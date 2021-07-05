from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.models import FreightBookingPickupNote, FreightBookingPartyAddress, FreightBooking, FreightBookingPortInfo, FreightBookingGoodsInfo, \
    FreightBookingShippingService, \
    FreightBookingOrderNote, FreightBookingGoodsReferences, FreightBookingStakeholderReference, FreightBookingBankBranch
from freightman.decorators import forwarder_required
from .booking_helpers import view_booking_email_body
from .public_id_helpers import type_1_public_id_to_model_id


@login_required
@forwarder_required
def pdf_template(request):
    data = {}
    return render(request, 'intuit/fm/booking_by_shipper_pdf_template.html', data)


@login_required
@forwarder_required
def view_booking_email_body_page(request, booking_public_id: str):
    booking_id = type_1_public_id_to_model_id(booking_public_id)
    return view_booking_email_body(request, booking_id)
