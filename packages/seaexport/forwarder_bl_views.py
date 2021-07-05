from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from freightman.exceptions import CustomException
from freightman.decorators import forwarder_required
from django.contrib.auth.decorators import login_required
from seaexport.blforms import HBLForm, MBLForm, BLAddressForm, AllocatedContainerForm, ContainerSerialForm, HBLIDFormForMBLMapping, ContainerConsolForm, ConsolContainerForm
from seaexport.forms import BookingPublicIDForm
from seaexport.models import SeaExportFreightBooking, SeaPort, ContainerType, SeaExportHBL, SeaExportHBLContainerInfo, SeaExportMBL, \
    SeaExportMBLToHBLMap, AllocatedOceanContainer, SeaExportContainerConsolShipmentAllocatedContainerToHBLMap, SeaExportContainerConsolShipment, \
    SeaExportContainerConsolShipmentToAllocatedContainerMap, Organization
from seaexport.dictbuilder.bookinglist import seafrtbooking_dict_for_bookinglist
from seaexport.dictbuilder.container import container_dict
from freightman.models import AddressBook, City, Country
from django.http import JsonResponse
from seaexport.dictbuilder.hbl import addressbook_dict, city_dict, country_dict, seaport_dict, booking_dict, container_dict, hbl_dict, allocated_container_dict, \
    container_dict_from_serial, hbl_dict_for_hbl_view
from freightman.user_helpers import user_org
from freightman.public_id_helpers import type_1_public_id_to_model_id
from django.db.models import F
from freightman.forms import PublicIDForm
from freightman.dictbuilders.org_management import org_dict_for_edit_form
import json


@login_required
@forwarder_required
def delete_job(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': []
    }
    form = PublicIDForm(request.GET)
    form.is_valid()
    hbl = SeaExportHBL.objects.get(id=form.id)
    hbl.delete()
    resp['success'] = True
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_job_dates(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {
            'received_at_estimated': '',
            'received_at_actual': '',
        }
    }
    form = PublicIDForm(request.GET)
    form.is_valid()
    hawb = SeaExportHBL.objects.get(id=form.id)
    resp['data']['received_at_estimated'] = hawb.received_at_estimated.strftime('%Y-%m-%d') if hawb.received_at_estimated else ''
    resp['data']['received_at_actual'] = hawb.received_at_actual.strftime('%Y-%m-%d') if hawb.received_at_actual else ''
    return JsonResponse(resp)


@login_required
@forwarder_required
def update_job_dates(request):
    from seaexport.forms import JobDatesForm
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {}
    }
    form = JobDatesForm(request.GET)
    form.is_valid()
    hbl = SeaExportHBL.objects.get(id=form.id)
    if form.cleaned_data['received_estimated']:
        hbl.received_at_estimated = form.cleaned_data['received_estimated']
        hbl.received_by_id = request.user.id
    if form.cleaned_data['received_actual']:
        hbl.received_at_actual = form.cleaned_data['received_actual']
        hbl.received_by_id = request.user.id
    hbl.save()
    resp['success'] = True
    return JsonResponse(resp)


@login_required
def get_hbl_info(request):
    form = PublicIDForm(request.GET)
    form.is_valid()
    hbl = SeaExportHBL.objects.get(id=type_1_public_id_to_model_id(form.cleaned_data['public_id']))
    resp = {
        'success': True,
        'errors': form.non_field_errors(),
        'data': {
            'hbl_dict': hbl_dict_for_hbl_view(request, hbl)
        }
    }
    return JsonResponse(resp)


@login_required
@forwarder_required
def view_hbl_page(request, public_id: str):
    data = {
        'form': HBLForm(),
        'forwarder': user_org(request.user.id),
        'hbl_public_id': public_id
    }
    return render(request, 'intuit/seaexport/forwarder/hbl_create_page.html', data)


@login_required
@forwarder_required
def copy_hbl_page(request, public_id: str):
    data = {
        'form': HBLForm(),
        'forwarder': user_org(request.user.id),
        'hbl_public_id': public_id
    }
    return render(request, 'intuit/seaexport/forwarder/hbl_copy_page.html', data)


@login_required
@forwarder_required
def create_hbl_page(request):
    data = {
        'form': HBLForm(),
        'forwarder': user_org(request.user.id)
    }
    return render(request, 'intuit/seaexport/forwarder/hbl_create_page.html', data)


@login_required
@forwarder_required
def ajax_hbl_page_init_data(request):
    forwarder_org = user_org(request.user.id)
    default_address = AddressBook.objects.filter(organization=forwarder_org, is_default=True).first()
    resp = {
        'data': {
            'supplier_list': [org_dict_for_edit_form(org) for org in Organization.objects.filter(is_supplier=True)],
            'confirmed_bookings_without_bl': [
                seafrtbooking_dict_for_bookinglist(request, booking)
                for booking in SeaExportFreightBooking.objects
                    .filter(is_booking_confirmed=True, goods_received=True, seaexpthblbooking__isnull=True).order_by('-id')
            ],
            'forwarder_default_address': addressbook_dict(default_address) if default_address else None,
            'city_list': [city_dict(ct) for ct in City.objects.all().order_by('-id')],
            'country_list': [country_dict(country) for country in Country.objects.all().order_by('-id')],
            'seaport_list': [seaport_dict(sp) for sp in SeaPort.objects.all().order_by('-id')],
            'container_type_list': [container_dict(container) for container in ContainerType.objects.all().order_by('-id')]
        }
    }
    return JsonResponse(resp)


@login_required
@forwarder_required
def ajax_mbl_page_init_data(request):
    forwarder_org = user_org(request.user.id)
    default_address = AddressBook.objects.filter(organization=forwarder_org, is_default=True).first()
    resp = {
        'data': {
            'forwarder_default_address': addressbook_dict(default_address) if default_address else None,
            'city_list': [city_dict(ct) for ct in City.objects.all().order_by('-id')],
            'country_list': [country_dict(country) for country in Country.objects.all().order_by('-id')],
            'seaport_list': [seaport_dict(sp) for sp in SeaPort.objects.all().order_by('-id')],
            'unassigned_hbl_list': [hbl_dict(request, hbl) for hbl in
                                    SeaExportHBL.objects.exclude(id__in=[m.hbl.id for m in SeaExportMBLToHBLMap.objects.all()])
                                        .order_by('-id')]
        }
    }
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_booking_dict_for_hbl_page(request):
    form = BookingPublicIDForm(request.GET)
    if form.is_valid():
        resp = {
            'success': True,
            'errors': [],
            'form_errors': [],
            'data': {
                'booking_dict': booking_dict(request, SeaExportFreightBooking.objects.get(id=type_1_public_id_to_model_id(form.cleaned_data['booking_public_id'])))
            }
        }
    else:
        resp = {
            'success': False,
            'errors': form.non_field_errors(),
            'form_errors': form.errors,
            'data': {}
        }
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_continer_serial_info(request):
    form = ContainerSerialForm(request.GET)

    resp = {
        'success': False,
        'errors': [],
        'msg': [],
        'form_errors': {},
        'data': {
            'container_dict': ''
        }
    }

    if form.is_valid():
        if not AllocatedOceanContainer.objects.filter(container_serial=form.cleaned_data['serial']).exists():
            resp['success'] = False
            resp['msg'].append('Serial is new(not in database)')
        else:
            resp['success'] = True
            resp['data']['container_dict'] = container_dict_from_serial(form.cleaned_data['serial'])
    else:
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
    return JsonResponse(resp)


@login_required
@forwarder_required
def add_mbl_page(request):
    data = {
        'form': MBLForm()
    }
    return render(request, 'intuit/seaexport/forwarder/mbl_create_page.html', data)


@login_required
@forwarder_required
def mbl_listing_page(request):
    data = {}
    return render(request, 'intuit/seaexport/forwarder/mbl_list_page.html', data)


@login_required
@forwarder_required
def get_mbl_list(request):
    from freightman.forms import PaginationForm
    from seaexport.dictbuilder.mbl import mbl_dict_for_frontend
    import math

    forwarder = user_org(request.user.id)

    form = PaginationForm(request.GET)
    form.is_valid()
    page = form.cleaned_data.get('page', None) or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    total_entry = SeaExportMBL.objects.filter(forwarder=forwarder).count()
    number_of_page = math.ceil(total_entry / entry_per_page)
    data = {
        'data': {
            'mbl_list': [mbl_dict_for_frontend(request, mbl) for mbl in SeaExportMBL.objects.filter(forwarder=forwarder).order_by('-id')[entry_start:entry_end]],
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
@forwarder_required
def bl_consol_page(request):
    data = {
        'form': None
    }
    return render(request, 'intuit/seaexport/forwarder/bl_consol_page.html', data)


@login_required
@csrf_exempt
@forwarder_required
def hbl_save(request):
    forwarder = user_org(request.user.id)
    resp = {
        'success': False,
        'errors': [],
        'form_errors': [],
        'msg': [],

        'container_error_list': [],

        'data': {
            'hbl_public_id': ''
        }
    }
    form = HBLForm(request.POST)
    if form.is_valid():
        if form.cleaned_data['booking_applies']:
            booking_id = type_1_public_id_to_model_id(form.cleaned_data['booking_public_id'])
            supplier_id = SeaExportFreightBooking.objects.get(id=booking_id).supplier_id
        else:
            booking_id = None
            supplier_id = type_1_public_id_to_model_id(form.cleaned_data['supplier_public_id'])
        try:
            with transaction.atomic():
                shipper_addressbook, _shaddrcr = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['shipper_company_name'],
                    address=form.cleaned_data['shipper_address'],
                    postcode=form.cleaned_data['shipper_postcode'],
                    city_id=form.cleaned_data['shipper_city'],
                    state=form.cleaned_data['shipper_state'],
                    country_id=form.cleaned_data['shipper_country'],
                    contact=form.cleaned_data['shipper_contact'],
                    phone=form.cleaned_data['shipper_tel_num'],
                    mobile=form.cleaned_data['shipper_mobile_num'],
                    fax=form.cleaned_data['shipper_fax_num'],
                    email=form.cleaned_data['shipper_email']
                )
                consignee_addressbook, _consaddrcr = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['consignee_company_name'],
                    address=form.cleaned_data['consignee_address'],
                    postcode=form.cleaned_data['consignee_postcode'],
                    city_id=form.cleaned_data['consignee_city'],
                    state=form.cleaned_data['consignee_state'],
                    country_id=form.cleaned_data['consignee_country'],
                    contact=form.cleaned_data['consignee_contact'],
                    phone=form.cleaned_data['consignee_tel_num'],
                    mobile=form.cleaned_data['consignee_mobile_num'],
                    fax=form.cleaned_data['consignee_fax_num'],
                    email=form.cleaned_data['consignee_email']
                )
                agent_addressbook, _agentaddrcr = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['agent_company_name'],
                    address=form.cleaned_data['agent_address'],
                    postcode=form.cleaned_data['agent_postcode'],
                    city_id=form.cleaned_data['agent_city'],
                    state=form.cleaned_data['agent_state'],
                    country_id=form.cleaned_data['agent_country'],
                    contact=form.cleaned_data['agent_contact'],
                    phone=form.cleaned_data['agent_tel_num'],
                    mobile=form.cleaned_data['agent_mobile_num'],
                    fax=form.cleaned_data['agent_fax_num'],
                    email=form.cleaned_data['agent_email']
                )
                if form.cleaned_data['hbl_public_id']:
                    hbl = SeaExportHBL.objects.get(id=type_1_public_id_to_model_id(form.cleaned_data['hbl_public_id']))

                    hbl.supplier_id = supplier_id

                    hbl.shipper_addressbook = shipper_addressbook
                    hbl.consignee_addressbook = consignee_addressbook
                    hbl.agent_addressbook = agent_addressbook

                    hbl.city_of_receipt_id = form.cleaned_data['city_id_of_receipt']
                    hbl.port_of_loading_id = form.cleaned_data['port_id_of_loading']
                    hbl.feeder_vessel_name = form.cleaned_data['feeder_vessel_name']
                    hbl.voyage_number = form.cleaned_data['voyage_number']
                    hbl.mother_vessel_name = form.cleaned_data['mother_vessel_name']
                    hbl.mother_vessel_voyage_number = form.cleaned_data['mother_vessel_voyage_number']
                    hbl.port_of_discharge_id = form.cleaned_data['port_id_of_discharge']
                    hbl.city_of_final_destination_id = form.cleaned_data['city_id_of_final_destination']
                    hbl.excess_value_declaration = form.cleaned_data['excess_value_declaration']

                    hbl.goods_no_of_packages = form.cleaned_data['goods_no_of_packages']
                    hbl.goods_gross_weight_kg = form.cleaned_data['goods_gross_weight_kg']
                    hbl.goods_cbm = form.cleaned_data['goods_cbm']
                    hbl.no_of_pallet = form.cleaned_data['no_of_pallet']
                    hbl.lot_number = form.cleaned_data['lot_number']
                    hbl.goods_note = form.cleaned_data['goods_note']

                    hbl.other_notes = form.cleaned_data['other_notes']
                    hbl.issue_city_id = form.cleaned_data['issue_city_id']
                    hbl.issue_date = form.cleaned_data['issue_date']

                    hbl.save()
                else:
                    hbl = SeaExportHBL.objects.create(
                        forwarder=forwarder,
                        booking_id=booking_id,
                        supplier_id=supplier_id,

                        shipper_addressbook=shipper_addressbook,
                        consignee_addressbook=consignee_addressbook,
                        agent_addressbook=agent_addressbook,

                        city_of_receipt_id=form.cleaned_data['city_id_of_receipt'],
                        port_of_loading_id=form.cleaned_data['port_id_of_loading'],
                        feeder_vessel_name=form.cleaned_data['feeder_vessel_name'],
                        voyage_number=form.cleaned_data['voyage_number'],
                        mother_vessel_name=form.cleaned_data['mother_vessel_name'],
                        mother_vessel_voyage_number=form.cleaned_data['mother_vessel_voyage_number'],
                        port_of_discharge_id=form.cleaned_data['port_id_of_discharge'],
                        city_of_final_destination_id=form.cleaned_data['city_id_of_final_destination'],

                        goods_no_of_packages=form.cleaned_data['goods_no_of_packages'],
                        goods_gross_weight_kg=form.cleaned_data['goods_gross_weight_kg'],
                        goods_cbm=form.cleaned_data['goods_cbm'],
                        no_of_pallet=form.cleaned_data['no_of_pallet'],
                        lot_number=form.cleaned_data['lot_number'],
                        goods_note=form.cleaned_data['goods_note'],
                        excess_value_declaration=form.cleaned_data['excess_value_declaration'],

                        other_notes=form.cleaned_data['other_notes'],
                        issue_city_id=form.cleaned_data['issue_city_id'],
                        issue_date=form.cleaned_data['issue_date'],
                        entry_by=request.user
                    )

                for containerform in form.container_valid_form_list:  # type:AllocatedContainerForm
                    allocatedcontainer, _contcr = AllocatedOceanContainer.objects.get_or_create(
                        container_type_id=containerform.cleaned_data['container_type_id'],
                        container_serial=containerform.cleaned_data['container_serial'],
                        container_number=containerform.cleaned_data['container_number']
                    )
                    SeaExportHBLContainerInfo.objects.get_or_create(hbl=hbl, allocated_container=allocatedcontainer)

                resp['success'] = True
                resp['msg'].append('Save Success')
                resp['data']['hbl_public_id'] = hbl.public_id
        except CustomException:
            resp['success'] = False
            resp['msg'] = []
    else:
        resp['success'] = False
        resp['form_errors'] = form.errors
        resp['errors'] += form.non_field_errors()
        resp['container_error_list'] = form.container_error_list

    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def mbl_save(request):
    forwarder = user_org(request.user.id)
    resp = {
        'success': False,
        'errors': [],
        'form_errors': [],
        'msg': [],

        'container_error_list': [],
        'hbl_error_list': [],

        'data': {
            'mbl_public_id': ''
        }
    }
    form = MBLForm(request.POST)
    if form.is_valid():
        with transaction.atomic():
            # if we get here that means all forms are valid(if invalid we already got out of here with raise exception)
            if form.mbl_id:
                mbl = SeaExportMBL.objects.get(id=form.mbl_id)

                mbl.mbl_number = form.cleaned_data['mbl_number']

                mbl.shipper_addressbook.company_name = form.cleaned_data['shipper_company_name']
                mbl.shipper_addressbook.address = form.cleaned_data['shipper_address']
                mbl.shipper_addressbook.postcode = form.cleaned_data['shipper_postcode']
                mbl.shipper_addressbook.city_id = form.cleaned_data['shipper_city']
                mbl.shipper_addressbook.state = form.cleaned_data['shipper_state']
                mbl.shipper_addressbook.country_id = form.cleaned_data['shipper_country']
                mbl.shipper_addressbook.contact = form.cleaned_data['shipper_contact']
                mbl.shipper_addressbook.phone = form.cleaned_data['shipper_tel_num']
                mbl.shipper_addressbook.mobile = form.cleaned_data['shipper_mobile_num']
                mbl.shipper_addressbook.fax = form.cleaned_data['shipper_fax_num']
                mbl.shipper_addressbook.email = form.cleaned_data['shipper_email']
                mbl.shipper_addressbook.save()

                mbl.consignee_addressbook.company_name = form.cleaned_data['consignee_company_name']
                mbl.consignee_addressbook.address = form.cleaned_data['consignee_address']
                mbl.consignee_addressbook.postcode = form.cleaned_data['consignee_postcode']
                mbl.consignee_addressbook.city_id = form.cleaned_data['consignee_city']
                mbl.consignee_addressbook.state = form.cleaned_data['consignee_state']
                mbl.consignee_addressbook.country_id = form.cleaned_data['consignee_country']
                mbl.consignee_addressbook.contact = form.cleaned_data['consignee_contact']
                mbl.consignee_addressbook.phone = form.cleaned_data['consignee_tel_num']
                mbl.consignee_addressbook.mobile = form.cleaned_data['consignee_mobile_num']
                mbl.consignee_addressbook.fax = form.cleaned_data['consignee_fax_num']
                mbl.consignee_addressbook.email = form.cleaned_data['consignee_email']
                mbl.consignee_addressbook.save()

                mbl.city_of_receipt_id = form.cleaned_data['city_id_of_receipt']
                mbl.port_of_loading_id = form.cleaned_data['port_id_of_loading']
                mbl.feeder_vessel_name = form.cleaned_data['feeder_vessel_name']
                mbl.voyage_number = form.cleaned_data['voyage_number']
                mbl.mother_vessel_name = form.cleaned_data['mother_vessel_name']
                mbl.mother_vessel_voyage_number = form.cleaned_data['mother_vessel_voyage_number']
                mbl.port_of_discharge_id = form.cleaned_data['port_id_of_discharge']
                mbl.city_of_final_destination_id = form.cleaned_data['city_id_of_final_destination']

                mbl.goods_no_of_packages = form.cleaned_data['goods_no_of_packages']
                mbl.goods_gross_weight_kg = form.cleaned_data['goods_gross_weight_kg']
                mbl.goods_cbm = form.cleaned_data['goods_cbm']

                mbl.issue_city_id = form.cleaned_data['issue_city_id']
                mbl.issue_date = form.cleaned_data['issue_date']
                mbl.save()
            else:
                shipper, _shaddrcr = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['shipper_company_name'],
                    address=form.cleaned_data['shipper_address'],
                    postcode=form.cleaned_data['shipper_postcode'],
                    city_id=form.cleaned_data['shipper_city'],
                    state=form.cleaned_data['shipper_state'],
                    country_id=form.cleaned_data['shipper_country'],
                    contact=form.cleaned_data['shipper_contact'],
                    phone=form.cleaned_data['shipper_tel_num'],
                    mobile=form.cleaned_data['shipper_mobile_num'],
                    fax=form.cleaned_data['shipper_fax_num'],
                    email=form.cleaned_data['shipper_email']
                )
                consignee, _consaddrcr = AddressBook.objects.get_or_create(
                    organization=forwarder,
                    company_name=form.cleaned_data['consignee_company_name'],
                    address=form.cleaned_data['consignee_address'],
                    postcode=form.cleaned_data['consignee_postcode'],
                    city_id=form.cleaned_data['consignee_city'],
                    state=form.cleaned_data['consignee_state'],
                    country_id=form.cleaned_data['consignee_country'],
                    contact=form.cleaned_data['consignee_contact'],
                    phone=form.cleaned_data['consignee_tel_num'],
                    mobile=form.cleaned_data['consignee_mobile_num'],
                    fax=form.cleaned_data['consignee_fax_num'],
                    email=form.cleaned_data['consignee_email']
                )
                mbl = SeaExportMBL.objects.create(
                    forwarder=forwarder,

                    mbl_number=form.cleaned_data['mbl_number'],

                    shipper_addressbook=shipper,
                    consignee_addressbook=consignee,

                    city_of_receipt_id=form.cleaned_data['city_id_of_receipt'],
                    port_of_loading_id=form.cleaned_data['port_id_of_loading'],
                    feeder_vessel_name=form.cleaned_data['feeder_vessel_name'],
                    voyage_number=form.cleaned_data['voyage_number'],
                    mother_vessel_name=form.cleaned_data['mother_vessel_name'],
                    mother_vessel_voyage_number=form.cleaned_data['mother_vessel_voyage_number'],
                    port_of_discharge_id=form.cleaned_data['port_id_of_discharge'],
                    city_of_final_destination_id=form.cleaned_data['city_id_of_final_destination'],

                    goods_no_of_packages=form.cleaned_data['goods_no_of_packages'],
                    goods_gross_weight_kg=form.cleaned_data['goods_gross_weight_kg'],
                    goods_cbm=form.cleaned_data['goods_cbm'],

                    issue_city_id=form.cleaned_data['issue_city_id'],
                    issue_date=form.cleaned_data['issue_date'],
                    entry_by=request.user
                )

            SeaExportMBLToHBLMap.objects.filter(mbl=mbl).delete()
            for hblform in form.hbl_valid_form_list:  # type: HBLIDFormForMBLMapping
                SeaExportMBLToHBLMap.objects.get_or_create(mbl=mbl, hbl_id=hblform.id, entry_by=request.user)

            resp['success'] = True
            resp['msg'].append('Save Success')
            resp['data']['mbl_public_id'] = mbl.public_id
    else:
        resp['success'] = False
        resp['form_errors'] = form.errors
        resp['errors'] = form.non_field_errors()
        resp['hbl_error_list'] = form.hbl_error_list

    return JsonResponse(resp)


@login_required
@forwarder_required
def shipment_advice_listing_page(request):
    data = {
    }
    return render(request, 'intuit/seaexport/forwarder/shipment_advice_listing_page.html', data)


@login_required
@forwarder_required
def container_consolidation_listing_page(request):
    data = {
    }
    return render(request, 'intuit/seaexport/forwarder/container_consol_listing_page.html', data)


@login_required
@forwarder_required
def get_container_consol_list(request):
    from freightman.forms import PaginationForm
    from seaexport.dictbuilder.container_consol import container_consol_dict
    import math

    form = PaginationForm(request.GET)
    form.is_valid()
    page = form.cleaned_data.get('page', None) or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    total_entry = SeaExportContainerConsolShipment.objects.all().count()
    number_of_page = math.ceil(total_entry / entry_per_page)
    resp = {
        'success': True,
        'data': {
            'container_consolidation_list': [container_consol_dict(request, cons) for cons in SeaExportContainerConsolShipment.objects.all().order_by('-id')[
                                                                                              entry_start:entry_end]],
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
        }
    }
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_container_consol_shipment_info(request):
    from seaexport.dictbuilder.container_consol import container_consol_dict
    resp = {
        'success': False,
        'errors': [],
        'data': {
            'container_consol_shipment_info_dict': None
        }
    }
    form = PublicIDForm(request.GET)
    if form.is_valid():
        consol = SeaExportContainerConsolShipment.objects.get(id=form.id)
        resp['success'] = True
        resp['data']['container_consol_shipment_info_dict'] = container_consol_dict(request, consol)
    else:
        resp['success'] = False
        resp['errors'] = form.non_field_errors() + [form.errors.as_json()]
    return JsonResponse(resp)


@login_required
@forwarder_required
def view_container_consol_shipment_advice_page(request, consol_shipment_public_id: str):
    data = {
        'container_consol_public_id': consol_shipment_public_id
    }
    return render(request, 'intuit/seaexport/forwarder/container_consolidation_shipment_advice.html', data)


@login_required
@forwarder_required
def container_consol_shipment_advice_csv(request, public_id: str):
    from seaexport.dictbuilder.container_consol import container_consol_dict
    consol = SeaExportContainerConsolShipment.objects.get(id=type_1_public_id_to_model_id(public_id))
    consol_dict = container_consol_dict(request, consol)


@login_required
@forwarder_required
def container_consolidation_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/container_consolidation_page.html', data)


@login_required
@forwarder_required
def container_consolidation_page_init_data(request):
    from freightman.forms import SupplierPublicIDForm
    form = SupplierPublicIDForm(request.GET)
    form.is_valid()
    resp = {
        'success': True,
        'errors': [],
        'data': {
            'supplier_list': [org_dict_for_edit_form(org) for org in Organization.objects.filter(is_supplier=True)],
            'shipper_addressbook_list': [addressbook_dict(addr) for addr in AddressBook.objects.filter(organization_id=form.id, is_shipper=True)],
            'consignee_addressbook_list': [addressbook_dict(addr) for addr in AddressBook.objects.filter(organization_id=form.id, is_consignee=True)],
            'city_list': [city_dict(ct) for ct in City.objects.all().order_by('-id')],
            'country_list': [country_dict(country) for country in Country.objects.all().order_by('-id')],
            'seaport_list': [seaport_dict(sp) for sp in SeaPort.objects.all().order_by('-id')],
            'unassigned_hbl_list': [hbl_dict(request, hbl) for hbl in
                                    SeaExportHBL.objects.exclude(id__in=
                                                                 [m.hbl.id for m in SeaExportMBLToHBLMap.objects.all()] +
                                                                 [info.hbl_id for info in SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.all()]
                                                                 )
                                        .order_by('-id')],
            'container_type_list': [container_dict(c) for c in ContainerType.objects.all().order_by('-id')]
        }
    }
    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def container_consolidation_save(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': {},
        'container_error_list': [],
        'data': {
            'consol_public_id': ''
        }
    }
    forwarder = user_org(request.user.id)
    form = ContainerConsolForm(request.POST)
    if form.is_valid():
        shipper, _shaddrcr = AddressBook.objects.get_or_create(
            organization=forwarder,
            company_name=form.cleaned_data['shipper_company_name'],
            address=form.cleaned_data['shipper_address'],
            postcode=form.cleaned_data['shipper_postcode'],
            city_id=form.cleaned_data['shipper_city'],
            state=form.cleaned_data['shipper_state'],
            country_id=form.cleaned_data['shipper_country'],
            contact=form.cleaned_data['shipper_contact'],
            phone=form.cleaned_data['shipper_tel_num'],
            mobile=form.cleaned_data['shipper_mobile_num'],
            fax=form.cleaned_data['shipper_fax_num'],
            email=form.cleaned_data['shipper_email'],
            is_shipper=True
        )
        consignee, _consaddrcr = AddressBook.objects.get_or_create(
            organization=forwarder,
            company_name=form.cleaned_data['consignee_company_name'],
            address=form.cleaned_data['consignee_address'],
            postcode=form.cleaned_data['consignee_postcode'],
            city_id=form.cleaned_data['consignee_city'],
            state=form.cleaned_data['consignee_state'],
            country_id=form.cleaned_data['consignee_country'],
            contact=form.cleaned_data['consignee_contact'],
            phone=form.cleaned_data['consignee_tel_num'],
            mobile=form.cleaned_data['consignee_mobile_num'],
            fax=form.cleaned_data['consignee_fax_num'],
            email=form.cleaned_data['consignee_email'],
            is_consignee=True
        )
        if form.id:  # update
            consol = SeaExportContainerConsolShipment.objects.get(id=form.id)
            consol.mbl_number = form.cleaned_data['mbl_number']
            consol.supplier_id = type_1_public_id_to_model_id(form.cleaned_data['supplier_public_id'])

            consol.shipper_addressbook = shipper
            consol.consignee_addressbook = consignee

            consol.feeder_vessel_name = form.cleaned_data['feeder_vessel_name']
            consol.feeder_vessel_voyage_number = form.cleaned_data['feeder_vessel_voyage_number']
            consol.feeder_departure_city_id = form.cleaned_data['feeder_departure_city_id']
            consol.feeder_arrival_city_id = form.cleaned_data['feeder_arrival_city_id']
            consol.feeder_etd = form.cleaned_data['feeder_etd']
            consol.feeder_eta = form.cleaned_data['feeder_eta']

            consol.mother_vessel_name = form.cleaned_data['mother_vessel_name']
            consol.mother_vessel_voyage_number = form.cleaned_data['mother_vessel_voyage_number']
            consol.mother_departure_city_id = form.cleaned_data['mother_departure_city_id']
            consol.mother_arrival_city_id = form.cleaned_data['mother_arrival_city_id']
            consol.mother_etd = form.cleaned_data['mother_etd']
            consol.mother_eta = form.cleaned_data['mother_eta']

            consol.city_of_receipt_id = form.cleaned_data['city_id_of_receipt']
            consol.port_of_loading_id = form.cleaned_data['port_id_of_loading']
            consol.port_of_discharge_id = form.cleaned_data['port_id_of_discharge']
            consol.city_of_final_destination_id = form.cleaned_data['city_id_of_final_destination']

            consol.save()

            for m in SeaExportContainerConsolShipmentToAllocatedContainerMap.objects.filter(container_consol_shipment=consol):
                SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(shipment_to_container_map=m).delete()
                m.allocated_container.delete()
                m.delete()
        else:  # create
            consol = SeaExportContainerConsolShipment.objects.create(
                forwarder=forwarder,
                mbl_number=form.cleaned_data['mbl_number'],
                supplier_id=type_1_public_id_to_model_id(form.cleaned_data['supplier_public_id']),

                shipper_addressbook=shipper,
                consignee_addressbook=consignee,

                feeder_vessel_name=form.cleaned_data['feeder_vessel_name'],
                feeder_vessel_voyage_number=form.cleaned_data['feeder_vessel_voyage_number'],
                feeder_departure_city_id=form.cleaned_data['feeder_departure_city_id'],
                feeder_arrival_city_id=form.cleaned_data['feeder_arrival_city_id'],
                feeder_etd=form.cleaned_data['feeder_etd'],
                feeder_eta=form.cleaned_data['feeder_eta'],

                mother_vessel_name=form.cleaned_data['mother_vessel_name'],
                mother_vessel_voyage_number=form.cleaned_data['mother_vessel_voyage_number'],
                mother_departure_city_id=form.cleaned_data['mother_departure_city_id'],
                mother_arrival_city_id=form.cleaned_data['mother_arrival_city_id'],
                mother_etd=form.cleaned_data['mother_etd'],
                mother_eta=form.cleaned_data['mother_eta'],

                city_of_receipt_id=form.cleaned_data['city_id_of_receipt'],
                port_of_loading_id=form.cleaned_data['port_id_of_loading'],
                port_of_discharge_id=form.cleaned_data['port_id_of_discharge'],
                city_of_final_destination_id=form.cleaned_data['city_id_of_final_destination'],

                entry_by=request.user
            )

        for container_form in form.container_valid_form_list:  # type:ConsolContainerForm
            alloc, _contcr = AllocatedOceanContainer.objects.get_or_create(
                container_type_id=container_form.cleaned_data['container_type_id'],
                container_number=container_form.cleaned_data['container_number'],
                container_serial=container_form.cleaned_data['container_serial']
            )
            alloc.fcl_or_lcl = container_form.cleaned_data['fcl_or_lcl']
            alloc.save()

            m, _mcr = SeaExportContainerConsolShipmentToAllocatedContainerMap.objects.get_or_create(container_consol_shipment=consol, allocated_container=alloc)
            for hbl_id in container_form.hbl_id_list:
                SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.get_or_create(shipment_to_container_map=m, hbl_id=hbl_id)

        resp['success'] = True
        resp['msg'].append('Success')
        resp['data']['consol_public_id'] = consol.public_id

    else:
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
        resp['container_error_list'] = form.container_error_list
    return JsonResponse(resp)


@login_required
@forwarder_required
def hbl_consolidation_report_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/hbl_consolidation_report_page.html', data)


@login_required
@forwarder_required
def mbl_consolidation_report_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/mbl_consolidation_report_page.html', data)


@login_required
@forwarder_required
def container_consolidation_report_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/container_consolidation_report_page.html', data)


@login_required
@forwarder_required
def buyers_consolidation_report_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/buyers_consolidation_report_page.html', data)


@login_required
@forwarder_required
def consolidation_job_costing_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/job_costing_page.html', data)


@login_required
@forwarder_required
def invoice_create_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/invoice_page.html', data)


@login_required
@forwarder_required
def gp_listing_page(request):
    data = {

    }
    return render(request, 'intuit/seaexport/forwarder/gp_listing_page.html', data)
