from django import forms
import datetime
from .models import SystemUser, AddressBook, MAWB, AirExportConsolidatedShipmentDebitNote, AuthLevelPermissions
from django.core.validators import MinValueValidator, MaxValueValidator, ValidationError
from .form_fields import CommaseparatedIntegerField
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator, validate_email, ValidationError
from freightman.validators import validate_type1_public_id
from freightman.public_id_helpers import type_1_public_id_to_model_id

from freightman.models import City, Country
from seaexport.models import SeaPort
import json

html_datefield_format_py = '%Y-%m-%d'


def debitnote_to_who_validator(val):
    choices = [choice[1] for choice in AirExportConsolidatedShipmentDebitNote._meta.get_field('to_who').choices]
    if val not in choices:
        raise ValidationError('to_who(selected address party) value is not in choice list', 'invalid')


def validate_json_string(val):
    try:
        json.loads(val)
    except:
        raise ValidationError('invalid json string', code='invalid')


class SimpleDateForm(forms.Form):
    date = forms.DateField(input_formats=[html_datefield_format_py])


class PaginationForm(forms.Form):
    page = forms.IntegerField(required=False)
    needle = forms.CharField(required=False)


class NewsForm(forms.Form):
    category_id = forms.IntegerField(required=True)
    office_id = forms.IntegerField(required=False)
    headline = forms.CharField(required=True)
    content_text = forms.CharField(required=True)


class SuperselectSearchForm(forms.Form):
    needle = forms.CharField(required=False)
    search_field = forms.CharField(required=False)
    page = forms.IntegerField(required=False, min_value=1)
    model = forms.CharField(required=True)
    filter = forms.CharField(required=False)


class SupereditForm(forms.Form):
    model = forms.CharField()
    id = forms.IntegerField()
    field = forms.CharField()
    value = forms.CharField()


class DataPaginationForm(forms.Form):
    page = forms.IntegerField(required=True, min_value=1)


class UserForm(forms.Form):
    id = forms.IntegerField(required=False)
    username = forms.CharField(max_length=10)
    first_name = forms.CharField()
    last_name = forms.CharField()
    email = forms.EmailField()
    password = forms.CharField()
    timezone_id = forms.IntegerField()

    def clean_username(self):
        username = self.cleaned_data['username']
        if not self.cleaned_data['id'] and get_user_model().objects.filter(username=username).exists():
            raise forms.ValidationError('Username exists', 'invalid')
        elif self.cleaned_data['id'] and get_user_model().objects.filter(username=username).exclude(
                id=self.cleaned_data['id']).exists():
            raise forms.ValidationError('Duplicate Username', 'invalid')
        return username

    def clean_email(self):
        email = self.cleaned_data['email']
        if not self.cleaned_data['id'] and get_user_model().objects.filter(email=email).exists():
            raise forms.ValidationError('Email exists', 'invalid')
        elif self.cleaned_data['id'] and get_user_model().objects.filter(email=email).exclude(
                id=self.cleaned_data['id']).exists():
            raise forms.ValidationError('Duplicate Email', 'invalid')
        return email


class AjaxRequestForm(forms.Form):
    action = forms.CharField()
    params = forms.CharField()


class ShipperAddressForm(forms.Form):
    shipper_id = forms.IntegerField()
    company_name = forms.CharField()
    address = forms.CharField()
    postcode = forms.IntegerField()
    city = forms.CharField()
    state = forms.CharField()
    country = forms.CharField()
    contact = forms.CharField()
    tel_num = forms.CharField()
    mobile_num = forms.CharField()
    fax_num = forms.CharField()
    email = forms.CharField(validators=[validate_email])


class AddressForm(forms.Form):
    address_id = forms.IntegerField(required=False)

    org_id = forms.IntegerField()

    booking_id = forms.IntegerField()

    booking_notify = forms.BooleanField(required=False)

    is_shipper = forms.BooleanField(required=False)
    is_consignee = forms.BooleanField(required=False)
    is_default_consignee = forms.BooleanField(required=False)
    is_consignor = forms.BooleanField(required=False)
    is_pickup = forms.BooleanField(required=False)
    is_delivery = forms.BooleanField(required=False)

    company_name = forms.CharField()
    prefix = forms.CharField(max_length=3, min_length=3)
    address = forms.CharField()
    postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length)
    city = forms.IntegerField()
    state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=False)
    country = forms.IntegerField()
    contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=False)
    email = forms.CharField(validators=[validate_email])

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class ShipperUserCreateForm(forms.Form):
    id = forms.IntegerField(required=False)
    shipper_id = forms.IntegerField()
    username = forms.CharField(required=False)
    firstname = forms.CharField()
    lastname = forms.CharField()
    email = forms.CharField(validators=[validate_email])
    password = forms.CharField()

    auth_level_id = forms.IntegerField()

    def clean_username(self):
        username = self.cleaned_data['username']
        if get_user_model().objects.filter(username=username).exists():
            raise forms.ValidationError('Username exists', 'invalid')
        return username

    def clean_email(self):
        email = self.cleaned_data['email']
        if get_user_model().objects.filter(email=email).exists():
            raise forms.ValidationError('Email exists', 'invalid')
        return email


class UserCreateForm(forms.Form):
    id = forms.IntegerField(required=False)
    username = forms.CharField(required=False)
    firstname = forms.CharField()
    lastname = forms.CharField()
    email = forms.CharField(validators=[validate_email])
    password = forms.CharField()

    auth_level_name = forms.CharField()

    org_id = forms.IntegerField()


class UserUpdateForm(forms.Form):
    id = forms.IntegerField(required=False)
    username = forms.CharField(required=False)
    firstname = forms.CharField()
    lastname = forms.CharField()
    email = forms.CharField(validators=[validate_email])
    password = forms.CharField(required=False)

    auth_level_name = forms.CharField()

    org_id = forms.IntegerField()

    def clean_email(self):
        if self.cleaned_data['id']:  # for update
            if get_user_model().objects.filter(email=self.cleaned_data['email']).exclude(id__in=[self.cleaned_data['id']]).exists():
                raise forms.ValidationError('Email assigned to another user', code='invalid')
        else:
            if get_user_model().objects.filter(email=self.cleaned_data['email']).exists():
                raise forms.ValidationError('Email assigned to another user', code='invalid')
        return self.cleaned_data['email']

    def clean(self):
        cleaned_data = super(UserUpdateForm, self).clean()

        if not cleaned_data.get('id', None) and not cleaned_data.get('password', None):
            self.add_error('password', 'password required')

        if not AuthLevelPermissions.objects.filter(level_name=cleaned_data.get('auth_level_name', None), organization_id=cleaned_data.get('org_id', None)).exists():
            raise forms.ValidationError('Auth level invalid for the org', code='invalid')


class BookingMainentryForm(forms.Form):
    status = forms.CharField()

    booking_id = forms.IntegerField(required=False)

    org_id = forms.IntegerField()

    edd = forms.DateField(input_formats=['%Y-%m-%d'], required=False)

    operation = forms.CharField()  # CRUD

    def clean(self):
        if self.is_booking_confirm and not self.cleaned_data['edd']:
            self.add_error('edd', forms.ValidationError('edd required', code='invalid'))
            return self.cleaned_data
        return self.cleaned_data

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'

    @property
    def is_draft(self):
        return self.cleaned_data['status'] == 'draft'

    @property
    def is_booking_confirm(self):
        return self.cleaned_data['status'] == 'book'

    # shipping_service = forms.CharField()
    # port_of_dest = forms.CharField()
    # port_of_load = forms.CharField()
    # terms_of_deliv = forms.CharField()
    # country_of_dest = forms.CharField()
    # pickup_date = forms.CharField()
    # pickup_earliest_time = forms.CharField()
    # pickup_latest_time = forms.CharField()
    # pickup_ins = forms.CharField()


class BookingPortsinfoForm(forms.Form):
    portinfo_id = forms.IntegerField(required=False)

    booking_id = forms.IntegerField()

    port_of_dest = forms.IntegerField()
    port_of_load = forms.IntegerField()
    terms_of_deliv = forms.CharField()
    country_of_dest = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingGoodsInfoForm(forms.Form):
    id = forms.IntegerField(required=False)
    booking_id = forms.IntegerField()

    no_of_pieces = forms.IntegerField()
    package_type = forms.IntegerField()
    weight_kg = forms.FloatField()

    chargable_weight = forms.FloatField()
    volumetric_weight = forms.FloatField()
    cbm = forms.FloatField()

    length_cm = forms.FloatField()
    width_cm = forms.FloatField()
    height_cm = forms.FloatField()
    quantity = forms.IntegerField()
    unit_price = forms.FloatField()
    currency = forms.IntegerField()
    shipping_mark = forms.CharField()
    goods_desc = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingGoodsReferencesForm(forms.Form):
    id = forms.IntegerField(required=False)
    goodsinfo_id = forms.IntegerField()
    ref_type_id = forms.IntegerField()
    ref_number = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingShippingServiceForm(forms.Form):
    id = forms.IntegerField(required=False)
    booking_id = forms.IntegerField()
    service = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingStakeholderReferencesForm(forms.Form):
    id = forms.IntegerField(required=False)
    booking_id = forms.IntegerField()

    ref_type_id = forms.IntegerField()
    ref_number = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingOrderNotesForm(forms.Form):
    id = forms.IntegerField(required=False)
    booking_id = forms.IntegerField()

    payment_ins_id = forms.IntegerField()
    transport_agreement_id = forms.IntegerField()
    delivery_instruction = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingPickupNotesForm(forms.Form):
    id = forms.IntegerField(required=False)
    booking_id = forms.IntegerField()

    pickup_date = forms.DateField(input_formats=['%Y-%m-%d'])
    pickup_time_early = forms.CharField()
    pickup_time_latest = forms.CharField()
    pickup_instruction = forms.CharField()

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'


class BookingCompletionForm(forms.Form):
    booking_id = forms.IntegerField()
    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_delete(self):
        return self.cleaned_data['operation'].lower() == 'delete'


class BookingEDDSetForm(forms.Form):
    id = forms.IntegerField()
    edd = forms.DateField(input_formats=['%Y-%m-%d'])


class HawbForm(forms.Form):
    hawb_reference_number = forms.CharField(required=False)

    booking_globalid = forms.CharField(required=False)

    booking_not_applicable = forms.IntegerField(required=False)

    house_id = forms.IntegerField(required=False)

    shipper_name = forms.CharField(max_length=30)

    shipper_address = forms.CharField(max_length=150)

    shipper_po_code = forms.CharField(max_length=15)

    shipper_city = forms.CharField(max_length=20)

    shipper_state = forms.CharField(max_length=20, required=False)

    shipper_country = forms.CharField(max_length=30)

    shipper_contact = forms.CharField(max_length=30)

    shipper_tel_number = forms.CharField(max_length=20)

    shipper_mob_num = forms.CharField(max_length=20)

    shipper_fax_num = forms.CharField(max_length=15, required=False)

    shipper_email = forms.EmailField()

    shipper_reference = forms.CharField(max_length=15, required=False)

    shipper_acc_no = forms.CharField(max_length=15, required=False)

    # Consignee forms

    consignee_name = forms.CharField(max_length=30)

    consignee_address = forms.CharField(max_length=150)

    consignee_po_code = forms.CharField(max_length=15)

    consignee_city = forms.CharField(max_length=20)

    consignee_state = forms.CharField(max_length=20, required=False)

    consignee_country = forms.CharField(max_length=30)

    consignee_contact = forms.CharField(max_length=30)

    consignee_tel_number = forms.CharField(max_length=20)

    consignee_mob_num = forms.CharField(max_length=20)

    consignee_fax_num = forms.CharField(max_length=15, required=False)

    consignee_email = forms.EmailField()

    consignee_reference = forms.CharField(max_length=15, required=False)
    consignee_acc_no = forms.CharField(max_length=15, required=False)

    # Carrier agent forms

    carrier_agent_name = forms.CharField(max_length=30)

    carrier_agent_city = forms.IntegerField()

    carrier_agent_state = forms.CharField(max_length=30, required=False)

    carrier_agent_country = forms.IntegerField()

    carrier_agent_ffl = forms.CharField(max_length=20, required=False)

    carrier_agent_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    carrier_agent_iata_code = forms.IntegerField(required=False)

    carrier_agent_acc_no = forms.CharField(max_length=20, required=False)

    payment_type = forms.IntegerField()

    departure_airport = forms.CharField(max_length=20, required=False)

    requested_routing = forms.CharField(max_length=50, required=False)

    destination_to_1_airport = forms.IntegerField(required=False)
    destination_to_1_airline = forms.IntegerField(required=False)
    destination_to_1_flight_num = forms.CharField(required=False)
    destination_to_1_flight_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    destination_to_2_airport = forms.IntegerField(required=False)
    destination_to_2_flight_num = forms.CharField(required=False)
    destination_to_2_flight_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)
    destination_by_2_airline = forms.IntegerField(required=False)

    destination_to_3_airport = forms.IntegerField(required=False)
    destination_to_3_airline = forms.IntegerField(required=False)
    destination_to_3_flight_num = forms.CharField(required=False)
    destination_to_3_flight_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    dest_airport = forms.IntegerField()

    requested_flight_info = forms.CharField(max_length=50, required=False)

    reff_no_1 = forms.CharField(max_length=20, required=False)

    reff_no_2 = forms.CharField(max_length=20, required=False)

    reff_no_3 = forms.CharField(max_length=20, required=False)

    currency = forms.CharField(max_length=3)

    cngs_code = forms.CharField(max_length=10)  # NVD by default

    wt = forms.IntegerField()

    other_wt = forms.IntegerField()

    carriage_value = forms.CharField()

    customs_value = forms.CharField()

    insurance_amount = forms.CharField()

    handling_info = forms.CharField(max_length=150, required=False)
    #
    # heading_body = forms.CharField(max_length=100)
    #
    # heading_sci = forms.CharField(max_length=20)

    goods_no_piece_rcp = forms.IntegerField()

    goods_gross_weight = forms.FloatField()

    goods_weight_unit = forms.CharField(max_length=3)

    goods_commodity_item_no = forms.CharField()

    goods_chargeable_weight = forms.FloatField()

    goods_rate = forms.FloatField()

    goods_total = forms.FloatField()
    #
    # goods_po_description = forms.CharField(max_length=15)
    #
    # goods_po_style_name = forms.CharField(max_length=15)

    goods_nature = forms.CharField(max_length=300)

    weightcharge_prepaid = forms.FloatField(required=False)

    weightcharge_collect = forms.FloatField(required=False)

    others_valuation_prepaid = forms.FloatField(required=False)

    others_valuation_collect = forms.FloatField(required=False)

    others_tax_prepaid = forms.FloatField(required=False)

    others_tax_collect = forms.FloatField(required=False)

    others_cda_prepaid = forms.FloatField(required=False)

    others_cda_collect = forms.FloatField(required=False)

    others_cdc_prepaid = forms.FloatField(required=False)

    others_cdc_collect = forms.FloatField(required=False)

    others_total_prepaid = forms.FloatField(required=False)

    others_total_collect = forms.FloatField(required=False)

    others_ccr = forms.FloatField(required=False)

    others_ccc_dest = forms.FloatField(required=False)

    others_cad = forms.FloatField(required=False)

    others_tcc = forms.FloatField(required=False)

    others_charges = forms.FloatField(required=False)

    others_signature = forms.CharField(max_length=20, required=False)

    others_ex_date = forms.CharField(max_length=20)

    others_ex_loc = forms.CharField(max_length=20)

    others_sic = forms.CharField(max_length=20, required=False)

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'

    def is_delete(self):
        return self.cleaned_data['operation'].lower() == 'delete'

    def clean(self):
        cleaned_data = super(HawbForm, self).clean()
        if cleaned_data.get('booking_not_applicable', None) and not cleaned_data.get('house_id', None):
            self.add_error('house_id', 'This field is required')
        if not cleaned_data.get('booking_not_applicable', None) and not cleaned_data.get('booking_globalid', None):
            self.add_error('booking_globalid', 'This field is required')
        return cleaned_data


class MawbModelForm(forms.ModelForm):
    class Meta:
        model = MAWB
        exclude = ('',)


class MawbForm(forms.Form):
    mawb_public_id = forms.CharField(required=False)

    # awb_id = forms.IntegerField()
    mawb_number = forms.CharField(max_length=11, min_length=11)

    shipper_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)

    shipper_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)

    shipper_po_code = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length)

    shipper_city = forms.IntegerField()

    shipper_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=False)

    shipper_country = forms.IntegerField()

    shipper_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)

    shipper_tel_number = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)

    shipper_mob_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)

    shipper_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=False)

    shipper_email = forms.EmailField()

    shipper_reference = forms.CharField(max_length=15, required=False)

    shipper_acc_no = forms.CharField(max_length=15, required=False)

    # Consignee forms

    consignee_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)

    consignee_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)

    consignee_po_code = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length)

    consignee_city = forms.IntegerField()

    consignee_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=False)

    consignee_country = forms.IntegerField()

    consignee_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)

    consignee_tel_number = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)

    consignee_mob_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)

    consignee_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=False)

    consignee_email = forms.EmailField()

    consignee_reference = forms.CharField(max_length=15, required=False)
    consignee_acc_no = forms.CharField(max_length=15, required=False)

    # Carrier agent forms

    carrier_agent_id = forms.IntegerField()

    carrier_agent_name = forms.CharField(max_length=MAWB._meta.get_field('carrier_agent_name').max_length)

    carrier_agent_city = forms.IntegerField()

    carrier_agent_state = forms.CharField(max_length=MAWB._meta.get_field('carrier_agent_state').max_length, required=False)

    carrier_agent_country = forms.IntegerField()

    carrier_agent_ffl = forms.CharField(max_length=MAWB._meta.get_field('carrier_agent_ffl_no').max_length, required=False)

    carrier_agent_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    carrier_agent_iata_code = forms.IntegerField(required=True)

    carrier_agent_acc_no = forms.CharField(max_length=MAWB._meta.get_field('carrier_agent_account_no').max_length, required=False)

    payment_type = forms.IntegerField()

    departure_airport = forms.IntegerField()

    requested_routing = forms.CharField(max_length=MAWB._meta.get_field('requested_routing').max_length, required=False)

    destination_to_1_airport = forms.IntegerField()
    destination_to_1_airline = forms.IntegerField()
    destination_to_1_flight_num = forms.CharField(max_length=MAWB._meta.get_field('to_1_flight_num').max_length)
    destination_to_1_flight_date = forms.DateField(input_formats=[html_datefield_format_py])

    destination_to_2_airport = forms.IntegerField(required=False)
    destination_to_2_flight_num = forms.CharField(required=False, max_length=MAWB._meta.get_field('to_2_flight_num').max_length)
    destination_to_2_flight_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)
    destination_to_2_airline = forms.IntegerField(required=False)

    destination_to_3_airport = forms.IntegerField(required=False)
    destination_to_3_airline = forms.IntegerField(required=False)
    destination_to_3_flight_num = forms.CharField(required=False, max_length=MAWB._meta.get_field('to_3_flight_num').max_length)
    destination_to_3_flight_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    dest_airport = forms.IntegerField()

    requested_flight_date = forms.CharField(max_length=MAWB._meta.get_field('requested_flight_date').max_length, required=False)

    reff_no_1 = forms.CharField(max_length=MAWB._meta.get_field('reff_no_1').max_length, required=False)

    reff_no_2 = forms.CharField(max_length=MAWB._meta.get_field('reff_no_2').max_length, required=False)

    reff_no_3 = forms.CharField(max_length=MAWB._meta.get_field('reff_no_3').max_length, required=False)

    currency = forms.IntegerField()

    cngs_code = forms.CharField(max_length=MAWB._meta.get_field('cngs_code').max_length, required=False)

    wt = forms.IntegerField()

    other_wt = forms.IntegerField()

    carriage_value = forms.CharField(max_length=MAWB._meta.get_field('declared_val_for_carriage').max_length)

    customs_value = forms.CharField(max_length=MAWB._meta.get_field('declared_val_for_customs').max_length)

    insurance_amount = forms.CharField(max_length=MAWB._meta.get_field('amt_of_insurance').max_length)

    handling_info = forms.CharField()
    #
    # heading_body = forms.CharField(max_length=100)
    #
    # heading_sci = forms.CharField(max_length=20)

    goods_no_piece_rcp = forms.IntegerField()

    goods_gross_weight = forms.FloatField()

    goods_weight_unit = forms.CharField(max_length=MAWB._meta.get_field('goods_weightunit').max_length)

    goods_commodity_item_no = forms.CharField(max_length=MAWB._meta.get_field('goods_commodityitemno').max_length)

    goods_chargeable_weight = forms.FloatField()

    goods_rate = forms.FloatField()

    goods_total = forms.FloatField()
    #
    # goods_po_description = forms.CharField(max_length=15)
    #
    # goods_po_style_name = forms.CharField(max_length=15)

    goods_nature = forms.CharField()

    weightcharge_prepaid = forms.FloatField(required=False)

    weightcharge_collect = forms.FloatField(required=False)

    others_valuation_prepaid = forms.FloatField(required=False)

    others_valuation_collect = forms.FloatField(required=False)

    others_tax_prepaid = forms.FloatField(required=False)

    others_tax_collect = forms.FloatField(required=False)

    others_cda_prepaid = forms.FloatField(required=False)

    others_cda_collect = forms.FloatField(required=False)

    others_cdc_prepaid = forms.FloatField(required=False)

    others_cdc_collect = forms.FloatField(required=False)

    others_total_prepaid = forms.FloatField(required=False)

    others_total_collect = forms.FloatField(required=False)

    others_ccr = forms.FloatField(required=False)

    others_ccc_dest = forms.FloatField(required=False)

    others_cad = forms.FloatField(required=False)

    others_tcc = forms.FloatField(required=False)

    others_charges = forms.FloatField(required=False)

    others_signature = forms.CharField(max_length=MAWB._meta.get_field('signature_shipperoragent').max_length, required=False)

    others_ex_date = forms.DateField(input_formats=[html_datefield_format_py])

    others_ex_loc = forms.IntegerField()

    others_sic = forms.CharField(max_length=MAWB._meta.get_field('signature_issuingcarrieroragent').max_length, required=False)

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'

    def is_delete(self):
        return self.cleaned_data['operation'].lower() == 'delete'

    def clean_mawb_number(self):
        mawb_number = self.cleaned_data['mawb_number']
        if not self.cleaned_data['mawb_public_id'] and MAWB.objects.filter(mawb_number=mawb_number).exists():
            raise forms.ValidationError('Duplicate MAWB Number')
        return mawb_number


class PublicIDForm(forms.Form):
    public_id = forms.CharField(validators=[validate_type1_public_id])

    id = None

    def clean_public_id(self):
        print(self.cleaned_data)
        self.id = type_1_public_id_to_model_id(self.cleaned_data['public_id'])
        return self.cleaned_data['public_id']


class JobDatesForm(forms.Form):
    hawb_public_id = forms.CharField(validators=[validate_type1_public_id])
    received_estimated = forms.DateField(input_formats=[html_datefield_format_py], required=False)
    received_actual = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    id = None

    def clean_hawb_public_id(self):
        self.id = type_1_public_id_to_model_id(self.cleaned_data['hawb_public_id'])
        return self.cleaned_data['hawb_public_id']


class SupplierPublicIDForm(forms.Form):
    supplier_public_id = forms.CharField(validators=[validate_type1_public_id])

    id = None

    def clean_supplier_public_id(self):
        self.id = type_1_public_id_to_model_id(self.cleaned_data['supplier_public_id'])
        return self.cleaned_data['supplier_public_id']


class DebitNoteForm(forms.Form):
    debitnote_public_id = forms.CharField(required=False)
    consolidation_public_id = forms.CharField()
    to_who = forms.CharField(validators=[debitnote_to_who_validator])
    to_hawb_public_id_if_applies = forms.CharField(required=False)
    date = forms.DateField(input_formats=[html_datefield_format_py])

    currency_id = forms.IntegerField()

    display_currency_conversion_from_currency_id = forms.IntegerField(required=False)
    display_currency_conversion_to_currency_id = forms.IntegerField(required=False)
    display_currency_conversion_rate = forms.FloatField(required=False)

    charges_list = forms.CharField(validators=[validate_json_string])

    #
    debitnote_id = None
    consolidation_id = None
    charge_applies_to_hawb = False
    hawb_id = None  # will be set in the clean method

    def clean(self):
        cleaned_data = super(DebitNoteForm, self).clean()
        if cleaned_data['to_who'] in ['house_supplier', 'house_shipper'] and not cleaned_data['to_hawb_public_id_if_applies']:
            raise forms.ValidationError('HAWB not selected but charge type is related to house', code='invalid')
        if cleaned_data['display_currency_conversion_to_currency_id'] or cleaned_data['display_currency_conversion_rate']:
            if not (cleaned_data['display_currency_conversion_from_currency_id'] and cleaned_data['display_currency_conversion_to_currency_id'] and cleaned_data[
                'display_currency_conversion_rate']):
                raise forms.ValidationError('Currency conversion data incomplete', code='invalid')
        if cleaned_data['to_who'] not in ['house_supplier', 'house_shipper']:
            cleaned_data['to_hawb_public_id_if_applies'] = ''
        else:
            self.charge_applies_to_hawb = True
            self.hawb_id = type_1_public_id_to_model_id(cleaned_data['to_hawb_public_id_if_applies'])

        self.consolidation_id = type_1_public_id_to_model_id(cleaned_data['consolidation_public_id'])
        self.debitnote_id = type_1_public_id_to_model_id(cleaned_data['debitnote_public_id']) if cleaned_data['debitnote_public_id'] else None

        return cleaned_data

    def validated_charges_form_list(self):
        valid_form_list = []
        has_error = False
        charge_form_error_list = []
        for chargeinfo in json.loads(self.cleaned_data['charges_list']):
            form = DebitNoteChargeForm(chargeinfo)
            if form.is_valid():
                valid_form_list.append(form)
            else:
                has_error = True
                charge_form_error_list.append({
                    'list_index': form.cleaned_data['list_index'],
                    'errors': form.non_field_errors(),
                    'form_errors': form.errors
                })
        return valid_form_list, has_error, charge_form_error_list


class DebitNoteChargeForm(forms.Form):
    list_index = forms.IntegerField()
    charge_type_id = forms.IntegerField()
    is_unit_cost = forms.BooleanField(required=False)
    fixed_or_unit_amount = forms.FloatField()


class UserOrgForm(forms.Form):
    user_id = forms.IntegerField(required=False)
    org_id = forms.IntegerField(required=False)


class OrgPublicIDForm(forms.Form):
    org_public_id = forms.CharField()

    org_id = None

    def clean_org_public_id(self):
        self.org_id = type_1_public_id_to_model_id(self.cleaned_data.get('org_public_id', None))


class OrgCreateForm(forms.Form):
    id = forms.IntegerField(required=False)
    company_name = forms.CharField()
    prefix = forms.CharField(min_length=3, max_length=3)


class FileUploadForm(forms.Form):
    file = forms.FileField()


class CityForm(forms.ModelForm):
    class Meta:
        model = City
        fields = ['name', 'country']


class CountryForm(forms.ModelForm):
    class Meta:
        model = Country
        fields = ['name', 'code_isoa2']


class SeaPortForm(forms.ModelForm):
    class Meta:
        model = SeaPort
        fields = ['name', 'city']
