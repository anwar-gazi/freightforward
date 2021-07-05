from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required, shipper_or_factory_required
from django.shortcuts import render
from freightman.user_helpers import user_org
from freightman.models import Organization, Currency, Country, City, BankBranch, PaymentType, GoodsReferenceTypes, StakeholderReferenceTypes, AddressBook, ServiceProviderMap
from seaexport.models import SeaTransportAgreement, SeaPort, SeaTermsofDelivery, SeaExportPackageType
from django.http import JsonResponse
from seaexport.dictbuilder.forwarder_frt_book import org_dict
from freightman.forms import SupplierPublicIDForm


@login_required
@shipper_or_factory_required
def sea_export_frt_booking_page(request):
    data = {}
    return render(request, 'intuit/seaexport/supplier/frt_book/sea_export_frt_book.html', data)


@login_required
@shipper_or_factory_required
def get_booking_page_init_data(request):
    supplier = user_org(request.user.id)
    forwarder = ServiceProviderMap.objects.filter(customer_org=supplier).first().service_provider_org
    data = {
        'forwarder': org_dict(forwarder),
        'supplier': org_dict(supplier) if supplier else {},
        'supplier_list': [org_dict(supplier)],
        'currency_list': [curr.dict(request) for curr in Currency.objects.all().order_by('id')],
        'transport_agreement_list': [ta.dict(request) for ta in SeaTransportAgreement.objects.all().order_by('id')],
        'country_list': [country.dict() for country in Country.objects.all().order_by('id')],
        'city_list': [city.dict() for city in City.objects.all().order_by('id')],
        'supplier_address_list': [add.dict(request) for add in AddressBook.objects.filter(organization=supplier).order_by('id')] if supplier else [],
        'bank_branch_list': [branch.dict() for branch in BankBranch.objects.all().order_by('id')],
        'sea_port_list': [sp.dict() for sp in SeaPort.objects.all().order_by('id')],
        'tod_list': [tod.dict() for tod in SeaTermsofDelivery.objects.all().order_by('id')],
        'package_type_list': [pak.dict() for pak in SeaExportPackageType.objects.all().order_by('id')],
        'payment_type_list': [pt.dict() for pt in PaymentType.objects.all().order_by('id')],
        'goods_ref_type_list': [ref.dict(request) for ref in GoodsReferenceTypes.objects.all().order_by('-id')],
        'stakeholder_ref_type_list': [ref.dict(request) for ref in StakeholderReferenceTypes.objects.all().order_by('id')],
    }
    return JsonResponse(data)


@login_required
@shipper_or_factory_required
def sea_export_frt_bookinglist_page(request):
    data = {}
    return render(request, 'intuit/seaexport/supplier/bookinglist_page.html', data)


@login_required
def get_seaexport_bookinglist(request):
    from freightman.forms import PaginationForm
    from seaexport.models import SeaExportFreightBooking
    from seaexport.dictbuilder.bookinglist import seafrtbooking_dict_for_supplier_bookinglist
    import math
    form = PaginationForm(request.GET)
    form.is_valid()
    page = form.cleaned_data.get('page', None) or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    supplier = user_org(request.user.id)

    total_entry = SeaExportFreightBooking.objects.filter(supplier=supplier).count()
    number_of_page = math.ceil(total_entry / entry_per_page)
    data = {
        'data': {
            'booking_list': [seafrtbooking_dict_for_supplier_bookinglist(request, book) for book in
                             SeaExportFreightBooking.objects.filter(supplier=supplier).order_by('-id')[entry_start:entry_end]],
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
        }
    }
    return JsonResponse(data)


@login_required
@shipper_or_factory_required
def view_frt_booking(request, public_id: str):
    data = {
        'public_id': public_id
    }
    return render(request, 'intuit/seaexport/supplier/frt_book/sea_export_frt_book.html', data)


@login_required
@shipper_or_factory_required
def copy_frt_booking(request, public_id: str):
    data = {
        'public_id': public_id,
        'copy': True
    }
    return render(request, 'intuit/seaexport/supplier/frt_book/sea_export_frt_book.html', data)


@login_required
@shipper_or_factory_required
def delete_frt_booking(request, public_id: str):
    from seaexport.models import SeaExportFreightBooking
    from freightman.public_id_helpers import type_1_public_id_to_model_id
    resp = {
        'success': False
    }
    booking = SeaExportFreightBooking.objects.get(id=type_1_public_id_to_model_id(public_id))
    booking.delete()
    resp['success'] = True
    return JsonResponse(resp)
