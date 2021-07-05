from freightman.models import HAWB, MAWB


def hawb_dict_for_consolidation_page(hawb: HAWB):
    return {
        'public_id': hawb.public_id,
        'shipper_company_name': hawb.shipper.company_name,
        'consignee_company_name': hawb.consignee.company_name
    }


def mawb_dict_for_consolidation_page(mawb: MAWB):
    return {
        'public_id': mawb.public_id,
        'shipper_company_name': mawb.shipper.company_name,
        'consignee_company_name': mawb.consignee.company_name
    }
