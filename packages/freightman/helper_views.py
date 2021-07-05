from django.shortcuts import render
from freightman.models import FreightBookingPickupNote, FreightBookingPartyAddress, FreightBooking, FreightBookingPortInfo, FreightBookingGoodsInfo, \
    FreightBookingShippingService, \
    FreightBookingOrderNote, FreightBookingGoodsReferences
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os, sys


@login_required
@forwarder_required
def pdf_template(request):
    data = {}
    return render(request, 'intuit/fm/booking_by_shipper_pdf_template.html', data)


@login_required
@forwarder_required
def view_booking_email_body(request, booking_id):
    booking = FreightBooking.objects.get(id=booking_id)
    shipper_address = FreightBookingPartyAddress.objects.get(booking_id=booking_id, is_shipper=True).addressbook
    consignee_address_list = [addrlink.addressbook for addrlink in FreightBookingPartyAddress.objects.filter(booking_id=booking_id, is_consignee=True)]
    port_info = FreightBookingPortInfo.objects.get(booking=booking)
    pickup_notes = FreightBookingPickupNote.objects.get(booking=booking)
    goods_info = FreightBookingGoodsInfo.objects.filter(booking=booking.id)
    shipping_service = FreightBookingShippingService.objects.get(booking=booking)
    order_note = FreightBookingOrderNote.objects.get(booking=booking)
    goods_references = FreightBookingGoodsReferences.objects.filter(goodsinfo__in=goods_info)
    sli = booking.globalid

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
        'sli': sli
    }
    return render(request, 'intuit/fm/booking_email.html', data)


@login_required
@csrf_exempt
def upload_file(request):
    from freightman.forms import FileUploadForm
    from django.core.files.storage import FileSystemStorage
    from datetime import datetime
    from freightman.filehelpers import basename_and_extension
    from django.http import JsonResponse
    import urllib.parse

    resp = {
        'success': False,
        'errors': [],
        'data': {
            'rel_path': ''
        }
    }

    form = FileUploadForm(request.POST, request.FILES)
    url = ''
    if form.is_valid():
        fs = FileSystemStorage()
        # filename = 'seaexport/booking/user_{}/{}'.format(request.user.id, datetime.now().strftime('%Y/%m/%d/')) + form.cleaned_data['file'].name
        basename, ext = basename_and_extension(form.cleaned_data['file'].name)
        filename = 'temp/' + form.cleaned_data['file'].name
        if os.path.exists(filename):
            if ext:
                filename = 'seaexport/booking/temp/' + basename + str(datetime.now().timestamp()) + '.' + ext
            else:
                filename = 'seaexport/booking/temp/' + form.cleaned_data['file'].name + str(datetime.now().timestamp())

        uploadedfilename = fs.save(filename, form.cleaned_data['file'].file)
        url = fs.url(uploadedfilename)
        resp['success'] = True
        resp['data']['rel_path'] = urllib.parse.unquote(url)
    return render(request, 'default/fm/iframe.html', {'url': urllib.parse.unquote(url)})
