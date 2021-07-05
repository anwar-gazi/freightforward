from django import forms


class CurrencyConversionForm(forms.Form):
    id = forms.IntegerField(required=False)
    from_currency = forms.IntegerField()
    to_currency = forms.IntegerField()
    conversion_factor = forms.FloatField()
