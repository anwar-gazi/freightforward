from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from freightman.forms import HawbForm
from django.http import JsonResponse
from freightman.models import Country, City, Airline, Airport, Airwaybill, Currency, FreightBooking, HAWB, AddressBook, PaymentType, AWBAgent, Organization
from freightman.helpers_frt_booking import booking_globalid_to_model_id
from freightman.dict_builders_hawb import booking_info_to_hawb_formdata, booking_dict_for_booking_selection
from freightman.dictbuilders.org_management import org_dict_for_edit_form
from django.db import transaction
import json
from django.conf import settings
import sys, os
import time
from freightman.dict_builders_hawb import hawb_dict_for_frontend
from freightman.decorators import forwarder_required, shipper_or_factory_required


@login_required
@csrf_exempt
@forwarder_required
def get_booking_info_for_hawb_form(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {
            'booking_info': {},
            'has_hawb': False,
            'hawb_info': {}
        }
    }
    booking_globalid = request.GET['booking_globalid']  # TODO make django form
    booking_id = booking_globalid_to_model_id(booking_globalid)
    if FreightBooking.objects.filter(id=booking_id).exists():
        resp['success'] = True
        hawb_q = HAWB.objects.filter(booking_id=booking_id)
        if hawb_q.exists():
            resp['data']['has_hawb'] = True
            resp['data']['hawb_info'] = hawb_dict_for_frontend(request, hawb_q.first().id)
        resp['data']['booking_info'] = booking_info_to_hawb_formdata(request, booking_id)
    else:
        resp['success'] = False
        resp['errors'].append('Invalid id: {}'.format(booking_globalid))
    return JsonResponse(resp)


@login_required
@forwarder_required
def page_init_data(request):
    from freightman.user_helpers import user_org
    resp = {
        'success': True,
        'msg': [],
        'errors': [],
        'data': {
            'supplier_list': [org_dict_for_edit_form(org) for org in Organization.objects.filter(is_supplier=True)],
            'country_list': [ctry.dict() for ctry in Country.objects.all().order_by('id')],
            'city_list': [city.dict() for city in City.objects.all().order_by('id')],
            'airport_list': [apt.dict() for apt in Airport.objects.all().order_by('id')],
            'airline_list': [arln.dict() for arln in Airline.objects.all().order_by('id')],
            'awb_list': [awb.dict() for awb in Airwaybill.objects.all().order_by('id')],
            'currency_list': [cur.dict(request) for cur in Currency.objects.all().order_by('id')],
            'default_currency': Currency.objects.filter(code__icontains='usd').first().dict(request)
            if Currency.objects.filter(code__icontains='usd').exists() else None,
            'payment_type_list': [p.dict() for p in PaymentType.objects.all().order_by('id')],
            'confirmed_booking_list': [booking_dict_for_booking_selection(request, booking) for booking in
                                       FreightBooking.objects.filter(is_booking_confirmed=True, entry_complete=True).order_by('-id')],
            'available_confirmed_booking_list': [booking.dict(request) for booking in
                                                 FreightBooking.objects.filter(is_booking_confirmed=True, entry_complete=True).exclude(
                                                     id__in=[hawb.booking.id for hawb in HAWB.objects.all() if hawb.booking_id]).order_by('-id')],
            'forwarder': user_org(request.user.id).dict(request),
            'awb_agent_list': [agent.dict() for agent in AWBAgent.objects.all().order_by('id')]
        }
    }

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def hawb_save(request):
    from freightman.hawb_helpers import hawb_globalid_to_model_id
    from freightman.user_helpers import user_org
    resp = {
        'success': False,
        'errors': [],
        'form_errors': {},
        'msg': [],
        'data': {
            'hawb_reference_number': ''
        }
    }

    if settings.SAVE_FORM_PROFILES:  # for test purpose
        jsn_file = os.path.join(settings.BASE_DIR, 'data/form_profiles/hawb/hawb_form_profile_{}.json'.format(time.time()))
        with open(jsn_file, 'w') as f:
            f.write(json.dumps(request.POST))
            print('form profile saved in {}'.format(jsn_file))

    form = HawbForm(request.POST)

    if form.is_valid():
        forwarder = user_org(request.user.id)
        if form.cleaned_data['booking_not_applicable'] == 1:
            booking_id = None
            house = Organization.objects.get(id=form.cleaned_data['house_id'])
        else:
            booking_id = booking_globalid_to_model_id(form.cleaned_data['booking_globalid'])
            booking = FreightBooking.objects.get(id=booking_id)
            house = booking.org
        if form.is_create():
            if not FreightBooking.objects.filter(id=booking_id).exists() and form.cleaned_data['booking_not_applicable'] != 1:
                resp['success'] = False
                resp['errors'].append('booking {} not found'.format(form.cleaned_data['booking_globalid']))
            else:
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
                    if not shipper_addressbook.is_shipper:
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

                    hawb = HAWB.objects.create(
                        booking_id=booking_id,
                        forwarder=forwarder,
                        house=house,
                        supplier=house,
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
                        to_2_airline_id=form.cleaned_data['destination_by_2_airline'],
                        to_2_flight_num=form.cleaned_data['destination_to_2_flight_num'],
                        to_2_flight_date=form.cleaned_data['destination_to_2_flight_date'],

                        to_3_airport_id=form.cleaned_data['destination_to_3_airport'],
                        to_3_airline_id=form.cleaned_data['destination_to_3_airline'],
                        to_3_flight_num=form.cleaned_data['destination_to_3_flight_num'],
                        to_3_flight_date=form.cleaned_data['destination_to_3_flight_date'],

                        airport_of_destination_id=form.cleaned_data['dest_airport'],

                        requested_flight_info=form.cleaned_data['requested_flight_info'],

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
                    resp['data']['hawb_reference_number'] = hawb.public_id
        if form.is_update():
            id = hawb_globalid_to_model_id(form.cleaned_data['hawb_reference_number'])
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

                hawb = HAWB.objects.get(id=id)

                hawb.booking_id = booking_id
                hawb.supplier = house

                hawb.shipper = shipper_addressbook
                hawb.consignee = consignee_addressbook
                hawb.payment_type_id = form.cleaned_data['payment_type']
                hawb.airport_of_departure_id = form.cleaned_data['departure_airport']
                hawb.requested_routing = form.cleaned_data['requested_routing']

                hawb.to_1_airport_id = form.cleaned_data['destination_to_1_airport']
                hawb.to_1_airline_id = form.cleaned_data['destination_to_1_airline']
                hawb.to_1_flight_num = form.cleaned_data['destination_to_1_flight_num']
                hawb.to_1_flight_date = form.cleaned_data['destination_to_1_flight_date']

                hawb.to_2_airport_id = form.cleaned_data['destination_to_2_airport']
                hawb.to_2_airline_id = form.cleaned_data['destination_by_2_airline']
                hawb.to_2_flight_num = form.cleaned_data['destination_to_2_flight_num']
                hawb.to_2_flight_date = form.cleaned_data['destination_to_2_flight_date']

                hawb.to_3_airport_id = form.cleaned_data['destination_to_3_airport']
                hawb.to_3_airline_id = form.cleaned_data['destination_to_3_airline']
                hawb.to_3_flight_num = form.cleaned_data['destination_to_3_flight_num']
                hawb.to_3_flight_date = form.cleaned_data['destination_to_3_flight_date']

                hawb.airport_of_destination_id = form.cleaned_data['dest_airport']

                hawb.requested_flight_info = form.cleaned_data['requested_flight_info']

                hawb.carrier_agent_name = form.cleaned_data['carrier_agent_name']
                hawb.carrier_agent_city_id = form.cleaned_data['carrier_agent_city']
                hawb.carrier_agent_state = form.cleaned_data['carrier_agent_state'],
                hawb.carrier_agent_country_id = form.cleaned_data['carrier_agent_country']
                hawb.carrier_agent_ffl_no = form.cleaned_data['carrier_agent_ffl']
                hawb.carrier_agent_date = form.cleaned_data['carrier_agent_date']
                hawb.carrier_agent_iata_code = form.cleaned_data['carrier_agent_iata_code']
                hawb.carrier_agent_account_no = form.cleaned_data['carrier_agent_acc_no']

                hawb.currency_id = form.cleaned_data['currency']
                hawb.cngs_code = form.cleaned_data['cngs_code']
                hawb.wt_val_payment_type_id = form.cleaned_data['wt']
                hawb.other_payment_type_id = form.cleaned_data['other_wt']
                hawb.declared_val_for_carriage = form.cleaned_data['carriage_value']
                hawb.declared_val_for_customs = form.cleaned_data['customs_value']
                hawb.amt_of_insurance = form.cleaned_data['insurance_amount']
                hawb.handling_info = form.cleaned_data['handling_info']
                hawb.goods_noofpcsrcp = form.cleaned_data['goods_no_piece_rcp']
                hawb.goods_grossweight = form.cleaned_data['goods_gross_weight']
                hawb.goods_weightunit = form.cleaned_data['goods_weight_unit']
                hawb.goods_commodityitemno = form.cleaned_data['goods_commodity_item_no']
                hawb.goods_chargableweight = form.cleaned_data['goods_chargeable_weight']
                hawb.goods_ratecharge = form.cleaned_data['goods_rate']
                hawb.goods_total = form.cleaned_data['goods_total']
                hawb.goods_natureandquantity = form.cleaned_data['goods_nature']
                hawb.weightcharge_prepaid = form.cleaned_data['weightcharge_prepaid']
                hawb.weightcharge_collect = form.cleaned_data['weightcharge_collect']
                hawb.valuationcharge_prepaid = form.cleaned_data['others_valuation_prepaid']
                hawb.valuationcharge_collect = form.cleaned_data['others_valuation_collect']
                hawb.tax_prepaid = form.cleaned_data['others_tax_prepaid']
                hawb.tax_collect = form.cleaned_data['others_tax_collect']
                hawb.totalotherchargesdueagent_prepaid = form.cleaned_data['others_cda_prepaid']
                hawb.totalotherchargesdueagent_collect = form.cleaned_data['others_cda_collect']
                hawb.totalotherchargesduecarrier_prepaid = form.cleaned_data['others_cda_prepaid']
                hawb.totalotherchargesduecarrier_collect = form.cleaned_data['others_cda_collect']
                hawb.total_prepaid = form.cleaned_data['others_total_prepaid']
                hawb.total_collect = form.cleaned_data['others_total_collect']
                hawb.currencyconversionrate = form.cleaned_data['others_ccr']
                hawb.ccchargesindestcurrency = form.cleaned_data['others_ccc_dest']
                hawb.chargesatdestination_collect = form.cleaned_data['others_cad']
                hawb.totalcharges_collect = form.cleaned_data['others_tcc']
                hawb.charges_other = form.cleaned_data['others_charges']
                hawb.signature_shipperoragent = form.cleaned_data['others_signature']
                hawb.executed_on_date = form.cleaned_data['others_ex_date']
                hawb.executed_at_city_id = form.cleaned_data['others_ex_loc']
                hawb.signature_issuingcarrieroragent = form.cleaned_data['others_sic']

                hawb.save()

                resp['success'] = True
                resp['data']['hawb_reference_number'] = hawb.public_id
    else:
        # print('Error in form')
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
