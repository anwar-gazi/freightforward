function BankInfoInput(props) {
    return <div>
        <div className="sub_title"></div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-labels">Select existing bank info from database</label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.onchange_bank_selection_setstate_fill_fields(props.identifier)} name="branch_id">
                    <option value="">--</option>
                    {props.context.state.bank_list.map(branch => <option key={branch.id} value={branch.id}>{branch.bank.bank_name}: {branch.branch_name}</option>)}
                </select>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">bank name<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" onChange={props.context.bankinfo_onchange_bankname(props.identifier)}
                       value={props.context.state[props.identifier].data.bank_name || ''}/>

                {props.context.state[props.identifier].field_errors.hasOwnProperty('bank_name') ?
                    <div className="text-danger small">{props.context.state[props.identifier].field_errors.bank_name}</div> : ''}

                {props.context.state[props.identifier].field_warns.hasOwnProperty('bank_name') ?
                    <div className="text-warning small">{props.context.state[props.identifier].field_warns.bank_name}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">branch<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" onChange={props.context.bankinfo_onchange_branch(props.identifier)}
                       value={props.context.state[props.identifier].data.branch_name || ''}/>

                {props.context.state[props.identifier].field_errors.hasOwnProperty('branch_name') ?
                    <div className="text-danger small">{props.context.state[props.identifier].field_errors.branch_name}</div> : ''}

                {props.context.state[props.identifier].field_warns.hasOwnProperty('branch_name') ?
                    <div className="text-warning small">{props.context.state[props.identifier].field_warns.branch_name}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" onChange={props.context.bankinfo_onchange_address(props.identifier)}
                          value={props.context.state[props.identifier].data.branch_address || ''}></textarea>

                {props.context.state[props.identifier].field_errors.hasOwnProperty('branch_address') ?
                    <div className="text-danger small">{props.context.state[props.identifier].field_errors.branch_address}</div> : ''}

                {props.context.state[props.identifier].field_warns.hasOwnProperty('branch_address') ?
                    <div className="text-warning small">{props.context.state[props.identifier].field_warns.branch_address}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label mr-2">notify<Required/>
                {props.context.state[props.identifier].booking_notify ? <i className="fa fa-check-double small ml-2"> yes</i> : <i className="fa fa-times small ml-2"> no</i>}
            </label>
        </div>
        <div className="form-check">
            {props.context.state[props.identifier].msg.map((msg) => {
                return <div className="text-success small" key={msg}>{msg}</div>
            })}
            {props.context.state[props.identifier].misc_errors.map((errmsg) => {
                return <div className="text-danger small" key={errmsg}>{errmsg}</div>
            })}
            {props.context.state[props.identifier].field_errors.hasOwnProperty('booking_id') ?
                <div className="text-danger small">booking_id: {props.context.state[props.identifier].field_errors.booking_id}</div> : ''}
            {props.context.state[props.identifier].field_errors.hasOwnProperty('branch_id') ?
                <div className="text-danger small">branch_id: {props.context.state[props.identifier].field_errors.branch_id}</div> : ''}
            {props.context.state[props.identifier].field_errors.hasOwnProperty('in_origin_leg') ?
                <div className="text-danger small">in_origin_leg: {props.context.state[props.identifier].field_errors.in_origin_leg}</div> : ''}
            {props.context.state[props.identifier].field_errors.hasOwnProperty('in_destination_leg') ?
                <div className="text-danger small">in_destination_leg: {props.context.state[props.identifier].field_errors.in_destination_leg}</div> : ''}
            {props.context.state[props.identifier].field_errors.hasOwnProperty('notify') ?
                <div className="text-danger small">notify: {props.context.state[props.identifier].field_errors.notify}</div> : ''}
            <div className="btn-group">
                {props.context.state[props.identifier].save_processing ?
                    <span className="margin-left-10p"><i className="fa fa-spinner fa-spin"></i> processing</span> : ''}
            </div>
        </div>
    </div>;
}

function BankInfoMixin(parent) {
    let _this = parent;

    parent.toggle_bank_info = (key) => () => {
        _this.setState({
            [key]: (function () {
                let bank_info = _this.state[key];
                bank_info.use = !bank_info.use;
                return bank_info;
            }())
        });
    };
    parent.onchange_bank_selection_setstate_fill_fields = (key) => (event) => {
        let data = {
            branch_id: '',
            bank_name: '',
            branch_name: '',
            branch_address: ''
        };
        let selected_branch_id = event.target.value;
        if (selected_branch_id) {
            let selected_branch_data = _this.state.bank_list.filter(branch => branch.id == selected_branch_id)[0];
            data.branch_id = selected_branch_data.id;
            data.bank_name = selected_branch_data.bank.bank_name;
            data.branch_name = selected_branch_data.branch_name;
            data.branch_address = selected_branch_data.branch_address;
        }
        _this.setState({
            [key]: (function () {
                let bank_info = _this.state[key];
                bank_info.data.branch_id = data.branch_id;
                bank_info.data.bank_name = data.bank_name;
                bank_info.data.branch_name = data.branch_name;
                bank_info.data.branch_address = data.branch_address;

                bank_info.saved = false;
                bank_info.msg = [];
                bank_info.field_errors = {};
                bank_info.misc_errors = [];

                bank_info.field_warns = {};

                return bank_info;
            }())
        });
    };
    parent.bankinfo_onchange_bankname = (key) => (event) => {
        _this.setState({
            [key]: (function () {
                let bank_info = _this.state[key];
                bank_info.data.bank_name = event.target.value;
                if (bank_info.data.branch_id) {
                    bank_info.field_warns['bank_name'] = 'changes will update the related bank database';
                }
                return bank_info;
            }())
        });
    };
    parent.bankinfo_onchange_branch = (key) => (event) => {
        _this.setState({
            [key]: (function () {
                let bank_info = _this.state[key];
                bank_info.data.branch_name = event.target.value;
                if (bank_info.data.branch_id) {
                    bank_info.field_warns['branch_name'] = 'changes will update the related bank database';
                }
                return bank_info;
            }())
        });
    };
    parent.bankinfo_onchange_address = (key) => (event) => {
        _this.setState({
            [key]: (function () {
                let bank_info = _this.state[key];
                bank_info.data.branch_address = event.target.value;
                if (bank_info.data.branch_id) {
                    bank_info.field_warns['branch_address'] = 'changes will update the related bank database';
                }
                return bank_info;
            }())
        });
    };

    parent.save_bankinfo = (key, onsuccess, onfail) => {
        _this.setState({
            [key]: (function () {
                let bankinfo = _this.state[key];
                bankinfo.save_processing = true;
                return bankinfo;
            }())
        });
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_save_bank_info,
            data: {
                booking_id: _this.state.booking_id,
                branch_id: _this.state[key].data.branch_id,
                in_origin_leg: key == 'origin_bank',
                in_destination_leg: key == 'destination_bank',
                bank_name: _this.state[key].data.bank_name,
                branch_name: _this.state[key].data.branch_name,
                branch_address: _this.state[key].data.branch_address,
                notify: _this.state[key].data.notify
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    [key]: (function () {
                        let info = _this.state[key];
                        info.saved = resp.success;
                        info.data.branch_id = resp.data.branch_id;
                        info.msg = resp.msg ? resp.msg : [];
                        info.field_errors = resp.form_errors ? resp.form_errors : {};
                        info.misc_errors = resp.misc_errors ? resp.misc_errors : [];
                        return info;
                    }())
                });
                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    [key]: (function () {
                        let bankinfo = _this.state[key];
                        bankinfo.misc_errors.push(err);
                        return bankinfo;
                    }())
                });
            },
            complete: function (jqXHR, textStatus) {
                _this.setState({
                    [key]: (function () {
                        let bankinfo = _this.state[key];
                        bankinfo.save_processing = false;
                        return bankinfo;
                    }())
                });
            }
        });
    };
}