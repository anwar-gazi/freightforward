from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from freightman.models import Country, City, Airport, HAWB, MAWB, AirExportConsolidatedShipment, AirExportConsolHouseMap, AirExportConsolidatedShipmentFlightInfo, \
    Airline, AWBAgent, Airwaybill
from freightman.consolidation_forms import ConsolidationForm, FlightForm
from freightman.decorators import forwarder_required
from freightman.user_helpers import user_org
from django.db import transaction
from freightman.dictbuilders.dictbuilders_airexport_consolidation import hawb_dict_for_consolidation_page, mawb_dict_for_consolidation_page


@login_required
@forwarder_required
def page_init_data(request):
    print(HAWB.objects.all())
    resp = {
        'success': True,
        'msg': [],
        'errors': [],
        'data': {
            'country_list': [ctry.dict() for ctry in Country.objects.all()],
            'city_list': [city.dict() for city in City.objects.all()],
            'airport_list': [apt.dict() for apt in Airport.objects.all()],
            'airline_list': [airline.dict() for airline in Airline.objects.all()],
            'awb_agent_list': [agent.dict() for agent in AWBAgent.objects.all()],
            'awb_list': [awb.dict() for awb in Airwaybill.objects.all()],
            'non_consolidated_hawbs': [hawb_dict_for_consolidation_page(h)
                                       for h in HAWB.objects.all().exclude(id__in=[m.hawb_id for m in AirExportConsolHouseMap.objects.all()])],
            'non_consolidated_mawbs': [mawb_dict_for_consolidation_page(m)
                                       for m in MAWB.objects.all().exclude(id__in=[consol.mawb_id for consol in AirExportConsolidatedShipment.objects.all()])],
        }

    }

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def consol_input_data_save(request):
    import json
    from .exceptions import CustomException
    resp = {
        'success': False,

        'consol_errors': [],
        'consol_form_errors': {},

        'flight_errors': [],
        'flight_form_errors_dict': {},

        'msg': [],

        'data': {
            'consolidation_job_number': ''
        }
    }

    form = ConsolidationForm(request.POST)
    forwarder_org = user_org(request.user.id)

    try:
        if form.is_valid():
            with transaction.atomic():
                if form.cleaned_data['consolidation_job_number']:  # is update
                    consolshpt = AirExportConsolidatedShipment.objects.get(id=form.consolidation_model_object_id)
                    # remove all current link
                    AirExportConsolHouseMap.objects.filter(consolidated_shipment=consolshpt).delete()
                else:  # is create
                    consolshpt = AirExportConsolidatedShipment.objects.create(forwarder=forwarder_org, mawb_id=form.mawb_object_id, created_by=request.user)

                # now map house and master
                for hawb_id in form.hawb_object_id_list:
                    AirExportConsolHouseMap.objects.create(consolidated_shipment=consolshpt, hawb_id=hawb_id)

                # now flight info
                for flightinfo in json.loads(request.POST.get('flight_info_list_json')):
                    flform = FlightForm(flightinfo)
                    if flform.is_valid():
                        AirExportConsolidatedShipmentFlightInfo.objects.filter(consolidated_shipment_id=consolshpt.id).delete()
                        AirExportConsolidatedShipmentFlightInfo.objects.create(
                            consolidated_shipment_id=consolshpt.id,
                            airline_id=flform.cleaned_data['airline'],
                            co_loader_id=flform.cleaned_data['co_loader'],
                            awb_id=flform.cleaned_data['awb'],
                            flight_number=flform.cleaned_data['flight_number'],
                            flight_date=flform.cleaned_data['flight_date'],
                            departure_country_id=flform.cleaned_data['departure_country'],
                            departure_airport_id=flform.cleaned_data['departure_airport'],
                            departure_date=flform.cleaned_data['departure_date'],
                            arrival_country_id=flform.cleaned_data['arrival_country'],
                            arrival_airport_id=flform.cleaned_data['arrival_airport'],
                            arrival_date=flform.cleaned_data['arrival_date'],
                        )
                    else:
                        resp['flight_errors'] += flform.non_field_errors()
                        resp['flight_form_errors_dict'][flform.cleaned_data['uniqid']] = flform.errors
                        raise CustomException('Fail to save consolidation')  # to break the atomicity of transaction

                resp['success'] = True
                resp['msg'].append('Consolidation Success')
                resp['data']['consolidation_job_number'] = consolshpt.job_number
        else:
            resp['consol_form_errors'] = form.errors
            resp['consol_errors'] = form.non_field_errors()
    except CustomException:
        resp['success'] = False
        resp['msg'] = []

    return JsonResponse(resp)


@login_required
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
