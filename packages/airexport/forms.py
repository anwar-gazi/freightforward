from django import forms
from freightman.forms import debitnote_to_who_validator, html_datefield_format_py
from freightman.validators import validate_json_string
from freightman.public_id_helpers import type_1_public_id_to_model_id
import json
from freightman.forms import DebitNoteChargeForm


class CreditNoteForm(forms.Form):
    creditnote_public_id = forms.CharField(required=False)
    consolidation_public_id = forms.CharField()
    to_who = forms.CharField(validators=[debitnote_to_who_validator])
    to_hawb_public_id_if_applies = forms.CharField(required=False)
    date = forms.DateField(input_formats=[html_datefield_format_py])

    currency_id = forms.IntegerField()

    display_currency_conversion_from_currency_id = forms.IntegerField(required=False)
    display_currency_conversion_to_currency_id = forms.IntegerField(required=False)
    display_currency_conversion_rate = forms.FloatField(required=False)

    charges_list = forms.CharField(validators=[validate_json_string])

    #
    creditnote_id = None
    consolidation_id = None
    charge_applies_to_hawb = False
    hawb_id = None  # will be set in the clean method

    def clean(self):
        cleaned_data = super(CreditNoteForm, self).clean()
        if cleaned_data['to_who'] in ['house_supplier', 'house_shipper'] and not cleaned_data['to_hawb_public_id_if_applies']:
            raise forms.ValidationError('HAWB not selected but charge type is related to house', code='invalid')
        if cleaned_data['display_currency_conversion_to_currency_id'] or cleaned_data['display_currency_conversion_rate']:
            if not (cleaned_data['display_currency_conversion_from_currency_id'] and cleaned_data['display_currency_conversion_to_currency_id'] and cleaned_data[
                'display_currency_conversion_rate']):
                raise forms.ValidationError('Currency conversion data incomplete', code='invalid')
        if cleaned_data['to_who'] not in ['house_supplier', 'house_shipper']:
            cleaned_data['to_hawb_public_id_if_applies'] = ''
        else:
            self.charge_applies_to_hawb = True
            self.hawb_id = type_1_public_id_to_model_id(cleaned_data['to_hawb_public_id_if_applies'])

        self.consolidation_id = type_1_public_id_to_model_id(cleaned_data['consolidation_public_id'])
        self.creditnote_id = type_1_public_id_to_model_id(cleaned_data['creditnote_public_id']) if cleaned_data['creditnote_public_id'] else None

        return cleaned_data

    def validated_charges_form_list(self):
        valid_form_list = []
        has_error = False
        charge_form_error_list = []
        for chargeinfo in json.loads(self.cleaned_data['charges_list']):
            form = DebitNoteChargeForm(chargeinfo)
            if form.is_valid():
                valid_form_list.append(form)
            else:
                has_error = True
                charge_form_error_list.append({
                    'list_index': form.cleaned_data['list_index'],
                    'errors': form.non_field_errors(),
                    'form_errors': form.errors
                })
        return valid_form_list, has_error, charge_form_error_list
