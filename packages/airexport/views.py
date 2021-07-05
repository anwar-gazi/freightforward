from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from freightman.models import AirExportConsolidatedShipmentCreditNote, AirExportCreditNoteCosting, MAWB, Organization, HAWB
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from freightman.user_helpers import user_org
from airexport.forms import CreditNoteForm, DebitNoteChargeForm
from django.db import transaction
from freightman.currency_helpers import currency_conversion_get_or_create
from freightman.exceptions import CustomException
from freightman.public_id_helpers import type_1_public_id_to_model_id, type_1_public_id_to_model_id_exceptionfree
from freightman.dictbuilders.debitcreditnote import creditnote_dict
from freightman.dictbuilders.mawb_listing import mawb_dict_for_mawb_listing_page
from freightman.dictbuilders.hawb_listing import hawb_dict_for_hawb_listing_page
from freightman.forms import PublicIDForm
from freightman.dict_builders_hawb import hawb_dict_for_frontend
from airexport.dictbuilder.mawb import mawb_dict_for_frontend


# Create your views here.

@login_required
@forwarder_required
def get_cargo_manifest_list(request):
    import math
    from freightman.forms import PaginationForm

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    needle = paginationform.cleaned_data.get('needle', None)
    q_key_dict = {}
    if needle:
        mawb_id, has_id = type_1_public_id_to_model_id_exceptionfree(needle)
        if has_id:
            q_key_dict = {
                'id': mawb_id
            }
        else:
            supplier_q = Organization.objects.filter(title__icontains=needle.lower(), is_supplier=True)
            if supplier_q.exists():
                q_key_dict = {
                    'org__title__icontains': needle.lower()
                }

    query = MAWB.objects.filter(**q_key_dict).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for mawb in query[entry_start:entry_end]:
        listing.append(mawb_dict_for_mawb_listing_page(mawb))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'mawb_list': listing,
        }
    })


@login_required
@forwarder_required
def cargo_manifest_listing(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/cargo_manifest_listing_page.html')


@login_required
def credit_note_page(request):
    return render(request, 'intuit/fm/forwarder/credit_note_page.html', {})


@login_required
def credit_note_listing(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/creditnote_listing_page.html', data)


@login_required
def ajax_get_creditnote_list(request):
    resp = {
        'success': True,
        'data': {
            'creditnote_list': []
        }
    }

    resp['data']['creditnote_list'] = [creditnote_dict(request, creditnote) for creditnote in AirExportConsolidatedShipmentCreditNote.objects.all().order_by('-id')]

    return JsonResponse(resp)


@login_required
def get_creditnote_info(request):
    resp = {
        'success': False,
        'errors': [],
        'data': {
            'creditnote_dict': {}
        }
    }
    form = PublicIDForm(request.GET)
    if form.is_valid():
        id = type_1_public_id_to_model_id(form.cleaned_data['public_id'])

        d_q = AirExportConsolidatedShipmentCreditNote.objects.filter(id=id)
        if d_q.exists():
            resp['data']['creditnote_dict'] = creditnote_dict(request, d_q.first())
            resp['success'] = True
        else:
            resp['success'] = False
            resp['errors'].append(['Credit Note does not exist'])
    else:
        resp['errors'] = form.non_field_errors() + ['public_id: ' + form.errors['public_id']]
        resp['success'] = False

    return JsonResponse(resp)


@login_required
@csrf_exempt
def credit_note_save(request):
    forwarder = user_org(request.user.id)
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': {},
        'charge_error_list': [],
        'data': {
            'public_id': ''
        }
    }
    form = CreditNoteForm(request.POST)
    if form.is_valid():
        try:
            with transaction.atomic():
                # process currency conversion
                if form.cleaned_data['display_currency_conversion_from_currency_id'] and form.cleaned_data['display_currency_conversion_to_currency_id'] and form.cleaned_data[
                    'display_currency_conversion_rate']:
                    cc, _ccr = currency_conversion_get_or_create(from_currency_id=form.cleaned_data['display_currency_conversion_from_currency_id'],
                                                                 to_currency_id=form.cleaned_data['display_currency_conversion_to_currency_id'],
                                                                 rate=form.cleaned_data['display_currency_conversion_rate'],
                                                                 created_by_user_id=request.user.id)
                else:
                    cc = None

                # creditnote entry
                if form.creditnote_id:
                    creditnote = AirExportConsolidatedShipmentCreditNote.objects.get(id=form.creditnote_id)
                    creditnote.target_currency_conversion = cc
                    creditnote.date = form.cleaned_data['date']
                    creditnote.save()
                else:  # create
                    creditnote = AirExportConsolidatedShipmentCreditNote.objects.create(
                        forwarder=forwarder,
                        consolidated_shipment_id=form.consolidation_id,
                        to_who=form.cleaned_data['to_who'],
                        hawb_id=form.hawb_id,
                        date=form.cleaned_data['date'],
                        currency_id=form.cleaned_data['currency_id'],
                        target_currency_conversion=cc,
                        entry_by=request.user,
                    )

                # process charges
                charges_form_list, charges_has_error, charges_error_list = form.validated_charges_form_list()
                if charges_has_error:
                    resp['charge_error_list'] = charges_error_list
                    raise CustomException('Charges invalid')
                else:
                    # purge old charges first
                    AirExportCreditNoteCosting.objects.filter(credit_note=creditnote).delete()
                    for chargeform in charges_form_list:  # type: DebitNoteChargeForm
                        job_costing = AirExportCreditNoteCosting.objects.create(
                            credit_note=creditnote,
                            currency_id=form.cleaned_data['currency_id'],
                            charge_type_id=chargeform.cleaned_data['charge_type_id'],
                            value=chargeform.cleaned_data['fixed_or_unit_amount'],
                            is_unit_cost=chargeform.cleaned_data['is_unit_cost'],
                            entry_by=request.user
                        )
                resp['success'] = True
                resp['msg'].append('credit note saved')
                resp['data']['public_id'] = creditnote.public_id
        except CustomException:
            raise CustomException
            resp['success'] = False
            resp['msg'] = []
            resp['data']['public_id'] = ''
    else:
        resp['success'] = False
        resp['errors'] += form.non_field_errors()
        resp['form_errors'] = form.errors

    return JsonResponse(resp)


@login_required
@forwarder_required
def view_credit_note(request, public_id: str):
    data = {
        'view_credit_note': True,
        'public_id': public_id
    }
    return render(request, 'intuit/fm/forwarder/credit_note_page.html', data)


@login_required
@forwarder_required
def hawb_listing(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/hawb_listing.html', data)


@login_required
@forwarder_required
def hawb_edit_page(request, hawb_public_id: str):
    data = {
        'hawb_public_id': hawb_public_id
    }
    return render(request, 'intuit/fm/forwarder/hawb_edit.html', data)


@login_required
@forwarder_required
def hawb_copy_page(request, hawb_public_id: str):
    data = {
        'hawb_public_id': hawb_public_id,
        'copy': True
    }
    return render(request, 'intuit/fm/forwarder/hawb_edit.html', data)


@login_required
@forwarder_required
def delete_hawb(request, hawb_public_id: str):
    resp = {
        'success': False
    }
    hawb = HAWB.objects.get(id=type_1_public_id_to_model_id(hawb_public_id))
    hawb.delete()
    resp['success'] = True
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_hawb_data(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {
            'hawb_info': {}
        }
    }
    form = PublicIDForm(request.GET)
    form.is_valid()
    hawb = HAWB.objects.get(id=form.id)
    resp['success'] = True
    resp['data']['hawb_info'] = hawb_dict_for_frontend(request, hawb.id)
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_mawb_data(request):
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {
            'mawb_info': {}
        }
    }
    form = PublicIDForm(request.GET)
    form.is_valid()
    mawb = MAWB.objects.get(id=form.id)
    resp['success'] = True
    resp['data']['mawb_info'] = mawb_dict_for_frontend(request, mawb)
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_job_dates(request):
    from django.conf import settings
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
    hawb = HAWB.objects.get(id=form.id)
    resp['data']['received_at_estimated'] = hawb.received_at_estimated.strftime('%Y-%m-%d') if hawb.received_at_estimated else ''
    resp['data']['received_at_actual'] = hawb.received_at_actual.strftime('%Y-%m-%d') if hawb.received_at_actual else ''
    return JsonResponse(resp)


@login_required
@forwarder_required
def update_job_dates(request):
    from freightman.forms import JobDatesForm
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'data': {}
    }
    user = user_org(request.user.id)
    form = JobDatesForm(request.GET)
    form.is_valid()
    hawb = HAWB.objects.get(id=form.id)
    if form.cleaned_data['received_estimated']:
        hawb.received_at_estimated = form.cleaned_data['received_estimated']
        hawb.received_by_id = request.user.id
    if form.cleaned_data['received_actual']:
        hawb.received_at_actual = form.cleaned_data['received_actual']
        hawb.received_by_id = request.user.id
    hawb.save()
    resp['success'] = True
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_hawb_list(request):
    import math
    from freightman.forms import PaginationForm

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    needle = paginationform.cleaned_data.get('needle', None)
    q_key_dict = {}
    if needle:
        hawb_id, has_id = type_1_public_id_to_model_id_exceptionfree(needle)
        if has_id:
            q_key_dict = {
                'id': hawb_id
            }
        else:
            supplier_q = Organization.objects.filter(title__icontains=needle.lower(), is_supplier=True)
            if supplier_q.exists():
                q_key_dict = {
                    'org__title__icontains': needle.lower()
                }

    query = HAWB.objects.filter(**q_key_dict).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for hawb in query[entry_start:entry_end]:
        listing.append(hawb_dict_for_hawb_listing_page(hawb))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'hawb_list': listing,
        }
    })


@login_required
@forwarder_required
def hawb_print_preview_page_by_forwarder(request, hawb_public_id: str):
    from freightman.hawb_helpers import hawb_globalid_to_model_id
    from django.shortcuts import get_object_or_404

    id = hawb_globalid_to_model_id(hawb_public_id)
    hawb = get_object_or_404(HAWB, pk=id)
    data = {
        'hawb': hawb,
        'dummy': False
    }
    return render(request, 'intuit/fm/forwarder/HAWB_A4.html', data)


@login_required
@forwarder_required
def hawb_dummy_print_preview_page_by_forwarder(request, hawb_public_id: str):
    from freightman.hawb_helpers import hawb_globalid_to_model_id
    from django.shortcuts import get_object_or_404

    id = hawb_globalid_to_model_id(hawb_public_id)
    hawb = get_object_or_404(HAWB, pk=id)
    data = {
        'hawb': hawb,
        'dummy': True
    }
    return render(request, 'intuit/fm/forwarder/HAWB_A4.html', data)
