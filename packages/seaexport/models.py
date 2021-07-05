from django.db import models
from django.contrib.auth import get_user_model
from freightman.models import Organization, AddressBook, BankBranch, PaymentType, Country, StakeholderReferenceTypes, Currency, City, CurrencyConversion
from django.conf import settings
from django.core.validators import ValidationError


# Create your models here.
# sea export

class SeaPort(models.Model):
    name = models.CharField(max_length=50, unique=True)

    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaportcity')

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city.name,
            'country': self.city.country.name,
        }


class SeaExportPackageType(models.Model):
    # org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE, related_name='seaexppackagetypes', related_query_name='seaexppackagetypes')
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class ContainerType(models.Model):
    name = models.CharField(max_length=30, unique=True)
    length_ft = models.FloatField()
    width_ft = models.FloatField()
    height_ft = models.FloatField()
    capacity_cbm = models.FloatField()

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }


class SeaTermsofDelivery(models.Model):
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


class SeaTransportAgreement(models.Model):
    org = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE, related_name='seaexpttransportagreements',
                            related_query_name='seaexpttransportagreements')
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


class SeaExportFreightBooking(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexportbookingforwarder', related_query_name='seaexportbookingforwarder')
    supplier = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexportbookingsupplier', related_query_name='seaexportbookingsupplier')

    shipper = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportbookingshipper', related_query_name='seaexportbookingshipper')
    consignee = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportbookingconsignee', related_query_name='seaexportbookingconsignee')

    origin_bank_branch = models.ForeignKey(BankBranch, on_delete=models.CASCADE, null=True, blank=True,
                                           related_name='seaexportbookingorigin', related_query_name='seaexportbookingorigin')
    destination_bank_branch = models.ForeignKey(BankBranch, on_delete=models.CASCADE, null=True, blank=True,
                                                related_name='seaexportbookingdest', related_query_name='seaexportbookingdest')

    loading_port = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexportbookingloading', related_query_name='seaexportbookingloading')
    destination_port = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexportbookingdest', related_query_name='seaexportbookingdest')
    delivery_terms = models.ForeignKey(SeaTermsofDelivery, on_delete=models.CASCADE,
                                       related_name='deliverytermsseaexportbooking',
                                       related_query_name='deliverytermsseaexportbooking')
    destination_country = models.ForeignKey(Country, on_delete=models.CASCADE,
                                            related_name='destcountryseaexportbooking', related_query_name='destcountryseaexportbooking')

    shipping_service = models.CharField(max_length=50)

    # more_address = models.ManyToManyField(AddressBook, through='SeaExportFreightBookingMoreAddressMap', through_fields=('booking', 'addressbook'),
    #                                       related_name='moreaddressseaexportbooking', related_query_name='moreaddressseaexportbooking')
    # goods_info = models.ManyToManyField(SeaExportFreightBookingGoodsInfo)
    # notify_party = models.ManyToManyField(AddressBook, through='SeaExportFreightBookingNotify', through_fields=('booking', 'addressbook'))
    # references = models.ManyToManyField(StakeholderReferenceTypes, through='SeaExportFreightBookingStakeholderReferenceTypes',
    #                                     through_fields=('booking', 'reference_types'))

    payment_type = models.ForeignKey(PaymentType, on_delete=models.CASCADE,
                                     related_name='paymenttypeseaexportbooking',
                                     related_query_name='paymenttypeseaexportbooking')
    transport_agreement = models.ForeignKey(SeaTransportAgreement, on_delete=models.CASCADE,
                                            related_name='transportagreementseaexportbooking',
                                            related_query_name='transportagreementseaexportbooking')
    delivery_note = models.TextField()

    pickup_date = models.DateField()
    pickup_time_start = models.CharField(max_length=10)
    pickup_time_end = models.CharField(max_length=10)
    pickup_note = models.TextField()

    edd = models.DateField(null=True, blank=True)

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.SET(None),
                                 related_name='entrybyseaexportbooking',
                                 related_query_name='entrybyseaexportbooking')
    entry_at = models.DateTimeField(auto_now_add=True)

    is_draft = models.BooleanField(default=False)
    is_booking_confirmed = models.BooleanField(default=False)

    confirmed_by = models.ForeignKey(get_user_model(), on_delete=models.SET(None), null=True, blank=True,
                                     related_name='confirmedbyseaexportbooking',
                                     related_query_name='confirmedbyseaexportbooking')
    confirmed_at = models.DateTimeField(null=True, blank=True)

    goods_received = models.BooleanField(default=False)
    goods_received_at = models.DateField(null=True, blank=True)
    goods_received_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True, blank=True, related_name='seafrtbookgoodsreceivedby')

    def dict(self, request):
        return {
            'id': self.id,
            'public_id': self.globalid,
            'supplier': self.supplier.dict(request),
            'edd': self.edd,
            'entry_at': self.entry_at,
            'confirmed_at': self.confirmed_at.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if self.confirmed_at else ''
        }

    @property
    def globalid(self):
        return self.public_id

    @property
    def public_id_tail(self):
        idlen = len(str(self.id))
        return '{}{}'.format(self.id, idlen)

    @property
    def public_id(self):
        return '{}/SEFB/{}'.format(self.supplier.prefix, self.public_id_tail)

    @property
    def public_id_normalized(self):
        return self.public_id.replace('/', '-')

    def __str__(self):
        return '{}'.format(self.public_id)


class SeaExportFreightBookingMoreAddressMap(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE,
                                related_name='bookingseaexportfreightbookingmoreaddressmap', related_query_name='bookingseaexportfreightbookingmoreaddressmap')
    addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE,
                                    related_name='addressseaexportfreightbookingmoreaddressmap', related_query_name='addressseaexportfreightbookingmoreaddressmap')

    is_shipper = models.BooleanField(default=False)
    is_consignee = models.BooleanField(default=False)
    is_consignor = models.BooleanField(default=False)
    is_pickup = models.BooleanField(default=False)
    is_delivery = models.BooleanField(default=False)


class SeaExportFreightBookingNotifyAddress(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE, related_name='bookingseaexportfreightbookingnotify',
                                related_query_name='bookingseaexportfreightbookingnotify')
    addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='addressseaexportfreightbookingnotify',
                                    related_query_name='addressseaexportfreightbookingnotify')


class SeaExportFreightBookingGoodsInfo(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE, related_name='seaexportfreightbookinggoodsinfo',
                                related_query_name='seaexportfreightbookinggoodsinfo')

    no_of_pieces = models.IntegerField()
    package_type = models.ForeignKey(SeaExportPackageType, on_delete=models.CASCADE)
    weight_kg = models.FloatField()

    cbm = models.FloatField()

    quantity = models.IntegerField()
    unit_price = models.FloatField()
    currency = models.ForeignKey(Currency, on_delete=models.SET(None))
    shipping_mark = models.TextField(default='')
    goods_desc = models.TextField(default='')


class SeaExportFreightBookingGoodsReference(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE, related_name='refsseaexportfreightbookinggoodsrefbooking',
                                related_query_name='refsseaexportfreightbookinggoodsrefbooking')
    goods_info = models.ForeignKey(SeaExportFreightBookingGoodsInfo, on_delete=models.CASCADE, related_name='refsseaexportfreightbookinggoodsref')
    reference_type = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE,
                                       related_name='refsseaexportfreightbookinggoodsreftype',
                                       related_query_name='refsseaexportfreightbookinggoodsreftype')
    reference_number = models.CharField(max_length=50)

    class Meta:
        unique_together = ('goods_info', 'reference_type', 'reference_number')


class SeaExportFreightBookingStakeholderReferenceTypes(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE,
                                related_name='bookingseaexportfreightbookingstakeholderreferencetypes',
                                related_query_name='bookingseaexportfreightbookingstakeholderreferencetypes')
    reference_type = models.ForeignKey(StakeholderReferenceTypes, on_delete=models.CASCADE,
                                       related_name='refsseaexportfreightbookingstakeholderreferencetypes',
                                       related_query_name='refsseaexportfreightbookingstakeholderreferencetypes')
    reference_number = models.CharField(max_length=50)


class SeaExportFreightBookingAttachedFile(models.Model):
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE, related_name='seaexportfreightbookingattachedfile')
    file = models.FileField(upload_to='media/', max_length=200)


class AllocatedOceanContainer(models.Model):
    container_type = models.ForeignKey(ContainerType, on_delete=models.CASCADE, related_name='allocatedoceancontainertype',
                                       related_query_name='allocatedoceancontainertype')
    # allocated_cbm = models.FloatField()
    container_serial = models.CharField(max_length=200)
    container_number = models.CharField(max_length=200)
    fcl_or_lcl = models.CharField(max_length=3, choices=(('fcl', 'fcl'), ('lcl', 'lcl')))

    class Meta:
        unique_together = ('container_type', 'container_serial', 'container_number')

    # def clean(self):
    #     if self.allocated_cbm > self.container_type.capacity_cbm:
    #         raise ValidationError('Allocated CBM exceeds capacity', 'invalid')
    #
    #     allocated_under_the_serial = self.allocated_cbm
    #     for alloc in AllocatedOceanContainer.objects.filter(container_serial=self.container_serial):
    #         if alloc.container_type is not self.container_type:
    #             raise ValidationError('the serial has different type container added already', 'invalid')
    #         allocated_under_the_serial += alloc.allocated_cbm
    #     if allocated_under_the_serial > self.container_type.capacity_cbm:
    #         raise ValidationError('Total Allocated CBM(with previous entries for this serial) Exceed capacity of the container type')
    #
    #     super(AllocatedOceanContainer, self).clean()


class SeaExportHBL(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexporthblforwarder', related_query_name='seaexporthblforwarder')
    booking = models.ForeignKey(SeaExportFreightBooking, on_delete=models.CASCADE,
                                related_name='seaexpthblbooking',
                                related_query_name='seaexpthblbooking', null=True, blank=True)

    supplier = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                 related_name='seaexpthblsupplier',
                                 related_query_name='seaexpthblsupplier', null=True, blank=True)  # not required is booking provided

    shipper_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexporthblshipperaddressbook')
    consignee_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexporthblconsigneeaddressbook')
    agent_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexporthblagentaddressbook', related_query_name='seaexporthblagentaddressbook')

    city_of_receipt = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexpthblcityofrcpt', related_query_name='seaexpthblcityofrcpt')
    port_of_loading = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexpthblportofload', related_query_name='seaexpthblportofload')
    feeder_vessel_name = models.TextField()
    voyage_number = models.TextField()
    mother_vessel_name = models.TextField()
    mother_vessel_voyage_number = models.TextField()
    port_of_discharge = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexpthblportofdisc', related_query_name='seaexpthblportofdisc')
    city_of_final_destination = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexpthblcityofdest', related_query_name='seaexpthblcityofdest')
    excess_value_declaration = models.TextField()

    goods_no_of_packages = models.IntegerField()
    goods_gross_weight_kg = models.FloatField()
    goods_cbm = models.FloatField()

    no_of_pallet = models.IntegerField()
    lot_number = models.IntegerField()

    goods_note = models.TextField()

    other_notes = models.TextField()

    issue_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexpthblissuecity', related_query_name='seaexpthblissuecity')
    issue_date = models.DateField()

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,
                                 related_name='entrybyseaexporthbl',
                                 related_query_name='entrybyseaexporthbl')
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    received_at_estimated = models.DateTimeField(null=True, blank=True)
    received_at_actual = models.DateTimeField(null=True, blank=True)
    received_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name='seaexportgoodsreceivedby')

    @property
    def public_id_tail(self):
        idlen = len(str(self.id))
        return '{}{}'.format(self.id, idlen)

    @property
    def public_id(self):
        return '{}/SEHBL/{}'.format(self.supplier.prefix, self.public_id_tail)

    @property
    def public_id_normalized(self):
        return self.public_id.replace('/', '-')


class SeaExportHBLContainerInfo(models.Model):
    hbl = models.ForeignKey(SeaExportHBL, on_delete=models.CASCADE, related_name='seaexporthblcontainerinfo',
                            related_query_name='seaexporthblcontainerinfo')
    allocated_container = models.ForeignKey(AllocatedOceanContainer, on_delete=models.CASCADE, related_name='seaexporthblallocatedcontainer',
                                            related_query_name='seaexporthblallocatedcontainer')

    class Meta:
        unique_together = ('hbl', 'allocated_container')


class SeaExportMBL(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexportmblforwarder', related_query_name='seaexportmblforwarder')

    mbl_number = models.CharField(max_length=20, unique=True)

    shipper_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportmblshipperaddressbook')
    consignee_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportmblconsigneeaddressbook')

    city_of_receipt = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexptmblcityofrcpt', related_query_name='seaexptmblcityofrcpt')
    port_of_loading = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexptmblportofload', related_query_name='seaexptmblportofload')
    feeder_vessel_name = models.TextField()
    voyage_number = models.TextField()
    mother_vessel_name = models.TextField()
    mother_vessel_voyage_number = models.TextField()
    port_of_discharge = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexptmblportofdisc', related_query_name='seaexptmblportofdisc')
    city_of_final_destination = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexptmblcityofdest', related_query_name='seaexptmblcityofdest')

    goods_no_of_packages = models.IntegerField()
    goods_gross_weight_kg = models.FloatField()
    goods_cbm = models.FloatField()

    issue_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexptmblissuecity', related_query_name='seaexptmblissuecity')
    issue_date = models.DateField()

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,
                                 related_name='entrybyseaexportmbl',
                                 related_query_name='entrybyseaexportmbl')
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def public_id(self):
        idlen = len(str(self.id))
        return '{}/SEMBL/{}{}'.format(self.forwarder.prefix, self.id, idlen)


# TODO should be renamed to MBLConsolidatedShipment
class SeaExportMBLToHBLMap(models.Model):
    mbl = models.ForeignKey(SeaExportMBL, on_delete=models.CASCADE, related_name='seaexportmblhblmapmbl')
    hbl = models.ForeignKey(SeaExportHBL, on_delete=models.CASCADE, related_name='seaexportmblhblmaphbl')

    entry_at = models.DateTimeField(auto_now_add=True)
    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='seaexportmblhblmapperuser')

    class Meta:
        unique_together = ('mbl', 'hbl')


class SeaExportContainerConsolShipment(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexportcontainerconsolforwarder')

    mbl_number = models.CharField(max_length=50)
    supplier = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexportcontainerconsolsupplier')

    shipper_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportcontainerconsolshipperaddressbook')
    consignee_addressbook = models.ForeignKey(AddressBook, on_delete=models.CASCADE, related_name='seaexportcontainerconsolconsigneeaddressbook')

    feeder_vessel_name = models.CharField(max_length=50)
    feeder_vessel_voyage_number = models.CharField(max_length=50)
    feeder_departure_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='feeder_dept_port')
    feeder_arrival_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='feeder_arrival_port')
    feeder_etd = models.DateField()
    feeder_eta = models.DateField()

    mother_vessel_name = models.CharField(max_length=50)
    mother_vessel_voyage_number = models.CharField(max_length=50)
    mother_departure_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='mother_dept_port')
    mother_arrival_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='mother_arrival_port')
    mother_etd = models.DateField()
    mother_eta = models.DateField()

    city_of_receipt = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexportcontainerconsolcityofrcpt')
    port_of_loading = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexportcontainerconsolportofload')
    port_of_discharge = models.ForeignKey(SeaPort, on_delete=models.CASCADE, related_name='seaexportcontainerconsolportofdisc')
    city_of_final_destination = models.ForeignKey(City, on_delete=models.CASCADE, related_name='seaexportcontainerconsolcityofdest')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE,
                                 related_name='entrybyseaexportcontainerconsol',
                                 related_query_name='entrybyseaexportcontainerconsol')
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def public_id_tail(self):
        idlen = len(str(self.id))
        return '{}{}'.format(self.id, idlen)

    @property
    def public_id(self):
        return '{}/SECCS/{}'.format(self.forwarder.prefix, self.public_id_tail)


class SeaExportContainerConsolShipmentToAllocatedContainerMap(models.Model):
    container_consol_shipment = models.ForeignKey(SeaExportContainerConsolShipment, on_delete=models.CASCADE, related_name='seaexptcontainerconsolshpmnt')
    allocated_container = models.ForeignKey(AllocatedOceanContainer, on_delete=models.CASCADE, related_name='seaexptcontainerconsolallocatedcontainer')

    class Meta:
        unique_together = ('container_consol_shipment', 'allocated_container')


class SeaExportContainerConsolShipmentAllocatedContainerToHBLMap(models.Model):
    shipment_to_container_map = models.ForeignKey(SeaExportContainerConsolShipmentToAllocatedContainerMap, on_delete=models.CASCADE, related_name='seaexptconsolcontainermap')
    hbl = models.ForeignKey(SeaExportHBL, on_delete=models.CASCADE, related_name='seaexptcontainerconsolhbl')

    class Meta:
        unique_together = ('shipment_to_container_map', 'hbl')


class SeaFrtChargeType(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class SeaExportContainerConsolidationJobCosting(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexptconsoljobcostingforwarder')

    container_consol = models.ForeignKey(SeaExportContainerConsolShipment, on_delete=models.CASCADE,
                                         related_name='seaexportconsoljobcosting', related_query_name='seaexportconsoljobcosting')

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='seaexportconsoljobcostingcurrency')
    currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True,
                                            related_name='seaexportconsoljobcostingcurrencyconversion')

    charge_type = models.ForeignKey(SeaFrtChargeType, on_delete=models.CASCADE)

    amount = models.FloatField()

    perunit_or_fixed = models.CharField(max_length=10, choices=(('perunit', 'perunit'), ('fixed', 'fixed')))

    hbl = models.ForeignKey(SeaExportHBL, on_delete=models.CASCADE, null=True, blank=True, related_name='seaexptconjobcostngshptcosthbl')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_unit_cost(self):
        return True if self.perunit_or_fixed == 'perunit' else False

    def value_in_currency(self, currency_id: int):
        if currency_id == self.currency_id:
            return self.amount
        else:
            return self.currency_conversion.convert(self.currency_id, currency_id, self.amount)

    def dict(self):
        return {
            'id': self.id,
            'container_consol': self.container_consol,
            'charge_type_id': self.charge_type_id,
            'is_unit_cost': self.perunit_or_fixed == 'perunit',
            'amount': self.amount
        }


class SeaExportDebitNote(models.Model):
    forwarder = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='seaexptconsshptdebitnoteforwarder')

    container_consol = models.ForeignKey(SeaExportContainerConsolShipment, on_delete=models.CASCADE,
                                         related_name='seaexportdebitnoteconsol')

    to_who = models.CharField(max_length=50, choices=(('mbl_consignee', 'mbl_consignee'), ('hbl_supplier', 'hbl_supplier'), ('hbl_shipper', 'hbl_shipper')))

    hbl = models.ForeignKey(SeaExportHBL, on_delete=models.CASCADE, null=True, blank=True)

    date = models.DateField()

    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='seaexptdebitnotedcurrency')
    target_currency_conversion = models.ForeignKey(CurrencyConversion, on_delete=models.CASCADE, null=True, blank=True,
                                                   related_name='seaexptdebitnotecurrencyconversion')

    entry_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    entry_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('container_consol', 'to_who')

    def to_address_company_name(self):
        if self.to_who == 'master_consignee':
            return self.consolidated_shipment.mawb.consignee.company_name
        elif self.to_who == 'house_supplier':
            return self.hawb.booking.org.addressbook_set.filter(is_default=True).first().company_name
        elif self.to_who == 'house_shipper':
            return self.hawb.shipper.company_name

    @property
    def public_id(self):
        digit_count = 10
        idlen = len(str(self.id))
        pad_dgt = digit_count - idlen
        date_dgt = self.entry_at.strftime(settings.ID_DATE_FORMAT)
        more_pad_dgt = pad_dgt - len(date_dgt)
        return '{}{}{}{}{}'.format(self.forwarder.prefix, date_dgt[:pad_dgt], '0' * more_pad_dgt, self.id, idlen)


class SeaExportDebitNoteToJobCostingMap(models.Model):
    debit_note = models.ForeignKey(SeaExportDebitNote, on_delete=models.CASCADE)
    job_costing = models.ForeignKey(SeaExportContainerConsolidationJobCosting, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('debit_note', 'job_costing')
