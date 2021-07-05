function Required() {
    return <i className="text-danger small">*</i>;
}

class UserAddForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auth_level_list: [],
            selected_org_id: props.org_id,
            selected_user_id: props.user_id,
            organization: {
                id: '',
                title: '',
                type: ''
            },
            user_formdata: {
                save_processing: false,
                error_msg: '',
                msg: '',
                field_errors: {},

                id: null,

                username: '',
                firstname: '',
                lastname: '',
                email: '',
                password: '',

                auth_level_name: '',

                password_reset_url: ''
            }
        };

        window.usermanagenent_context = this;

        this.load_data();
    }

    // initial page data
    load_data = () => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_init_data,
            data: {org_id: _this.state.selected_org_id, user_id: _this.state.selected_user_id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    auth_level_list: resp.data.auth_levels,
                    organization: resp.data.organization,
                    user_formdata: Object.assign(_this.state.user_formdata, resp.data.user)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
            }
        });
    };
    onchange_user_fname = (event) => {
        let formdata = this.state.user_formdata;
        formdata.firstname = event.target.value;
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_lname = (event) => {
        let formdata = this.state.user_formdata;
        formdata.lastname = event.target.value;
        this.setState({
            user_formdata: formdata
        });
    };
    onchange_user_email = (event) => {
        let formdata = this.state.user_formdata;
        formdata.email = event.target.value.trim();
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
        formdata.auth_level_name = event.target.value;
        this.setState({
            user_formdata: formdata
        });
    };
    onusersavebuttonclick = (event) => {
        let _this = this;

        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader.append_html(spinner);

        this.setState({
            user_formdata: (function () {
                let formdata = {..._this.state.user_formdata};
                formdata.save_processing = true;
                return formdata;
            }())
        });
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_register_forwarder_user,
            data: {
                id: _this.state.user_formdata.id,

                username: _this.state.user_formdata.username,
                firstname: _this.state.user_formdata.firstname,
                lastname: _this.state.user_formdata.lastname,
                email: _this.state.user_formdata.email,
                password: _this.state.user_formdata.password,

                auth_level_name: _this.state.user_formdata.auth_level_name,

                org_id: _this.state.organization.id
            },
            dataType: 'json',
            success: function (resp) {
                let formdata = _this.state.user_formdata;
                formdata.error_msg = resp.error;
                formdata.field_errors = resp.errors;
                formdata.msg = resp.msg;
                formdata.save_processing = false;
                if (resp.success) {
                    formdata.id = resp.data.user_id;
                    loader.append_html('<div class="text-success">Success</div>')
                } else {
                    loader.append_html('<div class="text-danger">Error: Please check input</div>')
                }

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
                loader.append_html('<div class="text-danger">' + err + '</div>')
            }, complete: function (jaXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    render() {
        let _this = this;
        return <ForwarderUserForm context={_this}/>;
    }
}

