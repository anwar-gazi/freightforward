from django import forms
from freightman.public_id_helpers import type_1_public_id_to_model_id
from freightman.models import AirExportConsolidatedShipmentJobCosting


class ConsolidatedShipmentIDForm(forms.Form):
    consolidated_shipment_public_id = forms.CharField()


class JobCostInsertForm(forms.Form):
    uniqid = forms.CharField()  # just an identifier for frontend
    # id = forms.IntegerField(required=False)
    charge_type_id = forms.IntegerField()
    value = forms.FloatField()
    currency_id = forms.IntegerField()
    currency_conversion_rate_id = forms.IntegerField(required=not AirExportConsolidatedShipmentJobCosting._meta.get_field('currency_conversion').blank)
    is_shipment_cost = forms.BooleanField(required=False)
    charge_applies_to_hawb = forms.BooleanField(required=False)
    for_specific_hawb = forms.BooleanField(required=False)
    hawb_public_id = forms.CharField(required=False)
    is_unit_cost = forms.BooleanField(required=False)

    def hawb_model_id(self):
        return type_1_public_id_to_model_id(self.cleaned_data['hawb_public_id']) if self.cleaned_data['hawb_public_id'] else None
