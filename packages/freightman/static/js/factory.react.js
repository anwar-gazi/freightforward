function Required() {
    return <i className="text-danger small">*</i>;
}

class FactoryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            country_list: [],
            city_list: [],
            auth_level_list: [],
            show_user_add_form: false,
            show_shipper_add_form: true,
            formdata: { // company form
                save_processing: false,
                error_msg: '',
                msg: '',
                field_errors: {},

                id: null,
                address_id: null,
                has_default_address: false,

                prefix: '',

                //default address

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
            },
            user_formdata: {
                save_processing: false,
                error_msg: '',
                msg: '',
                field_errors: {},

                shipper_id: null,

                id: null,

                username: '',
                firstname: '',
                lastname: '',
                email: '',
                password: '',

                auth_level_id: ''
            }
        };

        window.org_management_context = this;

        this.load_data(props.public_id);
    }

    // initial page data
    load_data = (public_id) => {
        const _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_orgmanage_init_data,
            data: {org_public_id: public_id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    country_list: resp.data.country_list,
                    city_list: resp.data.city_list,
                    formdata: Object.assign(_this.state.formdata, resp.data.org_dict)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
            }
        });
    };

    expand_shipper_form = (event) => {
        this.setState({show_shipper_add_form: true});
    };
    minimize_shipper_form = (event) => {
        this.setState({show_shipper_add_form: false});
    };

    minimize_user_form = (event) => {
        this.setState({show_user_add_form: false});
    };
    expand_user_form = (event) => {
        this.setState({show_user_add_form: true});
        this.minimize_shipper_form(event);
    };

    toggle_shipper_form = (event) => {
        if (this.state.show_shipper_add_form) {
            this.minimize_shipper_form(event);
        } else {
            this.expand_shipper_form(event);
        }
    };
    toggle_user_form = (event) => {
        if (this.state.show_user_add_form) {
            this.minimize_user_form(event);
        } else {
            this.expand_user_form(event);
        }
    };

    onchange_companyprefix = (event) => {
        let formdata = this.state.formdata;
        formdata.prefix = event.target.value.trim();
        this.setState({
            formdata: formdata
        });
    };

    onchange_companyname = (event) => {
        let formdata = this.state.formdata;
        formdata.company_name = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_address = (event) => {
        let formdata = this.state.formdata;
        formdata.address = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_postcode = (event) => {
        let formdata = this.state.formdata;
        formdata.postcode = event.target.value.trim();
        this.setState({
            formdata: formdata
        });
    };
    onchange_city = (event) => {
        let formdata = this.state.formdata;
        formdata.city = event.target.value.trim();
        this.setState({
            formdata: formdata
        });
    };
    onchange_state = (event) => {
        let formdata = this.state.formdata;
        formdata.state = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_country = (event) => {
        let formdata = this.state.formdata;
        formdata.country = event.target.value.trim();
        this.setState({
            formdata: formdata
        });
    };
    onchange_contact = (event) => {
        let formdata = this.state.formdata;
        formdata.contact = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_tel_num = (event) => {
        let formdata = this.state.formdata;
        formdata.tel_num = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_mobile_num = (event) => {
        let formdata = this.state.formdata;
        formdata.mobile_num = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_fax_num = (event) => {
        let formdata = this.state.formdata;
        formdata.fax_num = event.target.value;
        this.setState({
            formdata: formdata
        });
    };
    onchange_email = (event) => {
        let formdata = this.state.formdata;
        formdata.email = event.target.value.trim();
        this.setState({
            formdata: formdata
        });
    };
    onsavebuttonclick = (event) => {
        let _this = this;

        this.setState({
            formdata: (function () {
                let formdata = {..._this.state.formdata};
                formdata.save_processing = true;
                return formdata;
            }())
        });
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_register_shipper,
            data: _this.state.formdata,
            dataType: 'json',
            success: function (resp) {
                let formdata = _this.state.formdata;
                formdata.error_msg = resp.error;
                formdata.field_errors = resp.errors;
                formdata.msg = resp.msg;
                formdata.save_processing = false;
                if (resp.success) {
                    formdata.id = resp.data.shipper_id;
                    formdata.address_id = resp.data.address_id;
                }
                _this.setState({
                    formdata: formdata,
                    auth_level_list: resp.data.auth_levels
                });


                let userformdata = _this.state.user_formdata;
                if (resp.success) {
                    userformdata.shipper_id = resp.data.shipper_id;
                }
                _this.setState({
                    user_formdata: userformdata
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occured! {}'.format(textStatus, errorThrown);
                let formdata = _this.state.formdata;
                formdata.error_msg = err;
                formdata.save_processing = false;
                _this.setState({
                    formdata: formdata
                });
            }
        });
    };


    onchange_user_username = (event) => {
        let formdata = this.state.user_formdata;
        formdata.username = event.target.value.trim();
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_fname = (event) => {
        let formdata = this.state.user_formdata;
        formdata.firstname = event.target.value.trim();
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_lname = (event) => {
        let formdata = this.state.user_formdata;
        formdata.lastname = event.target.value.trim();
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_email = (event) => {
        let formdata = this.state.user_formdata;
        formdata.email = event.target.value.trim();
        formdata.shipper_id = this.state.formdata.id;
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_password = (event) => {
        let formdata = this.state.user_formdata;
        formdata.password = event.target.value.trim();
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_auth_level_id = (event) => {
        let formdata = this.state.user_formdata;
        formdata.auth_level_id = event.target.value;
        this.setState({
            user_formdata: formdata
        });
    };
    onusersavebuttonclick = (event) => {
        if (!this.state.formdata.id) {
            alert('Error: Shipper registration not complete');
            return false;
        }
        let _this = this;

        this.setState({
            user_formdata: (function () {
                let formdata = {..._this.state.user_formdata};
                formdata.save_processing = true;
                return formdata;
            }())
        });
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_register_shipper_user,
            data: _this.state.user_formdata,
            dataType: 'json',
            success: function (resp) {
                let formdata = _this.state.user_formdata;
                formdata.error_msg = resp.error;
                formdata.field_errors = resp.errors;
                formdata.msg = resp.msg;
                formdata.save_processing = false;
                formdata.id = resp.data.user_id;
                _this.setState({
                    user_formdata: formdata,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occured! {}'.format(textStatus, errorThrown);
                let formdata = _this.state.user_formdata;
                formdata.error_msg = err;
                formdata.save_processing = false;
                _this.setState({
                    user_formdata: formdata
                });
            }
        });
    };

    render() {
        let _this = this;
        return <div className="container">
            <div className="text-center py-4 bg-success">
                <h2 className="">{_this.state.formdata.id ? 'View/Edit: {}'.format(_this.state.formdata.company_name) : 'Supplier Registration'}</h2>
            </div>
            <ShipperForm context={_this} minimize={!this.state.show_shipper_add_form}/></div>;
    }
}