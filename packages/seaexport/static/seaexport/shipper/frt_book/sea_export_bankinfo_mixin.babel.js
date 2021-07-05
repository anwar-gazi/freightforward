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