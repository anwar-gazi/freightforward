from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.decorators import shipper_or_factory_required


@login_required
@shipper_or_factory_required
def sea_export_frt_booking_page(request):
    data = {}
    return render(request, 'intuit/seaexport/shipper/frt_book/sea_export_frt_book.html', data)
