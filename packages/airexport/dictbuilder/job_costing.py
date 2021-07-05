from freightman.models import MAWB, AirExportConsolidatedShipment, AirExportConsolidatedShipmentJobCosting
from django.shortcuts import reverse


def mawb_dict_for_cost_listing(mawb: MAWB):
    return {
        'public_id': mawb.public_id,
        'mawb_number': mawb.mawb_number,
        'is_consolidated': AirExportConsolidatedShipment.objects.filter(mawb=mawb).exists(),
        'has_job_costing': AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment__mawb=mawb).exists(),
        'load_url': reverse('load_job_costing', args=(mawb.public_id,)),
    }


def consol_dict_for_job_cost_listing(consol: AirExportConsolidatedShipment):
    return {
        'public_id': consol.public_id,
        'has_job_costing': AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=consol).exists(),
        'load_url': reverse('load_job_costing', args=(consol.public_id,)),
    }
