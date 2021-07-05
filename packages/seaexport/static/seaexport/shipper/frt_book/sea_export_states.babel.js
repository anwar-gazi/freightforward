function addressbook_state_tpl(address_type, is_additional) {
    return {
        field_errors: {},
        misc_errors: [],

        field_warns: {},

        booking_notify: false,

        is_additional_address: is_additional,

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

            address_type: address_type
        }
    };
}

function goods_info_state_tpl(refs_list) {
    return {
        id: '',

        no_of_pieces: '',
        package_type: '',
        weight_kg: '',
        volumetric_weight: '',
        chargable_weight: '',
        cbm: '',
        length_cm: '',
        width_cm: '',
        height_cm: '',
        quantity: '',
        unit_price: '',
        currency: '',
        shipping_mark: '',
        goods_desc: '',

        references: refs_list,

        errors: [],
        formerrors: {},
    };
}

function goods_references_state_tpl(ref_type_id, ref_number) {
    return {
        ref_type_id: ref_type_id,
        ref_number: ref_number,

        errors: [],
        formerrors: {},
    };
}

function bank_branch_state_tpl(leg, use) {
    return {
        use: use,

        field_errors: {},
        misc_errors: [],
        field_warns: {},

        data: {
            branch_id: '',

            bank_name: '',
            branch_name: '',
            branch_address: '',

            leg: leg,
        }
    };
}

function stakeholder_ref_state_tpl() {
    return {
        ref_type_id: '',
        ref_number: '',

        errors: [],
        formerrors: {},
    };
}

function init_data_loader() {

}


function sea_export_form_state() {
    return {
        cache: {
            forwarder: {},
            supplier_list: [],
            currency_list: [],
            transport_agreement_list: [],
            country_list: [],
            city_list: [],
            address_list: [],
            bank_branch_list: [],
            sea_port_list: [],
            tod_list: [],
            bank_list: [],
            package_type_list: [],
            payment_type_list: [],
            goods_ref_type_list: [],
            stakeholder_ref_type_list: []
        },
        uplaodedfile_url_list: [],

        booking_public_id: '',

        supplier: {},

        process_running: false,

        msg: [],
        errors: [],
        form_errors: {},

        is_draft: false,
        is_booking_confirm: false,

        addressbook_list: [addressbook_state_tpl('shipper'), addressbook_state_tpl('consignee')],

        bank_branch_list: [bank_branch_state_tpl('origin'), bank_branch_state_tpl('destination')],

        // shipping service data
        shipping_service: '',

        port_of_dest: '',
        port_of_load: '',
        terms_of_deliv: '',
        country_of_dest: '',

        goods_list: [goods_info_state_tpl([]), goods_info_state_tpl([]), goods_info_state_tpl([])],

        stakeholder_ref_list: [stakeholder_ref_state_tpl(), stakeholder_ref_state_tpl(), stakeholder_ref_state_tpl(), stakeholder_ref_state_tpl()],

        // order notes
        frt_payment_ins: '',
        frt_transport_agreement_id: '',
        frt_delivery_instruction: '',

        pickup_date: '',
        pickup_earliest_time: '',
        pickup_latest_time: '',
        pickup_ins: '',
    };
}