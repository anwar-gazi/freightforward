from django.forms import ModelForm, inlineformset_factory, BaseInlineFormSet
from django import forms
from freightman.models import Bank, BankBranch


class BookingBankForm(forms.Form):
    booking_id = forms.IntegerField()
    branch_id = forms.IntegerField(required=False)

    # id = forms.IntegerField(required=False)

    # operation = forms.CharField()
    # in_origin_leg = forms.BooleanField()
    # in_destination_leg = forms.BooleanField()
    #
    # def is_create(self):
    #     return False if self.cleaned_data['branch_id'] else True
    #
    # def is_update(self):
    #     return True if self.cleaned_data['branch_id'] else False

    bank_name = forms.CharField(max_length=Bank._meta.get_field('bank_name').max_length)

    # class Meta:
    #     model = Bank
    #     fields = ('bank_name',)


class BookingBankBranchForm(forms.ModelForm):
    booking_id = forms.IntegerField()
    branch_id = forms.IntegerField(required=False)
    # operation = forms.CharField()
    in_origin_leg = forms.BooleanField(required=False)
    in_destination_leg = forms.BooleanField(required=False)
    notify = forms.BooleanField(required=False)

    def is_create(self):
        return False if self.cleaned_data['branch_id'] else True

    def is_update(self):
        return True if self.cleaned_data['branch_id'] else False

    class Meta:
        model = BankBranch
        fields = ('branch_name', 'branch_address')
