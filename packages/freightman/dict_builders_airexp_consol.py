from .models import AirExportConsolidatedShipment, AirExportConsolidatedShipmentJobCosting, AirExportConsolHouseMap, HAWB


def hawb_dict_for_job_costing_page(hawb: HAWB):
    return {
        'public_id': hawb.public_id,
        'shipper_company_name': hawb.shipper.company_name,
        'consignee_company_name': hawb.consignee.company_name
    }


def airexp_consol_dict_for_job_costing_page(air_exp_consolidation_id: int):
    consolshpt = AirExportConsolidatedShipment.objects.get(id=air_exp_consolidation_id)
    return {
        'id': consolshpt.id,
        'public_id': consolshpt.public_id,
        'mawb_public_id': consolshpt.mawb.public_id,
        'hawb_list': [hawb_dict_for_job_costing_page(m.hawb) for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment=consolshpt)],
        'job_costing_list': [{
            'uniqid': c.id,
            'charge_type_id': c.charge_type_id,
            'charge_type_name': c.charge_type.name,
            'value': c.value,
            'currency_id': c.currency_id,
            'currency_conversion_rate_id': c.currency_conversion_id,
            'is_shipment_cost': c.is_shipment_cost,
            'charge_applies_to_hawb': c.charge_applies_to_hawb,
            'for_specific_hawb': c.for_specific_hawb,
            'hawb_public_id': c.hawb.public_id if c.hawb else '',
            'is_unit_cost': c.is_unit_cost,
        } for c in AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=consolshpt)]
    }
