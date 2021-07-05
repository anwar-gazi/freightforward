from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from freightman.forms import PublicIDForm, DebitNoteForm, DebitNoteChargeForm
from freightman.public_id_helpers import type_1_public_id_to_model_id
from freightman.models import MAWB, Currency, ChargeType, AirExportConsolidatedShipmentDebitNote, AirExportDebitNoteCosting
from freightman.dictbuilders.debitcreditnote import mawb_dict, currency_dict, charge_type_dict, debitnote_dict
from freightman.user_helpers import user_org
from freightman.currency_helpers import currency_conversion_get_or_create
from freightman.exceptions import CustomException
from django.db import transaction


@login_required
def debit_note_listing(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/debitnote_listing_page.html', data)


@login_required
def ajax_get_debitnote_list(request):
    resp = {
        'success': True,
        'data': {
            'debitnote_list': []
        }
    }

    resp['data']['debitnote_list'] = [debitnote_dict(request, debitnote) for debitnote in AirExportConsolidatedShipmentDebitNote.objects.all().order_by('-id')]

    return JsonResponse(resp)


@login_required
def debit_note_page(request):
    data = {
        'is_debit': True
    }
    return render(request, 'intuit/fm/forwarder/debit_note_page.html', data)


@login_required
def view_debit_note(request, debitnote_public_id: str):
    id = type_1_public_id_to_model_id(debitnote_public_id)
    data = {
        'view_debit_note': True,
        'debitnote_public_id': debitnote_public_id
    }
    return render(request, 'intuit/fm/forwarder/debit_note_page.html', data)


@login_required
def get_debitnote_info(request):
    resp = {
        'success': False,
        'errors': [],
        'data': {
            'debitnote_dict': {}
        }
    }
    form = PublicIDForm(request.GET)
    if form.is_valid():
        id = type_1_public_id_to_model_id(form.cleaned_data['public_id'])

        d_q = AirExportConsolidatedShipmentDebitNote.objects.filter(id=id)
        if d_q.exists():
            resp['data']['debitnote_dict'] = debitnote_dict(request, d_q.first())
            resp['success'] = True
        else:
            resp['success'] = False
            resp['errors'].append(['Debit Note does not exist'])
    else:
        resp['errors'] = form.non_field_errors() + ['public_id: ' + form.errors['public_id']]
        resp['success'] = False

    return JsonResponse(resp)


@login_required
def debit_note_page_init_data(request):
    resp = {
        'data': {
            'mawb_list': [mawb_dict(request, mawb) for mawb in MAWB.objects.all().order_by('-id')],
            'currency_list': [currency_dict(curr) for curr in Currency.objects.all().order_by('id')],
            'charge_type_list': [charge_type_dict(ct) for ct in ChargeType.objects.all().order_by('id')],
        }
    }
    return JsonResponse(resp)


@login_required
def get_mawb_info(request):
    resp = {
        'success': False,
        'errors': [],
        'data': {
            'mawb_dict': ''
        }
    }
    form = PublicIDForm(request.GET)
    if form.is_valid():
        mawb_q = MAWB.objects.filter(id=form.id)
        if mawb_q.exists():
            resp['data']['mawb_dict'] = mawb_dict(request, MAWB.objects.get(id=form.id))
            resp['success'] = True
        else:
            resp['success'] = False
            resp['errors'].append(['No MAWB found'])
    else:
        resp['errors'] = form.non_field_errors() + [form.errors['public_id']]
        resp['success'] = False

    return JsonResponse(resp)


@login_required
@csrf_exempt
def debit_note_save(request):
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
    form = DebitNoteForm(request.POST)
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

                # debitnote entry
                if form.debitnote_id:
                    debitnote = AirExportConsolidatedShipmentDebitNote.objects.get(id=form.debitnote_id)
                    debitnote.target_currency_conversion = cc
                    debitnote.date = form.cleaned_data['date']
                    debitnote.save()
                else:  # create
                    debitnote = AirExportConsolidatedShipmentDebitNote.objects.create(
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
                    AirExportDebitNoteCosting.objects.filter(debit_note=debitnote).delete()
                    for chargeform in charges_form_list:  # type: DebitNoteChargeForm
                        job_costing = AirExportDebitNoteCosting.objects.create(
                            debit_note=debitnote,
                            currency_id=form.cleaned_data['currency_id'],
                            charge_type_id=chargeform.cleaned_data['charge_type_id'],
                            value=chargeform.cleaned_data['fixed_or_unit_amount'],
                            is_unit_cost=chargeform.cleaned_data['is_unit_cost'],
                            entry_by=request.user
                        )
                resp['success'] = True
                resp['msg'].append('Debit note saved')
                resp['data']['public_id'] = debitnote.public_id
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
