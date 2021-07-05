from seaexport.models import SeaExportFreightBooking, SeaExportFreightBookingGoodsInfo, SeaExportHBL, SeaExportContainerConsolShipmentAllocatedContainerToHBLMap
from django.conf import settings
from django.shortcuts import reverse


def booking_status(booking: SeaExportFreightBooking):
    return 'booked' if booking.is_booking_confirmed else 'registered'


def seafrtbooking_dict_for_bookinglist(request, booking: SeaExportFreightBooking):
    info = {}
    goods = SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)
    info['public_id'] = booking.public_id
    info['edit_url'] = reverse('seaexport:freight_booking_edit', args=(booking.public_id_normalized,))
    info['copy_url'] = reverse('seaexport:freight_booking_copy', args=(booking.public_id_normalized,))
    info['delete_url'] = reverse('seaexport:freight_booking_delete', args=(booking.public_id_normalized,))
    info['urlfor_view_booking_email_body'] = reverse('seaexport:seaexport_forwarder_view_booking_email_body_page', args=(booking.public_id_normalized,))
    info['is_booking_confirmed'] = booking.is_booking_confirmed
    info['goods_received'] = booking.goods_received
    info['latest_status'] = booking_status(booking)
    info['owner'] = booking.supplier.title
    info['shippers_ref'] = booking.supplier.ref

    info['from'] = booking.shipper.company_name
    info['from_city'] = booking.shipper.city.name
    info['pickup'] = booking.pickup_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN)
    info['to'] = booking.consignee.company_name
    info['to_city'] = booking.consignee.city.name
    info['delivery'] = booking.edd.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if booking.edd else '--'
    info['no_of_packages'] = goods.count()
    info['total_weight'] = sum([float(info.weight_kg) for info in goods])
    info['weight_unit'] = 'KG'
    info['cbm'] = round(sum([gi.cbm for gi in goods]), 2)
    info['transport_service'] = booking.shipping_service
    info['sli'] = booking.globalid
    info['hbl_generated'] = SeaExportHBL.objects.filter(booking=booking).exists()
    info['is_consolidated'] = SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(hbl__booking=booking).exists()
    info['shipment_sent'] = False
    info['shipment_finished'] = False
    info['has_job_costing'] = False
    info['has_invoice'] = False
    return info


def seafrtbooking_dict_for_supplier_bookinglist(request, booking: SeaExportFreightBooking):
    info = {}
    goods = SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)
    info['public_id'] = booking.public_id
    info['edit_url'] = reverse('seaexport:supplier_freight_booking_edit', args=(booking.public_id_normalized,))
    info['copy_url'] = reverse('seaexport:supplier_freight_booking_copy', args=(booking.public_id_normalized,))
    info['delete_url'] = reverse('seaexport:supplier_freight_booking_delete', args=(booking.public_id_normalized,))
    info['urlfor_view_booking_email_body'] = reverse('seaexport:seaexport_forwarder_view_booking_email_body_page', args=(booking.public_id_normalized,))
    info['is_booking_confirmed'] = booking.is_booking_confirmed
    info['goods_received'] = booking.goods_received
    info['latest_status'] = booking_status(booking)
    info['owner'] = booking.supplier.title
    info['shippers_ref'] = booking.supplier.ref

    info['from'] = booking.shipper.company_name
    info['from_city'] = booking.shipper.city.name
    info['pickup'] = booking.pickup_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN)
    info['to'] = booking.consignee.company_name
    info['to_city'] = booking.consignee.city.name
    info['delivery'] = booking.edd.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if booking.edd else '--'
    info['no_of_packages'] = goods.count()
    info['total_weight'] = sum([float(info.weight_kg) for info in goods])
    info['weight_unit'] = 'KG'
    info['cbm'] = round(sum([gi.cbm for gi in goods]), 2)
    info['transport_service'] = booking.shipping_service
    info['sli'] = booking.globalid
    info['hbl_generated'] = SeaExportHBL.objects.filter(booking=booking).exists()
    info['is_consolidated'] = SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(hbl__booking=booking).exists()
    info['shipment_sent'] = False
    info['shipment_finished'] = False
    info['has_job_costing'] = False
    info['has_invoice'] = False
    return info
