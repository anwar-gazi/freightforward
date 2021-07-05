from freightman.models import FreightBooking, FreightBookingPartyAddress, FreightBookingPickupNote, FreightBookingShippingService, FreightBookingGoodsInfo, \
    AirExportConsolidatedShipment, HAWB
from django.conf import settings
from django.shortcuts import reverse


def booking_dict_for_bookinglist_frontend(request, booking_id: int):
    info = {}
    mawb_q = AirExportConsolidatedShipment.objects.filter(house__booking_id=booking_id)
    hawb_q = HAWB.objects.filter(booking_id=booking_id)
    booking = FreightBooking.objects.get(id=booking_id)
    info['id'] = booking.id
    info['latest_status'] = booking.status
    info['owner'] = booking.entry_by.get_full_name()
    info['shippers_ref'] = booking.org.ref
    shipper = FreightBookingPartyAddress.objects.filter(is_shipper=True, booking=booking).first()
    consignee = FreightBookingPartyAddress.objects.filter(is_consignee=True, booking=booking).first()
    pickupnote = FreightBookingPickupNote.objects.filter(booking=booking).first()
    shippingservice = FreightBookingShippingService.objects.filter(booking=booking).first()

    info['from'] = shipper.addressbook.company_name if shipper and shipper.addressbook else '--'
    info['from_city'] = shipper.addressbook.city.name if shipper and shipper.addressbook else '--'
    info['pickup'] = pickupnote.pickup_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if pickupnote else '--'
    info['to'] = consignee.addressbook.company_name if consignee and consignee.addressbook else ''
    info['to_city'] = consignee.addressbook.city.name if consignee and consignee.addressbook else '--'
    info['delivery'] = booking.edd.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if booking.edd else '--'
    goods = FreightBookingGoodsInfo.objects.filter(booking=booking)
    info['no_of_packages'] = goods.count()
    info['total_weight'] = sum([float(info.weight_kg) for info in goods])
    info['weight_unit'] = 'CBM'
    info['transport_service'] = shippingservice.service if shippingservice else '--'
    info['sli'] = booking.globalid
    info['hawb_generated'] = hawb_q.exists()
    info['mawb_generated'] = mawb_q.exists()
    info['hawb_view_url'] = request.build_absolute_uri(reverse('forwarder-hawb-print-preview-page', args=(hawb_q.first().public_id,))) if hawb_q.exists() else ''
    info['hawb_view_url_by_factory'] = request.build_absolute_uri(reverse('shipper-hawb-print-preview-page', args=(hawb_q.first().public_id,))) if hawb_q.exists() else ''
    return info
