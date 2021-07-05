from freightman.models import FreightBooking, FreightBookingPartyAddress, FreightBookingPickupNote, FreightBookingShippingService, FreightBookingGoodsInfo, HAWB, MAWB, \
    AirExportConsolidatedShipment, AirExportConsolHouseMap, AirExportConsolidatedShipmentJobCosting, AirExportConsolidatedShipmentDebitNote
from django.conf import settings
from django.urls import reverse


def booking_dict(request, booking_id):
    info = {}
    mawb_q = AirExportConsolidatedShipment.objects.filter(house__booking_id=booking_id)
    hawb_q = HAWB.objects.filter(booking_id=booking_id)
    debitnote_q = AirExportConsolidatedShipmentDebitNote.objects.filter(hawb__booking_id=booking_id)
    if hawb_q.exists():
        has_job_costing = AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment__airexportconsolhousemap__hawb=hawb_q.first()).exists()
    else:
        has_job_costing = False
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
    info['chargable_weight'] = round(sum([gi.chargable_weight for gi in goods]), 2)
    info['cbm'] = round(sum([gi.cbm for gi in goods]), 2)
    info['weight_unit'] = 'CBM'
    info['transport_service'] = shippingservice.service if shippingservice else '--'
    info['sli'] = booking.globalid
    info['is_booking_confirmed'] = booking.is_booking_confirmed
    info['hawb_generated'] = hawb_q.exists()
    info['mawb_generated'] = mawb_q.exists()
    info['has_job_costing'] = has_job_costing
    info['hawb_dummy_view_url'] = request.build_absolute_uri(reverse('forwarder-hawb-dummy-print-preview-page', args=(hawb_q.first().public_id,))) \
        if hawb_q.exists() else ''
    info['hawb_view_url'] = request.build_absolute_uri(reverse('forwarder-hawb-print-preview-page', args=(hawb_q.first().public_id,))) if hawb_q.exists() else ''
    info['mawb_view_url'] = request.build_absolute_uri(reverse('forwarder-mawb-print-preview-page', args=(mawb_q.first().mawb.public_id,))) if mawb_q.exists() else ''
    info['invoice_list'] = [{'public_id': debitnote.public_id,
                             'to_company': debitnote.to_address_company_name(),
                             'url': request.build_absolute_uri(reverse('forwarder-debit_note_view', args=(debitnote.public_id,)))}
                            for debitnote in debitnote_q]
    info['url_for_booking_notification_email_body_view'] = reverse('view_booking_email_body', args=(booking.globalid,))

    return info
