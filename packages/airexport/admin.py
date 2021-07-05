from django.contrib import admin
from freightman.models import AirExportConsolidatedShipmentCreditNote, AirExportCreditNoteCosting


# Register your models here.

@admin.register(AirExportConsolidatedShipmentCreditNote)
class AirExportConsolidatedShipmentCreditNoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'forwarder', 'consolidated_shipment', 'to_who', 'date', 'currency', 'target_currency_conversion']


@admin.register(AirExportCreditNoteCosting)
class AirExportCreditNoteCostingAdmin(admin.ModelAdmin):
    list_display = ['id', 'credit_note', 'currency', 'charge_type', 'value', 'is_unit_cost']
