from seaexport.models import SeaExportContainerConsolShipment, SeaExportContainerConsolShipmentToAllocatedContainerMap, \
    SeaExportContainerConsolShipmentAllocatedContainerToHBLMap, AllocatedOceanContainer, SeaExportHBL, SeaExportFreightBookingGoodsInfo, SeaExportFreightBookingGoodsReference, \
    SeaExportContainerConsolidationJobCosting
from django.shortcuts import reverse


def container_consol_dict(request, consol: SeaExportContainerConsolShipment):
    pallet_total = 0
    carton_total = 0
    cbm_total = 0
    for m in SeaExportContainerConsolShipmentToAllocatedContainerMap.objects.filter(container_consol_shipment=consol):
        for m in SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(shipment_to_container_map=m):
            pallet_total += m.hbl.no_of_pallet
            for gi in SeaExportFreightBookingGoodsInfo.objects.filter(booking=m.hbl.booking):
                carton_total += gi.no_of_pieces if 'carton' in gi.package_type.name.lower() else 0
                cbm_total += gi.cbm
    return {
        'public_id': consol.public_id,
        'view_url': reverse('seaexport:seaexport_container_consol_shipment_advice_view', args=(consol.public_id_tail,)),
        'container_info_list': [consol_container_dict(m.allocated_container,
                                                      [m.hbl for m in SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(shipment_to_container_map=m)])
                                for m in SeaExportContainerConsolShipmentToAllocatedContainerMap.objects.filter(container_consol_shipment=consol)],
        'carton_total': carton_total,
        'pallet_total': pallet_total,
        'cbm_total': cbm_total,

        'supplier': consol.supplier.title,
        'shipper': consol.shipper_addressbook.company_name,
        'consignee': consol.consignee_addressbook.company_name,

        'feeder_vessel_name': consol.feeder_vessel_name,
        'feeder_vessel_voyage_number': consol.feeder_vessel_voyage_number,
        'feeder_departure_city': consol.feeder_departure_city.name,
        'feeder_arrival_city': consol.feeder_arrival_city.name,
        'feeder_etd': consol.feeder_etd,
        'feeder_eta': consol.feeder_eta,

        'mother_vessel_name': consol.mother_vessel_name,
        'mother_vessel_voyage_number': consol.mother_vessel_voyage_number,
        'mother_departure_city': consol.mother_departure_city.name,
        'mother_arrival_city': consol.mother_arrival_city.name,
        'mother_etd': consol.mother_etd,
        'mother_eta': consol.mother_eta
    }


def consol_container_dict(allocated_container: AllocatedOceanContainer, hbl_list: [SeaExportHBL]):
    return {
        'container_no': allocated_container.container_serial,
        'size': allocated_container.container_type.name,
        'seal_no': allocated_container.container_number,
        'shipper': ','.join(set([hbl.shipper_addressbook.company_name for hbl in hbl_list])),
        'consignee': ','.join(set([hbl.consignee_addressbook.company_name for hbl in hbl_list])),
        'hbl_list': [consol_container_hbl_dict(hbl) for hbl in hbl_list]
    }


def consol_container_hbl_dict(hbl: SeaExportHBL):
    return {
        'public_id': hbl.public_id,
        'goods_info_list': [booking_goods_info_dict(gi) for gi in SeaExportFreightBookingGoodsInfo.objects.filter(booking=hbl.booking)],
        'no_of_pallet': hbl.no_of_pallet,
        'lot_number': hbl.lot_number
    }


def booking_goods_info_dict(gi: SeaExportFreightBookingGoodsInfo):
    return {
        'po_number_list': [ref.reference_number for ref in SeaExportFreightBookingGoodsReference.objects.filter(reference_type__name__icontains='po number')],
        'no_of_ctns': gi.no_of_pieces if 'carton' in gi.package_type.name.lower() else 0,
        'lot': 'NA',
        'pallet': '',
        'cbm': gi.cbm,
    }


def consol_dict_for_job_cost_listing(consol: SeaExportContainerConsolShipment):
    from seaexport.models import SeaExportContainerConsolidationJobCosting
    return {
        'public_id': consol.public_id,
        'has_job_costing': SeaExportContainerConsolidationJobCosting.objects.filter(container_consol=consol).exists(),
        'load_url': reverse('seaexport:load_job_costing', args=(consol.public_id.replace('/', '-'),)),
    }


def hbl_dict_for_job_costing_page(hbl: SeaExportHBL):
    return {
        'public_id': hbl.public_id,
        'shipper_company_name': hbl.shipper_addressbook.company_name,
        'consignee_company_name': hbl.consignee_addressbook.company_name,
        'cbm': hbl.goods_cbm
    }


def consol_dict_for_job_costing_page(consol: SeaExportContainerConsolShipment):
    return {
        'id': consol.id,
        'public_id': consol.public_id,
        'mbl_public_id': consol.mbl_number,
        'hbl_list': [hbl_dict_for_job_costing_page(m.hbl) for m in SeaExportContainerConsolShipmentAllocatedContainerToHBLMap.objects.filter(
            shipment_to_container_map__container_consol_shipment=consol)],
        'job_costing_list': [{
            'id': c.id,
            'charge_type_id': c.charge_type_id,
            'charge_type_name': c.charge_type.name,
            'value': c.amount,
            'currency_id': c.currency_id,
            'currency_conversion_rate_id': c.currency_conversion_id,
            'hbl_public_id': c.hbl.public_id if c.hbl else '',
            'is_unit_cost': c.is_unit_cost,
        } for c in SeaExportContainerConsolidationJobCosting.objects.filter(container_consol=consol)]
    }
