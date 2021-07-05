from freightman.models import AirExportConsolidatedShipment, AirExportConsolHouseMap


def consol_shipment_dict_for_listing(shipment: AirExportConsolidatedShipment):
    return {
        'public_id': shipment.public_id,
        'mawb_public_id': shipment.mawb.public_id,
        'mawb_number': shipment.mawb.mawb_number,
        'hawb_public_id_list': [m.hawb.public_id for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment=shipment)],
        'created_at': shipment.created_at
    }
