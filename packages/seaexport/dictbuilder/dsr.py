from seaexport.models import SeaExportHBL
from django.conf import settings


def dsr_dict(hbl: SeaExportHBL):
    return {
        'job_id': hbl.public_id,
        'supplier': hbl.supplier.title,
        'consignee': hbl.consignee_addressbook.company_name,
        'po_number': '',
        'weight': hbl.goods_gross_weight_kg,
        'volume_cbm': hbl.goods_cbm,
        'destination': hbl.city_of_final_destination.name,
        'status': '',
        'estimated_receive_date': hbl.received_at_estimated.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if hbl.received_at_estimated else '',
        'actual_receive_date': hbl.received_at_actual.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN) if hbl.received_at_actual else '',
    }
