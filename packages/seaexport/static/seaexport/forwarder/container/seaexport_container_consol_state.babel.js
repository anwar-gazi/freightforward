function container_info_dict(allocated_container_id, container_type_id, container_serial, container_number, fcl_or_lcl) {
    return {
        allocated_container_id: allocated_container_id,
        container_type_id: container_type_id,
        container_serial: container_serial,
        container_number: container_number,

        fcl_or_lcl: fcl_or_lcl,

        hbl_list: [],

        form_errors: {},
        errors: [],
    };
}

function addressbook_state_tpl() {
    return {
        msg: [],
        form_errors: {},
        errors: [],

        data: {
            id: null,

            company_name: '',
            address: '',
            postcode: '',
            city: '',
            state: '',
            country: '',
            contact: '',
            tel_num: '',
            mobile_num: '',
            fax_num: '',
            email: '',

            reference: '',
            account_number: ''
        }
    };
}


function container_consolidation_form_state() {
    return {
        cache: {
            supplier_list: [],
            shipper_addressbook_list: [],
            consignee_addressbook_list: [],
            city_list: [],
            country_list: [],
            seaport_list: [],
            unassigned_hbl_list: [],
            container_type_list: []
        },

        errors: [],
        form_errors: {},
        msg: [],

        consol_public_id: '',

        mbl_number: '',

        supplier_public_id: '',

        shipper: addressbook_state_tpl('shipper'),
        consignee: addressbook_state_tpl('consignee'),

        feeder_vessel_name: '',
        feeder_vessel_voyage_number: '',
        feeder_departure_city_id: '',
        feeder_arrival_city_id: '',
        feeder_etd: '',
        feeder_eta: '',

        mother_vessel_name: '',
        mother_vessel_voyage_number: '',
        mother_departure_city_id: '',
        mother_arrival_city_id: '',
        mother_etd: '',
        mother_eta: '',

        city_id_of_receipt: '',
        port_id_of_loading: '',
        port_id_of_discharge: '',
        city_id_of_final_destination: '',

        container_list: [],

        goods_gross_weight_kg: '',
        goods_cbm: '',
    };
}