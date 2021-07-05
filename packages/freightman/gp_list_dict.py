from freightman.models import Organization, AirExportConsolidatedShipment, AirExportConsolHouseMap, AirExportConsolidatedShipmentJobCosting, FreightBookingGoodsInfo
from .currency_helpers import get_default_currency, get_gp_listing_output_currency


def dict_for_gp_listing_table(factory_id: int):
    factory = Organization.objects.get(id=factory_id)

    default_currency = get_default_currency()

    output_currency = get_gp_listing_output_currency()

    factory_consolshpt_list = []
    factory_consolshpt_hawb_list = []
    for consolshpt in AirExportConsolidatedShipment.objects.all():
        for m in AirExportConsolHouseMap.objects.filter(consolidated_shipment=consolshpt):
            if m.hawb.booking.org_id == factory_id:
                factory_consolshpt_hawb_list.append(m.hawb)
                factory_consolshpt_list.append(consolshpt)
    factory_consolshpt_list = list(set(factory_consolshpt_list))

    revenue = 0
    cost = 0

    for consolshpt in factory_consolshpt_list:
        for costing in AirExportConsolidatedShipmentJobCosting.objects.filter(consolidated_shipment=consolshpt):
            if costing.is_shipment_cost:  # expenditure
                if costing.charge_applies_to_hawb:
                    if costing.for_specific_hawb:
                        if costing.is_unit_cost:
                            cost += costing.value_in_currency(output_currency.id) * costing.hawb.goods_chargableweight
                        else:
                            cost += costing.value_in_currency(output_currency.id)
                    else:  # per hawb
                        for hawb in factory_consolshpt_hawb_list:
                            if costing.is_unit_cost:
                                cost += costing.value_in_currency(output_currency.id) * hawb.goods_chargableweight
                            else:
                                cost += costing.value_in_currency(output_currency.id)
                else:  # cost applies MAWB?
                    if costing.is_unit_cost:
                        cost += costing.value_in_currency(output_currency.id) * costing.consolidated_shipment.mawb.goods_chargableweight
                    else:
                        cost += costing.value_in_currency(output_currency.id)

            else:  # revenue | house cost
                if costing.charge_applies_to_hawb:
                    if costing.for_specific_hawb:
                        if costing.is_unit_cost:
                            revenue += costing.value_in_currency(output_currency.id) * costing.hawb.goods_chargableweight
                        else:
                            revenue += costing.value_in_currency(output_currency.id)
                    else:  # per hawb
                        for hawb in factory_consolshpt_hawb_list:
                            if costing.is_unit_cost:
                                revenue += costing.value_in_currency(output_currency.id) * hawb.goods_chargableweight
                            else:
                                revenue += costing.value_in_currency(output_currency.id)
                else:  # fixed amount revenue only
                    revenue += costing.value_in_currency(output_currency.id)

    return {
        'factory_name': factory.title,
        'number_of_shipments': len(factory_consolshpt_hawb_list),
        'revenue': round(revenue, 2),
        'cost': round(cost, 2),
        'gross_profit': round(revenue - cost, 2),
        'currency': output_currency.dict(None)
    }
