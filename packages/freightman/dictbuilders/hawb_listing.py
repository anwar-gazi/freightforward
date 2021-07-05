from freightman.models import HAWB, AirExportConsolidatedShipment, AirExportConsolHouseMap
from django.shortcuts import reverse
from django.conf import settings


def hawb_dict_for_hawb_listing_page(hawb: HAWB):
    return {
        'public_id': hawb.public_id,
        'is_consolidated': AirExportConsolHouseMap.objects.filter(hawb=hawb).exists(),
        'shipper_name': hawb.shipper.company_name,
        'consignee_name': hawb.consignee.company_name,
        'edit_url': reverse('airexport:hawb_edit_page', args=(hawb.public_id,)),
        'copy_url': reverse('airexport:hawb_copy_page', args=(hawb.public_id,)),
        'delete_url': reverse('airexport:hawb_delete', args=(hawb.public_id,)),
        'dummy_print_url': reverse('airexport:hawb_dummy_print_preview_page', args=(hawb.public_id,)),
        'main_print_url': reverse('airexport:hawb_print_preview_page', args=(hawb.public_id,)),
        'executed_on': hawb.executed_on_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN),
        'entry_at': hawb.entry_at.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN),
    }
