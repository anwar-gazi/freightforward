from seaexport.models import SeaExportFreightBooking, SeaExportFreightBookingGoodsInfo, SeaExportFreightBookingGoodsReference, \
    SeaExportFreightBookingStakeholderReferenceTypes, SeaExportFreightBookingAttachedFile, SeaExportFreightBookingMoreAddressMap, SeaExportFreightBookingNotifyAddress
from freightman.models import AddressBook, BankBranch, Bank
from seaexport.dictbuilder.forwarder_frt_book import org_dict
from django.conf import settings


def addressbook_dict(notify: bool, is_additional_address: bool, addressbook: AddressBook, addr_type: str):
    return {
        'field_errors': {},
        'misc_errors': [],

        'field_warns': {},

        'booking_notify': notify,

        'is_additional_address': is_additional_address,

        'data': {
            'id': addressbook.id,

            'company_name': addressbook.company_name,
            'address': addressbook.address,
            'postcode': addressbook.postcode,
            'city': addressbook.city_id,
            'state': addressbook.state,
            'country': addressbook.country_id,
            'contact': addressbook.contact,
            'tel_num': addressbook.phone,
            'mobile_num': addressbook.mobile,
            'fax_num': addressbook.fax,
            'email': addressbook.email,

            'address_type': addr_type
        }
    }


def bank_branch_dict(use: bool, branch: BankBranch):
    return {
        'use': use,

        'data': {
            'branch_id': branch.id,
            'bank_name': branch.bank.bank_name,
            'branch_name': branch.branch_name,
            'branch_address': branch.branch_address,

            'leg': '',
        }
    }


def goodsinfo_dict(goodsinfo: SeaExportFreightBookingGoodsInfo):
    return {
        'id': goodsinfo.id,

        'no_of_pieces': goodsinfo.no_of_pieces,
        'package_type': goodsinfo.package_type_id,
        'weight_kg': goodsinfo.weight_kg,
        'cbm': goodsinfo.cbm,
        'quantity': goodsinfo.quantity,
        'unit_price': goodsinfo.unit_price,
        'currency': goodsinfo.currency_id,
        'shipping_mark': goodsinfo.shipping_mark,
        'goods_desc': goodsinfo.goods_desc,

        'references': [goods_ref_dict(ref) for ref in SeaExportFreightBookingGoodsReference.objects.filter(goods_info=goodsinfo)],

        'errors': [],
        'formerrors': {},
    }


def goods_ref_dict(ref: SeaExportFreightBookingGoodsReference):
    return {
        'ref_type_id': ref.reference_type_id,
        'ref_number': ref.reference_number,

        'errors': [],
        'formerrors': {},
    }


def stakeholder_ref_dict(ref: SeaExportFreightBookingStakeholderReferenceTypes):
    return {
        'ref_type_id': ref.reference_type_id,
        'ref_number': ref.reference_number,

        'errors': [],
        'formerrors': {},
    }


def more_address_type(m: SeaExportFreightBookingMoreAddressMap):
    if m.is_consignee:
        return 'consignee'
    if m.is_shipper:
        return 'shipper'
    if m.is_delivery:
        return 'delivery'
    if m.is_pickup:
        return 'pickup'
    if m.is_consignor:
        return 'consignor'


def booking_dict(request, booking: SeaExportFreightBooking):
    notify_addressbook_id_list = [notifyaddr.addressbook_id for notifyaddr in SeaExportFreightBookingNotifyAddress.objects.filter(booking=booking)]
    addressbook_list = [addressbook_dict(booking.shipper_id in notify_addressbook_id_list, False, booking.shipper, 'shipper'),
                        addressbook_dict(booking.consignee_id in notify_addressbook_id_list, False, booking.consignee, 'consignee')]
    for m in SeaExportFreightBookingMoreAddressMap.objects.filter(booking=booking):
        addressbook_list.append(addressbook_dict(m.addressbook_id in notify_addressbook_id_list, True, m.addressbook, more_address_type(m)))

    return {
        'uplaodedfile_url_list': [att.file.url for att in SeaExportFreightBookingAttachedFile.objects.filter(booking=booking)],

        'booking_public_id': booking.public_id,

        'supplier': org_dict(booking.supplier),

        'is_draft': not booking.is_booking_confirmed,
        'is_booking_confirm': booking.is_booking_confirmed,

        'addressbook_list': addressbook_list,

        'bank_branch_list': [],
        'shipping_service': booking.shipping_service,

        'port_of_dest': booking.destination_port_id,
        'port_of_load': booking.loading_port_id,
        'terms_of_deliv': booking.delivery_terms_id,
        'country_of_dest': booking.destination_country_id,

        'goods_list': [goodsinfo_dict(goodsinfo) for goodsinfo in SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)],

        'stakeholder_ref_list': [stakeholder_ref_dict(ref) for ref in SeaExportFreightBookingStakeholderReferenceTypes.objects.filter(booking=booking)],

        'frt_payment_ins': booking.payment_type_id,
        'frt_transport_agreement_id': booking.transport_agreement_id,
        'frt_delivery_instruction': booking.delivery_note,

        'pickup_date': booking.pickup_date.strftime(settings.HTML_DATEFIELD_FORMAT_PY),
        'pickup_earliest_time': booking.pickup_time_start,
        'pickup_latest_time': booking.pickup_time_end,
        'pickup_ins': booking.pickup_note,
    }
