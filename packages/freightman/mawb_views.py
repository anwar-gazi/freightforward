from django.shortcuts import render
from .decorators import forwarder_required
from django.contrib.auth.decorators import login_required
from .mawb_helpers import mawb_public_id_to_mawb_id
from freightman.models import MAWB, AirExportConsolHouseMap


@login_required
@forwarder_required
def mawb_listing_page(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/mawb_list.html', data)


@login_required
@forwarder_required
def cargo_manifest_page(request, mawb_public_id: str):
    id = mawb_public_id_to_mawb_id(mawb_public_id)
    mawb = MAWB.objects.get(id=id)
    hawb_list = [m.hawb for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment__mawb_id=id)]
    data = {
        'mawb': MAWB.objects.get(id=id),
        'hawb_list': hawb_list,
        'hawb_public_id_cs': ','.join([hawb.public_id for hawb in hawb_list])
    }
    return render(request, 'intuit/fm/forwarder/cargo_manifest.html', data)


@login_required
@forwarder_required
def mawb_edit_page(request, public_id: str):
    data = {
        'public_id': public_id
    }
    return render(request, 'intuit/fm/forwarder/mawb_edit.html', data)


@login_required
@forwarder_required
def mawb_copy_page(request, public_id: str):
    data = {
        'hawb_public_id': public_id,
        'copy': True
    }
    return render(request, 'intuit/fm/forwarder/hawb_edit.html', data)


@login_required
@forwarder_required
def delete_mawb(request, public_id: str):
    resp = {
        'success': False
    }
    hawb = HAWB.objects.get(id=type_1_public_id_to_model_id(hawb_public_id))
    hawb.delete()
    resp['success'] = True
