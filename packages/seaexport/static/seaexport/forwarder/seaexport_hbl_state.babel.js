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

function allocated_container_info_dict(allocation_id, container_type_id, container_serial, container_number) {
    return {
        allocation_id: allocation_id,//container type id
        container_type_id: container_type_id,
        container_serial: container_serial,
        container_number: container_number,

        form_errors: {},
        errors: [],
    };
}


function hbl_form_state() {
    return {
        cache: {
            supplier_list: [],
            confirmed_bookings_without_bl: [],
            forwarder_default_address: null,
            city_list: [],
            country_list: [],
            seaport_list: [],
            container_type_list: [],
        },

        errors: [],
        form_errors: {},
        msg: [],

        hbl_public_id: '',

        booking_applies: false,

        booking_public_id: '',

        supplier_public_id: '',

        shipper: addressbook_state_tpl(),
        consignee: addressbook_state_tpl(),

        agent: addressbook_state_tpl(),

        city_id_of_receipt: '',
        port_id_of_loading: '',
        feeder_vessel_name: '',
        voyage_number: '',
        mother_vessel_name: '',
        mother_vessel_voyage_number: '',
        port_id_of_discharge: '',
        city_id_of_final_destination: '',
        excess_value_declaration: '',

        goods_no_of_packages: '',
        goods_gross_weight_kg: '',
        goods_cbm: 0,
        goods_note: '',

        no_of_pallet: 0,
        lot_number: 0,

        container_list: [],

        other_notes: '',

        issue_city_id: '',
        issue_date: ''

    };
}