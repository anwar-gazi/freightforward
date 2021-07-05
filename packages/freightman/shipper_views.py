from django.shortcuts import render, redirect, reverse, get_object_or_404
from django.contrib.auth.decorators import login_required
from freightman.decorators import shipper_or_factory_required
from freightman.models import HAWB
from .user_helpers import user_org


@login_required
@shipper_or_factory_required
def shipper_home(request):
    data = {}
    return render(request, 'intuit/fm/shipper_home.html', data)


@login_required
@shipper_or_factory_required
def booking(request):
    data = {
        'org': user_org(request.user.id)
    }
    return render(request, 'intuit/fm/shipper_freight_booking.html', data)


@login_required
@shipper_or_factory_required
def booking_list(request, type):
    data = {
        'type': type
    }
    return render(request, 'intuit/fm/shipper_booking_list.html', data)


@login_required
@shipper_or_factory_required
def hawb_print_preview_page_by_shipper(request, hawb_public_id: str):
    from .hawb_helpers import hawb_globalid_to_model_id
    id = hawb_globalid_to_model_id(hawb_public_id)
    hawb = get_object_or_404(HAWB, pk=id)
    data = {
        'hawb': hawb
    }
    return render(request, 'intuit/fm/forwarder/hawb.html', data)
