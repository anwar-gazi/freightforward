from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from django.shortcuts import render
from freightman.public_id_helpers import type_1_public_id_to_model_id
from seaexport.models import SeaExportFreightBooking
from django.http import JsonResponse


@login_required
@forwarder_required
def sea_export_frt_booking_page(request):
    data = {}
    return render(request, 'intuit/seaexport/shipper/frt_book/sea_export_frt_book.html', data)


@login_required
@forwarder_required
def view_frt_booking(request, public_id: str):
    data = {
        'public_id': public_id
    }
    return render(request, 'intuit/seaexport/shipper/frt_book/sea_export_frt_book.html', data)


@login_required
@forwarder_required
def copy_frt_booking(request, public_id: str):
    data = {
        'public_id': public_id,
        'copy': True
    }
    return render(request, 'intuit/seaexport/shipper/frt_book/sea_export_frt_book.html', data)


@login_required
@forwarder_required
def delete_frt_booking(request, public_id: str):
    resp = {
        'success': False
    }
    booking = SeaExportFreightBooking.objects.get(id=type_1_public_id_to_model_id(public_id))
    booking.delete()
    resp['success'] = True
    return JsonResponse(resp)
