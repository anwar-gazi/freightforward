from . import models
import django_filters


class JobFilter(django_filters.FilterSet):
    public_key = django_filters.CharFilter(label='Search By De-Console ID')

    class Meta:
        model = models.SeaImportJob
        fields = ['public_key', 'created_at']


class MblFilter(django_filters.FilterSet):

    class Meta:
        model = models.SeaImportMbl
        fields = ['mbl_number', 'mbl_shipper',]


class HblFilter(django_filters.FilterSet):

    class Meta:
        model = models.SeaImportHbl
        fields = ['hbl_number', 'hbl_consignor', 'hbl_bank', 'hbl_notifier']

