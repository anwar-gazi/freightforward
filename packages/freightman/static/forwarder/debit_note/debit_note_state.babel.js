function charge_dict(id, charge_type_id, is_unit_cost, is_for_hawb, fixed_or_unit_amount) {
    return {
        charge_type_id: charge_type_id,
        is_unit_cost: is_unit_cost,
        fixed_or_unit_amount: parseFloat(fixed_or_unit_amount),

        errors: [],
        form_errors: {}
    };
}

function debitnote_state() {
    return {
        errors: [],
        form_errors: {},
        msg: [],

        cache: {
            mawb_list: [],
            currency_list: [],
            charge_type_list: []
        },

        print_preview: false,

        debitnote_public_id: '',

        currency: {
            id: null,
            code: null
        },
        currency_conversion: {
            from_currency_id: '',
            to_currency_id: '',
            rate: 0,
        },

        to_who: '',

        to_address_dict: {
            company_name: '',
            address: '',
            postcode: '',
            city: '',
            state: '',
            country: '',
        },
        date: '',

        mawb: {
            public_id: '',
            mawb_number: '',

            is_consolidated: '',
            consolidation_public_id: '',

            chargable_weight: 0,
            weight_unit: '',

            goods_commodityitemno: '',
            destination: '',
            no_of_packages: '',
            package_type_code: '',
        },

        hawb: {
            public_id: '',
            chargable_weight: 0,
            weight_unit: ''
        },

        charges_list: [],

        //user input custom
        custom_hawb_id: '',
        custom_mawb_id: '',
        custom_destination: '',
        custom_commodity_code: '',
        total_amount_repr: ''
    };
}