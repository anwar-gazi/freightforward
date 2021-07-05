from django.contrib import admin
from .models import SeaImportAgent, SeaImportGood, SeaImportGoodType, SeaImportJob, \
    SeaImportState, SeaImportDocType, SeaImportDoc, SeaImportCompany, \
    SeaImportFreightType, SeaImportExpense, SeaImportExpenseType, SeaImportAgentBankInfo, \
    SeaImportDeliveryOrder, SeaImportHbl, SeaImportMbl, SeaImportTask, SeaImportSystemSetting, \
    SeaImportFormInstruction, SeaImportJobCost, SeaImportJobCostType, SeaImportCreditNote, \
    SeaImportCreditNoteCosts


# Register your models here.

@admin.register(SeaImportCompany)
class SeaImportCompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'is_forwarder', 'is_consignor', 'is_importer', 'is_bank', 'is_foreign_agent']


@admin.register(SeaImportAgent)
class SeaImportAgentAdmin(admin.ModelAdmin):
    list_display = ['id', 'branch', 'name']


@admin.register(SeaImportGoodType)
class SeaImportGoodTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'goods_type_name']


@admin.register(SeaImportGood)
class SeaImportGoodAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'gross_weight', 'weight_unit']


@admin.register(SeaImportJob)
class SeaImportJobAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = ('id',)
    list_filter = ('created_at',)


@admin.register(SeaImportHbl)
class SeaImportHblAdmin(admin.ModelAdmin):
    list_display = ['id', 'hbl_number']

@admin.register(SeaImportTask)
class SeaImportTaskAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(SeaImportMbl)
class SeaImportMblAdmin(admin.ModelAdmin):
    list_display = ['id', 'mbl_number',]


@admin.register(SeaImportState)
class SeaImportStateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'country']


@admin.register(SeaImportDocType)
class SeaImportDocTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'type_name', 'type_description']


@admin.register(SeaImportDoc)
class SeaImportDocAdmin(admin.ModelAdmin):
    list_display = ['id', 'doc_type', 'job', 'file']


@admin.register(SeaImportFreightType)
class SeaImportFreightTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']



@admin.register(SeaImportExpenseType)
class SeaImportExpenseTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name',]


@admin.register(SeaImportExpense)
class SeaImportExpenseAdmin(admin.ModelAdmin):
    list_display = ['id', 'hbl', 'type', 'amount']


@admin.register(SeaImportAgentBankInfo)
class SeaImportAgentBankInfoAdmin(admin.ModelAdmin):
    list_display = ['id', 'company', 'bank_name']


@admin.register(SeaImportDeliveryOrder)
class SeaImportDeliveryOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'cargo_system', 'hbl']

@admin.register(SeaImportSystemSetting)
class SeaImportSystemSettingAdmin(admin.ModelAdmin):
    list_display = ['id', 'show_instruction']

@admin.register(SeaImportFormInstruction)
class SeaImportFormInstructionAdmin(admin.ModelAdmin):
    list_display = ['id']

@admin.register(SeaImportJobCost)
class SeaImportJobCostAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'job']

@admin.register(SeaImportJobCostType)
class SeaImportJobCostTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(SeaImportCreditNote)
class SeaImportCreditNoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'job', 'agent']

@admin.register(SeaImportCreditNoteCosts)
class SeaImportCreditNoteCostsAdmin(admin.ModelAdmin):
    list_display = ['id', 'credit_note', 'name']

