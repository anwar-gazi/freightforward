from django.shortcuts import render, redirect, reverse, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required, user_passes_test
from freightman.user_test import can_create_supplier
from .models import SystemUser, TimeZone, Organization, UserOrganizationMap, HAWB, MAWB, Bank, FreightBooking, \
    AirExportConsolHouseMap, \
    AirExportConsolidatedShipmentJobCosting, AddressBook, Country
from .forms import UserForm, SuperselectSearchForm, SupereditForm, AjaxRequestForm
from math import ceil
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.shortcuts import get_object_or_404
import json
from freightman.decorators import forwarder_required, shipper_or_factory_required, forwarder_admin_required
from .public_id_helpers import type_1_public_id_to_model_id
from django.db.models import Sum
from datetime import datetime
from django.db.models import Count


@login_required
def under_construction(request, *args, **kwargs):
    data = {}
    return render(request, 'default/fm/working_on.html', data)


@login_required
def landing(request):
    from freightman.user_test import is_superuser, can_do_airexport_frt_booking, can_do_seaexport_frt_booking, \
        can_do_seaimport_frt_booking
    orgmap = UserOrganizationMap.objects.filter(user=request.user)
    if orgmap.exists():
        if orgmap.first().organization.is_shipper:
            return redirect('shipper-home')
        elif orgmap.first().organization.is_forwarder:
            if is_superuser(request.user):
                return redirect('booking_list_registered')
            if can_do_airexport_frt_booking(request.user):
                return redirect('booking_list_registered')
            if can_do_seaexport_frt_booking(request.user):
                return redirect('seaexport:seaexport_forwarder_freight_bookinglist_page')
            if can_do_seaimport_frt_booking(request.user):
                return redirect('seaimport:sea_import_admin_dashboard')
        else:
            return HttpResponseForbidden('User mapped org not recognized')
    else:
        return HttpResponseForbidden('User not mapped to org')


@login_required
def homepage(request):
    if UserOrganizationMap.objects.filter(user=request.user).exists() and UserOrganizationMap.objects.get(
            user=request.user).organization.is_shipper:
        return redirect('shipper-home')
    else:
        data = {}
        return redirect('forwarder_grid_menu_home')
        # return render(request, 'intuit/fm/dashboard.html', data)
        # return redirect('booking_list_registered')


@login_required
def commerical_invoice(request):
    data = {}
    return render(request, 'intuit/fm/commercial_invoice .html', data)


@login_required
def booking(request):
    data = {}
    return render(request, 'default/fm/working_on.html', data)


@login_required
def hawb(request):
    data = {}
    return render(request, 'intuit/fm/hawb.html', data)


@login_required
def hawb2(request):
    data = {}
    return render(request, 'intuit/fm/hawb2.html', data)


@login_required
def mawb(request):
    data = {}
    return render(request, 'intuit/fm/mawb.html', data)


@login_required
@forwarder_required
@user_passes_test(can_create_supplier)
def add_factory_page(request):
    data = {}
    return render(request, 'intuit/fm/factory_add.html', data)


@login_required
@forwarder_required
@user_passes_test(can_create_supplier)
def view_company_info(request, public_id: str):
    data = {
        'public_id': public_id
    }
    return render(request, 'intuit/fm/factory_add.html', data)


@login_required
@forwarder_required
def list_shippers(request):
    data = {}
    return render(request, 'intuit/fm/shippers_listing_page.html', data)


@login_required
@forwarder_required
def booking_list_by_forwarder(request):
    data = {}
    return render(request, 'intuit/fm/booking_list.html', data)


@login_required
@shipper_or_factory_required
def booking_list_by_shipper(request):
    data = {}
    return render(request, 'intuit/fm/shipper/booking_list.html', data)


@login_required
@forwarder_required
def booking_list_by_system_owner(request, type: str):
    data = {
        'type': type,
        'page_title': '{} bookings'.format(type[0].upper() + type[1:])
    }
    return render(request, 'intuit/fm/booking_list.html', data)


@login_required
@forwarder_required
def booking_invoice(request, booking_public_id):
    from .models import AirExportConsolidatedShipment, FreightBookingGoodsInfo, CurrencyConversion
    from .currency_helpers import format_to_indian_spelling, get_invoice_output_currency, get_default_currency

    booking_model_id = type_1_public_id_to_model_id(booking_public_id)

    booking = FreightBooking.objects.get(pk=booking_model_id)

    total_unit_cost = 0
    total_unit_cost_converted = 0
    total = 0
    total_converted = 0

    factory = booking.org

    default_currency = get_default_currency()
    converted_currency = get_invoice_output_currency()

    unit_costs = []
    fixed_costs = []

    consolidated_shipment = None
    hawb = None
    mawb = None

    for consolshpt in AirExportConsolidatedShipment.objects.all():
        for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment=consolshpt):
            if m.hawb.booking == booking:
                consolidated_shipment = consolshpt
                hawb = m.hawb
                mawb = consolidated_shipment.mawb
                break

    for costing in AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=consolidated_shipment):
        if costing.is_shipment_cost:  # expenditure
            if costing.charge_applies_to_hawb:
                if costing.for_specific_hawb:
                    if costing.hawb == hawb:
                        if costing.is_unit_cost:
                            unit_costs.append({
                                'reference': factory.title,
                                'description': costing.charge_type.name,
                                'qty_kg': costing.hawb.goods_chargableweight,
                                'unit_price': costing.value,
                                'discount': 0,
                                'total': costing.hawb.goods_chargableweight * costing.value,
                                'total_converted': costing.value_in_currency(
                                    converted_currency.id) * costing.hawb.goods_chargableweight,
                            })
                        else:
                            fixed_costs.append({
                                'description': costing.charge_type.name,
                                'total': costing.value,
                                'total_converted': costing.value_in_currency(converted_currency.id),
                            })
                else:  # per hawb
                    if costing.is_unit_cost:
                        unit_costs.append({
                            'reference': factory.title,
                            'description': costing.charge_type.name,
                            'qty_kg': costing.hawb.goods_chargableweight,
                            'unit_price': costing.value,
                            'discount': 0,
                            'total': costing.hawb.goods_chargableweight * costing.value,
                            'total_converted': costing.hawb.goods_chargableweight * costing.value_in_currency(
                                converted_currency.id),
                        })
                    else:
                        fixed_costs.append({
                            'description': costing.charge_type.name,
                            'total': costing.value,
                            'total_converted': costing.value_in_currency(converted_currency.id),
                        })

    for unit_cost in unit_costs:
        total_unit_cost += unit_cost['total']
        total_unit_cost_converted += unit_cost['total_converted']

    total += total_unit_cost
    total_converted += total_unit_cost_converted

    for fixed_cost in fixed_costs:
        total += fixed_cost['total']
        total_converted += fixed_cost['total_converted']

    data = {
        'hawb': hawb,
        'mawb_public_id': mawb.public_id,
        'unit_costs': unit_costs,
        'fixed_costs': fixed_costs,
        'total_unit_cost': total_unit_cost,
        'total': total,
        'total_converted': total_converted,
        'total_converted_indian_spelling': total_converted,
        'from_currency_code': default_currency.code,
        'to_currency_code': converted_currency.code,
        'currency_conversion_rate': CurrencyConversion.objects.get(from_currency=default_currency,
                                                                   to_currency=converted_currency).conversion_rate,
    }

    return render(request, 'intuit/fm/forwarder/client_invoice.html', data)


@login_required
def shipment_booking_page_by_forwarder(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/shipment_booking.html', data)


@login_required
def shipment_consol_page_by_forwarder(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/shipment_consol.html', data)


@login_required
@forwarder_required
def mawb_input_page_by_forwarder(request):
    from .forms import MawbForm
    data = {
        'form': MawbForm()
    }
    return render(request, 'intuit/fm/forwarder/mawb_input.html', data)


@login_required
@forwarder_required
def mawb_edit(request):
    from .forms import MawbForm
    data = {
        'form': MawbForm(),
    }
    return render(request, 'intuit/fm/forwarder/mawb_edit.html', data)


@login_required
@forwarder_required
def mawb_print_preview_page_by_forwarder(request, mawb_public_id: str):
    from .mawb_helpers import mawb_public_id_to_mawb_id
    id = mawb_public_id_to_mawb_id(mawb_public_id)
    mawb = MAWB.objects.get(pk=id)
    data = {
        'mawb': mawb
    }
    return render(request, 'intuit/fm/forwarder/mawb.html', data)


@login_required
@forwarder_required
def hawb_print_preview_page_by_forwarder(request, hawb_public_id: str):
    from .hawb_helpers import hawb_globalid_to_model_id
    id = hawb_globalid_to_model_id(hawb_public_id)
    hawb = get_object_or_404(HAWB, pk=id)
    forwarder_address = AddressBook.objects.filter(organization=hawb.forwarder).first()
    print(forwarder_address)
    data = {
        'hawb': hawb,
        'dummy': False,
        'forwarder_address': forwarder_address,
    }
    return render(request, 'intuit/fm/forwarder/HAWB_A4.html', data)


@login_required
@forwarder_required
def hawb_dummy_print_preview_page_by_forwarder(request, hawb_public_id: str):
    from .hawb_helpers import hawb_globalid_to_model_id
    id = hawb_globalid_to_model_id(hawb_public_id)
    hawb = get_object_or_404(HAWB, pk=id)
    data = {
        'hawb': hawb,
        'dummy': True
    }
    return render(request, 'intuit/fm/forwarder/HAWB_A4.html', data)


@login_required
@forwarder_required
def hawb_input_page_by_forwarder(request):
    from .forms import HawbForm
    data = {
        'form': HawbForm()
    }
    return render(request, 'intuit/fm/forwarder/hawb_input.html', data)


@login_required
@forwarder_required
def hawb_edit(request):
    from .forms import HawbForm
    data = {
        'form': HawbForm()
    }
    return render(request, 'intuit/fm/forwarder/hawb_edit.html', data)


@csrf_exempt
@login_required
@forwarder_required
def daily_status_report(request):
    date = None
    if request.method == "POST":
        date = request.POST.get('dsr_date')
        hawb = HAWB.objects.filter(executed_on_date__contains=date)

    if not date:
        date = datetime.today()
        hawb = HAWB.objects.filter(executed_on_date__contains=date)

    data = {
        'hawb': hawb,
        'date': date,
    }
    return render(request, 'intuit/fm/forwarder/reports/dsr.html', data)


@login_required
@forwarder_required
def daily_status_report_print(request, date):
    # date = datetime.date(date)
    hawb = HAWB.objects.filter(executed_on_date__contains=date)
    data = {
        'hawb': hawb,
        'date': date,
    }
    return render(request, 'intuit/fm/forwarder/reports/dsr_print.html', data)


@login_required
@forwarder_required
def weight_lift_by_customer(request):
    shippers = dict([agent.id_and_name() for agent in AddressBook.objects.all()])

    order_by_field = "total_chargableweight"

    if request.GET.get('sort_field'):
        if request.GET.get('sort_order'):
            order_by_field = request.GET.get('sort_order') + request.GET.get('sort_field')
        else:
            order_by_field = request.GET.get('sort_field')

    hawbs = HAWB.objects.all().values('shipper').annotate(
        total_gross_weight=Sum('goods_grossweight'),
        total_chargableweight=Sum('goods_chargableweight'),
        total_shipments=Count('shipper'),
    ).order_by(order_by_field)

    for hawb in hawbs:
        hawb['name'] = shippers[hawb['shipper']]

    report_name = "Weight Lifting Report (Customer)"

    data = {
        'lists': hawbs,
        'order_by_field': request.GET.get('sort_field'),
        'order': request.GET.get('sort_order'),
        'report_name': report_name
    }

    if request.GET.get('print'):
        return render(request, 'intuit/fm/forwarder/reports/weight_lifting_report_print.html', data)

    return render(request, 'intuit/fm/forwarder/reports/weight_lifting.html', data)


@login_required
@forwarder_required
def weight_lift_by_agent(request):
    agents = dict([agent.id_and_name() for agent in AddressBook.objects.all()])

    order_by_field = "total_chargableweight"

    if request.GET.get('sort_field'):
        if request.GET.get('sort_order'):
            order_by_field = request.GET.get('sort_order') + request.GET.get('sort_field')
        else:
            order_by_field = request.GET.get('sort_field')

    mawbs = MAWB.objects.all().values('consignee').annotate(
        total_gross_weight=Sum('goods_grossweight'),
        total_chargableweight=Sum('goods_chargableweight'),
        total_shipments=Count('consignee'),
    ).order_by(order_by_field)

    for mawb in mawbs:
        mawb['name'] = agents[mawb['consignee']]

    report_name = "Weight Lifting Report (Agent)"

    data = {
        'lists': mawbs,
        'order_by_field': request.GET.get('sort_field'),
        'order': request.GET.get('sort_order'),
        'report_name': report_name
    }

    if request.GET.get('print'):
        return render(request, 'intuit/fm/forwarder/reports/weight_lifting_report_print.html', data)

    return render(request, 'intuit/fm/forwarder/reports/weight_lifting.html', data)


@login_required
@forwarder_required
def weight_lift_by_destination(request):
    countries = dict([country.id_and_name() for country in Country.objects.all()])

    order_by_field = "total_chargableweight"

    if request.GET.get('sort_field'):
        if request.GET.get('sort_order'):
            order_by_field = request.GET.get('sort_order') + request.GET.get('sort_field')
        else:
            order_by_field = request.GET.get('sort_field')

    mawbs = MAWB.objects.all().values('consignee__country').annotate(
        total_gross_weight=Sum('goods_grossweight'),
        total_chargableweight=Sum('goods_chargableweight'),
        total_shipments=Count('consignee'),
    ).order_by(order_by_field)

    # print(mawbs)
    for mawb in mawbs:
        mawb['name'] = countries[mawb['consignee__country']]

    report_name = "Weight Lifting Report (Destination)"

    data = {
        'lists': mawbs,
        'order_by_field': request.GET.get('sort_field'),
        'order': request.GET.get('sort_order'),
        'report_name': report_name
    }

    if request.GET.get('print'):
        return render(request, 'intuit/fm/forwarder/reports/weight_lifting_report_print.html', data)

    return render(request, 'intuit/fm/forwarder/reports/weight_lifting.html', data)


from collections import defaultdict


@login_required
@forwarder_required
def customer_gp_listing(request):
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    print(from_date, to_date)
    filtered_hawb = HAWB.objects.filter(entry_at__range=[from_date, to_date])

    hawbs = [hawb for hawb in filtered_hawb if hawb.job_costing_done()]
    hawb_dictionary = defaultdict(dict)

    # Making a dictionary from the list of HAWBs and it's data
    for hawb in hawbs:
        if hawb_dictionary[hawb.shipper.company_name]:
            # if that key already exists, we update those field by add new data
            hawb_dictionary[hawb.shipper.company_name]['total_shipments'] += 1
            hawb_dictionary[hawb.shipper.company_name]['revenue'] += hawb.get_total_debit()
            hawb_dictionary[hawb.shipper.company_name]['cost'] += hawb.total_job_cost()
            hawb_dictionary[hawb.shipper.company_name]['gross_profit'] += (hawb.get_total_debit() - hawb.total_job_cost())
            hawb_dictionary[hawb.shipper.company_name]['chargable_weight'] += hawb.goods_chargableweight
        # If the key does not exist, create new list with expected fields
        else:
            hawb_dictionary[hawb.shipper.company_name] = \
                {
                    'name': hawb.shipper.company_name,
                    'total_shipments': 1,
                    'revenue': hawb.get_total_debit(),
                    'cost': hawb.total_job_cost(),
                    'gross_profit': hawb.get_total_debit() - hawb.total_job_cost(),
                    'chargable_weight': hawb.goods_chargableweight,
                }
    data = {
        'dict': dict(hawb_dictionary),
        'report_name': 'CUSTOMER GP LISTING',
        'from_date': from_date,
        'to_date': to_date,
    }

    print(data)
    if request.GET.get('print'):
        return render(request, 'intuit/fm/forwarder/reports/gp_listing_report_print.html', data)

    return render(request, 'intuit/fm/forwarder/reports/gp_listing.html', data)

# # @login_required
# def testing(request):
#     hawbs = [hawb for hawb in HAWB.objects.all() if hawb.job_costing_done()]
#
#     print(hawbs)
#     # return render(request, 'intuit/fm/forwarder/shipment_booking.html', data)
