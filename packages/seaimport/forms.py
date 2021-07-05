from django import forms
from django.urls import reverse_lazy
from django_addanother.widgets import AddAnotherWidgetWrapper
from django.shortcuts import reverse

from .models import SeaImportJob, SeaImportGood, SeaImportDoc, SeaImportExpense, SeaImportDeliveryOrder \
    , SeaImportMbl, SeaImportHbl, SeaImportAgent, SeaImportCompany, \
    SeaImportExpenseType, SeaImportFreightType, SeaImportGoodType, SeaImportDocType, SeaImportAgentBankInfo, \
    SeaImportJobCost, SeaImportJobCostType, SeaImportCreditNoteCosts, SeaImportCreditNote
from freightman.models import City, Country
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Div, Button

from seaexport.models import SeaPort, SeaExportPackageType, ContainerType


# A class to change date fields to date type in templates
class DateInput(forms.DateInput):
    input_type = 'date'


from django.shortcuts import reverse
from django.utils.safestring import mark_safe
from django.forms import widgets


# from django.conf import settings


class RelatedFieldWidgetCanAdd(widgets.Select):

    def __init__(self, related_model, related_url=None, *args, **kw):
        super(RelatedFieldWidgetCanAdd, self).__init__(*args, **kw)

        if not related_url:
            rel_to = related_model
            info = (rel_to._meta.app_label, rel_to._meta.object_name.lower())
            related_url = 'admin:%s_%s_add' % info

        # Be careful that here "reverse" is not allowed
        self.related_url = related_url

    def render(self, name, value, *args, **kwargs):
        self.related_url = reverse(self.related_url)
        output = [super(RelatedFieldWidgetCanAdd, self).render(name, value, *args, **kwargs)]
        output.append(
            u'<a href="%s" class=" btn btn-primary float-right" id="add_id_%s" target="_blank">+</a> ' % \
            (self.related_url, name))
        return mark_safe(u''.join(output))


class SeaImportMblForm(forms.ModelForm):

    class Meta:
        model = SeaImportMbl
        fields = (
            'mbl_number',
            'mbl_shipper',
            'mbl_consignee',
            'mbl_notifier',
            'freight_type',
            'file',
            'proforma_invoice_no',
            'proforma_invoice_date',
            'port_of_loading',
            'port_of_discharge',
            'feeder_vessel',
            'eta_destination_port',
            'ocean_freight_cost_per_container',
        )
        widgets = {
            'proforma_invoice_date': DateInput(),
            'eta_destination_port': DateInput(),
            'port_of_loading': RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_seaport"),
            'port_of_discharge': RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_seaport"),
            'freight_type': RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_freighttype"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['mbl_shipper'].widget.attrs.update({
            'class': 'agent col-11 float-left',
        })

        self.fields['port_of_loading'].widget.attrs.update({
            'class': ' col-11 float-left',
        })

        self.fields['port_of_discharge'].widget.attrs.update({
            'class': ' col-11 float-left',
        })

        self.fields['freight_type'].widget.attrs.update({
            'class': 'col-11 float-left',
        })

    mbl_shipper = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_foreign_agent=True),
        label="CONSIGNOR (Foreign Agent)",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"), )

    mbl_consignee = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_forwarder=True),
        label="CONSIGNEE",
        # widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"),
    )

    mbl_notifier = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_forwarder=True),
        label="NOTIFIER",
        # widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"),
    )


class SeaImportHblForm(forms.ModelForm):
    class Meta:
        model = SeaImportHbl
        fields = (
            'hbl_number',
            'hbl_consignor',
            'hbl_bank',
            'hbl_notifier',
            'file',
            # 'task',
        )
        widgets = {

        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['hbl_consignor'].widget.attrs.update({
            'class': 'agent col-11 float-left',
        })
        self.fields['hbl_bank'].widget.attrs.update({
            'class': 'agent col-11 float-left',
        })
        self.fields['hbl_notifier'].widget.attrs.update({
            'class': 'agent col-11 float-left',
        })

    hbl_consignor = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_consignor=True),
        label="CONSIGNOR",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"), )

    hbl_bank = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_bank=True),
        label="CONSIGNED TO ORDER OF",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"), )

    hbl_notifier = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_importer=True),
        label="NOTIFY ADDRESS (Importer)",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"), )


# A form to update dollar rate only
class SeaImportJobDollarRateForm(forms.ModelForm):
    class Meta:
        model = SeaImportJob
        fields = (
            'dollar_rate',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


# A form to update job
class SeaImportJobForm(forms.ModelForm):
    class Meta:
        model = SeaImportJob
        fields = (
            'dollar_rate',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class SeaImportGoodForm(forms.ModelForm):
    type = forms.ModelChoiceField(
        queryset=SeaImportGoodType.objects.all(),
        label="Type of Good",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_goodstype"), )

    package_type = forms.ModelChoiceField(
        queryset=SeaExportPackageType.objects.all(),
        label="Package Type",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_package_type"), )

    container_size_type = forms.ModelChoiceField(
        queryset=ContainerType.objects.all(),
        label="Container Type",
        widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_container_type"), )

    class Meta:
        model = SeaImportGood
        fields = (
            'type',
            'description',
            'container_seal_number',
            'quantity',
            'package_type',

            'net_weight',
            'gross_weight',
            'container_size_type',
        )

    # hbl_number = forms.CharField(label='HBL Number', required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.fields['type'].widget.attrs.update({
            'class': 'col-11 float-left',
            'id': 'id_goods_type',
        })
        self.fields['package_type'].widget.attrs.update({
            'class': 'col-11 float-left',
        })

        self.fields['container_size_type'].widget.attrs.update({
            'class': 'col-11 float-left',
        })


class SeaImportDocForm(forms.ModelForm):
    class Meta:
        model = SeaImportDoc
        fields = (
            'doc_type',
            'job',
            'file',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        # self.helper.form_method = 'post'
        self.helper.form_show_labels = False

        self.fields['doc_type'].widget.attrs.update({
            'required': True,
            'class': 'doc_type',
        })
        self.fields['job'].widget.attrs.update({'required': True})
        self.fields['file'].widget.attrs.update({'required': True})




class SeaImportExpenseForm(forms.ModelForm):
    class Meta:
        model = SeaImportExpense
        fields = (
            'type',
            'amount',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        # self.helper.form_method = 'post'
        self.helper.form_show_labels = False
        self.fields['amount'].widget.attrs.update({'class': 'amount_usd', 'required': True, })
        self.fields['type'].widget.attrs.update({'required': True, })


class SeaImportDeliveryOrderForm(forms.ModelForm):
    class Meta:
        model = SeaImportDeliveryOrder
        fields = (
            'to',
            'address',
            'city',
            'cargo_system',
            'vessel',
            'line_no',
            'rotation_no',

            'lc_number',
            'applicant_name',
            'applicant_address',
            'lcaf_number',
            'applicant_irc',
            'tin',
            'bin_no',
            'others',
            'hbl',

            'bank_statement',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()


"""
Form for Freight Certificate
"""


# class Row(Div):
#     css_class = "form-row"

class SeaImportAgentForm(forms.ModelForm):
    form_name = "Add Company Branch"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col'),
            Div(Button('button', "+", css_class='btn btn-primary field-align-button float-left',
                       onclick="javascript:newPopup('/seaimport/create/company');"),
                css_class='col-1'),
            Div('branch', css_class='col-6'),
            Div('address', css_class='col-6'),
            Div('postal_code', css_class='col-6'),
            Div('city', css_class='col'),
            Div(Button('button', "+", css_class='btn btn-primary field-align-button float-left',
                       onclick="javascript:newPopup('/seaimport/create/city');"), css_class='col-1'),
            Div('contact', css_class='col-6'),
            Div('email', css_class='col-6'),
            Div('phone', css_class='col-6'),
            Div('mobile', css_class='col-6'),
            Div('fax', css_class='col-6'),
            css_class='row'),
    )

    # Row(
    #     Field('branch', wrapper_class='col-3'),
    #     Field('address', wrapper_class='col-md-9')
    # )

    class Meta:
        model = SeaImportAgent
        exclude = ('',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs.update({
            'id': 'id_company_name',
        })


class SeaImportCompanyForm(forms.ModelForm):
    form_name = "Add Company"
    success_message = 'New Company Added Successfully'
    error_message = "There was an error adding the Company"

    helper = FormHelper()
    helper.layout = Layout(
        Div(Div('name', css_class='col-6'), css_class='row'),
        Div(Div('is_consignor', css_class='col-6'), css_class='row'),
        Div(Div('is_importer', css_class='col-6'), css_class='row'),
        Div(Div('is_bank', css_class='col-6'), css_class='row'),
        Div(Div('is_foreign_agent', css_class='col-6'), css_class='row'),
    )

    # Row(
    #     Field('branch', wrapper_class='col-3'),
    #     Field('address', wrapper_class='col-md-9')
    # )

    class Meta:
        model = SeaImportCompany
        exclude = ('',)


class SeaImportCityForm(forms.ModelForm):
    form_name = "Add New City"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('country', css_class='col'),
            Div(Button('button', "+", css_class='btn btn-primary field-align-button float-left',
                       onclick="window.open('/seaimport/create/country');")),
            css_class='row'), )

    class Meta:
        model = City
        exclude = ('',)


class SeaImportCountryForm(forms.ModelForm):
    form_name = "Add New Country"
    success_message = 'New Country Added Successfully'
    error_message = "There was an error adding the Country"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('code_isoa2', css_class='col'),
            css_class='row'), )

    class Meta:
        model = Country
        exclude = ('',)


class SeaImportExpenseTypeForm(forms.ModelForm):
    form_name = "Add New Expense Type"
    success_message = 'New Expense Type Added Successfully'
    error_message = "There was an error adding the Expense Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('default', css_class='col-6'),
            Div('type', css_class='col-6'),
            Div('description', css_class='col'),
            css_class='row'), )

    class Meta:
        model = SeaImportExpenseType
        exclude = ('',)


class SeaImportFreightTypeForm(forms.ModelForm):
    form_name = "Add New Freight Type"
    success_message = 'New Freight Type Added Successfully'
    error_message = "There was an error adding the Freight Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-7'),
            Div('freight_certificate', css_class='col-7'),
            Div('description', css_class='col-7'),
            css_class='row'), )

    class Meta:
        model = SeaImportFreightType
        exclude = ('',)


class SeaImportGoodsTypeForm(forms.ModelForm):
    form_name = "Add New Goods Type"
    success_message = 'New Goods Type Added Successfully'
    error_message = "There was an error adding the Goods Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('goods_type_name', css_class='col-7'),
            Div('goods_type_description', css_class='col-7'),
            css_class='row'), )

    class Meta:
        model = SeaImportGoodType
        exclude = ('',)


class SeaImportDocTypeForm(forms.ModelForm):
    form_name = "Add New Document Type"
    success_message = 'New Document Type Added Successfully'
    error_message = "There was an error adding the Document Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('type_name', css_class='col-7'),
            Div('type_description', css_class='col-7'),
            css_class='row'), )

    class Meta:
        model = SeaImportDocType
        exclude = ('',)


class SeaImportPortForm(forms.ModelForm):
    form_name = "Add New Port"
    success_message = 'New Port Added Successfully'
    error_message = "There was an error adding the Port, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('city', css_class='col'),
            Div(Button('button', "+", css_class='btn btn-primary field-align-button float-left',
                       onclick="javascript:newPopup('/seaimport/create/city');"), css_class='col-1'),
            css_class='row'), )

    class Meta:
        model = SeaPort
        exclude = ('',)


class SeaImportPackageTypeForm(forms.ModelForm):
    form_name = "Add New Package Type"
    success_message = 'New Package Type Added Successfully'
    error_message = "There was an error adding the Package Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            css_class='row'), )

    class Meta:
        model = SeaExportPackageType
        exclude = ('',)


class SeaImportContainerTypeForm(forms.ModelForm):
    form_name = "Add New Container Type"
    success_message = 'New Container Type Added Successfully'
    error_message = "There was an error adding the Container Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('height_ft', css_class='col-6'),
            Div('length_ft', css_class='col-6'),
            Div('width_ft', css_class='col-6'),
            Div('capacity_cbm', css_class='col-6'),
            css_class='row'), )

    class Meta:
        model = ContainerType
        exclude = ('',)


class SeaImportAgentBankInfoForm(forms.ModelForm):
    form_name = "Add Bank for Forwarder"
    success_message = 'New Bank Added Successfully, Close this form and reload'
    error_message = "There was an error adding the Bank, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('company', css_class='col-6'),
            Div('account_no', css_class='col-6'),
            Div('bank_name', css_class='col-6'),
            Div('swift_code', css_class='col-6'),
            Div('bank_address', css_class='col-6'),
            css_class='row'), )

    class Meta:
        model = SeaImportAgentBankInfo
        exclude = ('',)

    company = forms.ModelChoiceField(
        queryset=SeaImportAgent.objects.filter(name__is_forwarder=True),
        label="Select Forwarder",
        # widget=RelatedFieldWidgetCanAdd(SeaImportAgent, related_url="seaimport:sea_import_create_agent"),
    )


class SeaImportJobCostTypeForm(forms.ModelForm):
    form_name = "Add Job Cost Type"
    success_message = 'New Cost Type Added Successfully'
    error_message = "There was an error adding the Cost Type, Please try again"
    helper = FormHelper()
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-6'),
            Div('default', css_class='col-6'),
            Div('type', css_class='col-6'),
            Div('description', css_class='col-6'),
            css_class='row'), )

    class Meta:
        model = SeaImportJobCostType
        exclude = ('',)


class SeaImportJobCostForm(forms.ModelForm):
    class Meta:
        model = SeaImportJobCost
        fields = (
            'name',
            'amount',
            'type',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        # self.helper.form_method = 'post'
        self.helper.form_show_labels = False
        self.fields['amount'].widget.attrs.update({'class': 'amount_usd ', 'required': True, })
        self.fields['name'].widget.attrs.update({'required': True, })
        self.fields['type'].widget.attrs.update({'required': True, 'class':'form-control'})


class SeaImportCreditNoteCostForm(forms.ModelForm):
    class Meta:
        model = SeaImportCreditNoteCosts
        fields = (
            'name',
            'amount',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        # self.helper.form_method = 'post'
        self.helper.form_show_labels = False
        self.fields['amount'].widget.attrs.update({'class': 'amount_usd ', 'required': True, })
        self.fields['name'].widget.attrs.update({'required': True, })


class SeaImportCreditNoteForm(forms.ModelForm):
    class Meta:
        model = SeaImportCreditNote
        fields = (
            'agent',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        # self.helper.form_method = 'post'
        self.helper.form_show_labels = False
        self.fields['agent'].widget.attrs.update({'required': True, })