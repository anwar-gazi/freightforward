from django import forms

from freightman.models import AddressBook


class AddressModelForm(forms.ModelForm):
    # organization = forms.IntegerField()

    booking_id = forms.IntegerField()

    booking_notify = forms.BooleanField(required=False)

    is_default_consignee = forms.BooleanField(required=False)

    operation = forms.CharField()  # CRUD

    def is_create(self):
        return self.cleaned_data['operation'].lower() == 'create'

    def is_update(self):
        return self.cleaned_data['operation'].lower() == 'update'

    class Meta:
        model = AddressBook
        fields = ('id', 'organization', 'company_name', 'address', 'postcode', 'city', 'state', 'country', 'contact', 'phone', 'mobile', 'fax', 'email', 'is_default', 'is_shipper',
                  'is_consignee', 'is_consignor', 'is_pickup', 'is_delivery')
        validate_unique = False
