from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from freightman.models import SystemUser, TimeZone, GoodsReferenceTypes, PackageType, Currency, StakeholderReferenceTypes, TransportAgreement, FreightBooking, Country, City, \
    AddressBook, \
    Organization, FreightBookingPartyAddress, FreightBookingGoodsInfo, Airport, FreightBookingPortInfo, Airline, TermsofDelivery, Airwaybill, UserOrganizationMap, \
    AWBAgent, \
    AWBAgentAirlinesMap, PaymentType, HAWB, MAWB, FreightBookingPickupNote, BookingListener, Bank, BankBranch, FreightBookingBankBranch, AirExportConsolidatedShipment, \
    AirExportConsolHouseMap, AirExportConsolidatedShipmentFlightInfo, ChargeType, AirExportConsolidatedShipmentJobCosting, AuthLevelPermissions, UserAuthLevel, \
    CurrencyConversion, AirExportConsolidatedShipmentDebitNote, AirExportDebitNoteCosting, ServiceProviderMap
from .admin_helpers import user_auth_level, user_org_name, agent_name


@admin.register(ServiceProviderMap)
class ServiceProviderMapAdmin(admin.ModelAdmin):
    list_display = ['id', 'service_provider_org', 'customer_org']
    list_filter = ('service_provider_org',)


@admin.register(AuthLevelPermissions)
class AuthLevelPermissionsAdmin(admin.ModelAdmin):
    list_display = ['id', 'organization', 'level_name']
    list_filter = ('organization',)


@admin.register(UserAuthLevel)
class UserAuthLevelAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'auth_level']


@admin.register(AirExportConsolidatedShipmentJobCosting)
class AirExportConsolidatedShipmentJobCostingAdmin(admin.ModelAdmin):
    list_display = ['id', 'consolidated_shipment', 'currency', 'currency_conversion', 'is_shipment_cost', 'charge_type', 'value', 'is_unit_cost', 'charge_applies_to_hawb',
                    'for_specific_hawb', 'hawb', 'entry_by', 'entry_at', 'updated_at']


@admin.register(AirExportConsolidatedShipment)
class AirExportConsolidatedShipmentAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(AirExportConsolidatedShipmentDebitNote)
class AirExportConsolidatedShipmentDebitNoteAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(AirExportDebitNoteCosting)
class AirExportDebitNoteCostingAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(AirExportConsolHouseMap)
class AirExportConsolHouseMapAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(AirExportConsolidatedShipmentFlightInfo)
class AirExportConsolidatedShipmentFlightInfoAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = ['id', 'bank_name', 'active', 'added_at', 'added_by']


@admin.register(BankBranch)
class BankBranchAdmin(admin.ModelAdmin):
    list_display = ['id', 'bank', 'branch_name', 'branch_address', 'active', 'added_at', 'added_by']


@admin.register(BookingListener)
class BookingListenerAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'added_at', 'added_by']


@admin.register(HAWB)
class HAWBAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(MAWB)
class MAWBAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(FreightBookingBankBranch)
class FreightBookingBankBranchAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking_id', 'bank_branch_id', 'in_origin_leg', 'in_destination_leg', 'notify']


@admin.register(FreightBookingPortInfo)
class FreightBookingPortInfoAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking_id']


@admin.register(FreightBookingPickupNote)
class FreightBookingPickupNoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking_id']


@admin.register(TermsofDelivery)
class TermsofDeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'title']


@admin.register(PaymentType)
class PaymentTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


@admin.register(ChargeType)
class ChargeTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


@admin.register(Airline)
class AirlineAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'prefix_number']


@admin.register(AWBAgent)
class AWBAgentAdmin(admin.ModelAdmin):
    list_display = ['id', 'iata_code', agent_name]


@admin.register(AWBAgentAirlinesMap)
class AWBAgentAirlinesMapAdmin(admin.ModelAdmin):
    list_display = ['id', 'airline', 'agent']


@admin.register(Airwaybill)
class AirwaybillAdmin(admin.ModelAdmin):
    list_display = ['id', 'airline', 'awb_serial']


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


@admin.register(FreightBookingGoodsInfo)
class FreightBookingGoodsInfoAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'prefix', 'active', 'booking_mail_sending_enabled', 'is_forwarder', 'is_supplier', 'is_buyer', 'is_factory', 'is_shipper']


@admin.register(UserOrganizationMap)
class UserOrganizationMapAdmin(admin.ModelAdmin):
    list_display = ['id', 'organization', 'user']


@admin.register(AddressBook)
class AddressBookAdmin(admin.ModelAdmin):
    list_display = ['id', 'organization', 'company_name', 'address', 'postcode',
                    'city', 'state', 'country', 'contact', 'phone', 'mobile', 'fax', 'email', 'is_default', 'is_shipper', 'is_consignee', 'is_consignor', 'is_pickup',
                    'is_delivery']


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code_isoa2')


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country')


@admin.register(FreightBooking)
class FreightBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'entry_complete', 'org', 'is_draft', 'is_booking_confirmed', 'entry_at', 'edd', 'entry_by')


@admin.register(FreightBookingPartyAddress)
class FreightBookingPartyAddressAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'addressbook', 'notify', 'is_shipper', 'is_consignee', 'is_default_consignee', 'is_consignor', 'is_pickup', 'is_delivery')


@admin.register(TransportAgreement)
class TransportAgreementAdmin(admin.ModelAdmin):
    list_display = ('id', 'org', 'title')


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'currency_name', 'default')


@admin.register(CurrencyConversion)
class CurrencyConversionAdmin(admin.ModelAdmin):
    list_display = ['id', 'from_currency', 'to_currency', 'conversion_rate']


@admin.register(PackageType)
class PackageTypeAdmin(admin.ModelAdmin):
    list_display = ('org', 'name')


@admin.register(StakeholderReferenceTypes)
class StakeholderReferenceTypesAdmin(admin.ModelAdmin):
    list_display = ('org', 'name')


@admin.register(GoodsReferenceTypes)
class ReferenceTypesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(TimeZone)
class TimeZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'tz_name')


@admin.register(SystemUser)
class SystemUserAdmin(UserAdmin):
    list_display = ('username', user_org_name, user_auth_level, 'email', 'first_name', 'last_name', 'time_zone')
