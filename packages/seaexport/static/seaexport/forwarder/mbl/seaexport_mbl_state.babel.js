function addressbook_state_tpl(address_type, is_additional) {
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


function mbl_form_state() {
    return {
        cache: {
            forwarder_default_address: null,
            city_list: [],
            country_list: [],
            seaport_list: [],
            unassigned_hbl_list: [],
            container_list: []
        },

        errors: [],
        form_errors: {},
        msg: [],

        mbl_public_id: '',
        mbl_number: '',

        hbl_list: [],

        shipper: addressbook_state_tpl('shipper'),
        consignee: addressbook_state_tpl('consignee'),

        city_id_of_receipt: '',
        port_id_of_loading: '',
        feeder_vessel_name: '',
        voyage_number: '',
        mother_vessel_name: '',
        mother_vessel_voyage_number: '',
        port_id_of_discharge: '',
        city_id_of_final_destination: '',

        goods_no_of_packages: '',
        goods_gross_weight_kg: '',
        goods_cbm: 0,

        issue_city_id: '',
        issue_date: ''
    };
}