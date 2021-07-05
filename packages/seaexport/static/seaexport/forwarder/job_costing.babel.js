"use strict";


class JobCosting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_list: [],
            form_errors: {},
            cost_form_error_list: [],

            msg: [],
            saved: false,

            cache: {
                consol_public_id: props.consol_public_id,
                charges_type_list: [],
                currency_list: []
            },

            selected_consolidated_shipment: '',

            charges_list: [], //charges form render source,

            currency_conversion_rate_id: ''//model id|int
        };
        this.load_data();

        window.job_costing = this;
        console.info('access job costing react component context by window.job_costing');
    }

    load_data = () => {
        let _this = this;
        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Loading</div>');
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_job_costing_page_init_data,
            data: {public_id: _this.state.cache.consol_public_id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: {
                        charges_type_list: resp.data.charges_type_list,
                        currency_list: resp.data.currency_list
                    }
                });
                _this.setState({
                    saved: false,
                    selected_consolidated_shipment: resp.data.job_info,
                    charges_list: resp.data.job_info.job_costing_list
                });
                loader.close();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    set_charge_value = (list_index) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map((ch, i) => {
                if (i === list_index) {
                    ch.value = event.target.value.trim();
                }
                return ch;
            })
        });
    };

    set_related_hbl_public_id = (list_index) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map((ch, i) => {
                if (i === list_index) {
                    if (event.target.value) {
                        ch.hbl_public_id = event.target.value;
                    } else {
                        ch.hbl_public_id = '';
                    }
                }
                return ch;
            })
        });
    };
    set_charge_type_fixed_or_unit = (list_index, is_unit_cost) => () => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map((ch, i) => {
                if (i === list_index) {
                    ch.is_unit_cost = is_unit_cost;
                }
                return ch;
            })
        });
    };
    onclick_charge_type_add_button = () => {
        let _this = this;
        let selection = jQuery('<div class="form-group">' +
            '<label class="">Charge type name to entry</label>' +
            '<input class="form-control" type="text" id="new_charge_type">' +
            '<div id="charge_type_save_feedback"></div>' +
            '</div>'
        );
        let loader = window.modal_alert();
        loader.append_html(selection);
        loader.upon_ok = function () {
            let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
            const charge_type_name = selection.find('#new_charge_type').val();
            if (charge_type_name) {
                selection.find('#charge_type_save_feedback').html(spinner);
                jQuery.ajax({
                    type: 'POST',
                    url: window.urlfor_charge_type_save,
                    data: {
                        charge_type_name: charge_type_name
                    },
                    dataType: 'json',
                    success: function (resp) {
                        if (resp.success) {
                            selection.find('#charge_type_save_feedback').append('<div class="text-success">Charge Type Added!</div>');
                            _this.load_data();
                        } else {
                            selection.find('#charge_type_save_feedback').append('<div class="text-danger">Error: {}</div>'.format(resp.error));
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                        selection.find('#charge_type_save_feedback').append('<div class="text-danger">Error: {}</div>'.format(err));
                    },
                    complete: function (jqXHR, textStatus) {
                        spinner.remove();
                    }
                });
            }
        };
    };
    onclick_charge_add_button = () => {
        let _this = this;
        let compile_charge_type_election = function () {
            return '<select class="form-control">' +
                '<option value="">--</option>' + _this.state.cache.charges_type_list.map(ct => {
                    return '<option value="{}">{}</option>'.format(ct.id, ct.name);
                }).join('') + '</select>';
        };
        let selection = jQuery('<div class="form-group" id="charge_type_election"><label>Select Cost Type</label>' + compile_charge_type_election() + '</div>');
        let loader = window.modal_alert();
        loader.append_html(selection);
        loader.upon_ok = function () {
            let cost_type_id = selection.find('select').val();
            if (cost_type_id) {
                _this.setState({
                    saved: false,
                    charges_list: (function () {
                        let existing_charges_list = _this.state.charges_list;
                        existing_charges_list.push((function () {
                            let ct = _this.state.cache.charges_type_list.filter(ct => ct.id == cost_type_id)[0];
                            return {
                                charge_type_id: ct.id,
                                charge_type_name: ct.name,
                                value: '',
                                currency_id: _this.state.cache.currency_list.filter(c => c.default)[0].id,
                                currency_conversion_rate_id: '',
                                hbl_public_id: '',
                                is_unit_cost: false,
                            };
                        }()));
                        return existing_charges_list;
                    }())
                });
                return true;
            }
        };
    };

    charge_currency_selection = (list_index) => () => {
        let _this = this;
        const currency_id = _this.state.charges_list.filter((ct, i) => i === list_index)[0].currency_id;
        let modal = window.modal_alert({content_html: ''});
        modal.append_html(function () {
            let currency_selection = jQuery('<div class="form-group">' +
                '<label>Select Currency</label>' +
                '<select class="form-control" id="charge_currency_selection">' + _this.state.cache.currency_list.map(curr =>
                    '<option value="{}" {}>{}</option>'.format(curr.id, (curr.id == currency_id ? 'selected' : ''), curr.code)) + '</select>' +
                '</div>');
            currency_selection.find('select').on('change', function (event) {
                let new_currency_id = jQuery(event.target).val();
                if (new_currency_id) {
                    _this.setState({
                        charges_list: (function () {
                            let charges = _this.state.charges_list;
                            charges.filter((ct, i) => i === list_index)[0].currency_id = new_currency_id;
                            return charges;
                        }())
                    });
                }
            });
            return currency_selection;
        });
    };

    onsubmit = (event) => {
        let _this = this;
        _this.setState({
            error_list: [],
            form_errors: {},
            cost_form_error_list: [],
        });
        let spinner = jQuery('<div><i class="fa fa-spin fa-spinner"></i> Processing</div>');
        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);

        jQuery.ajax({
            type: 'POST',
            url: window.urlfor_job_costing_save,
            data: {
                consolidation_public_id: _this.state.selected_consolidated_shipment ? _this.state.selected_consolidated_shipment.public_id : '',
                cost_list_json: JSON.stringify(_this.state.charges_list.map((c, i) => {
                    c.list_index = i;
                    return c;
                })),
                currency_conversion_rate_id: _this.state.currency_conversion_rate_id
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)));
                    _this.setState({msg: resp.msg});
                } else {
                    let errors_html = resp.errors.map(err => '<div class="text-danger">{}</div>'.format(err)).join('');
                    loader.append_html(errors_html);
                    loader.append_html('<div class="text-danger">Please check for errors</div>');

                    _this.setState({
                        error_list: resp.errors,
                        form_errors: resp.form_errors,
                        cost_form_error_list: resp.cost_form_error_list,
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    render() {
        let _this = this;
        return <div className="">
            <div>
                <button type="button"
                        className='btn btn-success mt-2 float-right'
                        onClick={_this.onsubmit}><i className="fa fa-save"></i> Save costing
                </button>
                <div className="clearfix"></div>
            </div>
            <div>
                {_this.state.msg.map((msg, i) => <div key={i} className="text-center py-2 text-success font-weight-bold">{msg}</div>)}
                {_this.state.error_list.map((err, i) => <div key={i} className="text-center py-2 text-danger font-weight-bold">{err}</div>)}
                {_this.state.form_errors.hasOwnProperty('consolidation_public_id') ?
                    <div className="text-center py-2 bg-danger">{_this.state.form_errors.consolidation_public_id}</div> : ''}
                {_this.state.form_errors.hasOwnProperty('cost_list_json') ?
                    <div className="text-center py-2 text-danger">{_this.state.form_errors.cost_list_json}</div> : ''}
            </div>
            <div className="card">
                <div className="card-header bg-warning text-center">
                    Currency Conversion Rate
                </div>
                <div className="card-body">
                    {_this.state.cache.currency_list.length > 1 ?
                        <CurrencyConversionInput rate_hook={function (id) {
                            this.setState({
                                saved: false,
                                charges_list: _this.state.charges_list.map(ch => {
                                    ch.currency_conversion_rate_id = id;
                                    return ch;
                                })
                            });
                        }}/>
                        : <div className="">Currency Conversion not available now as database doesn't have multiple currency </div>}
                </div>
            </div>
            {
                _this.state.charges_list.map((ct, i) => {
                    const form_errors_q = _this.state.cost_form_error_list.filter(cfe => cfe.list_index == i);
                    let non_field_errors = [];
                    let form_errors = {};
                    if (form_errors_q.length) {
                        form_errors = form_errors_q[0].field_errors;
                        non_field_errors = form_errors_q[0].misc_errors;
                    }
                    const currency = _this.state.cache.currency_list.filter(c => c.id == ct.currency_id)[0];
                    //console.dir(ct);
                    return <div className="card" key={i}>
                        <div className="card-header bg-warning">
                            <label className="" htmlFor={'ct_input_{}'.format(i)}>
                                                    <span className='font-weight-bold badge badge-danger px-4 py-1'>
                                                        {ct.charge_type_name}</span>
                            </label>
                            {form_errors && form_errors.hasOwnProperty('charge_type_id') ?
                                <div className="text-danger small">charge type: {form_errors.charge_type_id}</div>
                                : ''}
                            {form_errors && form_errors.hasOwnProperty('list_index') ?
                                <div className="text-danger small">list_index: {form_errors.list_index}</div>
                                : ''}
                            <i className="fa fa-times cursor-pointer small float-right text-danger" title="remove"
                               onClick={() => {
                                   _this.setState({
                                       saved: false,
                                       charges_list: _this.state.charges_list.filter((c, lci) => lci !== i)
                                   });
                               }}>{''}</i>
                        </div>
                        <div className="card-body">
                            {non_field_errors.map((err, i) => <div key={i} className="text-center py-2 bg-danger">{err}</div>)}
                            <div className="row">
                                <div className="col-4">
                                    <input type="radio" id={'ct_{}_fixed'.format(i)}
                                           name={'ct_{}_fixed_or_perunit'.format(i)}
                                           className=""
                                           checked={!ct.is_unit_cost}
                                           onClick={_this.set_charge_type_fixed_or_unit(i, false)}
                                           onChange={() => {
                                           }}
                                    /><label htmlFor={'ct_{}_fixed'.format(i)}> Fixed Cost</label>
                                    <div><input type="radio" id={'ct_{}_perunit'.format(i)}
                                                name={'ct_{}_fixed_or_perunit'.format(i)}
                                                className=""
                                                checked={ct.is_unit_cost}
                                                onClick={_this.set_charge_type_fixed_or_unit(i, true)}
                                                onChange={() => {
                                                }}
                                    /><label htmlFor={'ct_{}_perunit'.format(i)}> Per Unit(HBL CBM) Cost</label>
                                    </div>
                                    {form_errors && form_errors.hasOwnProperty('is_unit_cost') ?
                                        <div className="text-danger small">{form_errors.is_unit_cost}</div>
                                        : ''}
                                </div>
                                <div className="col">
                                    {ct.is_unit_cost ?
                                        <select value={ct.hbl_public_id} onChange={_this.set_related_hbl_public_id(i)}>
                                            <option value="">--</option>
                                            {_this.state.selected_consolidated_shipment.hbl_list.map((hbl, i) => <option key={i} value={hbl.public_id}>{hbl.public_id}</option>)}
                                        </select>
                                        : ''}
                                    <div>
                                        {ct.hbl_public_id ? _this.state.selected_consolidated_shipment.hbl_list.filter(hbl => hbl.public_id === ct.hbl_public_id)[0].cbm + ' cbm' : ''}
                                    </div>
                                    {form_errors && form_errors.hasOwnProperty('hbl_public_id') ?
                                        <div className="text-danger small">{form_errors.hbl_public_id}</div>
                                        : ''}
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                            <span className="input-group-text" id="basic-addon1"
                                                                  title={currency.currency_name} onClick={_this.charge_currency_selection(i)}>
                                                                {currency.code}
                                                                </span>
                                            </div>
                                            <input id={'ct_input_{}'.format(i)} type="number"
                                                   className="form-control"
                                                   onChange={_this.set_charge_value(i)}
                                                   value={ct.value}
                                            />
                                        </div>
                                        {form_errors && form_errors.hasOwnProperty('value') ?
                                            <div className="text-danger small">Amount: {form_errors.value}</div>
                                            : ''}
                                        {form_errors && form_errors.hasOwnProperty('currency_id') ?
                                            <div className="text-danger small">Currency: {form_errors.currency_id}</div>
                                            : ''}
                                        {form_errors && form_errors.hasOwnProperty('currency_conversion_rate_id') ?
                                            <div className="text-danger small">Currency Conversion: {form_errors.currency_conversion_rate_id}</div>
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>;
                })
            }
            <div className="">
                <div>
                    <button type="button" className="btn btn-primary mr-4"
                            onClick={_this.onclick_charge_add_button}><i className="fa fa-plus">
                    </i> add cost
                    </button>

                    <button type="button" className="btn btn-primary"
                            onClick={_this.onclick_charge_type_add_button}><i className="fa fa-plus">
                    </i> new charge type
                    </button>
                </div>
                <div className="mt-4">
                    {_this.state.error_list.map(err => <div key={err} className="text-danger">{err}</div>)}
                </div>
            </div>
        </div>;
    }
}