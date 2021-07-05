from freightman.models import FreightBooking, Organization, UserOrganizationMap, FreightBookingPartyAddress, AddressBook, \
    FreightBookingPickupNote, FreightBookingGoodsInfo, FreightBookingShippingService
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required


@login_required
@forwarder_required
def getlist_booking(request, type: str):
    org = UserOrganizationMap.objects.get(user=request.user).organization
    bookings = []
    if type == 'registered':
        query = FreightBooking.objects.filter(is_booking_confirmed=False, org=org, entry_complete=True)
    elif type == 'confirmed':
        query = FreightBooking.objects.filter(is_booking_confirmed=True, org=org, entry_complete=True)
        print(query)
    else:
        query = []
    for booking in query:
        info = {}
        info['id'] = booking.id
        info['latest_status'] = 'entry created'
        info['owner'] = org.title
        info['shippers_ref'] = ''
        shipper = FreightBookingPartyAddress.objects.filter(is_shipper=True, booking=booking).first()
        consignee = FreightBookingPartyAddress.objects.filter(is_consignee=True, booking=booking).first()
        pickupnote = FreightBookingPickupNote.objects.filter(booking=booking).first()
        shippingservice = FreightBookingShippingService.objects.filter(booking=booking).first()

        info['from'] = shipper.addressbook.company_name if shipper and shipper.addressbook else ''
        info['from_city'] = shipper.addressbook.city if shipper and shipper.addressbook else ''
        info['pickup'] = pickupnote.pickup_date if pickupnote else ''
        info['to'] = consignee.addressbook.company_name if consignee and consignee.addressbook else ''
        info['to_city'] = consignee.addressbook.city if consignee and consignee.addressbook else ''
        info['delivery'] = ''
        goods = FreightBookingGoodsInfo.objects.filter(booking=booking)
        info['no_of_packages'] = goods.count()
        info['total_weight'] = sum([float(info.weight_kg) for info in goods])
        info['weight_unit'] = 'kg'
        info['transport_service'] = shippingservice.service if shippingservice else ''
        info['sli'] = ''
        bookings.append(info)
    return JsonResponse({
        'data': {
            'booking_list': bookings
        }
    })
