from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from seaexport.models import SeaExportContainerConsolShipment
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@login_required
@forwarder_required
def job_costing_listing(request):
    data = {}
    return render(request, 'intuit/seaexport/forwarder/job_costing_listing.html', data)


@login_required
@forwarder_required
def get_consol_list(request):
    import math
    from freightman.forms import PaginationForm
    from seaexport.dictbuilder.container_consol import consol_dict_for_job_cost_listing

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    query = SeaExportContainerConsolShipment.objects.all().order_by('-id')

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
def load_job_costing(request, consol_public_id: str):
    data = {
        'consol_public_id': consol_public_id
    }
    return render(request, 'intuit/seaexport/forwarder/job_costing.html', data)


@login_required
@forwarder_required
def job_costing_page_init_data(request):
    from freightman.forms import PublicIDForm
    from seaexport.dictbuilder.container_consol import consol_dict_for_job_costing_page
    from seaexport.models import SeaFrtChargeType
    from freightman.dictbuilders_currency import dict_for_currency_conversion_ui
    from freightman.models import Currency
    form = PublicIDForm(request.GET)
    form.is_valid()
    resp = {
        'success': True,
        'data': {
            'job_info': consol_dict_for_job_costing_page(SeaExportContainerConsolShipment.objects.get(id=form.id)),
            'charges_type_list': [ct.dict() for ct in SeaFrtChargeType.objects.all().order_by('id')],
            'currency_list': [dict_for_currency_conversion_ui(curr) for curr in Currency.objects.all().order_by('id')]
        }
    }

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def save_job_costing(request):
    from django.db import transaction
    from freightman.public_id_helpers import type_1_public_id_to_model_id
    from seaexport.models import SeaExportContainerConsolidationJobCosting
    from seaexport.forms import JobCostingForm, CostForm
    from freightman.user_helpers import user_org
    resp = {
        'success': False,
        'errors': [],
        'form_errors': [],
        'cost_form_error_list': [],
        'msg': [],
        'data': {}
    }
    forwarder = user_org(request.user.id)
    form = JobCostingForm(request.POST)
    if form.is_valid():
        consolidated_shipment = SeaExportContainerConsolShipment.objects.get(id=form.consolidation_id)
        SeaExportContainerConsolidationJobCosting.objects.filter(container_consol=consolidated_shipment).delete()
        for costform in form.valid_cost_form_list:  # type:CostForm
            SeaExportContainerConsolidationJobCosting.objects.create(
                forwarder=forwarder,
                container_consol=consolidated_shipment,
                currency_id=costform.cleaned_data['currency_id'],
                currency_conversion_id=costform.cleaned_data['currency_conversion_rate_id'],
                charge_type_id=costform.cleaned_data['charge_type_id'],
                amount=costform.cleaned_data['value'],
                perunit_or_fixed='perunit' if costform.cleaned_data['is_unit_cost'] else 'fixed',
                hbl_id=type_1_public_id_to_model_id(costform.cleaned_data['hbl_public_id']) if costform.cleaned_data['hbl_public_id'] else None,
                entry_by_id=request.user.id
            )
        resp['success'] = True
        resp['msg'].append('Cost Info save success')
    else:
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
        resp['cost_form_error_list'] = form.cost_form_error_list

    return JsonResponse(resp)


@login_required
@csrf_exempt
def save_charge_type(request):
    from seaexport.models import SeaFrtChargeType
    resp = {
        'success': False,
        'error': '',
        'data': {
            'id': ''
        }
    }
    charge_type_name = request.POST.get('charge_type_name').strip()
    if charge_type_name:
        ct, _cr = SeaFrtChargeType.objects.get_or_create(name=charge_type_name)
        if _cr:
            resp['data']['id'] = ct.id
            resp['success'] = True
        else:
            resp['error'] = 'Charge Type exists!'
    else:
        resp['error'] = 'name not provided'

    return JsonResponse(resp)
