from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .decorators import forwarder_required
from .models import MAWB, ChargeType, AirExportConsolidatedShipmentJobCosting, AirExportConsolidatedShipment, Currency
from .user_helpers import user_org
from django.db.models import Q
from .job_costing_forms import ConsolidatedShipmentIDForm, JobCostInsertForm
from .public_id_helpers import type_1_public_id_to_model_id
import json
from django.db import transaction
from .exceptions import CustomException
from .dict_builders_airexp_consol import airexp_consol_dict_for_job_costing_page
from .currency_helpers import get_usd_currency
from .dictbuilders_currency import dict_for_currency_conversion_ui
from airexport.dictbuilder.job_costing import mawb_dict_for_cost_listing
from freightman.forms import PublicIDForm


@login_required
@forwarder_required
def job_costing_page_init_data(request):
    form = PublicIDForm(request.GET)
    form.is_valid()
    resp = {
        'success': True,
        'data': {
            'job_info': airexp_consol_dict_for_job_costing_page(form.id),
            'charges_type_list': [ct.dict() for ct in ChargeType.objects.all().order_by('id')],
            'currency_list': [dict_for_currency_conversion_ui(curr) for curr in Currency.objects.all().order_by('id')]
        }
    }

    return JsonResponse(resp)


@login_required
@forwarder_required
def get_consol_list(request):
    import math
    from freightman.forms import PaginationForm
    from airexport.dictbuilder.job_costing import consol_dict_for_job_cost_listing

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    query = AirExportConsolidatedShipment.objects.all().order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for consol in query[entry_start:entry_end]:
        listing.append(consol_dict_for_job_cost_listing(consol))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'consol_list': listing,
        }
    })


@login_required
@forwarder_required
def get_consolidated_shipment(request):
    consol_public_id = request.GET.get('consol_public_id', None)
    id = type_1_public_id_to_model_id(consol_public_id)
    consshpt = AirExportConsolidatedShipment.objects.get(id=id)
    resp = {
        'data': airexp_consol_dict_for_job_costing_page(consshpt)
    }
    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def save_job_costing(request):
    resp = {
        'success': False,
        'errors': [],
        'cost_info_errors': [],
        'cost_info_form_error_list': [],
        'msg': [],
        'data': {}
    }
    consolshiptidform = ConsolidatedShipmentIDForm(request.POST)
    try:
        with transaction.atomic():
            if consolshiptidform.is_valid():

                consolidated_shipment = AirExportConsolidatedShipment.objects.get(
                    id=type_1_public_id_to_model_id(consolshiptidform.cleaned_data['consolidated_shipment_public_id']))
                consolidated_shipment.save()

                cost_list = json.loads(request.POST.get('cost_list_json'))
                if len(cost_list):
                    AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=consolidated_shipment).delete()  # todo update in place
                    for cost_info in cost_list:
                        # print('cost info {}'.format(cost_info))
                        costform = JobCostInsertForm(cost_info)
                        if costform.is_valid():
                            AirExportConsolidatedShipmentJobCosting.objects.create(
                                consolidated_shipment=consolidated_shipment,
                                charge_type_id=costform.cleaned_data['charge_type_id'],
                                value=costform.cleaned_data['value'],
                                currency_id=costform.cleaned_data['currency_id'],
                                currency_conversion_id=costform.cleaned_data['currency_conversion_rate_id'],
                                is_shipment_cost=costform.cleaned_data['is_shipment_cost'],
                                charge_applies_to_hawb=costform.cleaned_data['charge_applies_to_hawb'],
                                for_specific_hawb=costform.cleaned_data['for_specific_hawb'],
                                hawb_id=costform.hawb_model_id(),
                                is_unit_cost=costform.cleaned_data['is_unit_cost'],
                                entry_by=request.user
                            )
                        else:
                            resp['cost_info_errors'] += costform.non_field_errors()
                            resp['cost_info_form_error_list'].append({**costform.errors, **{'uniqid': costform.cleaned_data['uniqid']}})
                            raise CustomException('Damn')
                    resp['success'] = True
                    resp['msg'].append('Cost Info save success')
            else:
                resp['errors'].append('Consolidated shipment not selected')
    except CustomException as e:
        print(e)
        resp['success'] = False
        resp['msg'] = []
    return JsonResponse(resp)


@login_required
@csrf_exempt
def save_charge_type(request):
    resp = {
        'success': False,
        'error': '',
        'data': {
            'id': ''
        }
    }
    charge_type_name = request.POST.get('charge_type_name').strip()
    if charge_type_name:
        ct, _cr = ChargeType.objects.get_or_create(name=charge_type_name)
        if _cr:
            resp['data']['id'] = ct.id
            resp['success'] = True
        else:
            resp['error'] = 'Charge Type exists!'
    else:
        resp['error'] = 'name not provided'

    return JsonResponse(resp)
