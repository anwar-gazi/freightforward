from django.contrib import admin

from seaexport.models import SeaPort, SeaExportFreightBooking, SeaExportFreightBookingMoreAddressMap, SeaExportFreightBookingNotifyAddress, \
    SeaExportFreightBookingGoodsInfo, \
    SeaExportFreightBookingStakeholderReferenceTypes, ContainerType, SeaExportHBL, SeaExportHBLContainerInfo, AllocatedOceanContainer, SeaExportMBL, \
    SeaExportFreightBookingAttachedFile, SeaExportFreightBookingGoodsReference, SeaExportPackageType, SeaExportContainerConsolShipment, \
    SeaExportContainerConsolShipmentToAllocatedContainerMap, SeaExportContainerConsolShipmentAllocatedContainerToHBLMap, SeaTermsofDelivery
from freightman.admin_helpers import public_id
from seaexport.admin_helpers import booking_public_id


# Register your models here.
@admin.register(SeaPort)
class SeaPortAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'city']


@admin.register(SeaTermsofDelivery)
class SeaTermsofDeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'title']


@admin.register(SeaExportPackageType)
class SeaExportPackageTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


@admin.register(ContainerType)
class ContainerTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'capacity_cbm']


@admin.register(AllocatedOceanContainer)
class AllocatedOceanContainerAdmin(admin.ModelAdmin):
    list_display = ['id', 'container_type', 'container_serial', 'container_serial']


@admin.register(SeaExportFreightBooking)
class SeaExportFreightBookingAdmin(admin.ModelAdmin):
    list_display = ('id', booking_public_id)


@admin.register(SeaExportFreightBookingAttachedFile)
class SeaExportFreightBookingAttachedFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'file')


@admin.register(SeaExportHBL)
class SeaExportHBLAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', public_id)


@admin.register(SeaExportMBL)
class SeaExportMBLAdmin(admin.ModelAdmin):
    list_display = ('id', public_id)


@admin.register(SeaExportHBLContainerInfo)
class SeaExportHBLContainerInfoAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportFreightBookingMoreAddressMap)
class SeaExportFreightBookingMoreAddressMapAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportFreightBookingNotifyAddress)
class SeaExportFreightBookingNotifyAddressAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportFreightBookingGoodsInfo)
class SeaExportFreightBookingGoodsInfoAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportFreightBookingGoodsReference)
class SeaExportFreightBookingGoodsReferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'goods_info', 'booking')


@admin.register(SeaExportFreightBookingStakeholderReferenceTypes)
class SeaExportFreightBookingStakeholderReferenceTypesAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportContainerConsolShipment)
class SeaExportContainerConsolShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'forwarder', 'supplier', 'shipper_addressbook', 'consignee_addressbook')


@admin.register(SeaExportContainerConsolShipmentToAllocatedContainerMap)
class SeaExportContainerConsolShipmentToAllocatedContainerMapAdmin(admin.ModelAdmin):
    list_display = ('id',)


@admin.register(SeaExportContainerConsolShipmentAllocatedContainerToHBLMap)
class SeaExportContainerConsolShipmentAllocatedContainerToHBLMapAdmin(admin.ModelAdmin):
    list_display = ('id',)
