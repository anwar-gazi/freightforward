from freightman.models import MAWB, Airwaybill, AirExportConsolidatedShipment, AirExportConsolHouseMap
from .public_id_helpers import type_1_public_id_to_model_id


def mawb_ref_number_to_awb_serial(ref_number: str):
    return ref_number[-11:]


def mawb_public_id_to_mawb_id(public_id: str):
    return type_1_public_id_to_model_id(public_id)


def mawb_consolidated_hawb_list(mawb: MAWB):
    consq = AirExportConsolidatedShipment.objects.filter(mawb=mawb)
    if consq.exists():
        conshpt = AirExportConsolidatedShipment.objects.get(mawb=mawb)
        return [m.hawb for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment=conshpt)]
    else:
        return []


def mawb_is_consolidated(mawb: MAWB):
    return AirExportConsolidatedShipment.objects.filter(mawb=mawb).exists()
