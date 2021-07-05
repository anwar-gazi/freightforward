"use strict";


class CreditNote extends React.Component {
    constructor(props) {
        super(props);
        this.state = creditnote_state();
        if (props.public_id) {
            this.state.creditnote_public_id = props.public_id;
            // this.load_creditnote(this.state.creditnote_public_id);
        }
        window.creditnotereactelement = this;
        this.load_data();
        if (props.public_id) {
            this.load_creditnote(props.public_id);
        }
    }

    load_data = (onsuccess) => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_creditnotepage_init_data,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: Object.assign({}, resp.data),
                    date: window.today_date_for_dateinput()
                });
                if (onsuccess) {
                    onsuccess();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
            },
            complete: function (jqXHR, textStatus) {
            }
        });
    };

    load_creditnote = (creditnote_public_id) => {
        let _this = this;
        let spinner = jQuery('<div class=""><i class="fa fa-spinner fa-spin"></i> Loading credit note #' + creditnote_public_id + '</div>');
        let loader = window.modal_alert();
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_creditnote_info,
            data: {
                public_id: creditnote_public_id
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    loader.append_html('<div class="text-success">Load success</div>');
                    _this.setState({
                        creditnote_public_id: resp.data.creditnote_dict.public_id,
                        currency: Object.assign(_this.state.currency, resp.data.creditnote_dict.currency),
                        currency_conversion: Object.assign(_this.state.currency_conversion, resp.data.creditnote_dict.currency_conversion),
                        to_who: resp.data.creditnote_dict.to_who,
                        to_address_dict: Object.assign(_this.state.to_address_dict, resp.data.creditnote_dict.to_address_dict),
                        date: resp.data.creditnote_dict.date,
                        mawb: Object.assign(_this.state.mawb, resp.data.creditnote_dict.mawb),
                        hawb: Object.assign(_this.state.hawb, resp.data.creditnote_dict.hawb),
                        charges_list: resp.data.creditnote_dict.charges_list.map(charge => {
                            charge.errors = [];
                            charge.form_errors = {};
                            return charge;
                        })
                    });
                    loader.close();
                } else {
                    loader.append_html('<div class="text-danger">Cannot load</div>');
                    loader.append_html(resp.errors.map(err => '<div class="text-danger">' + err + '</div>').join(''));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">' + err + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    is_bill_to_mawb = () => {
        const _this = this;
        if (_this.state.to_who === 'master_consignee') {
            return true;
        } else {
            return false;
        }
    };

    set_field = (field_name, val) => {
        this.setState({
            [field_name]: val
        });
    };

    address_selection = (mawb_load_ajax_resp, callback) => {
        const _this = this;
        const resp = mawb_load_ajax_resp;
        let popup_content = jQuery('<div class="card">' +
            '<div class="card-header">' +
            '' +
            '<div>' +
            'Master Bill: ' + resp.data.mawb_dict.public_id + ' ' +
            (resp.data.mawb_dict.is_consolidated ? '<span class="badge badge-success small">consolidated</span>' : '<span class="badge badge-danger small">not' +
                ' consolidated</span>')
            + '</div>'
            + '</div>'
            + '<div class="card-body">' + '<div class="form-group">' + '<label class="radio_label_color">' + '<input type="radio" name="to_party" value="mawb_consignee"> MAWB consignee address ('
            + resp.data.mawb_dict.consignee_address_dict.company_name + ')' +
            '</label>' +
            '<div>' +
            '</div></div>'
            + resp.data.mawb_dict.hawb_list.map(hawb => {
                return '<div class="card">' +
                    '<div class="card-header font-weight-bold">HAWB: ' + hawb.public_id + '</div>' +
                    '<div class="card-body">' +
                    '<div class="form-group">' +
                    '<label class="radio_label_color">' +
                    '<input type="radio" name="to_party" value="hawb_shipper" data-hawb_public_id="' + hawb.public_id + '"> HAWB#' + hawb.public_id + ' shipper' +
                    ' address ('
                    + hawb.shipper_address_dict.company_name
                    + ')' +
                    '</label>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="radio_label_color">' +
                    '<input type="radio" name="to_party" value="hawb_supplier" ' +
                    ' data-hawb_public_id="' + hawb.public_id + '" '
                    + (hawb.supplier_address_exist ? '' : 'disabled')
                    + '>'
                    + ' HAWB#' + hawb.public_id + ' supplier default address' +
                    ' (' + hawb.supplier_name + ')' +
                    '</label>' +
                    (hawb.supplier_address_exist ? '' : '<div class="text-danger small">no default address in database</div>') +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }).join('')
            + '</div>' +
            '</div>');
        let address_radio_modal = window.modal_alert();
        address_radio_modal.set_header('<div class="text-center bg-success py-4"><h4>Bill To</h4></div>');
        address_radio_modal.append_html(popup_content);
        address_radio_modal.upon_ok = (modal) => {
            const radioelem = popup_content.find('[name="to_party"]:checked');
            const addresstype = radioelem.val();
            if (addresstype) {
                _this.setState({
                    to_who: addresstype,
                    mawb: (function () {
                        let mawb = _this.state.mawb;
                        mawb.public_id = resp.data.mawb_dict.public_id;
                        mawb.consolidation_public_id = resp.data.mawb_dict.consolidation_public_id;

                        mawb.chargable_weight = resp.data.mawb_dict.chargable_weight;
                        mawb.weight_unit = resp.data.mawb_dict.weight_unit;
                        mawb.mawb_number = resp.data.mawb_dict.mawb_number;
                        mawb.is_consolidated = resp.data.mawb_dict.is_consolidated;
                        mawb.goods_commodityitemno = resp.data.mawb_dict.goods_commodityitemno;
                        mawb.destination = resp.data.mawb_dict.destination;
                        mawb.no_of_packages = resp.data.mawb_dict.no_of_packages;
                        mawb.package_type_code = resp.data.mawb_dict.package_type_code;
                        return mawb;
                    }())
                });

                if (addresstype === 'mawb_consignee') {
                    _this.setState({
                        to_address_dict: resp.data.mawb_dict.consignee_address_dict,
                    });
                    _this.setState({ //clear any previous hawb
                        hawb: (function () {
                            let hawb = _this.state.hawb;
                            hawb.public_id = '';
                            hawb.chargable_weight = '';
                            hawb.weight_unit = '';
                            return hawb;
                        }())
                    });
                    address_radio_modal.hide();
                    if (callback) callback();
                } else if (addresstype == 'hawb_shipper' || addresstype == 'hawb_supplier') {
                    const hawb_public_id = radioelem.attr('data-hawb_public_id');
                    const hawbselected = resp.data.mawb_dict.hawb_list.filter(hawb => hawb.public_id == hawb_public_id)[0];
                    _this.setState({
                        hawb: (function () {
                            let hawb = _this.state.hawb;
                            hawb.public_id = hawbselected.public_id;
                            hawb.chargable_weight = hawbselected.chargable_weight;
                            hawb.weight_unit = hawbselected.weight_unit;
                            return hawb;
                        }())
                    });

                    if (addresstype == 'hawb_shipper') {
                        _this.setState({
                            to_address_dict: hawbselected.shipper_address_dict
                        });
                        address_radio_modal.hide();
                        if (callback) callback();
                    } else if (addresstype == 'hawb_supplier') {
                        if (hawbselected.supplier_address_exist) {
                            _this.setState({
                                to_address_dict: hawbselected.supplier_address_dict
                            });
                            address_radio_modal.hide();
                            if (callback) callback();
                        }
                    }
                }
            }
        };
    };

    load_mawb = (mawb_public_id, callback) => {
        let _this = this;
        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_mawb_info,
            data: {public_id: mawb_public_id},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    if (!resp.data.mawb_dict.is_consolidated) {
                        loader.append_html('<div class="text-danger">Not a consolidated shipment</div>');
                        return false;
                    }
                    if (resp.data.mawb_dict.has_creditnote) {
                        loader.append_html('<div class="text-warning">Credit note exists.</div>');
                        let creditnoteselection = jQuery('<div class="form-group"><label>Select a credit not to load</label><select class="form-control"><option' +
                            ' value="">--</option>' + resp.data.mawb_dict.creditnote_list.map(info => '<option value="' + info.public_id + '">#' + info.public_id + ' ' + info.to_who + '</option>').join('') + '</select></div><div class="form-group"><button type="button">or create another credit note</button></div>');
                        loader.append_html(creditnoteselection);
                        loader.upon_ok = function () {
                            const public_id = creditnoteselection.find('select').val();
                            if (public_id) {
                                loader.close();
                                _this.load_creditnote(public_id);
                            } else {
                                loader.set_footer_msg('<div class="text-danger">Please select</div>');
                            }
                        };
                        creditnoteselection.find('button').click(function (event) {
                            loader.close();
                            _this.address_selection(resp, callback);
                        });
                        return false;
                    }
                    loader.hide();
                    _this.address_selection(resp, callback);
                } else {
                    loader.append_html(resp.errors.map(err => '<div class="text-danger">' + err + '</div>').join(''));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">' + err + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    currency_selection = (on_selection) => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#currency_selection_tpl').html());
        form.find('.currency_selection').html(_this.state.cache.currency_list.map(curr => '<option value="' + curr.id + '">' + curr.code + '</option>'));
        modal.append_html(form);
        modal.set_header('<div class="text-center bg-success py-4"><h4>Select Currency</h4></div>');
        modal.upon_ok = function () {
            const currency_id = form.find('.currency_selection').val();
            if (currency_id) {
                const currency = _this.state.cache.currency_list.filter(curr => curr.id == currency_id)[0];
                _this.setState({
                    currency: {
                        id: currency.id,
                        code: currency.code
                    }
                });
                if (on_selection) {
                    on_selection();
                }
                return true;
            } else {
                modal.set_footer_msg('<div class="text-danger small">Currency not selected</div>');
                return false;
            }
        };
    };

    mawb_selection = (callback) => {
        const _this = this;
        let modal = window.modal_alert();
        let mawb_options = _this.state.cache.mawb_list.map(mawb => '<option value="{}">{}</option>'.format(mawb.public_id, mawb.mawb_number));
        let form = jQuery('<div class="form-group"><label>MAWB ID</label><select id="mawb_public_id" class="form-control"><option value="">--</option>' + mawb_options + '</select></div>');
        form.find('input.mawb_public_id').eq(0).focus();
        modal.append_html(form);
        modal.set_header('<div class="text-center bg-success py-4"><h4>Select MAWB</h4></div>');
        modal.upon_ok = () => {
            const mawb_public_id = form.find('#mawb_public_id').val();
            if (mawb_public_id) {
                _this.load_mawb(mawb_public_id, callback);
                return true;
            } else {
                modal.set_footer_msg('<div class="text-danger">Select MAWB</div>');
            }
        };
    };

    charge_define = () => {
        const _this = this;

        const charge_define_modal = function () {
            let modal = window.modal_alert();
            modal.set_header('<div class="text-center bg-success py-4"><h4>Define Charge</h4></div>');
            let form = jQuery(jQuery('#charge_define_tpl').html());
            form.find('.charge_type_selection').append(_this.state.cache.charge_type_list.map(ct => '<option value="{}">{}</option>'.format(ct.id, ct.name)).join(''));
            form.find('.currency_code').text(_this.state.currency.code);
            form.find('.per_unit_source_selection').html(
                (_this.is_bill_to_mawb() ?
                    '<option value="mawb">mawb: ' + _this.state.mawb.chargable_weight + _this.state.mawb.weight_unit + '</option>' : '')
                +
                (!_this.is_bill_to_mawb() ?
                    '<option value="hawb">hawb: ' + _this.state.hawb.chargable_weight + _this.state.hawb.weight_unit + '</option>' : ''));
            form.find('[name="is_unit_or_fixed"]').click(function (event) {
                const unit_or_fixed = jQuery(event.target).val();
                const amount_per_unit = parseFloat(jQuery('.amount').val()) || 0;
                const per_unit_source = form.find('.per_unit_source_selection').val();

                let no_of_unit = '';
                let unit_name = '';
                if (per_unit_source === 'mawb') {
                    no_of_unit = _this.state.mawb.chargable_weight;
                    unit_name = _this.state.mawb.weight_unit;
                } else {
                    no_of_unit = _this.state.hawb.chargable_weight;
                    unit_name = _this.state.hawb.weight_unit;
                }
                const total_amount = (no_of_unit * amount_per_unit).toFixed(2);
                if (unit_or_fixed === 'per_unit') {
                    form.find('.calculation').html('<div>multiplies {}{}={}{}</div>'.format(no_of_unit, unit_name, total_amount, _this.state.currency.code));
                } else if (unit_or_fixed === 'fixed') {
                    form.find('.calculation').empty();
                }
            });
            form.find('.amount').keyup(function (event) {
                if (form.find('[name="is_unit_or_fixed"]:checked').val() === 'per_unit') {
                    const amount_per_unit = parseFloat(jQuery(event.target).val()) || 0;
                    const per_unit_source = form.find('.per_unit_source_selection').val();
                    let no_of_unit = '';
                    let unit_name = '';
                    if (per_unit_source === 'mawb') {
                        no_of_unit = _this.state.mawb.chargable_weight;
                        unit_name = _this.state.mawb.weight_unit;
                    } else {
                        no_of_unit = _this.state.hawb.chargable_weight;
                        unit_name = _this.state.hawb.weight_unit;
                    }
                    const total_amount = (no_of_unit * amount_per_unit).toFixed(2);
                    form.find('.calculation').html('<div>multiplies {}{}={}{}</div>'.format(no_of_unit, unit_name, total_amount, _this.state.currency.code));
                }
            });
            modal.append_html(form);
            modal.upon_ok = () => {
                const charge_type_id = parseInt(form.find('.charge_type_selection').val());
                const is_unit_cost = form.find('[name="is_unit_or_fixed"]:checked').val() == 'per_unit';
                const is_for_hawb = form.find('.per_unit_source_selection').val() == 'hawb';
                const amount = parseFloat(form.find('.amount').val());
                if (charge_type_id && amount) {
                    _this.setState({
                        charges_list: (function () {
                            let charges_list = _this.state.charges_list;
                            charges_list.push(charge_dict(null, charge_type_id, is_unit_cost, is_for_hawb, amount));
                            return charges_list;
                        }())
                    });
                    return true;
                } else {
                    modal.set_footer_msg('<div class="text-danger">Charge type and amount not provided</div>');
                }
            };
        };

        const charge_define_with_currency_check = () => {
            if (!_this.state.currency.id) {
                _this.currency_selection(charge_define_modal);
            } else {
                charge_define_modal();
            }
        };

        if (!_this.state.mawb.public_id) {
            _this.mawb_selection(charge_define_with_currency_check);
        } else {
            charge_define_with_currency_check();
        }
    };

    define_currency_conversion = (from_currency_id) => {
        const _this = this;
        const from_currency = _this.state.cache.currency_list.filter(c => c.id == from_currency_id)[0];

        let modal = window.modal_alert();
        let form = jQuery(jQuery('#currency_conversion_rate_tpl').html());
        form.find('.from_currency_code').text(from_currency.code);
        form.find('.to_currency_code').append(_this.state.cache.currency_list.filter(curr => curr.id != from_currency.id)
            .map(curr => '<option value="' + curr.id + '">' + curr.code + '</option>').join(''));
        form.find('.conversion_rate').val(_this.state.currency_conversion.rate);
        modal.append_html(form);
        modal.upon_ok = () => {
            const to_currency_id = form.find('.to_currency_code').val();
            const rate = form.find('.conversion_rate').val();
            if (to_currency_id && rate) {
                const to_currency = _this.state.cache.currency_list.filter(c => c.id == to_currency_id)[0];
                _this.setState({
                    currency_conversion: (function () {
                        let cc = _this.state.currency_conversion;
                        cc.from_currency_id = from_currency.id;
                        cc.to_currency_id = to_currency.id;
                        cc.rate = rate;
                        return cc;
                    }())
                });
                return true;
            } else {
                if (!to_currency_id) {
                    modal.set_footer_msg('<div class="text-danger">target currency not defined</div>');
                }
                if (!rate) {
                    modal.set_footer_msg('<div class="text-danger">rate not defined</div>');
                }
            }
        };
    };

    calculate_total_charge = () => {
        const _this = this;
        let amount_total = 0.0;
        _this.state.charges_list.map(charge => {
            const chargable_wt = _this.is_bill_to_mawb() ? _this.state.mawb.chargable_weight : _this.state.hawb.chargable_weight;
            const amount_subtotal = (charge.is_unit_cost ? parseFloat(chargable_wt) * parseFloat(charge.fixed_or_unit_amount) : parseFloat(charge.fixed_or_unit_amount))
                .toFixed(2);
            amount_total += parseFloat(amount_subtotal);
        });
        return amount_total;
    };

    set_total_amount_in_words = () => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#text_input_tpl').html());
        form.find('textarea').val(_this.state.total_amount_repr);
        modal.append_html(form);
        modal.upon_ok = function () {
            const text = form.find('textarea').val().trim();
            _this.setState({
                total_amount_repr: text
            });
            return true;
        };
    };

    set_custom_hawb_id = () => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#text_input_tpl').html());
        form.find('label').text('HAWB');
        form.find('textarea').val(_this.state.custom_hawb_id);
        modal.append_html(form);
        modal.upon_ok = function () {
            const text = form.find('textarea').val().trim();
            _this.setState({
                custom_hawb_id: text
            });
            return true;
        };
    };
    set_custom_mawb_id = () => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#text_input_tpl').html());
        form.find('label').text('MAWB');
        form.find('textarea').val(_this.state.custom_mawb_id);
        modal.append_html(form);
        modal.upon_ok = function () {
            const text = form.find('textarea').val().trim();
            _this.setState({
                custom_mawb_id: text
            });
            return true;
        };
    };
    set_custom_destiantion = () => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#text_input_tpl').html());
        form.find('label').text('Destination');
        form.find('textarea').val(_this.state.custom_destination);
        modal.append_html(form);
        modal.upon_ok = function () {
            const text = form.find('textarea').val().trim();
            _this.setState({
                custom_destination: text
            });
            return true;
        };
    };
    set_custom_commodity_code = () => {
        const _this = this;
        let modal = window.modal_alert();
        let form = jQuery(jQuery('#text_input_tpl').html());
        form.find('label').text('Commodity Code');
        form.find('textarea').val(_this.state.custom_commodity_code);
        modal.append_html(form);
        modal.upon_ok = function () {
            const text = form.find('textarea').val().trim();
            _this.setState({
                custom_commodity_code: text
            });
            return true;
        };
    };

    open_print_preview = () => {
        jQuery('#invoice').printThis();
    };

    save = () => {
        const _this = this;
        let loader = window.modal_alert();
        if (!_this.state.charges_list.length) {
            loader.append_html('<div class="text-danger">No charges added. Save abort!</div>');
            return false;
        }
        _this.setState({
            errors: [],
            form_errors: {},
            msg: [],
        });
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'POST',
            url: window.urlfor_credit_note_save,
            data: {
                creditnote_public_id: _this.state.creditnote_public_id,
                consolidation_public_id: _this.state.mawb.consolidation_public_id,
                to_who: (function () {
                    if (_this.state.to_who == 'mawb_consignee') {
                        return 'master_consignee';
                    }
                    if (_this.state.to_who == 'hawb_supplier') {
                        return 'house_supplier';
                    }
                    if (_this.state.to_who == 'hawb_shipper') {
                        return 'house_shipper';
                    }
                }()),
                to_hawb_public_id_if_applies: _this.state.hawb.public_id,
                date: _this.state.date,
                currency_id: _this.state.currency.id,
                display_currency_conversion_from_currency_id: _this.state.currency_conversion.from_currency_id,
                display_currency_conversion_to_currency_id: _this.state.currency_conversion.to_currency_id,
                display_currency_conversion_rate: _this.state.currency_conversion.rate,
                charges_list: JSON.stringify(_this.state.charges_list.map((charge, i) => {
                    return {
                        list_index: i,
                        charge_type_id: charge.charge_type_id,
                        is_unit_cost: charge.is_unit_cost,
                        fixed_or_unit_amount: charge.fixed_or_unit_amount
                    }
                }))
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    _this.setState({
                        msg: resp.msg,
                        creditnote_public_id: resp.data.public_id
                    });
                    loader.append_html('<div class="text-success">Success</div>');
                } else {
                    loader.append_html('<div class="text-danger">Please check for errors</div>');
                    _this.setState({
                        errors: resp.errors,
                        form_errors: resp.form_errors,
                        charges_list: _this.state.charges_list.map((charge, i) => {
                            resp.charge_error_list.forEach(function (charge_error_info) {
                                if (charge_error_info.list_index == i) {
                                    charge.errors = charge_error_info.errors;
                                    charge.form_errors = charge_error_info.form_errors;
                                }
                            });
                            return charge;
                        })
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">' + err + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            },
        });
    };

    render() {
        return <CreditNoteForm context={this}/>;
    }

}