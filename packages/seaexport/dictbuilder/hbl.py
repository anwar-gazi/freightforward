from freightman.models import AddressBook, City, Country
from seaexport.models import SeaPort, SeaExportFreightBooking, SeaExportFreightBookingGoodsInfo, ContainerType, SeaExportHBL, SeaExportHBLContainerInfo, \
    AllocatedOceanContainer, SeaExportContainerConsolShipmentAllocatedContainerToHBLMap
from django.conf import settings
from django.shortcuts import reverse


def addressbook_dict(addressbook: AddressBook):
    return {
        'id': addressbook.id,
        'company_name': addressbook.company_name,
        'address': addressbook.address,
        'postcode': addressbook.postcode,
        'city_id': addressbook.city.id,
        'state': addressbook.state,
        'country_id': addressbook.country.id,
        'contact': addressbook.contact,
        'phone': addressbook.phone,
        'mobile': addressbook.mobile,
        'fax': addressbook.fax,
        'email': addressbook.email,
        'address_type': '',
    }


def city_dict(city: City):
    return {
        'id': city.id,
        'name': city.name
    }


def country_dict(country: Country):
    return {
        'id': country.id,
        'code_isoa2': country.code_isoa2,
        'name': country.name
    }


def seaport_dict(seaport: SeaPort):
    return {
        'id': seaport.id,
        'name': seaport.name
    }


def container_dict(container: ContainerType):
    return {
        'id': container.id,
        'name': container.name,
        'length_ft': container.length_ft,
        'width_ft': container.width_ft,
        'height_ft': container.height_ft,
        'capacity_cbm': container.capacity_cbm
    }


def container_dict_from_serial(serial: str):
    loaded = 0
    container_type = None
    allocation_list_hbl = []
    allocation_list_mbl = []
    for alloc in AllocatedOceanContainer.objects.filter(container_serial=serial):
        container_type = alloc.container_type
        loaded += alloc.allocated_cbm

        hblcontainer = SeaExportHBLContainerInfo.objects.filter(allocated_container=alloc).first()
        mblcontainer = None
        if mblcontainer:
            allocation_list_mbl.append({'mbl_container_map_id': mblcontainer.id, 'mbl': mblcontainer.mbl.public_id, 'loaded': alloc.allocated_cbm})
        if hblcontainer:
            allocation_list_hbl.append({'hbl_container_map_id': hblcontainer.id, 'hbl': hblcontainer.hbl.public_id, 'loaded': alloc.allocated_cbm})
    return {
        'id': container_type.id,
        'name': container_type.name,
        'length_ft': container_type.length_ft,
        'width_ft': container_type.width_ft,
        'height_ft': container_type.height_ft,
        'capacity_cbm': container_type.capacity_cbm,
        'allocated_cbm': loaded,
        'can_allocate_more': container_type.capacity_cbm - loaded > 0,
        'allocation_list': {'hbl': allocation_list_hbl, 'mbl': allocation_list_mbl}
    }


def booking_dict(request, booking: SeaExportFreightBooking):
    return {
        'shipper_dict': addressbook_dict(booking.shipper),
        'consignee_dict': addressbook_dict(booking.consignee),
        'public_id': booking.public_id,
        'port_id_of_loading': booking.loading_port_id,
        'port_id_of_discharge': booking.destination_port_id,
        'goods_no_of_packages': sum([g.no_of_pieces for g in SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)]),
        'goods_gross_weight_kg': sum([g.weight_kg for g in SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)]),
        'goods_cbm': sum([g.cbm for g in SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking)]),
    }


def allocated_container_dict(aloocated_container: AllocatedOceanContainer):
    return {
        'allocation_id': aloocated_container.id,
        'container_type': container_dict(aloocated_container.container_type),
        'container_serial': aloocated_container.container_serial,
        'container_number': aloocated_container.container_number
    }


def hbl_dict(request, hbl: SeaExportHBL):
    return {
        'public_id': hbl.public_id,
        'shipper_name': hbl.shipper_addressbook.company_name,
        'consignee_name': hbl.consignee_addressbook.company_name,
        'cbm': hbl.goods_cbm,
        'allocated_container_list': [allocated_container_dict(ci.allocated_container) for ci in SeaExportHBLContainerInfo.objects.filter(hbl=hbl)],
        'issue_date': hbl.issue_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN)
    }


def allocated_container_dict_for_hbl_view(allocated_container: AllocatedOceanContainer):
    return {
        'id': allocated_container.container_type_id,
        'name': allocated_container.container_type.name,
        'length_ft': allocated_container.container_type.length_ft,
        'width_ft': allocated_container.container_type.width_ft,
        'height_ft': allocated_container.container_type.height_ft,
        'capacity_cbm': allocated_container.container_type.capacity_cbm,
        'serial': allocated_container.container_serial,
        'container_number': allocated_container.container_number
    }


def hbl_dict_for_hbl_view(request, hbl: SeaExportHBL):
    return {
        'public_id': hbl.public_id,
        'hbl_public_id': hbl.public_id,

        'booking_applies': True if hbl.booking else False,

        'booking_public_id': hbl.booking.public_id if hbl.booking else '',

        'supplier_public_id': hbl.supplier.public_id,

        'shipper': addressbook_dict(hbl.shipper_addressbook),
        'consignee': addressbook_dict(hbl.consignee_addressbook),
        'agent': addressbook_dict(hbl.agent_addressbook),

        'city_id_of_receipt': hbl.city_of_receipt_id,
        'port_id_of_loading': hbl.port_of_loading_id,
        'feeder_vessel_name': hbl.feeder_vessel_name,
        'voyage_number': hbl.voyage_number,
        'mother_vessel_name': hbl.mother_vessel_name,
        'mother_vessel_voyage_number': hbl.mother_vessel_voyage_number,
        'port_id_of_discharge': hbl.port_of_discharge_id,
        'city_id_of_final_destination': hbl.city_of_final_destination_id,
        'excess_value_declaration': hbl.excess_value_declaration,

        'goods_no_of_packages': hbl.goods_no_of_packages,
        'goods_gross_weight_kg': hbl.goods_gross_weight_kg,
        'goods_cbm': hbl.goods_cbm,
        'goods_note': hbl.goods_note,

        'no_of_pallet': hbl.no_of_pallet,
        'lot_number': hbl.lot_number,

        'container_list': [allocated_container_dict_for_hbl_view(info.allocated_container) for info in SeaExportHBLContainerInfo.objects.filter(hbl=hbl)],

        'other_notes': hbl.other_notes,

        'issue_city_id': hbl.issue_city_id,
        'issue_date': hbl.issue_date,

        'created_by': hbl.entry_by.get_full_name(),
        'entry_at': hbl.entry_at.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN),

        'is_consolidated': SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(hbl=hbl).exists(),
        'has_invoice': False,
        'has_job_costing': False,
        'shipment_sent': False,
        'shipment_received_by_buyer': False,

        'hbl_edit_url': reverse('seaexport:seaexport_forwarder_view_hbl_page', args=(hbl.public_id_normalized,)),
        'hbl_copy_url': reverse('seaexport:seaexport_forwarder_copy_hbl_page', args=(hbl.public_id_normalized,))
    }
