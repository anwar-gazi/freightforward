from django import forms
from freightman.mawb_helpers import mawb_ref_number_to_awb_serial, mawb_public_id_to_mawb_id
from freightman.hawb_helpers import hawb_public_id_to_model_id
from freightman.consol_helpers import consolidation_job_number_to_model_id
from freightman.models import MAWB, HAWB, AirExportConsolidatedShipmentFlightInfo

html_datefield_format_py = '%Y-%m-%d'


class ConsolidationForm(forms.Form):
    consolidation_job_number = forms.CharField(required=False)
    mawb_public_id = forms.CharField()
    hawb_public_id_comma_separated = forms.CharField()

    @property
    def mawb_object_id(self):
        id = mawb_public_id_to_mawb_id(self.cleaned_data['mawb_public_id'])
        return MAWB.objects.get(id=id).id

    @property
    def hawb_object_id_list(self):
        return [HAWB.objects.get(id=hawb_public_id_to_model_id(hawb_public_id)).id for hawb_public_id in self.cleaned_data['hawb_public_id_comma_separated'].split(',')]

    @property
    def consolidation_model_object_id(self):
        return consolidation_job_number_to_model_id(self.cleaned_data['consolidation_job_number'])


class FlightForm(forms.Form):
    uniqid = forms.CharField()
    airline = forms.IntegerField()
    co_loader = forms.IntegerField()
    awb = forms.IntegerField()
    flight_number = forms.CharField()
    flight_date = forms.DateField(input_formats=[html_datefield_format_py])
    departure_country = forms.IntegerField()
    departure_airport = forms.IntegerField()
    departure_date = forms.DateField(input_formats=[html_datefield_format_py])
    # departure_note = forms.CharField(required=False)
    arrival_country = forms.IntegerField()
    arrival_airport = forms.IntegerField()
    arrival_date = forms.DateField(input_formats=[html_datefield_format_py])
    # arrival_note = forms.CharField(required=False)

    # class Meta:
    #     model = AirExportConsolidatedShipmentFlightInfo
    #     fields = ['airline', 'co_loader', 'awb', 'flight_number', 'flight_date', 'departure_country', 'departure_airport', 'departure_date',
    #               'departure_note', 'arrival_country', 'arrival_airport', 'arrival_date', 'arrival_note']
