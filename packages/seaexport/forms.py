from django import forms
from freightman.models import AddressBook, Bank, BankBranch
from seaexport.models import SeaExportFreightBooking, SeaExportFreightBookingStakeholderReferenceTypes, SeaExportFreightBookingGoodsInfo, \
    SeaExportFreightBookingGoodsReference
from django.core.validators import validate_email
from freightman.validators import validate_json_string, json_is_nonempty_list, validate_type1_public_id
from freightman.public_id_helpers import type_1_public_id_to_model_id
from urllib.parse import unquote
import json

html_datefield_format_py = '%Y-%m-%d'


class SeaExportFrtAddressForm(forms.Form):
    list_index = forms.IntegerField()
    id = forms.IntegerField(required=False)

    booking_notify = forms.BooleanField(required=False)

    is_additional_address = forms.BooleanField(required=False)

    is_shipper = forms.BooleanField(required=False)
    is_consignee = forms.BooleanField(required=False)
    is_consignor = forms.BooleanField(required=False)
    is_pickup = forms.BooleanField(required=False)
    is_delivery = forms.BooleanField(required=False)

    company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    city = forms.IntegerField()
    state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    country = forms.IntegerField()
    contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    email = forms.CharField(validators=[validate_email])


class SeaExportFrtBankForm(forms.Form):
    list_index = forms.IntegerField()
    branch_id = forms.IntegerField(required=False)
    in_origin_leg = forms.BooleanField(required=False)
    bank_name = forms.CharField(max_length=Bank._meta.get_field('bank_name').max_length)
    branch_name = forms.CharField(max_length=BankBranch._meta.get_field('branch_name').max_length)
    branch_address = forms.CharField(max_length=BankBranch._meta.get_field('branch_address').max_length)


class SeaExportFrtGoodsRefForm(forms.Form):
    list_index = forms.IntegerField()
    ref_type_id = forms.IntegerField()
    ref_number = forms.CharField(max_length=SeaExportFreightBookingGoodsReference._meta.get_field('reference_number').max_length)


class SeaExportFrtGoodsForm(forms.Form):
    list_index = forms.IntegerField()
    id = forms.IntegerField(required=False)

    no_of_pieces = forms.IntegerField()
    package_type = forms.IntegerField()
    weight_kg = forms.FloatField()

    cbm = forms.FloatField()

    quantity = forms.IntegerField()
    unit_price = forms.FloatField()
    currency = forms.IntegerField()
    shipping_mark = forms.CharField()
    goods_desc = forms.CharField()

    references_json = forms.CharField(validators=[validate_json_string])
    references_valid_form_list = []
    references_error_list = []

    def clean(self):
        cleaned_data = super(SeaExportFrtGoodsForm, self).clean()
        for refinfo in json.loads(cleaned_data['references_json']):
            form = SeaExportFrtGoodsRefForm(refinfo)
            if form.is_valid():
                self.references_valid_form_list.append(form)
            else:
                self.add_error('references_json', 'reference invalid')
                self.references_error_list.append({
                    'list_index': form.cleaned_data['list_index'],
                    'form_errors': form.errors,
                    'errors': form.non_field_errors()
                })

        return cleaned_data


class SeaExportFrtStakeholderRefForm(forms.Form):
    list_index = forms.IntegerField()
    ref_type_id = forms.IntegerField()
    ref_number = forms.CharField(max_length=SeaExportFreightBookingStakeholderReferenceTypes._meta.get_field('reference_number').max_length)


class SeaExportFrtBookingForm(forms.Form):
    booking_public_id = forms.CharField(required=False)
    supplier_public_id = forms.CharField()
    is_confirm = forms.BooleanField(required=False)
    edd = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    addressbook_list = forms.CharField()
    bank_branch_list = forms.CharField(required=False)
    goods_list = forms.CharField(validators=[validate_json_string, json_is_nonempty_list])
    stakeholder_ref_list = forms.CharField(required=False)

    port_of_dest = forms.IntegerField()
    port_of_load = forms.IntegerField()
    terms_of_deliv = forms.IntegerField()
    country_of_dest = forms.IntegerField()
    shipping_service = forms.CharField(max_length=SeaExportFreightBooking._meta.get_field('shipping_service').max_length)
    frt_payment_ins = forms.IntegerField()
    frt_transport_agreement_id = forms.IntegerField()
    frt_delivery_instruction = forms.CharField(max_length=SeaExportFreightBooking._meta.get_field('delivery_note').max_length, required=False)
    pickup_date = forms.DateField(input_formats=[html_datefield_format_py])
    pickup_earliest_time = forms.CharField(max_length=SeaExportFreightBooking._meta.get_field('pickup_time_start').max_length)
    pickup_latest_time = forms.CharField(max_length=SeaExportFreightBooking._meta.get_field('pickup_time_end').max_length)
    pickup_ins = forms.CharField(max_length=SeaExportFreightBooking._meta.get_field('pickup_note').max_length, required=False)

    uplaodedfile_url_list_json = forms.CharField(validators=[validate_json_string])

    uplaodedfile_url_list = []

    def clean(self):
        cleaned_data = super(SeaExportFrtBookingForm, self).clean()
        for url in json.loads(cleaned_data['uplaodedfile_url_list_json']):
            self.uplaodedfile_url_list.append(unquote(url))
        return cleaned_data


class BookingConfirmForm(forms.Form):
    booking_public_id = forms.CharField()
    edd = forms.DateField(input_formats=[html_datefield_format_py])


class BookingPublicIDForm(forms.Form):
    booking_public_id = forms.CharField(validators=[validate_type1_public_id])

    id = None

    def clean_booking_public_id(self):
        self.id = type_1_public_id_to_model_id(self.cleaned_data['booking_public_id'])
        return self.cleaned_data['booking_public_id']


class JobDatesForm(forms.Form):
    hbl_public_id = forms.CharField(validators=[validate_type1_public_id])
    received_estimated = forms.DateField(input_formats=[html_datefield_format_py], required=False)
    received_actual = forms.DateField(input_formats=[html_datefield_format_py], required=False)

    id = None

    def clean_hbl_public_id(self):
        self.id = type_1_public_id_to_model_id(self.cleaned_data['hbl_public_id'])
        return self.cleaned_data['hbl_public_id']


class DailyReportPaginationForm(forms.Form):
    page = forms.IntegerField(required=False)
    needle = forms.CharField(required=False)
    report_date = forms.DateField(input_formats=[html_datefield_format_py], required=False)


class CostForm(forms.Form):
    list_index = forms.IntegerField()
    charge_type_id = forms.IntegerField()
    value = forms.FloatField()
    currency_id = forms.IntegerField()
    currency_conversion_rate_id = forms.IntegerField(required=False)
    hbl_public_id = forms.CharField(required=False)
    is_unit_cost = forms.BooleanField(required=False)

    def clean(self):
        cleaned_data = super(CostForm, self).clean()
        if cleaned_data.get('is_unit_cost') and not cleaned_data.get('hbl_public_id'):
            self.add_error('hbl_public_id', 'HBL not selected')
        return cleaned_data


class JobCostingForm(forms.Form):
    consolidation_public_id = forms.CharField(validators=[validate_type1_public_id])
    cost_list_json = forms.CharField(validators=[validate_json_string, json_is_nonempty_list])

    consolidation_id = None
    cost_form_error_list = []
    valid_cost_form_list = []

    def clean(self):
        cleaned_data = super(JobCostingForm, self).clean()
        self.consolidation_id = type_1_public_id_to_model_id(cleaned_data['consolidation_public_id'])
        cost_list_json = cleaned_data.get('cost_list_json')
        print(cost_list_json)
        if not cost_list_json:
            pass
        else:
            for cost in json.loads(cost_list_json):
                form = CostForm(cost)
                if form.is_valid():
                    self.valid_cost_form_list.append(form)
                else:
                    self.cost_form_error_list.append({'list_index': form.cleaned_data['list_index'], 'misc_errors': form.non_field_errors(), 'field_errors': form.errors})
                    self.add_error('cost_list_json', 'Invalid cost data')

        return cleaned_data
