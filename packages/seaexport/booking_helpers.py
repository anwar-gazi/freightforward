from django.shortcuts import render
from django.core.mail import EmailMultiAlternatives
from freightman.models import BookingListener
from seaexport.models import SeaExportFreightBooking, SeaExportFreightBookingMoreAddressMap, SeaExportFreightBookingGoodsInfo, SeaExportFreightBookingStakeholderReferenceTypes, \
    SeaExportFreightBookingNotifyAddress


def view_booking_email_body(request, booking_id: int):
    booking = SeaExportFreightBooking.objects.get(id=booking_id)
    consignee_address_list = [addrlink.addressbook for addrlink in
                              SeaExportFreightBookingMoreAddressMap.objects.filter(booking_id=booking_id, is_consignee=True)] + [booking.consignee]
    goods_info = SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking.id)
    stakeholder_reference = SeaExportFreightBookingStakeholderReferenceTypes.objects.filter(booking=booking)

    data = {
        'booking': booking,
        'consignee_address_list': consignee_address_list,
        'goods_info': goods_info,
        'stakeholder_reference': stakeholder_reference
    }
    return render(request, 'intuit/seaexport/forwarder/booking_email.html', data)


# obey settings
def send_booking_notification_emails(request, booking_id: int):
    # send booking notify mail
    booking = SeaExportFreightBooking.objects.get(id=booking_id)
    # email directly from this booking(depending the org email ability on setting) + email watcher for this booking company+email watcher for all bookings
    booking_notify_party_emails = [addr.addressbook.email for addr in SeaExportFreightBookingNotifyAddress.objects.filter(booking=booking)] \
        if booking.supplier.booking_mail_sending_enabled \
        else []
    notify_emails = list(set(
        booking_notify_party_emails
        + [l.email for l in BookingListener.objects.all()]
    ))
    # Send it to mail
    subject = 'Booking #{} confirmed'.format(booking.globalid)
    body = '<email has html body>'
    html_content = view_booking_email_body(request, booking.id).content.decode('utf-8')

    msg = EmailMultiAlternatives(subject, body, from_email='freightautomat@gmail.com', to=notify_emails)
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    return notify_emails
