from django.http import JsonResponse
from freightman.models import CurrencyConversion, Currency
from django.contrib.auth.decorators import login_required
from django.db import transaction
from .currency_conversion_forms import CurrencyConversionForm
from .dictbuilders_currency import dict_for_currency_conversion_ui, currency_conversion_dict_for_ui
from django.views.decorators.csrf import csrf_exempt


@login_required
def get_currency_list(request):
    conv = CurrencyConversion.objects.all().order_by('id').last()
    resp = {
        'data': {
            'currency_list': [dict_for_currency_conversion_ui(curr) for curr in Currency.objects.all().order_by('id')],
            'conversion_rate_latest': currency_conversion_dict_for_ui(conv) if conv else ''
        }
    }
    return JsonResponse(resp)


@login_required
@csrf_exempt
@transaction.atomic
def save_conversion_rate(request):
    resp = {
        'success': False,
        'data': {
            'id': ''
        }
    }
    form = CurrencyConversionForm(request.POST)
    if form.is_valid():
        if form.cleaned_data['id']:  # update
            conversion = CurrencyConversion.objects.get(id=form.cleaned_data['id'])
            conversion.from_currency_id = form.cleaned_data['from_currency']
            conversion.to_currency_id = form.cleaned_data['to_currency']
            conversion.conversion_rate = form.cleaned_data['conversion_factor']
            conversion.save()
        else:  # create
            conversion = CurrencyConversion.objects.create(
                from_currency_id=form.cleaned_data['from_currency'],
                to_currency_id=form.cleaned_data['to_currency'],
                conversion_rate=form.cleaned_data['conversion_factor'],
                created_by=request.user
            )
        resp['data']['id'] = conversion.id
        resp['success'] = True
    return JsonResponse(resp)
