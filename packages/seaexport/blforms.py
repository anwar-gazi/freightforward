from django import forms
from freightman.models import AddressBook
from seaexport.models import AllocatedOceanContainer, ContainerType, SeaExportMBL
from freightman.public_id_helpers import type_1_public_id_to_model_id
from django.core.validators import validate_email
from freightman.validators import validate_json_string, json_is_nonempty_list, validate_type1_public_id, validate_type1_public_id_list
from seaexport.validators import validate_booking_confirmed, validate_booking_goods_received
import json
import functools

html_datefield_format_py = '%Y-%m-%d'


class AllocatedContainerForm(forms.Form):
    list_index = forms.IntegerField()
    container_type_id = forms.IntegerField()
    container_serial = forms.CharField()
    container_number = forms.CharField()


class BLAddressForm(forms.Form):
    id = forms.IntegerField(required=False)

    company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length)
    city = forms.IntegerField()
    state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    country = forms.IntegerField()
    contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    email = forms.CharField(validators=[validate_email])


class HBLForm(forms.Form):
    hbl_public_id = forms.CharField(required=False)

    booking_applies = forms.IntegerField()
    booking_public_id = forms.CharField(validators=[validate_type1_public_id, validate_booking_confirmed, validate_booking_goods_received], required=False)
    supplier_public_id = forms.CharField(validators=[validate_type1_public_id], required=False)

    shipper_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    shipper_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    shipper_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    shipper_city = forms.IntegerField()
    shipper_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    shipper_country = forms.IntegerField()
    shipper_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    shipper_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    shipper_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    shipper_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    shipper_email = forms.CharField(validators=[validate_email])

    consignee_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    consignee_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    consignee_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    consignee_city = forms.IntegerField()
    consignee_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    consignee_country = forms.IntegerField()
    consignee_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    consignee_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    consignee_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    consignee_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    consignee_email = forms.CharField(validators=[validate_email])

    agent_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    agent_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    agent_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length)
    agent_city = forms.IntegerField()
    agent_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    agent_country = forms.IntegerField()
    agent_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    agent_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    agent_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    agent_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    agent_email = forms.CharField(validators=[validate_email])

    container_list = forms.CharField(validators=[validate_json_string], required=False)

    city_id_of_receipt = forms.IntegerField()
    port_id_of_loading = forms.IntegerField()
    feeder_vessel_name = forms.CharField()
    voyage_number = forms.CharField()
    mother_vessel_name = forms.CharField()
    mother_vessel_voyage_number = forms.CharField()
    port_id_of_discharge = forms.IntegerField()
    city_id_of_final_destination = forms.IntegerField()
    excess_value_declaration = forms.CharField()

    goods_no_of_packages = forms.IntegerField()
    goods_gross_weight_kg = forms.FloatField()
    goods_cbm = forms.FloatField()

    no_of_pallet = forms.IntegerField()
    lot_number = forms.IntegerField()

    goods_note = forms.CharField()

    other_notes = forms.CharField()

    issue_city_id = forms.IntegerField()
    issue_date = forms.DateField(input_formats=[html_datefield_format_py])

    container_valid_form_list = []
    container_error_list = []

    def clean_container_list(self):
        for allocated_container_info in json.loads(self.cleaned_data['container_list']):
            form = AllocatedContainerForm(allocated_container_info)
            if form.is_valid():
                self.container_valid_form_list.append(form)
            else:
                self.container_error_list.append({
                    'list_index': form.cleaned_data['list_index'],
                    'errors': form.non_field_errors(),
                    'form_errors': form.errors
                })
        if len(self.container_error_list):
            raise forms.ValidationError('container info invalid', 'invalid')
        return self.cleaned_data['container_list']

    def clean(self):
        cleaned_data = super(HBLForm, self).clean()
        print(cleaned_data)
        if not cleaned_data.get('booking_applies', None) and not cleaned_data.get('supplier_public_id', None):
            self.add_error('supplier_public_id', 'This field is required')
        if cleaned_data.get('booking_applies', None) and not cleaned_data.get('booking_public_id', None):
            self.add_error('booking_public_id', 'This field is required')

        if not len(self.container_error_list):
            total_cbm_from_containers = 0
            for containerform in self.container_valid_form_list:  # type: AllocatedContainerForm
                container_type = ContainerType.objects.get(id=containerform.cleaned_data['container_type_id'])
                total_cbm_from_containers += container_type.capacity_cbm
        return cleaned_data

    @property
    def supplier_id(self):
        return type_1_public_id_to_model_id(self.cleaned_data['supplier_public_id'])


class HBLIDFormForMBLMapping(forms.Form):
    list_index = forms.IntegerField()
    public_id = forms.CharField(validators=[validate_type1_public_id])

    id = None

    def clean_public_id(self):
        self.id = type_1_public_id_to_model_id(self.cleaned_data['public_id'])
        return self.cleaned_data['public_id']


class MBLForm(forms.Form):
    mbl_public_id = forms.CharField(required=False, validators=[validate_type1_public_id])
    mbl_number = forms.CharField(max_length=20)

    shipper_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    shipper_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    shipper_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    shipper_city = forms.IntegerField()
    shipper_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    shipper_country = forms.IntegerField()
    shipper_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    shipper_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    shipper_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    shipper_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    shipper_email = forms.EmailField()

    consignee_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    consignee_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    consignee_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    consignee_city = forms.IntegerField()
    consignee_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    consignee_country = forms.IntegerField()
    consignee_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    consignee_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    consignee_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    consignee_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    consignee_email = forms.EmailField()

    hbl_list_json = forms.CharField(validators=[validate_json_string, json_is_nonempty_list])

    city_id_of_receipt = forms.IntegerField()
    port_id_of_loading = forms.IntegerField()
    feeder_vessel_name = forms.CharField()
    voyage_number = forms.CharField()
    mother_vessel_name = forms.CharField()
    mother_vessel_voyage_number = forms.CharField()
    port_id_of_discharge = forms.IntegerField()
    city_id_of_final_destination = forms.IntegerField()

    goods_no_of_packages = forms.IntegerField()
    goods_gross_weight_kg = forms.FloatField()
    goods_cbm = forms.FloatField()

    issue_city_id = forms.IntegerField()
    issue_date = forms.DateField(input_formats=[html_datefield_format_py])

    # our custom properties
    mbl_id = None

    hbl_valid_form_list = []
    hbl_error_list = []

    def clean_hbl_list_json(self):
        hbl_list_json = self.cleaned_data['hbl_list_json']
        hbl_list = json.loads(self.cleaned_data['hbl_list_json'])
        for hblinfo in hbl_list:
            hblform = HBLIDFormForMBLMapping(hblinfo)
            if hblform.is_valid():
                self.hbl_valid_form_list.append(hblform)
            else:
                self.hbl_error_list.append({
                    'list_index': hblform.cleaned_data['list_index'],
                    'errors': hblform.non_field_errors(),
                    'form_errors': hblform.errors,
                })
        if len(self.hbl_error_list):
            raise forms.ValidationError('HBL list invalid')

        return hbl_list_json

    def clean(self):
        cleaned_data = super(MBLForm, self).clean()
        if cleaned_data.get('mbl_public_id', None):
            self.mbl_id = type_1_public_id_to_model_id(cleaned_data.get('mbl_public_id', None))
            q = SeaExportMBL.objects.filter(mbl_number=cleaned_data.get('mbl_number', None)).exclude(id=self.mbl_id)
            if q.exists():
                self.add_error('mb_number', 'mbl number used for another mbl#{}'.format(','.join([mbl.public_id for mbl in q])))
        else:
            q = SeaExportMBL.objects.filter(mbl_number=cleaned_data.get('mbl_number', None))
            if q.exists():
                self.add_error('mb_number', 'mbl number used for another mbl#{}'.format(','.join([mbl.public_id for mbl in q])))
        return cleaned_data


class ContainerSerialForm(forms.Form):
    serial = forms.CharField()


class ConsolContainerForm(forms.Form):
    list_index = forms.IntegerField()
    allocated_container_id = forms.IntegerField(required=False)
    container_type_id = forms.IntegerField()
    container_number = forms.CharField()
    container_serial = forms.CharField()
    fcl_or_lcl = forms.CharField()

    hbl_public_id_list_json = forms.CharField(validators=[validate_json_string, json_is_nonempty_list])

    # out custom prop
    hbl_id_list = []

    def clean_hbl_public_id_list_json(self):
        for hbl_public_id in json.loads(self.cleaned_data['hbl_public_id_list_json']):
            validate_type1_public_id(hbl_public_id)
            self.hbl_id_list.append(type_1_public_id_to_model_id(hbl_public_id))
        return self.cleaned_data['hbl_public_id_list_json']

    def clean_fcl_or_lcl(self):
        if self.cleaned_data['fcl_or_lcl'] not in ['fcl', 'lcl']:
            raise forms.ValidationError('allocation identifier should be fcl or lcl')
        return self.cleaned_data['fcl_or_lcl']


class ContainerConsolForm(forms.Form):
    public_id = forms.CharField(validators=[validate_type1_public_id], required=False)

    mbl_number = forms.CharField()

    supplier_public_id = forms.CharField(validators=[validate_type1_public_id])

    container_list_json = forms.CharField(validators=[validate_json_string, json_is_nonempty_list])

    shipper_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    shipper_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    shipper_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    shipper_city = forms.IntegerField()
    shipper_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    shipper_country = forms.IntegerField()
    shipper_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    shipper_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    shipper_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    shipper_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    shipper_email = forms.EmailField()

    consignee_company_name = forms.CharField(max_length=AddressBook._meta.get_field('company_name').max_length)
    consignee_address = forms.CharField(max_length=AddressBook._meta.get_field('address').max_length)
    consignee_postcode = forms.CharField(max_length=AddressBook._meta.get_field('postcode').max_length, required=not AddressBook._meta.get_field('postcode').blank)
    consignee_city = forms.IntegerField()
    consignee_state = forms.CharField(max_length=AddressBook._meta.get_field('state').max_length, required=not AddressBook._meta.get_field('state').blank)
    consignee_country = forms.IntegerField()
    consignee_contact = forms.CharField(max_length=AddressBook._meta.get_field('contact').max_length)
    consignee_tel_num = forms.CharField(max_length=AddressBook._meta.get_field('phone').max_length)
    consignee_mobile_num = forms.CharField(max_length=AddressBook._meta.get_field('mobile').max_length)
    consignee_fax_num = forms.CharField(max_length=AddressBook._meta.get_field('fax').max_length, required=not AddressBook._meta.get_field('fax').blank)
    consignee_email = forms.EmailField()

    feeder_vessel_name = forms.CharField(max_length=50)
    feeder_vessel_voyage_number = forms.CharField(max_length=50)
    feeder_departure_city_id = forms.IntegerField()
    feeder_arrival_city_id = forms.IntegerField()
    feeder_etd = forms.DateField(input_formats=[html_datefield_format_py])
    feeder_eta = forms.DateField(input_formats=[html_datefield_format_py])

    mother_vessel_name = forms.CharField(max_length=50)
    mother_vessel_voyage_number = forms.CharField(max_length=50)
    mother_departure_city_id = forms.IntegerField()
    mother_arrival_city_id = forms.IntegerField()
    mother_etd = forms.DateField(input_formats=[html_datefield_format_py])
    mother_eta = forms.DateField(input_formats=[html_datefield_format_py])

    city_id_of_receipt = forms.IntegerField()
    port_id_of_loading = forms.IntegerField()
    port_id_of_discharge = forms.IntegerField()
    city_id_of_final_destination = forms.IntegerField()

    # our custom props
    id = None
    container_valid_form_list = []
    container_error_list = []

    def clean_container_list_json(self):
        container_list = json.loads(self.cleaned_data['container_list_json'])
        for info in container_list:
            form = ConsolContainerForm(info)
            if form.is_valid():
                self.container_valid_form_list.append(form)
            else:
                self.container_error_list.append({
                    'list_index': form.cleaned_data['list_index'],
                    'errors': form.non_field_errors(),
                    'form_errors': form.errors,
                })
        if len(self.container_error_list):
            raise forms.ValidationError('Container list invalid')

        return self.cleaned_data['container_list_json']

    def clean(self):
        cleaned_data = super(ContainerConsolForm, self).clean()
        if cleaned_data.get('public_id', None):
            self.id = type_1_public_id_to_model_id(cleaned_data.get('public_id', None))
        return cleaned_data
