from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from freightman.decorators import forwarder_required
from django.http import JsonResponse
from seaexport.models import SeaExportFreightBooking, SeaExportHBL
from seaexport.dictbuilder.bookinglist import seafrtbooking_dict_for_bookinglist
from seaexport.dictbuilder.hbl import hbl_dict_for_hbl_view
from freightman.forms import PaginationForm
from seaexport.forms import BookingConfirmForm
from freightman.public_id_helpers import type_1_public_id_to_model_id
from seaexport.booking_helpers import view_booking_email_body, send_booking_notification_emails
from datetime import datetime
from django.db import transaction
from freightman.user_helpers import user_org
import pytz
import math


@login_required
@forwarder_required
def sea_export_frt_bookinglist_page(request):
    data = {}
    return render(request, 'intuit/seaexport/forwarder/bookinglist_page.html', data)


@login_required
@forwarder_required
def ajax_get_seaexport_bookinglist(request):
    forwarder = user_org(request.user.id)
    form = PaginationForm(request.GET)
    form.is_valid()
    page = form.cleaned_data.get('page', None) or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    total_entry = SeaExportFreightBooking.objects.filter(forwarder=forwarder).count()
    number_of_page = math.ceil(total_entry / entry_per_page)
    data = {
        'data': {
            'booking_list': [seafrtbooking_dict_for_bookinglist(request, book) for book in
                             SeaExportFreightBooking.objects.filter(forwarder=forwarder).order_by('-id')[entry_start:entry_end]],
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
        }
    }
    return JsonResponse(data)


@login_required
@forwarder_required
def view_booking_email_body_page(request, booking_public_id):
    return view_booking_email_body(request, type_1_public_id_to_model_id(booking_public_id))


@login_required
@csrf_exempt
def mark_booking_confirmed(request):
    resp = {
        'success': False,
        'errors': [],
        'msg': [],
        'form_errors': {},
    }
    form = BookingConfirmForm(request.POST)
    if form.is_valid():
        with transaction.atomic():
            booking = SeaExportFreightBooking.objects.get(id=type_1_public_id_to_model_id(form.cleaned_data['booking_public_id']))
            booking.edd = form.cleaned_data['edd']
            booking.is_booking_confirmed = True
            booking.confirmed_by = request.user
            booking.confirmed_at = datetime.now(pytz.utc)
            booking.save()
            notified_emails = send_booking_notification_emails(request, booking.id)
            resp['success'] = True
            resp['msg'].append('Booking confirmed')
            resp['msg'].append('Notification email sent to {}'.format(notified_emails))
    else:
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def mark_booking_goods_received(request):
    from seaexport.forms import BookingPublicIDForm
    resp = {
        'success': False,
        'errors': [],
        'msg': [],
        'form_errors': {},
    }
    form = BookingPublicIDForm(request.POST)
    if form.is_valid():
        with transaction.atomic():
            booking = SeaExportFreightBooking.objects.get(id=form.id)
            booking.goods_received = True
            booking.goods_received_by = request.user
            booking.goods_received_at = datetime.now(pytz.utc)
            booking.save()
            resp['success'] = True
            resp['msg'].append('Goods received confirmed by {}'.format(request.user.get_full_name()))
    else:
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors

    return JsonResponse(resp)


@login_required
@forwarder_required
def get_hbl_list(request):
    forwarder = user_org(request.user.id)

    form = PaginationForm(request.GET)
    form.is_valid()
    page = form.cleaned_data.get('page', None) or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    total_entry = SeaExportHBL.objects.filter(forwarder=forwarder).count()
    number_of_page = math.ceil(total_entry / entry_per_page)
    data = {
        'data': {
            'hbl_list': [hbl_dict_for_hbl_view(request, hbl) for hbl in SeaExportHBL.objects.filter(forwarder=forwarder).order_by('-id')[entry_start:entry_end]],
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
        }
    }
    return JsonResponse(data)


@login_required
@forwarder_required
def sea_export_hbl_list_page(request):
    data = {}
    return render(request, 'intuit/seaexport/forwarder/hbl_list_page.html', data)
