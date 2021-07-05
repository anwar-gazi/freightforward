from freightman.models import Currency, CurrencyConversion
from .currency_converter_helper import int_to_words
from datetime import datetime, timedelta
import pytz


def get_default_currency():
    return Currency.objects.get(default=True)


def get_usd_currency():
    return Currency.objects.filter(code__icontains='usd').first()


def format_to_indian_spelling(amount: int):
    return int_to_words(amount)


def get_gp_listing_output_currency():
    return Currency.objects.get(code__icontains='bdt')


def get_invoice_output_currency():
    return Currency.objects.get(code__icontains='bdt')


def currency_conversion_get_or_create(from_currency_id: int, to_currency_id: int, rate: float, created_by_user_id: int):
    q = CurrencyConversion.objects.filter(from_currency_id=from_currency_id, to_currency_id=to_currency_id, conversion_rate=rate,
                                          created_at__gte=datetime.now(pytz.utc) - timedelta(days=30))
    if q.exists():
        return q.first(), False
    else:
        return CurrencyConversion.objects.create(from_currency_id=from_currency_id, to_currency_id=to_currency_id, conversion_rate=rate, created_by_id=created_by_user_id), True
