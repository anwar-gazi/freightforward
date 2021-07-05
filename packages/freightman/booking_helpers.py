from freightman.models import FreightBooking, FreightBookingPartyAddress, BookingListener, FreightBookingPortInfo, FreightBookingPickupNote, FreightBookingGoodsInfo, \
    FreightBookingShippingService, FreightBookingOrderNote, FreightBookingGoodsReferences, FreightBookingStakeholderReference, FreightBookingBankBranch
# from freightman.booking_email_views import view_booking_email_body
from django.core.mail import EmailMultiAlternatives
from django.shortcuts import render


def view_booking_email_body(request, booking_id: int):
    booking = FreightBooking.objects.get(id=booking_id)
    shipper_address = FreightBookingPartyAddress.objects.get(booking_id=booking_id, is_shipper=True).addressbook
    consignee_address_list = [addrlink.addressbook for addrlink in
                              FreightBookingPartyAddress.objects.filter(booking_id=booking_id, is_consignee=True)]
    port_info = FreightBookingPortInfo.objects.get(booking=booking)
    pickup_notes = FreightBookingPickupNote.objects.get(booking=booking)
    goods_info = FreightBookingGoodsInfo.objects.filter(booking=booking.id)
    shipping_service = FreightBookingShippingService.objects.get(booking=booking)
    order_note = FreightBookingOrderNote.objects.get(booking=booking)
    goods_references = FreightBookingGoodsReferences.objects.filter(goodsinfo__in=goods_info)
    sli = booking.globalid
    stakeholder_reference = FreightBookingStakeholderReference.objects.filter(booking=booking)
    origin_bank = FreightBookingBankBranch.objects.filter(booking=booking, in_origin_leg=True).first()
    destination_bank = FreightBookingBankBranch.objects.filter(booking=booking, in_destination_leg=True).first()

    data = {
        'booking': booking,
        'shipper_address': shipper_address,
        'consignee_address_list': consignee_address_list,
        'port_info': port_info,
        'pickup_notes': pickup_notes,
        'goods_info': goods_info,
        'shipping_service': shipping_service,
        'order_note': order_note,
        'goods_references': goods_references,
        'sli': sli,
        'stakeholder_reference': stakeholder_reference,
        'origin_bank': origin_bank,
        'destination_bank': destination_bank,
    }
    return render(request, 'intuit/fm/booking_email.html', data)


# obey settings
def send_booking_notification_emails(request, booking_id: int):
    # send booking notify mail
    booking = FreightBooking.objects.get(id=booking_id)
    # email directly from this booking(depending the org email ability on setting) + email watcher for this booking company+email watcher for all bookings
    booking_notify_party_emails = [addr.addressbook.email for addr in FreightBookingPartyAddress.objects.filter(booking=booking, notify=True)] \
        if booking.org.booking_mail_sending_enabled \
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
