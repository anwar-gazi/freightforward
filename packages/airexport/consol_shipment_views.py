from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from airexport.dictbuilder.consol_shipment import consol_shipment_dict_for_listing
from freightman.models import AirExportConsolidatedShipment
from django.http import JsonResponse
from freightman.public_id_helpers import type_1_public_id_to_model_id_exceptionfree


@login_required
@forwarder_required
def shipment_listing_page(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/consol_shipment_list.html', data)


@login_required
@forwarder_required
def get_consol_shipment_list(request):
    import math
    from freightman.forms import PaginationForm

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    needle = paginationform.cleaned_data.get('needle', None)
    q_key_dict = {}
    if needle:
        consol_id, has_id = type_1_public_id_to_model_id_exceptionfree(needle)
        if has_id:
            q_key_dict = {
                'id': consol_id
            }
        else:
            q_key_dict = {}

    query = AirExportConsolidatedShipment.objects.filter(**q_key_dict).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for consol in query[entry_start:entry_end]:
        listing.append(consol_shipment_dict_for_listing(consol))

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
