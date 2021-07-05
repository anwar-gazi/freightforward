from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from freightman.forms import MawbForm
from django.http import JsonResponse
from freightman.models import Country, City, Airport, Airline, Airwaybill, MAWB, AddressBook, Currency, PaymentType, AWBAgent
from freightman.forms import MawbForm
from django.db import transaction
from freightman.user_helpers import user_org
import json
from django.conf import settings
import os, sys
import time
from .mawb_dict_builder import mawb_dict_for_frontend
from freightman.decorators import forwarder_required, shipper_or_factory_required
from freightman.dictbuilders.mawb_listing import mawb_dict_for_mawb_listing_page
from freightman.dictbuilders.mawb_create import awb_dict_for_mawb_create_page, addressbook_dict_for_mawb_create_page, agent_dict_for_mawb_create_page
from .public_id_helpers import type_1_public_id_to_model_id
from django.core import serializers


@login_required
@forwarder_required
def get_mawb_list(request):
    resp = {
        'success': True,
        'data': {
            'mawb_list': []
        }
    }

    resp['data']['mawb_list'] = [mawb_dict_for_mawb_listing_page(mawb) for mawb in MAWB.objects.all()]

    return JsonResponse(resp)


@login_required
@forwarder_required
def page_init_data(request):
    forwarder = user_org(request.user.id)
    resp = {
        'success': True,
        'msg': [],
        'errors': [],
        'data': {
            'country_list': [ctry.dict() for ctry in Country.objects.all()],
            'city_list': [city.dict() for city in City.objects.all()],
            'airport_list': [apt.dict() for apt in Airport.objects.all()],
            'airline_list': [arln.dict() for arln in Airline.objects.all()],
            'awb_list': [],
            'currency_list': [cur.dict(request) for cur in Currency.objects.all()],
            'payment_type_list': [p.dict() for p in PaymentType.objects.all()],
            'mawb_list': [],
            'forwarder_default_address': addressbook_dict_for_mawb_create_page(AddressBook.objects.filter(organization=forwarder, is_default=True).first()),
            'agent_list': [agent_dict_for_mawb_create_page(agent) for agent in AWBAgent.objects.all().order_by('id')]
        }
    }

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def mawb_save(request):
    from freightman.mawb_helpers import mawb_ref_number_to_awb_serial
    from freightman.user_helpers import user_org
    resp = {
        'success': False,
        'errors': [],
        'form_errors': {},
        'msg': [],
        'data': {
            'mawb_number': '',
            'mawb_public_id': '',
        }
    }

    if settings.SAVE_FORM_PROFILES:  # for test purpose
        jsn_file = os.path.join(settings.BASE_DIR, 'data/form_profiles/mawb/mawb_form_profile_{}.json'.format(time.time()))
        with open(jsn_file, 'w') as f:
            f.write(json.dumps(request.POST))

    form = MawbForm(request.POST)

    if form.is_valid():
        forwarder = user_org(request.user.id)
        if form.is_create():
            with transaction.atomic():
                shipper_addressbook, _shipperaddrcreated = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['shipper_name'],
                    address=form.cleaned_data['shipper_address'],
                    postcode=form.cleaned_data['shipper_po_code'],
                    city_id=form.cleaned_data['shipper_city'],
                    state=form.cleaned_data['shipper_state'],
                    country_id=form.cleaned_data['shipper_country'],
                    contact=form.cleaned_data['shipper_contact'],
                    phone=form.cleaned_data['shipper_tel_number'],
                    mobile=form.cleaned_data['shipper_mob_num'],
                    fax=form.cleaned_data['shipper_fax_num'],
                    email=form.cleaned_data['shipper_email'],
                )
                shipper_addressbook.is_shipper = True
                shipper_addressbook.save()

                # consignee
                consignee_addressbook, _consigneeaddrcreated = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['consignee_name'],
                    address=form.cleaned_data['consignee_address'],
                    postcode=form.cleaned_data['consignee_po_code'],
                    city_id=form.cleaned_data['consignee_city'],
                    state=form.cleaned_data['consignee_state'],
                    country_id=form.cleaned_data['consignee_country'],
                    contact=form.cleaned_data['consignee_contact'],
                    phone=form.cleaned_data['consignee_tel_number'],
                    mobile=form.cleaned_data['consignee_mob_num'],
                    fax=form.cleaned_data['consignee_fax_num'],
                    email=form.cleaned_data['consignee_email']
                )
                consignee_addressbook.is_consignee = True
                consignee_addressbook.save(update_fields=['is_consignee'])

                # TODO save carrier agent info in different model

                mawb = MAWB.objects.create(
                    forwarder=forwarder,
                    mawb_number=form.cleaned_data['mawb_number'],
                    shipper=shipper_addressbook,
                    consignee=consignee_addressbook,
                    payment_type_id=form.cleaned_data['payment_type'],
                    airport_of_departure_id=form.cleaned_data['departure_airport'],
                    requested_routing=form.cleaned_data['requested_routing'],

                    to_1_airport_id=form.cleaned_data['destination_to_1_airport'],
                    to_1_airline_id=form.cleaned_data['destination_to_1_airline'],
                    to_1_flight_num=form.cleaned_data['destination_to_1_flight_num'],
                    to_1_flight_date=form.cleaned_data['destination_to_1_flight_date'],

                    to_2_airport_id=form.cleaned_data['destination_to_2_airport'],
                    to_2_airline_id=form.cleaned_data['destination_to_2_airline'],
                    to_2_flight_num=form.cleaned_data['destination_to_2_flight_num'],
                    to_2_flight_date=form.cleaned_data['destination_to_2_flight_date'],

                    to_3_airport_id=form.cleaned_data['destination_to_3_airport'],
                    to_3_airline_id=form.cleaned_data['destination_to_3_airline'],
                    to_3_flight_num=form.cleaned_data['destination_to_3_flight_num'],
                    to_3_flight_date=form.cleaned_data['destination_to_3_flight_date'],

                    airport_of_destination_id=form.cleaned_data['dest_airport'],

                    carrier_agent_id=form.cleaned_data['carrier_agent_id'],

                    carrier_agent_name=form.cleaned_data['carrier_agent_name'],
                    carrier_agent_city_id=form.cleaned_data['carrier_agent_city'],
                    carrier_agent_state=form.cleaned_data['carrier_agent_state'],
                    carrier_agent_country_id=form.cleaned_data['carrier_agent_country'],
                    carrier_agent_ffl_no=form.cleaned_data['carrier_agent_ffl'],
                    carrier_agent_date=form.cleaned_data['carrier_agent_date'],
                    carrier_agent_iata_code=form.cleaned_data['carrier_agent_iata_code'],
                    carrier_agent_account_no=form.cleaned_data['carrier_agent_acc_no'],

                    currency_id=form.cleaned_data['currency'],
                    cngs_code=form.cleaned_data['cngs_code'],
                    wt_val_payment_type_id=form.cleaned_data['wt'],
                    other_payment_type_id=form.cleaned_data['other_wt'],
                    declared_val_for_carriage=form.cleaned_data['carriage_value'],
                    declared_val_for_customs=form.cleaned_data['customs_value'],
                    amt_of_insurance=form.cleaned_data['insurance_amount'],
                    handling_info=form.cleaned_data['handling_info'],
                    goods_noofpcsrcp=form.cleaned_data['goods_no_piece_rcp'],
                    goods_grossweight=form.cleaned_data['goods_gross_weight'],
                    goods_weightunit=form.cleaned_data['goods_weight_unit'],
                    goods_commodityitemno=form.cleaned_data['goods_commodity_item_no'],
                    goods_chargableweight=form.cleaned_data['goods_chargeable_weight'],
                    goods_ratecharge=form.cleaned_data['goods_rate'],
                    goods_total=form.cleaned_data['goods_total'],
                    goods_natureandquantity=form.cleaned_data['goods_nature'],
                    weightcharge_prepaid=form.cleaned_data['weightcharge_prepaid'],
                    weightcharge_collect=form.cleaned_data['weightcharge_collect'],
                    valuationcharge_prepaid=form.cleaned_data['others_valuation_prepaid'],
                    valuationcharge_collect=form.cleaned_data['others_valuation_collect'],
                    tax_prepaid=form.cleaned_data['others_tax_prepaid'],
                    tax_collect=form.cleaned_data['others_tax_collect'],
                    totalotherchargesdueagent_prepaid=form.cleaned_data['others_cda_prepaid'],
                    totalotherchargesdueagent_collect=form.cleaned_data['others_cda_collect'],
                    totalotherchargesduecarrier_prepaid=form.cleaned_data['others_cda_prepaid'],
                    totalotherchargesduecarrier_collect=form.cleaned_data['others_cda_collect'],
                    total_prepaid=form.cleaned_data['others_total_prepaid'],
                    total_collect=form.cleaned_data['others_total_collect'],
                    currencyconversionrate=form.cleaned_data['others_ccr'],
                    ccchargesindestcurrency=form.cleaned_data['others_ccc_dest'],
                    chargesatdestination_collect=form.cleaned_data['others_cad'],
                    totalcharges_collect=form.cleaned_data['others_tcc'],
                    charges_other=form.cleaned_data['others_charges'],
                    signature_shipperoragent=form.cleaned_data['others_signature'],
                    executed_on_date=form.cleaned_data['others_ex_date'],
                    executed_at_city_id=form.cleaned_data['others_ex_loc'],
                    signature_issuingcarrieroragent=form.cleaned_data['others_sic'],
                    entry_by_id=request.user.id
                )
                resp['success'] = True
                resp['msg'].append('MAWB created')
                resp['data']['mawb_number'] = mawb.mawb_number
                resp['data']['mawb_public_id'] = mawb.public_id
        if form.is_update():
            id = type_1_public_id_to_model_id(form.cleaned_data['mawb_public_id'])
            mawb = MAWB.objects.get(id=id)
            with transaction.atomic():
                shipper_addressbook, _shipperaddrcreated = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['shipper_name'],
                    address=form.cleaned_data['shipper_address'],
                    postcode=form.cleaned_data['shipper_po_code'],
                    city_id=form.cleaned_data['shipper_city'],
                    state=form.cleaned_data['shipper_state'],
                    country_id=form.cleaned_data['shipper_country'],
                    contact=form.cleaned_data['shipper_contact'],
                    phone=form.cleaned_data['shipper_tel_number'],
                    mobile=form.cleaned_data['shipper_mob_num'],
                    fax=form.cleaned_data['shipper_fax_num'],
                    email=form.cleaned_data['shipper_email']
                )
                shipper_addressbook.is_shipper = True
                shipper_addressbook.save()

                # consignee
                consignee_addressbook, _consigneeaddrcreated = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['consignee_name'],
                    address=form.cleaned_data['consignee_address'],
                    postcode=form.cleaned_data['consignee_po_code'],
                    city_id=form.cleaned_data['consignee_city'],
                    state=form.cleaned_data['consignee_state'],
                    country_id=form.cleaned_data['consignee_country'],
                    contact=form.cleaned_data['consignee_contact'],
                    phone=form.cleaned_data['consignee_tel_number'],
                    mobile=form.cleaned_data['consignee_mob_num'],
                    fax=form.cleaned_data['consignee_fax_num'],
                    email=form.cleaned_data['consignee_email']
                )
                consignee_addressbook.is_consignee = True
                consignee_addressbook.save()

                # TODO save carrier agent info in different model

                mawb.shipper = shipper_addressbook
                mawb.consignee = consignee_addressbook
                mawb.payment_type_id = form.cleaned_data['payment_type']
                mawb.airport_of_departure_id = form.cleaned_data['departure_airport']
                mawb.requested_routing = form.cleaned_data['requested_routing']

                mawb.to_1_airport_id = form.cleaned_data['destination_to_1_airport']
                mawb.to_1_airline_id = form.cleaned_data['destination_to_1_airline']
                mawb.to_1_flight_num = form.cleaned_data['destination_to_1_flight_num']
                mawb.to_1_flight_date = form.cleaned_data['destination_to_1_flight_date']

                mawb.to_2_airport_id = form.cleaned_data['destination_to_2_airport']
                mawb.to_2_airline_id = form.cleaned_data['destination_to_2_airline']
                mawb.to_2_flight_num = form.cleaned_data['destination_to_2_flight_num']
                mawb.to_2_flight_date = form.cleaned_data['destination_to_2_flight_date']

                mawb.to_3_airport_id = form.cleaned_data['destination_to_3_airport']
                mawb.to_3_airline_id = form.cleaned_data['destination_to_3_airline']
                mawb.to_3_flight_num = form.cleaned_data['destination_to_3_flight_num']
                mawb.to_3_flight_date = form.cleaned_data['destination_to_3_flight_date']

                mawb.airport_of_destination_id = form.cleaned_data['dest_airport']

                mawb.carrier_agent_id = form.cleaned_data['carrier_agent_id']
                mawb.carrier_agent_name = form.cleaned_data['carrier_agent_name']
                mawb.carrier_agent_city_id = form.cleaned_data['carrier_agent_city']
                mawb.carrier_agent_state = form.cleaned_data['carrier_agent_state'],
                mawb.carrier_agent_country_id = form.cleaned_data['carrier_agent_country']
                mawb.carrier_agent_ffl_no = form.cleaned_data['carrier_agent_ffl']
                mawb.carrier_agent_date = form.cleaned_data['carrier_agent_date']
                mawb.carrier_agent_iata_code = form.cleaned_data['carrier_agent_iata_code']
                mawb.carrier_agent_account_no = form.cleaned_data['carrier_agent_acc_no']

                mawb.currency_id = form.cleaned_data['currency']
                mawb.cngs_code = form.cleaned_data['cngs_code']
                mawb.wt_val_payment_type_id = form.cleaned_data['wt']
                mawb.other_payment_type_id = form.cleaned_data['other_wt']
                mawb.declared_val_for_carriage = form.cleaned_data['carriage_value']
                mawb.declared_val_for_customs = form.cleaned_data['customs_value']
                mawb.amt_of_insurance = form.cleaned_data['insurance_amount']
                mawb.handling_info = form.cleaned_data['handling_info']
                mawb.goods_noofpcsrcp = form.cleaned_data['goods_no_piece_rcp']
                mawb.goods_grossweight = form.cleaned_data['goods_gross_weight']
                mawb.goods_weightunit = form.cleaned_data['goods_weight_unit']
                mawb.goods_commodityitemno = form.cleaned_data['goods_commodity_item_no']
                mawb.goods_chargableweight = form.cleaned_data['goods_chargeable_weight']
                mawb.goods_ratecharge = form.cleaned_data['goods_rate']
                mawb.goods_total = form.cleaned_data['goods_total']
                mawb.goods_natureandquantity = form.cleaned_data['goods_nature']
                mawb.weightcharge_prepaid = form.cleaned_data['weightcharge_prepaid']
                mawb.weightcharge_collect = form.cleaned_data['weightcharge_collect']
                mawb.valuationcharge_prepaid = form.cleaned_data['others_valuation_prepaid']
                mawb.valuationcharge_collect = form.cleaned_data['others_valuation_collect']
                mawb.tax_prepaid = form.cleaned_data['others_tax_prepaid']
                mawb.tax_collect = form.cleaned_data['others_tax_collect']
                mawb.totalotherchargesdueagent_prepaid = form.cleaned_data['others_cda_prepaid']
                mawb.totalotherchargesdueagent_collect = form.cleaned_data['others_cda_collect']
                mawb.totalotherchargesduecarrier_prepaid = form.cleaned_data['others_cda_prepaid']
                mawb.totalotherchargesduecarrier_collect = form.cleaned_data['others_cda_collect']
                mawb.total_prepaid = form.cleaned_data['others_total_prepaid']
                mawb.total_collect = form.cleaned_data['others_total_collect']
                mawb.currencyconversionrate = form.cleaned_data['others_ccr']
                mawb.ccchargesindestcurrency = form.cleaned_data['others_ccc_dest']
                mawb.chargesatdestination_collect = form.cleaned_data['others_cad']
                mawb.totalcharges_collect = form.cleaned_data['others_tcc']
                mawb.charges_other = form.cleaned_data['others_charges']
                mawb.signature_shipperoragent = form.cleaned_data['others_signature']
                mawb.executed_on_date = form.cleaned_data['others_ex_date']
                mawb.executed_at_city_id = form.cleaned_data['others_ex_loc']
                mawb.signature_issuingcarrieroragent = form.cleaned_data['others_sic']

                mawb.save()

                resp['success'] = True
                resp['msg'].append('MAWB updated')
                resp['data']['mawb_number'] = mawb.mawb_number
                resp['data']['mawb_public_id'] = mawb.public_id
    else:
        resp['form_errors'] = form.errors
        resp['errors'] = form.non_field_errors()

    return JsonResponse(resp)


def pretty_request(request):
    headers = ''
    for header, value in request.META.items():
        if not header.startswith('HTTP'):
            continue
        header = '-'.join([h.capitalize() for h in header[5:].lower().split('_')])
        headers += '{}: {}\n'.format(header, value)

    return (
        '{method} HTTP/1.1\n'
        'Content-Length: {content_length}\n'
        'Content-Type: {content_type}\n'
        '{headers}\n\n'
        '{body}'
    ).format(
        method=request.method,
        content_length=request.META['CONTENT_LENGTH'],
        content_type=request.META['CONTENT_TYPE'],
        headers=headers,
        body=request.body,
    )

from django.http.response import JsonResponse

def get_mawb(request, mawb_number):
    mawb = MAWB.objects.filter(mawb_number=mawb_number).first()
    # serialized_queryset = serializers.serialize('json', [ mawb, ])
    return JsonResponse(mawb.all_data(request))

