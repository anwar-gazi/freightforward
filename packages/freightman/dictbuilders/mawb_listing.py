from freightman.models import MAWB, AirExportConsolidatedShipment
from django.shortcuts import reverse


def mawb_dict_for_mawb_listing_page(mawb: MAWB):
    return {
        'public_id': mawb.public_id,
        'mawb_number': mawb.mawb_number,
        'is_consolidated': AirExportConsolidatedShipment.objects.filter(mawb=mawb).exists(),
        'shipper_name': mawb.shipper.company_name,
        'consignee_name': mawb.consignee.company_name,
        'cargo_manifest_url': reverse('forwarder-mawb_cargo_manifest', args=(mawb.public_id,)),
        'edit_url': reverse('airexport:mawb_edit_page', args=(mawb.public_id,)),
        'copy_url': reverse('airexport:mawb_copy_page', args=(mawb.public_id,)),
        'delete_url': reverse('airexport:mawb_delete', args=(mawb.public_id,)),
    }
