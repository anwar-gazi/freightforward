from freightman.models import Currency, CurrencyConversion


def dict_for_currency_conversion_ui(currency: Currency):
    return {
        'id': currency.id,
        'code': currency.code,
        'currency_name': currency.currency_name,
        'default': currency.default
    }


def currency_conversion_dict_for_ui(currency_conversion: CurrencyConversion):
    return {
        'id': currency_conversion.id,
        'from_currency': currency_conversion.from_currency_id,
        'to_currency': currency_conversion.to_currency_id,
        'conversion_factor': currency_conversion.conversion_rate
    }
