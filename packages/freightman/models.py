from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import PermissionsMixin, UnicodeUsernameValidator, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import ValidationError, MaxValueValidator, MinValueValidator
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils import timezone
from django.core.mail import send_mail
import pytz
from freightman.mixins import AuthMixin
from django.conf import settings
from .model_validators import validate_awb_serial_length, validate_org_prefix_length
from .exceptions import CustomException
from datetime import datetime


# Create your models here.


class Country(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    code_isoa2 = models.CharField(max_length=2, null=False, blank=False)

    def clean(self):
        self.code_isoa2 = self.code_isoa2.upper()
        super(Country, self).clean()

    def dict(self):
        return {
            'id': self.id,
            'code_isoa2': self.code_isoa2,
            'name': self.name,
        }

    def __str__(self):
        return '{} ({})'.format(self.name, self.code_isoa2)

    def id_and_name(self):
        return self.id, self.name


class City(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)

    def __str__(self):
        return '{}({})'.format(self.name, self.country.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'country': self.country.name,
        }

    class Meta:
        unique_together = ('country', 'name')


class State(models.Model):
    country = models.ForeignKey(Country, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=50)

    def __str__(self):
        return '{}({})'.format(self.name, self.country.name)

    class Meta:
        unique_together = ('country', 'name')


class PostCode(models.Model):
    country = models.ForeignKey(Country, null=True, on_delete=models.SET_NULL)
    code = models.IntegerField()

    def __str__(self):
        return '{}({})'.format(self.code, self.country.name)

    class Meta:
        unique_together = ('country', 'code')


class TimeZone(models.Model):
    tz_name = models.CharField(max_length=200, unique=True)  # name from tz database https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    utc_offset_sign = models.CharField(max_length=1)
    utc_offset_hour = models.IntegerField(validators=[MaxValueValidator(24), MinValueValidator(0)])
    utc_offset_minute = models.IntegerField(validators=[MaxValueValidator(60), MinValueValidator(0)])

    def utc_offset_str(self):
        return '{}{}:{}'.format(self.utc_offset_sign, self.utc_offset_hour, self.utc_offset_minute)

    def as_pytz_obj(self):
        return pytz.timezone(self.tz_name)

    def __str__(self):
        return self.tz_name + '{}{}:{}'.format(self.utc_offset_sign, self.utc_offset_hour, self.utc_offset_minute)

    def dict(self):
        return {
            'id': self.id,
            'tz_name': self.tz_name,
            'offset_str': self.utc_offset_str()
        }


class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)  # ISO4217 code
    currency_name = models.CharField(max_length=20)  # ISO4217 code

    default = models.BooleanField(default=False)

    def __str__(self):
        return '{}({})'.format(self.currency_name, self.code)

    def dict(self, sth):
        return {
            'id': self.id,
            'code': self.code,
            'currency_name': self.currency_name
        }

    def clean(self):
        if Currency.objects.filter(default=True).exists() and self.default:
            raise ValidationError(_('Current default currency is {}. Please remove this default to set another default'
                                    .format(Currency.objects.get(default=True).code)), 'invalid')

        if not Currency.objects.filter(default=True).exists() and not self.default:
            raise ValidationError(_('No default currency found. Please select a default currency.'), 'invalid')

        super(Currency, self).clean()


class Airport(models.Model):
    code = models.CharField(max_length=3, unique=True)  # IATA code
    name = models.CharField(null=False, blank=False, max_length=50)

    def __str__(self):
        return '{}'.format(self.code)

    def dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name
        }


class Airline(models.Model):
    prefix_number = models.IntegerField(unique=True)  # three digit iata prefix number for cargo
    prefix_code = models.CharField(max_length=2)
    name = models.CharField(null=False, blank=False, max_length=30)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'prefix_number': self.prefix_number,
            'name': self.name
        }


class TermsofDelivery(models.Model):
    code = models.CharField(max_length=3, unique=True)
    title = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return '{}'.format(self.code)

    def dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'title': self.title,
        }


class SystemUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, username, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        if not username:
            raise ValueError('The given username must be set')
        email = self.normalize_email(email)
        username = self.model.normalize_username(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(username, email, password, **extra_fields)


class SystemAbstractUser(AbstractBaseUser, PermissionsMixin):
    """
    An abstract base class implementing a fully featured User model with
    admin-compliant permissions.

    Username and password are required. Other fields are optional.
    """
    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    email = models.EmailField(_('email address'), blank=False, null=False, unique=True)

    time_zone = models.ForeignKey(TimeZone, null=True, blank=True, on_delete=models.CASCADE)

    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = SystemUserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        abstract = True

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)


class SystemUser(SystemAbstractUser, AuthMixin):
    """
    Users within the Django authentication system are represented by this
    model.
    """

    class Meta(SystemAbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.get_full_name()

    def dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.get_full_name(),
            'timezone': self.time_zone.dict() if self.time_zone else None
        }


class Organization(models.Model):
    title = models.CharField(max_length=200, unique=True)
    active = models.BooleanField(default=True)
    prefix = models.CharField(max_length=3, validators=[validate_org_prefix_length], unique=True)

    is_supplier = models.BooleanField(default=False)
    is_buyer = models.BooleanField(default=False)
    is_factory = models.BooleanField(default=False)
    is_shipper = models.BooleanField(default=False)

    is_forwarder = models.BooleanField(default=False)

    booking_mail_sending_enabled = models.BooleanField(default=False)

    entry_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)

    @property
    def type(self):
        if self.is_supplier:
            return 'Supplier'
        elif self.is_buyer:
            return 'Buyer'
        elif self.is_factory:
            return 'Supplier'
        elif self.is_shipper:
            return 'Shipper'
        elif self.is_forwarder:
            return 'FreightForwarder'

    @property
    def ref(self):
        digit_count = 15
        idlen = len(str(self.id))
        pad_dgt = digit_count - idlen
        date_dgt = self.entry_at.strftime(settings.ID_DATE_FORMAT)
        more_pad_dgt = pad_dgt - len(date_dgt)
        return '{}{}'.format(self.id, idlen)

    @property
    def public_id(self):
        return self.ref

    def dict(self, request):
        default_address_q = AddressBook.objects.filter(organization=self, is_default=True)
        return {
            'id': self.id,
            'title': self.title,
            'active': self.active,
            'type': self.type,
            'is_supplier': self.is_supplier,
            'is_buyer': self.is_buyer,
            'is_factory': self.is_factory,
            'is_shipper': self.is_shipper,
            'public_id': self.ref,
            'booking_mail_sending_enabled': self.booking_mail_sending_enabled,
            'default_address': default_address_q.first().dict(request) if default_address_q.exists() else None
        }

    def clean(self):
        super(Organization, self).clean()

    def __str__(self):
        return '{}'.format(self.title)


class ServiceProviderMap(models.Model):
    service_provider_org = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='serviceproviderorg')
    customer_org = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='customerorg')

    class Meta:
        unique_together = ('service_provider_org', 'customer_org')


class AddressBook(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_query_name='org_address', null=True, blank=True)

    company_name = models.CharField(max_length=200)
    address = models.TextField()
    postcode = models.CharField(max_length=10, null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    state = models.CharField(max_length=50, default='', null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    contact = models.CharField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=30)
    mobile = models.CharField(max_length=30)
    fax = models.CharField(max_length=30, default='', blank=True)
    email = models.EmailField()

    is_default = models.BooleanField(default=False)

    is_shipper = models.BooleanField(default=False)
    is_consignee = models.BooleanField(default=False)
    is_consignor = models.BooleanField(default=False)
    is_pickup = models.BooleanField(default=False)
    is_delivery = models.BooleanField(default=False)

    def __str__(self):
        return '{} #{}'.format(self.company_name, self.id)

    # class Meta:
    #     unique_together = ('organization', 'company_name', 'city', 'state', 'country', 'email')

    def dict(self, request):
        address_type = 'undefined'
        if self.is_shipper:
            address_type = 'shipper'
        if self.is_consignee:
            address_type = 'consignee'
        if self.is_consignor:
            address_type = 'consignor'
        if self.is_pickup:
            address_type = 'pickup'
        if self.is_delivery:
            address_type = 'delivery'

        print(self)
        return {
            'id': self.id,
            # 'organization': self.organization.dict(request),
            'company_name': self.company_name,
            'address': self.address,
            'postcode': self.postcode,
            'city': self.city.dict(),
            'state': self.state,
            'country': self.country.dict(),
            'contact': self.contact,
            'phone': self.phone,
            'mobile': self.mobile,
            'fax': self.fax,
            'email': self.email,
            'address_type': address_type,
            'is_shipper': self.is_shipper,
            'is_consignee': self.is_consignee
        }

    def id_and_name(self):
        return self.id, self.company_name


choices = (('SuperUser', 'SuperUser'), ('Admin', 'Admin'),
           ('NormalUser', 'NormalUser'))


class AuthLevelPermissions(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    level_name = models.CharField(max_length=30)

    can_do_airexport_frt_booking = models.BooleanField(default=False)
    can_access_airexport_frt_bookinglist = models.BooleanField(default=False)
    can_access_airexport_hbl_create = models.BooleanField(default=False)
    can_access_airexport_mbl_create = models.BooleanField(default=False)
    can_access_airexport_hbl_list = models.BooleanField(default=False)
    can_access_airexport_mbl_list = models.BooleanField(default=False)
    can_access_airexport_consolidation = models.BooleanField(default=False)
    can_access_airexport_invoice_create = models.BooleanField(default=False)
    can_access_airexport_invoice_list = models.BooleanField(default=False)
    can_access_airexport_job_costing_create = models.BooleanField(default=False)
    can_access_airexport_job_costing_list = models.BooleanField(default=False)
    can_access_airexport_gp_listing = models.BooleanField(default=False)

    @property
    def can_access_anything_of_airexport(self):
        return self.can_do_airexport_frt_booking or self.can_access_airexport_frt_bookinglist or self.can_access_airexport_hbl_create or self.can_access_airexport_mbl_create or \
               self.can_access_airexport_hbl_list or self.can_access_airexport_mbl_list or self.can_access_airexport_consolidation or self.can_access_airexport_invoice_create or \
               self.can_access_airexport_invoice_list or self.can_access_airexport_job_costing_create or self.can_access_airexport_job_costing_list or \
               self.can_access_airexport_gp_listing

    can_do_seaexport_frt_booking = models.BooleanField(default=False)
    can_access_seaexport_frt_bookinglist = models.BooleanField(default=False)
    can_access_seaexport_hbl_create = models.BooleanField(default=False)
    can_access_seaexport_mbl_create = models.BooleanField(default=False)
    can_access_seaexport_hbl_list = models.BooleanField(default=False)
    can_access_seaexport_mbl_list = models.BooleanField(default=False)
    can_access_seaexport_consolidation = models.BooleanField(default=False)
    can_access_seaexport_invoice_create = models.BooleanField(default=False)
    can_access_seaexport_invoice_list = models.BooleanField(default=False)
    can_access_seaexport_job_costing_create = models.BooleanField(default=False)
    can_access_seaexport_job_costing_list = models.BooleanField(default=False)
    can_access_seaexport_gp_listing = models.BooleanField(default=False)

    @property
    def can_access_anything_of_seaexport(self):
        return self.can_do_seaexport_frt_booking or self.can_access_seaexport_frt_bookinglist or self.can_access_seaexport_hbl_create or self.can_access_seaexport_mbl_create or \
               self.can_access_seaexport_hbl_list or self.can_access_seaexport_mbl_list or self.can_access_seaexport_consolidation or self.can_access_seaexport_invoice_create or \
               self.can_access_seaexport_invoice_list or self.can_access_seaexport_job_costing_create or self.can_access_seaexport_job_costing_list or \
               self.can_access_seaexport_gp_listing

    # can_do_airimport_frt_booking = models.BooleanField(default=False)
    # can_access_airimport_frt_bookinglist = models.BooleanField(default=False)
    # can_access_airimport_hbl_create = models.BooleanField(default=False)
    # can_access_airimport_mbl_create = models.BooleanField(default=False)
    # can_access_airimport_hbl_list = models.BooleanField(default=False)
    # can_access_airimport_mbl_list = models.BooleanField(default=False)
    # can_access_airimport_consolidation = models.BooleanField(default=False)
    # can_access_airimport_invoice_create = models.BooleanField(default=False)
    # can_access_airimport_invoice_list = models.BooleanField(default=False)
    # can_access_airimport_job_costing_create = models.BooleanField(default=False)
    # can_access_airimport_job_costing_list = models.BooleanField(default=False)
    # can_access_airimport_gp_listing = models.BooleanField(default=False)

    can_do_seaimport_frt_booking = models.BooleanField(default=False)
    can_access_seaimport_frt_bookinglist = models.BooleanField(default=False)
    can_access_seaimport_hbl_create = models.BooleanField(default=False)
    can_access_seaimport_mbl_create = models.BooleanField(default=False)
    can_access_seaimport_hbl_list = models.BooleanField(default=False)
    can_access_seaimport_mbl_list = models.BooleanField(default=False)
    can_access_seaimport_consolidation = models.BooleanField(default=False)
    can_access_seaimport_invoice_create = models.BooleanField(default=False)
    can_access_seaimport_invoice_list = models.BooleanField(default=False)
    can_access_seaimport_job_costing_create = models.BooleanField(default=False)
    can_access_seaimport_job_costing_list = models.BooleanField(default=False)
    can_access_seaimport_gp_listing = models.BooleanField(default=False)

    @property
    def can_access_anything_of_seaimport(self):
        return self.can_do_seaimport_frt_booking or self.can_access_seaimport_frt_bookinglist or self.can_access_seaimport_hbl_create or self.can_access_seaimport_mbl_create or \
               self.can_access_seaimport_hbl_list or self.can_access_seaimport_mbl_list or self.can_access_seaimport_consolidation or self.can_access_seaimport_invoice_create or \
               self.can_access_seaimport_invoice_list or self.can_access_seaimport_job_costing_create or self.can_access_seaimport_job_costing_list or \
               self.can_access_seaimport_gp_listing

    can_create_user = models.BooleanField(default=False)
    can_list_user = models.BooleanField(default=False)

    can_access_site_settings = models.BooleanField(default=False)

    @property
    def can_access_anything_of_user_management(self):
        return self.can_create_user or self.can_list_user

    can_create_supplier = models.BooleanField(default=False)
    can_list_supplier = models.BooleanField(default=False)

    @property
    def can_access_anything_of_supplier_management(self):
        return self.can_create_supplier or self.can_list_supplier

    class Meta:
        unique_together = ('organization', 'level_name')

    def __str__(self):
        return '{}:{}'.format(self.organization.title, self.level_name)

    @property
    def is_forwarder_user(self):
        return self.organization.is_forwarder

    @property
    def is_forwarder_superuser(self):
        return self.is_forwarder_user and self.level_name == 'SuperUser'

    @property
    def is_forwarder_admin(self):
        return self.is_forwarder_superuser or (self.is_forwarder_user and self.level_name == 'Admin')

    @property
    def is_forwarder_normal_user(self):
        return self.is_forwarder_admin or (self.is_forwarder_user and self.level_name == 'NormalUser')

    def dict(self):
        return {
            'id': self.id,
            'level_name': self.level_name,
            'is_forwarder_user': self.is_forwarder_user,
            'is_forwarder_superuser': self.is_forwarder_superuser,
            'is_forwarder_admin': self.is_forwarder_admin,
            'is_forwarder_normal_user': self.is_forwarder_normal_user
        }


class UserAuthLevel(models.Model):
    user = models.OneToOneField(SystemUser, on_delete=models.CASCADE)
    auth_level = models.ForeignKey(AuthLevelPermissions, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'auth_level')


class AWBAgent(models.Model):
    addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE)
    # name = models.CharField(max_length=50, unique=True)
    # city = models.ForeignKey(City, on_delete=models.CASCADE)
    # state = models.CharField(max_length=30, default='', blank=True)
    # country = models.ForeignKey(Country, on_delete=models.CASCADE)
    iata_code = models.CharField(max_length=12)

    ffl_number = models.CharField(max_length=12, null=True, blank=True)
    ffl_exp_date = models.DateField(null=True, blank=True)

    # airline = models.ManyToManyField(Airline, through='AWBAgentAirlinesMap', through_fields=('airline', 'agent'))

    def __str__(self):
        return '{} {}'.format(self.iata_code, self.addressbook.company_name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.addressbook.company_name,
            'city': self.addressbook.city.dict(),
            'state': self.addressbook.state,
            'country': self.addressbook.country.dict(),
            'iata_code': self.iata_code,
            'ffl_number': '',
            'ffl_exp_date': ''
        }


class AWBAgentAirlinesMap(models.Model):
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE)
    agent = models.ForeignKey(AWBAgent, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('airline', 'agent')


class Airwaybill(models.Model):
    agent = models.ForeignKey(AWBAgent, on_delete=models.CASCADE)
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE)
    awb_serial = models.CharField(unique=True, max_length=8, validators=[validate_awb_serial_length])
    expire_date = models.DateField()

    def master(self):
        q = MAWB.objects.filter(awb_id=self.id)
        if q.exists():
            return q.first()
        else:
            return None

    def __str__(self):
        return '{}-{}'.format(self.airline.prefix_number, self.awb_serial)

    def dict(self):
        return {
            'id': self.id,
            'agent': self.agent.dict(),
            'airline': self.airline.dict(),
            'awb_serial': self.awb_serial
        }


class UserOrganizationMap(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)  # for now, one user cannot join multiple company


class BookingListener(models.Model):
    email = models.EmailField(null=False, blank=False)
    # org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(get_user_model(), null=False, blank=False, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('email',)


class Bank(models.Model):
    # organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='organizationbank', related_query_name='organizationbank')
    bank_name = models.CharField(max_length=50)

    # for_all_organization = models.BooleanField(default=False)

    active = models.BooleanField(default=True)

    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = ('bank_name',)

    def __str__(self):
        return '{}'.format(self.bank_name)

    def dict(self):
        return {
            'id': self.id,
            'bank_name': self.bank_name
        }


class BankBranch(models.Model):
    bank = models.ForeignKey(Bank, on_delete=models.CASCADE, related_name='bankbranch', related_query_name='bankbranch')
    branch_name = models.CharField(max_length=50, verbose_name='branch name')

    branch_address = models.TextField()

    active = models.BooleanField(default=True)

    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = ('bank', 'branch_name')

    def __str__(self):
        return '{}:{}'.format(self.bank.bank_name, self.branch_name)

    def dict(self):
        return {
            'id': self.id,
            'bank': self.bank.dict(),
            'branch_name': self.branch_name,
            'branch_address': self.branch_address
        }


# goods reference types
class GoodsReferenceTypes(models.Model):
    # org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)

    class Meta:
        unique_together = ('name',)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self, request):
        return {
            'id': self.id,
            'name': self.name
        }


class StakeholderReferenceTypes(models.Model):
    org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)

    class Meta:
        unique_together = ('org', 'name')

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self, request):
        return {
            'id': self.id,
            'name': self.name
        }


class PackageType(models.Model):
    org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self, request):
        return {
            'id': self.id,
            'name': self.name
        }


class TransportAgreement(models.Model):
    org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=30, null=False, blank=False)
    details = models.TextField(null=False, blank=False)

    class Meta:
        unique_together = ('org', 'title')

    def __str__(self):
        return '{}'.format(self.title)

    def dict(self, request):
        return {
            'id': self.id,
            'title': self.title,
            'details': self.details
        }


class PaymentType(models.Model):
    name = models.CharField(max_length=30)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class ChargeType(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class CurrencyConversion(models.Model):
    from_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='conversion_from_currency', related_query_name='conversion_from_currency')
    to_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='conversion_to_currency', related_query_name='conversion_to_currency')
    conversion_rate = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    def clean(self):
        if self.from_currency_id == self.to_currency_id:
            raise ValidationError(_('From and to currency should not be same'), 'invalid')

        super(CurrencyConversion, self).clean()

    def convert(self, from_currency_id, to_currency_id, amount: float):
        if self.from_currency_id == from_currency_id and self.to_currency_id == to_currency_id:
            return self.conversion_rate * amount
        elif self.from_currency_id == to_currency_id and self.to_currency_id == from_currency_id:
            return (1 / self.conversion_rate) * amount
        else:
            # print('from {} to {} objectfrom: {} objectto: {}'.format(from_currency_id, to_currency_id, self.from_currency_id, self.to_currency_id))
            pass

    def __str__(self):
        return '1{}={}{}'.format(self.from_currency.currency_name, self.conversion_rate, self.to_currency.currency_name)


class FreightBooking(models.Model):
    org = models.ForeignKey(Organization, on_delete=models.CASCADE, null=False, blank=False)
    edd = models.DateField(null=True, blank=True)

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)

    is_draft = models.BooleanField(default=False)
    is_booking_confirmed = models.BooleanField(default=False)

    confirmed_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True, blank=True, related_name='freightbookingconfirmedby')
    confirmed_at = models.DateTimeField(null=True, blank=True)

    entry_complete = models.BooleanField(default=False)

    def dict(self, request):
        return {
            'id': self.id,
            'public_id': self.globalid,
            'org': self.org.dict(request),
            'edd': self.edd,
            'entry_at': self.entry_at,
            'confirmed_at': self.confirmed_at.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if self.confirmed_at else ''
        }

    @property
    def status(self):
        if self.is_draft:
            return 'registered'
        elif self.is_booking_confirmed:
            return 'booked'

    @property
    def globalid(self):
        idlen = len(str(self.id))
        return '{}{}{}'.format(self.org.prefix, self.id, idlen)

    @property
    def public_id(self):
        return self.globalid


class FreightBookingPartyAddress(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_address')
    addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, null=False, blank=False)
    is_shipper = models.BooleanField(default=False)
    is_consignee = models.BooleanField(default=False)
    is_default_consignee = models.BooleanField(default=False)
    is_consignor = models.BooleanField(default=False)
    is_pickup = models.BooleanField(default=False)
    is_delivery = models.BooleanField(default=False)
    notify = models.BooleanField(default=False, null=False, blank=False)


class FreightBookingBankBranch(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_name='bookingbankbranchlink',
                                related_query_name='bookingbankbranchlink')
    bank_branch = models.ForeignKey(BankBranch, on_delete=models.CASCADE, related_name='bankbranchbookinglink', related_query_name='bankbranchbookinglink')
    in_origin_leg = models.BooleanField(default=False)
    in_destination_leg = models.BooleanField(default=False)
    notify = models.BooleanField(default=False)


class FreightBookingPortInfo(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_portinfo')
    port_of_destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='port_of_destination')
    port_of_loading = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='port_of_loading')
    terms_of_delivery = models.ForeignKey(TermsofDelivery, on_delete=models.CASCADE)
    country_of_destination = models.ForeignKey(Country, on_delete=models.CASCADE)


class FreightBookingGoodsInfo(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_goodsinfo')
    no_of_pieces = models.IntegerField()
    package_type = models.ForeignKey(PackageType, on_delete=models.CASCADE)
    weight_kg = models.FloatField()

    chargable_weight = models.FloatField()
    volumetric_weight = models.FloatField()
    cbm = models.FloatField()

    length_cm = models.FloatField()
    width_cm = models.FloatField()
    height_cm = models.FloatField()
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    shipping_mark = models.TextField(default='')
    goods_desc = models.TextField(default='')

    def dict(self, request):
        return {
            'references': [ref.dict(request) for ref in self.freightbookinggoodsreferences_set.all()],
            'id': self.id,
            'booking_id': self.booking_id,
            'no_of_pieces': self.no_of_pieces,
            'package_type': self.package_type.dict(request),
            'weight_kg': self.weight_kg,
            'chargable_weight': self.chargable_weight,
            'volumetric_weight': self.volumetric_weight,
            'cbm': self.cbm,
            'length_cm': self.length_cm,
            'width_cm': self.width_cm,
            'height_cm': self.height_cm,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'currency': self.currency.dict(request),
            'shipping_mark': self.shipping_mark,
            'goods_desc': self.goods_desc
        }


class FreightBookingGoodsReferences(models.Model):
    goodsinfo = models.ForeignKey(FreightBookingGoodsInfo, on_delete=models.CASCADE, related_query_name='booking_goodsinfo_refs')
    reference_type = models.ForeignKey(GoodsReferenceTypes, on_delete=models.CASCADE)
    reference_number = models.CharField(max_length=50)

    def dict(self, request):
        return {
            'id': self.id,
            'reference_type': self.reference_type.dict(request),
            'reference_number': self.reference_number
        }


class FreightBookingShippingService(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_shipping_service')
    service = models.CharField(max_length=50)


class FreightBookingStakeholderReference(models.Model):
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_stakeholder_refs')
    reference_type = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE)
    reference_number = models.CharField(max_length=50)


class FreightBookingOrderNote(models.Model):
    booking = models.OneToOneField(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_ordernote')
    payment_instruction = models.ForeignKey(PaymentType, on_delete=models.CASCADE)
    transport_agreement = models.ForeignKey(TransportAgreement, on_delete=models.CASCADE)
    delivery_instruction = models.TextField()


class FreightBookingPickupNote(models.Model):
    booking = models.OneToOneField(FreightBooking, on_delete=models.CASCADE, null=False, blank=False, related_query_name='booking_pickupnote')
    pickup_date = models.DateField(max_length=50)
    pickup_time_early = models.CharField(max_length=50)
    pickup_time_latest = models.CharField(max_length=50)
    pickup_instruction = models.TextField()


#
# class CompanyOffice(models.Model):
#     company = models.ForeignKey(Organization, on_delete=models.CASCADE)
#     title = models.CharField(max_length=200)
#     address = models.TextField()
#     country = models.ForeignKey(Country, on_delete=models.CASCADE)
#     utc_offset = models.FloatField()
#
#     def __str__(self):
#         return self.title
#
#     class Meta:
#         unique_together = (('company', 'title'),)
#
#
# class CompanyDepartment(models.Model):
#     company = models.ForeignKey(Organization, on_delete=models.CASCADE)
#     title = models.CharField(max_length=200)
#
#     def __str__(self):
#         return self.title
#
#     class Meta:
#         unique_together = (('company', 'title'),)

# class GroupAuthLevel(models.Model):
#     pass


# class UserCompanyMap(models.Model):
#     """
#     Users who are not mapped to a Organization(office/department) are taken as system user
#     """
#     user = models.ForeignKey(SystemUser, on_delete=models.CASCADE)
#     office = models.ForeignKey(CompanyOffice, null=True, blank=True, on_delete=models.CASCADE)
#     department = models.ForeignKey(CompanyDepartment, null=True, blank=True, on_delete=models.CASCADE)
#     position = models.CharField(max_length=200)
#     company = models.ForeignKey(Organization, on_delete=models.CASCADE)
#     country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True)
#
#     is_company_superuser = models.BooleanField(default=False, null=False, blank=False)
#     is_admin = models.BooleanField(default=False, null=False, blank=False)
#
#     class Meta:
#         unique_together = (('user', 'office', 'department'),)
#         verbose_name = _('User Organization association')
#         verbose_name_plural = _('User company associations')
#
#     def clean(self):
#         if self.office:
#             if self.department and self.office.company is not self.department.company:
#                 raise ValidationError(_('Office and Departments are not of same company'), 'invalid')
#             if self.company and self.office.company is not self.company:
#                 raise ValidationError(_('Office is not from the company'), 'invalid')
#         elif self.department:
#             if self.office and self.office.company is not self.department.company:
#                 raise ValidationError(_('Office and Departments are not of same company'), 'invalid')
#             if self.company and self.company is not self.department.company:
#                 raise ValidationError(_('Department is not from the company'), 'invalid')
#
#         super(UserCompanyMap, self).clean()
#
#     def save(self, *args, **kwargs):
#         self.full_clean(*args, **kwargs)
#         super(UserCompanyMap, self).save(*args, **kwargs)


class HAWB(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE)
    house = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='hawb_org')
    booking = models.ForeignKey(FreightBooking, on_delete=models.CASCADE, related_name='hawb_booking', related_query_name='booking_hawb', null=True, blank=True)
    supplier = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='hawb_suplier')

    shipper = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_query_name='hawb_shipper', related_name='hawb_shipper', null=True, blank=True, )
    consignee = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_query_name='hawb_consignee', null=True, blank=True, )

    payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='hawb_paymenttype', related_name='hawb_paymenttype', null=True,
                                     blank=True, )
    airport_of_departure = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='hawb_airportofdeparture', related_name='hawb_airportofdeparture',
                                             null=True,
                                             blank=True, )
    requested_routing = models.TextField(null=True, blank=True, )
    to_1_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='hawb_to1_airport', related_name='hawb_to1_airport', null=True, blank=True, )
    to_1_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='hawb_to1_airline', related_name='hawb_to1_airline', null=True, blank=True, )
    to_1_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_1_flight_date = models.DateField(null=True, blank=True)
    to_2_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='hawb_to2_airport', related_name='hawb_to2_airport', null=True, blank=True, )
    to_2_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='hawb_to2_airline', related_name='hawb_to2_airline', null=True, blank=True, )
    to_2_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_2_flight_date = models.DateField(null=True, blank=True)
    to_3_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='hawb_to3_airport', related_name='hawb_to3_airport', null=True, blank=True, )
    to_3_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='hawb_to3_airline', related_name='hawb_to3_airline', null=True, blank=True, )
    to_3_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_3_flight_date = models.DateField(null=True, blank=True)
    airport_of_destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='hawb_airportofdestination',
                                               related_name='hawb_airportofdestination',
                                               null=True, blank=True, )
    requested_flight_info = models.TextField(default='')

    carrier_agent_name = models.CharField(max_length=50)
    carrier_agent_city = models.ForeignKey(City, on_delete=models.CASCADE)
    carrier_agent_state = models.CharField(max_length=30)
    carrier_agent_country = models.ForeignKey(Country, on_delete=models.CASCADE)
    carrier_agent_ffl_no = models.CharField(max_length=50)
    carrier_agent_date = models.DateField(null=True, blank=True)
    carrier_agent_iata_code = models.IntegerField(null=True, blank=True)
    carrier_agent_account_no = models.CharField(max_length=30)

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_query_name='hawb_currency', related_name='hawb_currency', null=True, blank=True, )
    cngs_code = models.CharField(max_length=200, null=True, blank=True, )
    wt_val_payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='hawb_wtvalpaymenttype', related_name='hawb_wtvalpaymenttype',
                                            null=True,
                                            blank=True, )
    other_payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='hawb_otherpaymenttype', related_name='hawb_otherpaymenttype',
                                           null=True,
                                           blank=True, )

    declared_val_for_carriage = models.CharField(max_length=30)
    declared_val_for_customs = models.CharField(max_length=30)
    amt_of_insurance = models.CharField(max_length=30)

    handling_info = models.TextField(null=True, blank=True, )
    goods_noofpcsrcp = models.IntegerField(null=True, blank=True, )
    goods_grossweight = models.FloatField(null=True, blank=True, )
    goods_weightunit = models.CharField(max_length=2, null=True, blank=True, )
    goods_commodityitemno = models.TextField(default='')
    goods_chargableweight = models.FloatField(null=True, blank=True, )
    goods_ratecharge = models.FloatField(null=True, blank=True, )
    goods_total = models.FloatField(null=True, blank=True, )

    goods_natureandquantity = models.TextField(null=True, blank=True, )

    weightcharge_prepaid = models.FloatField(null=True, blank=True, )
    weightcharge_collect = models.FloatField(null=True, blank=True, )
    valuationcharge_prepaid = models.FloatField(null=True, blank=True, )
    valuationcharge_collect = models.FloatField(null=True, blank=True, )
    tax_prepaid = models.FloatField(null=True, blank=True, )
    tax_collect = models.FloatField(null=True, blank=True, )
    totalotherchargesdueagent_prepaid = models.FloatField(null=True, blank=True, )
    totalotherchargesdueagent_collect = models.FloatField(null=True, blank=True, )
    totalotherchargesduecarrier_prepaid = models.FloatField(null=True, blank=True, )
    totalotherchargesduecarrier_collect = models.FloatField(null=True, blank=True, )
    total_prepaid = models.FloatField(null=True, blank=True, )
    total_collect = models.FloatField(null=True, blank=True, )
    currencyconversionrate = models.FloatField(null=True, blank=True, )
    ccchargesindestcurrency = models.FloatField(null=True, blank=True, )
    chargesatdestination_collect = models.FloatField(null=True, blank=True, )
    totalcharges_collect = models.FloatField(null=True, blank=True, )
    charges_other = models.FloatField(null=True, blank=True, )
    signature_shipperoragent = models.CharField(max_length=200, null=True, blank=True, )
    executed_on_date = models.DateField(null=True, blank=True, )
    executed_at_city = models.ForeignKey(City, on_delete=models.CASCADE, related_query_name='hawb_executedatcity', related_name='hawb_executedatcity', null=True,
                                         blank=True, )
    signature_issuingcarrieroragent = models.CharField(max_length=200, null=True, blank=True, )

    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    received_at_estimated = models.DateTimeField(null=True, blank=True)
    received_at_actual = models.DateTimeField(null=True, blank=True)
    received_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name='airexportgoodsreceivedby')

    @property
    def public_id(self):
        digit_count = 8
        idlen = len(str(self.id))
        pad_dgt = digit_count - idlen
        padstr = '0' * pad_dgt
        return 'HAWB-{}{}'.format(self.id, idlen)

    def basic_info(self):
        return {
            'id': self.id,
            'public_id': self.public_id,
            'shipper': self.shipper.organization.title,
            'consignee': self.consignee.organization.title
        }

    # This function returns true if this hawb is consolidated and has a job costing
    def job_costing_done(self):
        console_map = AirExportConsolHouseMap.objects.filter(hawb=self.id).first()
        if not console_map:
            return False

        console = console_map.consolidated_shipment

        # If the consolidation have a job costing return True
        if console.has_job_costing():
            return True

        return False

    def get_total_debit(self):
        debit_notes = AirExportConsolidatedShipmentDebitNote.objects.filter(hawb=self.id)
        debit_note_costings = AirExportDebitNoteCosting.objects.filter(debit_note__in=debit_notes)
        return sum([cost.get_value() for cost in debit_note_costings])

    # This function gives the total expense for this hawb
    def total_job_cost(self):
        # At first we check if this hawb is consolidated
        consoled_to = AirExportConsolHouseMap.objects.filter(hawb=self.id).first()
        # Check if this hawb is consolidated, if not return Zero
        if not consoled_to:
            return 0

        console = consoled_to.consolidated_shipment
        # If this HAWB's consolidation has job costing then proceed else return Zero
        if not console.has_job_costing():
            return 0

        # First we get the costs that are specifically for this hawb
        job_cost_for_this_hawb = sum([cost.get_value() for cost in AirExportConsolidatedShipmentJobCosting.objects.filter(hawb=self.id)])

        # Total job costing for this hawb is the sum of job costing for this hawb and the cost for each hawb of the console this hawb is of
        total_costing_for_this_hawb = job_cost_for_this_hawb + console.get_per_job_costing_except_single_hawbs()

        return total_costing_for_this_hawb

    def dsr_report(self):
        status = "NA"
        estimated_date = "NA"
        actual_date = "NA"

        if self.booking:
            status = "Booking Placed"
            estimated_date = "NA"
            actual_date = "NA"

            if self.booking.confirmed_at:
                status = "Booking Confirmed"
                estimated_date = "NA"
                actual_date = self.booking.confirmed_at

        if self.received_at_estimated:
            status = "Will Recieve At"
            estimated_date = self.received_at_estimated

        if self.received_at_actual:
            status = "Received"
            estimated_date = self.received_at_estimated
            actual_date = self.received_at_actual

        console_house_map = AirExportConsolHouseMap.objects.filter(hawb=self.id).first()
        if console_house_map:
            mawb = console_house_map.consolidated_shipment.mawb
            if mawb:
                status = "Ready for Departure"
                estimated_date = self.to_1_flight_date

                if datetime.now().date() >= self.to_1_flight_date:
                    status = "Departed"
                    actual_date = self.to_1_flight_date

                if datetime.now().date() >= self.to_1_flight_date:
                    status = "Departed"
                    actual_date = self.to_1_flight_date

                if self.to_3_flight_date:
                    if datetime.now().date() > self.to_3_flight_date:
                        status = "Delivered"
                        estimated_date = self.to_3_flight_date
                        actual_date = self.to_3_flight_date
                elif self.to_2_flight_date:
                    if datetime.now().date() > self.to_2_flight_date:
                        status = "Delivered"
                        estimated_date = self.to_2_flight_date
                        actual_date = self.to_2_flight_date
                elif self.to_1_flight_date:
                    if datetime.now().date() > self.to_1_flight_date:
                        status = "Delivered"
                        estimated_date = self.to_1_flight_date
                        actual_date = self.to_1_flight_date

        return {
            'status': status,
            'estimated_date': estimated_date,
            'actual_date': actual_date
        }


class MAWB(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE)

    # awb = models.OneToOneField(Airwaybill, on_delete=models.CASCADE)

    mawb_number = models.CharField(max_length=11)

    shipper = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_query_name='mawb_shipper', related_name='mawb_shipper', null=True, blank=True, )
    consignee = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_query_name='mawb_consignee', null=True, blank=True, )
    payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='mawb_paymenttype', related_name='mawb_paymenttype', null=True,
                                     blank=True, )
    airport_of_departure = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='mawb_airportofdeparture', related_name='mawb_airportofdeparture',
                                             null=True,
                                             blank=True, )
    requested_routing = models.TextField(null=True, blank=True, )
    to_1_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='mawb_to1_airport', related_name='mawb_to1_airport', null=True, blank=True, )
    to_1_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='mawb_to1_airline', related_name='mawb_to1_airline', null=True, blank=True, )
    to_1_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_1_flight_date = models.DateField(null=True, blank=True)
    to_2_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='mawb_to2_airport', related_name='mawb_to2_airport', null=True, blank=True, )
    to_2_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='mawb_to2_airline', related_name='mawb_to2_airline', null=True, blank=True, )
    to_2_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_2_flight_date = models.DateField(null=True, blank=True)
    to_3_airport = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='mawb_to3_airport', related_name='mawb_to3_airport', null=True, blank=True, )
    to_3_airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_query_name='mawb_to3_airline', related_name='mawb_to3_airline', null=True, blank=True, )
    to_3_flight_num = models.CharField(max_length=200, null=True, blank=True, )
    to_3_flight_date = models.DateField(null=True, blank=True)

    airport_of_destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_query_name='mawb_airportofdestination',
                                               related_name='mawb_airportofdestination',
                                               null=True, blank=True, )
    requested_flight_date = models.DateField(null=True, blank=True)

    reff_no_1 = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE, null=True, blank=True,
                                  related_name='mawb_ref1', related_query_name='mawb_ref1')
    reff_no_2 = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE, null=True, blank=True,
                                  related_name='mawb_ref2', related_query_name='mawb_ref2')
    reff_no_3 = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE, null=True, blank=True,
                                  related_name='mawb_ref3', related_query_name='mawb_ref3')

    carrier_agent = models.ForeignKey(AWBAgent, on_delete=models.CASCADE, related_query_name='mawb_carrieragent', related_name='mawb_carrieragent')
    carrier_agent_name = models.CharField(max_length=50)
    carrier_agent_city = models.ForeignKey(City, on_delete=models.CASCADE)
    carrier_agent_state = models.CharField(max_length=30)
    carrier_agent_country = models.ForeignKey(Country, on_delete=models.CASCADE)
    carrier_agent_ffl_no = models.CharField(max_length=50)
    carrier_agent_date = models.DateField(null=True, blank=True)
    carrier_agent_iata_code = models.IntegerField()
    carrier_agent_account_no = models.CharField(max_length=30)

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_query_name='mawb_currency', related_name='mawb_currency', null=True, blank=True, )

    cngs_code = models.CharField(max_length=200, null=True, blank=True, )

    wt_val_payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='mawb_wtvalpaymenttype', related_name='mawb_wtvalpaymenttype',
                                            null=True,
                                            blank=True, )
    other_payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE, related_query_name='mawb_otherpaymenttype', related_name='mawb_otherpaymenttype',
                                           null=True,
                                           blank=True, )
    declared_val_for_carriage = models.CharField(max_length=200, null=True, blank=True, )
    declared_val_for_customs = models.CharField(max_length=200, null=True, blank=True, )
    amt_of_insurance = models.CharField(max_length=10)
    handling_info = models.TextField(null=True, blank=True, )
    goods_noofpcsrcp = models.IntegerField(null=True, blank=True, )
    goods_grossweight = models.FloatField(null=True, blank=True, )
    goods_weightunit = models.CharField(max_length=2, null=True, blank=True, )
    goods_commodityitemno = models.CharField(null=True, blank=True, max_length=200)
    goods_chargableweight = models.FloatField(null=True, blank=True, )
    goods_ratecharge = models.FloatField(null=True, blank=True, )
    goods_total = models.TextField(null=True, blank=True, )
    goods_natureandquantity = models.TextField(null=True, blank=True, )
    weightcharge_prepaid = models.FloatField(null=True, blank=True, )
    weightcharge_collect = models.FloatField(null=True, blank=True, )
    valuationcharge_prepaid = models.FloatField(null=True, blank=True, )
    valuationcharge_collect = models.FloatField(null=True, blank=True, )
    tax_prepaid = models.FloatField(null=True, blank=True, )
    tax_collect = models.FloatField(null=True, blank=True, )
    totalotherchargesdueagent_prepaid = models.FloatField(null=True, blank=True, )
    totalotherchargesdueagent_collect = models.FloatField(null=True, blank=True, )
    totalotherchargesduecarrier_prepaid = models.FloatField(null=True, blank=True, )
    totalotherchargesduecarrier_collect = models.FloatField(null=True, blank=True, )
    total_prepaid = models.FloatField(null=True, blank=True, )
    total_collect = models.FloatField(null=True, blank=True, )
    currencyconversionrate = models.FloatField(null=True, blank=True, )
    ccchargesindestcurrency = models.FloatField(null=True, blank=True, )
    chargesatdestination_collect = models.FloatField(null=True, blank=True, )
    totalcharges_collect = models.FloatField(null=True, blank=True, )
    charges_other = models.FloatField(null=True, blank=True, )
    signature_shipperoragent = models.CharField(max_length=200, null=True, blank=True, )
    executed_on_date = models.DateField(null=True, blank=True, )
    executed_at_city = models.ForeignKey(City, on_delete=models.CASCADE, related_query_name='mawb_executedatcity', related_name='mawb_executedatcity', null=True,
                                         blank=True, )
    signature_issuingcarrieroragent = models.CharField(max_length=200, null=True, blank=True, )

    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    def clean(self):
        if len(self.mawb_number) != 11:
            raise ValidationError(_('MAWB Number should be 11 digit'), 'invalid')

        super(MAWB, self).clean()

    def __str__(self):
        return '{}'.format(self.id)

    def dict(self, request):
        cs_q = AirExportConsolidatedShipment.objects.filter(mawb=self)
        return {
            'id': self.id,
            'public_id': self.public_id,
            'shipper_name': self.shipper.organization.title,
            'consignee_name': self.consignee.organization.title,
            'is_consolidated': cs_q.exists(),
            'cons_shipment_public_id': cs_q.first().public_id if cs_q.exists() else ''
        }

    def all_data(self, request):
        return {
            'forwarder': self.forwarder.dict(request),
            'shipper': self.shipper.dict(request),
            'consignee': self.consignee.dict(request),
            'mawb_number': self.mawb_number,
            'payment_type': self.payment_type.dict(),
            # 'airport_of_departure': self.airport_of_departure,
            # 'requested_routing': self.requested_routing,
            # 'to_1_airport': self.to_1_airport,
            # 'to_1_airline': self.to_1_airline,
            # 'to_1_flight_num': self.to_1_flight_num,
            # 'to_1_flight_date': self.to_1_flight_date,
            #
            # 'to_2_airport': self.to_2_airport,
            # 'to_2_airline': self.to_2_airline,
            # 'to_2_flight_num': self.to_2_flight_num,
            # 'to_2_flight_date': self.to_2_flight_date,
            #
            #
            # 'to_3_airport': self.to_3_airport,
            # 'to_3_airline': self.to_3_airline,
            # 'to_3_flight_num': self.to_3_flight_num,
            # 'to_3_flight_date': self.to_3_flight_date,
            #
            # 'airport_of_destination': self.airport_of_destination,
            # 'requested_flight_date': self.requested_flight_date,
            # 'reff_no_1': self.reff_no_1,
            # 'reff_no_2': self.reff_no_2,
            # 'reff_no_3': self.reff_no_3,
            #
            # 'carrier_agent': self.carrier_agent,
            # 'carrier_agent_name': self.carrier_agent_name,
            # 'carrier_agent_city': self.carrier_agent_city,
            # 'carrier_agent_state': self.carrier_agent_state,
            # 'carrier_agent_country': self.carrier_agent_country,
            # 'carrier_agent_ffl_no': self.carrier_agent_ffl_no,
            # 'carrier_agent_date': self.carrier_agent_date,
            # 'carrier_agent_iata_code': self.carrier_agent_iata_code,
            # 'carrier_agent_account_no': self.carrier_agent_account_no,
            # 'currency': self.currency,
            # 'cngs_code': self.cngs_code,
            # 'wt_val_payment_type': self.wt_val_payment_type,
            # 'other_payment_type': self.other_payment_type,
            # 'declared_val_for_carriage': self.declared_val_for_carriage,
            # 'declared_val_for_customs': self.declared_val_for_customs,
            # 'amt_of_insurance': self.amt_of_insurance,
            # 'handling_info': self.handling_info,
            # 'goods_noofpcsrcp': self.goods_noofpcsrcp,
            # 'goods_grossweight': self.goods_grossweight,
            # 'goods_weightunit': self.goods_weightunit,
            # 'goods_commodityitemno': self.goods_commodityitemno,
            # 'goods_chargableweight': self.goods_chargableweight,
            # 'goods_ratecharge': self.goods_ratecharge,
            # 'goods_total': self.goods_total,
            # 'goods_natureandquantity': self.goods_natureandquantity,
            # 'weightcharge_prepaid': self.weightcharge_prepaid,
            # 'weightcharge_collect': self.weightcharge_collect,
            # 'valuationcharge_prepaid': self.valuationcharge_prepaid,
            # 'valuationcharge_collect': self.valuationcharge_collect,
            # 'tax_prepaid': self.tax_prepaid,
            # 'tax_collect': self.tax_collect,
            # 'totalotherchargesdueagent_prepaid': self.totalotherchargesdueagent_prepaid,
            # 'totalotherchargesdueagent_collect': self.totalotherchargesdueagent_collect,
            # 'totalotherchargesduecarrier_prepaid': self.totalotherchargesduecarrier_prepaid,
            # 'totalotherchargesduecarrier_collect': self.totalotherchargesduecarrier_collect,
            # 'total_prepaid': self.total_prepaid,
            # 'total_collect': self.total_collect,
            # 'currencyconversionrate': self.currencyconversionrate,
            # 'ccchargesindestcurrency': self.ccchargesindestcurrency,
            # 'chargesatdestination_collect': self.chargesatdestination_collect,
            # 'charges_other': self.charges_other,
            # 'signature_shipperoragent': self.signature_shipperoragent,
            # 'executed_on_date': self.executed_on_date,
            # 'executed_at_city': self.executed_at_city,
            # 'signature_issuingcarrieroragent': self.signature_issuingcarrieroragent,
        }

    def basic_info(self):
        return {
            'id': self.id,
            'public_id': self.public_id,
            'shipper': self.shipper.organization.title,
            'consignee': self.consignee.organization.title
        }

    @property
    def public_id(self):
        digit_count = 9
        idlen = len(str(self.id))
        pad_dgt = digit_count - idlen
        padstr = '0' * pad_dgt
        return 'MAWB-{}{}'.format(self.id, idlen)


class AirExportConsolidatedShipment(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE)
    mawb = models.OneToOneField(MAWB, on_delete=models.CASCADE, related_name='consolidated_mawb', related_query_name='consolidated_mawb')

    # currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    # currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True)

    created_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    house = models.ManyToManyField(HAWB, related_name='consolidatedshipment_house', related_query_name='consolidatedshipment_house', through='AirExportConsolHouseMap')

    @property
    def job_number(self):
        idlen = len(str(self.id))
        return 'AECONS-{}{}'.format(self.id, idlen)

    @property
    def public_id(self):
        return self.job_number

    def dict(self):
        return {
            'id': self.id,
            'public_id': self.public_id
        }

    # Get all the HAWBs of this consolidation
    def get_hawbs(self):
        hawb_ids = [map.hawb.id for map in AirExportConsolHouseMap.objects.filter(consolidated_shipment=self.id)]
        hawbs = HAWB.objects.filter(pk__in=hawb_ids)
        return hawbs

    # Check if this consolidation has job costing
    def has_job_costing(self):
        if len(AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=self.id)):
            return True
        else:
            return False

    # This method returns the total job costing except the costing that are for single hawbs not all
    def get_total_job_costing_except_single_hawbs(self):
        return sum([cost.get_value() for cost in AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=self.id, for_specific_hawb=False)])

    # This method returns the job costing for each hawbs. These excludes the cost that are for single hawbs
    def get_per_job_costing_except_single_hawbs(self):
        return sum([cost.get_value() for cost in
                    AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=self.id,
                                                                           for_specific_hawb=False)]) / len(self.get_hawbs())


class AirExportConsolHouseMap(models.Model):
    consolidated_shipment = models.ForeignKey(AirExportConsolidatedShipment, on_delete=models.CASCADE)
    hawb = models.ForeignKey(HAWB, on_delete=models.CASCADE)

    def clean(self):
        h_q = self.objects.filter(house=self.hawb)
        if h_q.exists() and h_q.first().consolidated_shipment_id != self.consolidated_shipment.id:
            raise ValidationError(_('This house bill already mapped to another consolidated shipment {}'.format(h_q.first().consolidated_shipment_id)), 'invalid')

        super(AirExportConsolHouseMap, self).clean()


class AirExportConsolidatedShipmentFlightInfo(models.Model):
    consolidated_shipment = models.ForeignKey(AirExportConsolidatedShipment, on_delete=models.CASCADE,
                                              related_name='airexportconsolshptfltinfo', related_query_name='airexportconsolshptfltinfo')
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE, related_name='airline_airexportconsolshptfltinfo',
                                related_query_name='airline_airexportconsolshptfltinfo')
    co_loader = models.ForeignKey(AWBAgent, on_delete=models.CASCADE, related_name='awbagent_airexportconsolshptfltinfo',
                                  related_query_name='awbagent_airexportconsolshptfltinfo')
    awb = models.ForeignKey(Airwaybill, on_delete=models.CASCADE, related_name='awb_airexportconsolshptfltinfo', related_query_name='awb_airexportconsolshptfltinfo')
    flight_number = models.CharField(max_length=30)
    flight_date = models.DateField()

    departure_country = models.ForeignKey(Country, on_delete=models.CASCADE,
                                          related_name='departcountry_airexportconsolshptfltinfo', related_query_name='departcountry_airexportconsolshptfltinfo')
    departure_airport = models.ForeignKey(Airport, on_delete=models.CASCADE,
                                          related_name='departairport_airexportconsolshptfltinfo', related_query_name='departairport_airexportconsolshptfltinfo')
    departure_date = models.DateField()
    departure_note = models.TextField(default='', blank=True)

    arrival_country = models.ForeignKey(Country, on_delete=models.CASCADE,
                                        related_name='arrivecountry_airexportconsolshptfltinfo', related_query_name='arrivecountry_airexportconsolshptfltinfo')
    arrival_airport = models.ForeignKey(Airport, on_delete=models.CASCADE,
                                        related_name='arriveairport_airexportconsolshptfltinfo', related_query_name='arriveairport_airexportconsolshptfltinfo')
    arrival_date = models.DateField()
    arrival_note = models.TextField(default='', blank=True)

    note = models.TextField(default='', blank=True)

    class Meta:
        unique_together = (
            'consolidated_shipment', 'airline', 'co_loader', 'awb', 'flight_number', 'flight_date',
            'departure_country', 'departure_airport', 'departure_date',
            'arrival_country', 'arrival_airport', 'arrival_date')


# single Expenses
class AirExportConsolidatedShipmentJobCosting(models.Model):
    consolidated_shipment = models.ForeignKey(AirExportConsolidatedShipment, on_delete=models.CASCADE,
                                              related_name='airexportconsoljobcosting', related_query_name='airexportconsoljobcosting')

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='airexportconsoljobcostingcurrency')
    currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True,
                                            related_name='airexportconsoljobcostingcurrencyconversion')

    is_shipment_cost = models.BooleanField(default=False)  # ie. is_expense, if False then it is income

    charge_type = models.ForeignKey(ChargeType, on_delete=models.CASCADE)

    value = models.FloatField()

    is_unit_cost = models.BooleanField()
    # for unit cost, below three fields are to get the units(quantity/chargable weight etc)
    charge_applies_to_hawb = models.BooleanField(default=False)  # if not then mawb
    for_specific_hawb = models.BooleanField(default=False)  # if not then applies to each hawb in the shipment
    hawb = models.ForeignKey(HAWB, on_delete=models.CASCADE, null=True, blank=True, related_name='airexptconjobcostngshptcosthawb')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # A method to calculate the costing for different situations and return it
    def get_value(self):
        # If it's not a unit cost then we just return the fixed cost which is the value
        if not self.is_unit_cost:
            return self.value

        # If it's a unit cost then we have to check if it's for mawb or hawb
        else:
            # If it's for hawb then we check if applies to single hawb or all
            if self.charge_applies_to_hawb:
                # For specific hawb we multiply that hawbs's chargable weight with value
                if self.for_specific_hawb:
                    return self.value * self.hawb.goods_chargableweight
                # Or we bring all the hawbs, get their chargeable weight and multiply it with value and return sum
                else:
                    return sum([hawb.goods_chargableweight * self.value for hawb in self.consolidated_shipment.get_hawbs()])
            # Else this cost applies to MAWB's chargeable weight
            return self.consolidated_shipment.mawb.goods_chargableweight * self.value

    def value_in_currency(self, currency_id: int):
        if currency_id == self.currency_id:
            return self.value
        else:
            return self.currency_conversion.convert(self.currency_id, currency_id, self.value)

    # TODO make some uniqueness
    # class Meta:
    #     unique_together = ('consolidated_shipment', 'charge_type')

    def dict(self):
        return {
            'id': self.id,
            'consolidated_shipment_id': self.consolidated_shipment_id,
            'charge_type_id': self.charge_type_id,
            'is_unit_cost': self.is_unit_cost,
            'value': self.value
        }

    @property
    def charge_for_house(self):
        return not self.is_shipment_cost


class AirExportConsolidatedShipmentDebitNote(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='airexptconsshptdebitnoteforwarder')
    consolidated_shipment = models.ForeignKey(AirExportConsolidatedShipment, on_delete=models.CASCADE,
                                              related_name='airexptconsshptdebitnote', related_query_name='airexptconsshptdebitnote')
    to_who = models.CharField(max_length=50, choices=(('master_consignee', 'master_consignee'), ('house_supplier', 'house_supplier'), ('house_shipper', 'house_shipper')))
    hawb = models.ForeignKey(HAWB, on_delete=models.CASCADE, null=True, blank=True)

    date = models.DateField()

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='airexptconsshptdebitnotedcurrency')
    target_currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True,
                                                   related_name='airexptconsshptdebitnotedisplaycurrencyconversion')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('consolidated_shipment', 'to_who')

    def to_address_company_name(self):
        if self.to_who == 'master_consignee':
            return self.consolidated_shipment.mawb.consignee.company_name
        elif self.to_who == 'house_supplier':
            return self.hawb.booking.org.addressbook_set.filter(is_default=True).first().company_name
        elif self.to_who == 'house_shipper':
            return self.hawb.shipper.company_name

    @property
    def public_id(self):
        idlen = len(str(self.id))
        return 'AEDN{}{}'.format(self.id, idlen)


class AirExportDebitNoteCosting(models.Model):
    debit_note = models.ForeignKey(AirExportConsolidatedShipmentDebitNote, on_delete=models.CASCADE,
                                   related_name='debitnotecosting', related_query_name='debitnotecosting')

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='debitnotecostingcurrency')

    charge_type = models.ForeignKey(ChargeType, on_delete=models.CASCADE)

    value = models.FloatField()

    is_unit_cost = models.BooleanField()

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_value(self):
        if self.is_unit_cost:
            return self.value* self.debit_note.hawb.goods_chargableweight
        return self.value


class AirExportConsolidatedShipmentCreditNote(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='airexptconsshptcreditnoteforwarder')
    consolidated_shipment = models.ForeignKey(AirExportConsolidatedShipment, on_delete=models.CASCADE,
                                              related_name='airexptconsshptcreditnote', related_query_name='airexptconsshptcreditnote')
    to_who = models.CharField(max_length=50, choices=(('master_consignee', 'master_consignee'), ('house_supplier', 'house_supplier'), ('house_shipper', 'house_shipper')))
    hawb = models.ForeignKey(HAWB, on_delete=models.CASCADE, null=True, blank=True)

    date = models.DateField()

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='airexptconsshptcreditnotedcurrency')
    target_currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True,
                                                   related_name='airexptconsshptcreditnotedisplaycurrencyconversion')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('consolidated_shipment', 'to_who')

    def to_address_company_name(self):
        if self.to_who == 'master_consignee':
            return self.consolidated_shipment.mawb.consignee.company_name
        elif self.to_who == 'house_supplier':
            return self.hawb.booking.org.addressbook_set.filter(is_default=True).first().company_name
        elif self.to_who == 'house_shipper':
            return self.hawb.shipper.company_name

    @property
    def public_id(self):
        idlen = len(str(self.id))
        return 'AECN-{}{}'.format(self.id, idlen)


class AirExportCreditNoteCosting(models.Model):
    credit_note = models.ForeignKey(AirExportConsolidatedShipmentCreditNote, on_delete=models.CASCADE,
                                    related_name='creditnotecosting', related_query_name='creditnotecosting')

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='creditnotecostingcurrency')

    charge_type = models.ForeignKey(ChargeType, on_delete=models.CASCADE)

    value = models.FloatField()

    is_unit_cost = models.BooleanField()

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
