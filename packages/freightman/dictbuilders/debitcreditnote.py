from freightman.models import MAWB, HAWB, AddressBook, Organization, AirExportConsolidatedShipment, Currency, ChargeType, AirExportConsolidatedShipmentDebitNote, \
    AirExportDebitNoteCosting, AirExportConsolidatedShipmentJobCosting, AirExportConsolidatedShipmentCreditNote, \
    AirExportCreditNoteCosting
from freightman.mawb_helpers import mawb_consolidated_hawb_list
from django.conf import settings
from django.shortcuts import reverse


def currency_dict(currency: Currency):
    return {
        'id': currency.id,
        'code': currency.code
    }


def charge_type_dict(chargetype: ChargeType):
    return {
        'id': chargetype.id,
        'name': chargetype.name
    }


def charge_dict(costing):
    return {
        'charge_type_id': costing.charge_type_id,
        'is_unit_cost': costing.is_unit_cost,
        'fixed_or_unit_amount': costing.value,
    }


def addressbook_dict(addressbook: AddressBook):
    return {
        'company_name': addressbook.company_name,
        'address': addressbook.address,
        'postcode': addressbook.postcode,
        'city': addressbook.city.name,
        'state': addressbook.state,
        'country': addressbook.country.name,
        'contact': addressbook.contact,
        'phone': addressbook.phone,
        'mobile': addressbook.mobile,
        'fax': addressbook.fax,
        'email': addressbook.email
    }


def hawb_dict(request, hawb: HAWB):
    if hawb.booking:
        aq = AddressBook.objects.filter(organization=hawb.booking.org, is_default=True)
    else:
        aq = AddressBook.objects.filter(organization=hawb.supplier, is_default=True)
    return {
        'public_id': hawb.public_id,
        'shipper_address_dict': addressbook_dict(hawb.shipper),
        'supplier_name': hawb.booking.org.title if hawb.booking else hawb.supplier.title,
        'supplier_address_dict': addressbook_dict(aq.first()) if aq.exists() else None,
        'supplier_address_exist': aq.exists(),
        'chargable_weight': hawb.goods_chargableweight,
        'weight_unit': hawb.goods_weightunit,
    }


def mawb_dict(request, mawb: MAWB):
    consq = AirExportConsolidatedShipment.objects.filter(mawb=mawb)
    debitnoteq = AirExportConsolidatedShipmentDebitNote.objects.filter(consolidated_shipment__mawb=mawb)
    creditnoteq = AirExportConsolidatedShipmentCreditNote.objects.filter(consolidated_shipment__mawb=mawb)
    return {
        'public_id': mawb.public_id,
        'mawb_number': mawb.mawb_number,
        'has_debitnote': debitnoteq.exists(),
        'has_creditnote': creditnoteq.exists(),
        'debitnote_list': [{'public_id': debitnote.public_id, 'to_who': debitnote.to_who} for debitnote in debitnoteq],
        'creditnote_list': [{'public_id': creditnote.public_id, 'to_who': creditnote.to_who} for creditnote in creditnoteq],
        'debitnote_public_id': debitnoteq.first().public_id if debitnoteq.exists() else '',
        'is_consolidated': consq.exists(),
        'consolidation_public_id': consq.first().public_id if consq.exists() else '',
        'goods_commodityitemno': mawb.goods_commodityitemno,
        'destination': mawb.airport_of_destination.name,
        'no_of_packages': mawb.goods_noofpcsrcp,
        'package_type_code': 'CTN',

        'chargable_weight': mawb.goods_chargableweight,
        'weight_unit': mawb.goods_weightunit,

        'consignee_address_dict': addressbook_dict(mawb.consignee),

        'hawb_list': [hawb_dict(request, hawb) for hawb in mawb_consolidated_hawb_list(mawb)]
    }


def debitnote_dict(request, debitnote: AirExportConsolidatedShipmentDebitNote):
    if debitnote.to_who == 'master_consignee':
        address = debitnote.consolidated_shipment.mawb.consignee
    elif debitnote.to_who == 'house_supplier':
        address = debitnote.hawb.supplier.addressbook_set.filter(is_default=True).first()
    elif debitnote.to_who == 'house_shipper':
        address = debitnote.hawb.shipper
    return {
        'public_id': debitnote.public_id,
        'currency': {
            'id': debitnote.currency_id,
            'code': debitnote.currency.code,
        },
        'currency_conversion': {
            'from_currency_id': debitnote.target_currency_conversion.from_currency_id if debitnote.target_currency_conversion else None,
            'to_currency_id': debitnote.target_currency_conversion.to_currency_id if debitnote.target_currency_conversion else None,
            'rate': debitnote.target_currency_conversion.conversion_rate if debitnote.target_currency_conversion else None,
        },
        'to_who': debitnote.to_who.replace('master', 'mawb').replace('house', 'hawb'),
        'to_address_dict': addressbook_dict(address),
        'date': debitnote.date,
        'mawb': mawb_dict(request, debitnote.consolidated_shipment.mawb),
        'hawb': hawb_dict(request, debitnote.hawb) if debitnote.hawb else {},
        'charges_list': [charge_dict(cost) for cost in AirExportDebitNoteCosting.objects.filter(debit_note=debitnote)],
        'view_url': reverse('forwarder-debit_note_view', args=(debitnote.public_id,))
    }


def creditnote_dict(request, creditnote: AirExportConsolidatedShipmentCreditNote):
    if creditnote.to_who == 'master_consignee':
        address = creditnote.consolidated_shipment.mawb.consignee
    elif creditnote.to_who == 'house_supplier':
        address = creditnote.hawb.supplier.addressbook_set.filter(is_default=True).first()
    elif creditnote.to_who == 'house_shipper':
        address = creditnote.hawb.shipper
    return {
        'public_id': creditnote.public_id,
        'currency': {
            'id': creditnote.currency_id,
            'code': creditnote.currency.code,
        },
        'currency_conversion': {
            'from_currency_id': creditnote.target_currency_conversion.from_currency_id if creditnote.target_currency_conversion else None,
            'to_currency_id': creditnote.target_currency_conversion.to_currency_id if creditnote.target_currency_conversion else None,
            'rate': creditnote.target_currency_conversion.conversion_rate if creditnote.target_currency_conversion else None,
        },
        'to_who': creditnote.to_who.replace('master', 'mawb').replace('house', 'hawb'),
        'to_address_dict': addressbook_dict(address),
        'date': creditnote.date,
        'mawb': mawb_dict(request, creditnote.consolidated_shipment.mawb),
        'hawb': hawb_dict(request, creditnote.hawb) if creditnote.hawb else {},
        'charges_list': [charge_dict(cost) for cost in AirExportCreditNoteCosting.objects.filter(credit_note=creditnote)],
        'view_url': reverse('airexport:credit_note_view', args=(creditnote.public_id,))
    }
