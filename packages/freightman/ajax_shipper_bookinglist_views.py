from django.contrib.auth.decorators import login_required
from freightman.user_helpers import user_org
from freightman.dict_builder_shipper_bookinglist import booking_dict_for_bookinglist_frontend
from freightman.models import FreightBooking, FreightBookingPartyAddress
from django.http import JsonResponse
from freightman.decorators import shipper_or_factory_required
from django.views.decorators.csrf import csrf_exempt
from freightman.booking_email_views import view_booking_email_body
from datetime import datetime
import pytz
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from freightman.forms import BookingEDDSetForm
from freightman.booking_helpers import send_booking_notification_emails


@login_required
@shipper_or_factory_required
def getlist_booking(request, booking_type: str):
    org = user_org(request.user.id)
    if booking_type == 'registered':
        bookings = [booking_dict_for_bookinglist_frontend(request, booking.id) for booking in FreightBooking.objects.filter(is_booking_confirmed=False, org=org,
                                                                                                                            entry_complete=True).order_by('-id')]
    elif booking_type == 'confirmed':
        bookings = [booking_dict_for_bookinglist_frontend(request, booking.id) for booking in
                    FreightBooking.objects.filter(is_booking_confirmed=True, org=org, entry_complete=True).order_by('-id')]
    else:
        bookings = []
    return JsonResponse({
        'data': {
            'booking_list': bookings,
            'type': booking_type
        }
    })


@login_required
@csrf_exempt
@shipper_or_factory_required
def mark_as_booked(request):
    result = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': [],
        'data': {

        }
    }
    form = BookingEDDSetForm(request.POST)

    if form.is_valid():
        booking = FreightBooking.objects.get(id=form.cleaned_data['id'])
        booking.is_draft = False
        booking.is_booking_confirmed = True
        booking.edd = form.cleaned_data['edd']
        booking.confirmed_by = request.user
        booking.confirmed_at = datetime.now(pytz.utc)
        booking.save()

        result['success'] = True

        result['msg'].append('booking #{} confirmed.'.format(booking.globalid))

        notify_emails = send_booking_notification_emails(request, booking.id)
        if notify_emails:
            result['msg'].append('Notification email sent to {}'.format(', '.join(notify_emails)))
    else:
        result['success'] = False
        result['errors'] = form.non_field_errors()
        result['form_errors'] = form.errors

    return JsonResponse(result)
