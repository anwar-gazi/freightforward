from seaexport.models import SeaExportMBL, SeaExportMBLToHBLMap
from seaexport.dictbuilder.hbl import hbl_dict, addressbook_dict


def mbl_dict_for_frontend(request, mbl: SeaExportMBL):
    return {
        'public_id': mbl.public_id,
        'mbl_public_id': mbl.public_id,
        'mbl_number': mbl.mbl_number,

        'hbl_list': [hbl_dict(request, m.hbl) for m in SeaExportMBLToHBLMap.objects.filter(mbl=mbl)],

        'shipper': addressbook_dict(mbl.shipper_addressbook),
        'consignee': addressbook_dict(mbl.consignee_addressbook),

        'city_id_of_receipt': mbl.city_of_receipt_id,
        'port_id_of_loading': mbl.port_of_loading_id,
        'feeder_vessel_name': mbl.feeder_vessel_name,
        'voyage_number': mbl.voyage_number,
        'mother_vessel_name': mbl.mother_vessel_name,
        'mother_vessel_voyage_number': mbl.mother_vessel_voyage_number,
        'port_id_of_discharge': mbl.port_of_discharge_id,
        'city_id_of_final_destination': mbl.city_of_final_destination_id,

        'goods_no_of_packages': mbl.goods_no_of_packages,
        'goods_gross_weight_kg': mbl.goods_gross_weight_kg,
        'goods_cbm': mbl.goods_cbm,

        'issue_city_id': mbl.issue_city_id,
        'issue_date': mbl.issue_date
    }
