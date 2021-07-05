from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .decorators import forwarder_required


@login_required
@forwarder_required
def frt_booking_page(request):
    data = {}
    return render(request, 'intuit/fm/forwarder_freight_booking.html', data)
