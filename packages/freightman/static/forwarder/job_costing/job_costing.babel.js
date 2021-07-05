"use strict";


class JobCosting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_list: [],
            cost_form_error_list: [],

            msg: [],
            saved: false,

            cache: {
                charges_type_list: [],
                currency_list: []
            },

            selected_consolidated_shipment: '',

            charges_list: [], //charges form render source,

            currency_conversion_rate_id: ''//model id|int
        };
        this.load_data(props.consol_public_id);

        window.job_costing = this;
        console.info('access job costing react component context by window.job_costing');
    }

    load_data = (consol_public_id) => {
        let _this = this;
        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Loading</div>');
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_job_costing_page_init_data,
            data: {public_id: consol_public_id},
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

    set_charge_value = (uniqid) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map(ch => {
                if (ch.uniqid == uniqid) {
                    ch.value = event.target.value.trim();
                }
                return ch;
            })
        });
    };
    set_charge_type_expenditure_or_revenue = (uniqid, is_shipment_cost) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map(ch => {
                if (ch.uniqid == uniqid) {
                    ch.is_shipment_cost = is_shipment_cost;
                }
                return ch;
            })
        });
    };

    charge_applies_to_house_or_not = (uniqid) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map(ch => {
                if (ch.uniqid == uniqid) {
                    ch.charge_applies_to_hawb = !ch.charge_applies_to_hawb;
                    if (!ch.charge_applies_to_hawb && !ch.is_shipment_cost) {
                        ch.is_unit_cost = false;
                    }
                }
                return ch;
            })
        });
    };

    set_related_hawb_public_id = (uniqid) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map(ch => {
                if (ch.uniqid == uniqid) {
                    if (event.target.value) {
                        ch.for_specific_hawb = true;
                        ch.hawb_public_id = event.target.value;
                    } else {
                        ch.for_specific_hawb = false;
                        ch.hawb_public_id = '';
                    }
                }
                return ch;
            })
        });
    };
    set_charge_type_fixed_or_unit = (uniqid, is_unit_cost) => (event) => {
        let _this = this;
        this.setState({
            saved: false,
            charges_list: _this.state.charges_list.map(ch => {
                if (ch.uniqid == uniqid) {
                    ch.is_unit_cost = is_unit_cost;
                }
                return ch;
            })
        });
    };
    onclick_charge_type_add_button = (event) => {
        let _this = this;
        let selection = jQuery('<div class="form-group"><label class="">Charge type name to entry</label><input class="form-control" type="text" id="new_charge_type">' +
            '<div id="charge_type_save_feedback"></div>' +
            '<div><button type="button" id="save_new_charge_type">save</button></div></div>'
        );
        selection.find('#save_new_charge_type').on('click', function (event) {
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
        });
        window.modal_alert().append_html(selection);
    };
    onclick_charge_add_button = (event) => {
        let _this = this;
        let compile_charge_type_election = function () {
            return '<select class="form-control">' +
                '<option value="">select cost type</option>' + _this.state.cache.charges_type_list.map(ct => {
                    return '<option value="{}">{}</option>'.format(ct.id, ct.name);
                }).join('') + '</select>';
        };
        let selection = jQuery('<div class="form-group" id="charge_type_election"><label>Select Cost Type</label>' + compile_charge_type_election() + '</div>');
        selection.find('select').on('change', function (event) {
            let cost_type_id = jQuery(event.target).val();
            if (cost_type_id) {
                _this.setState({
                    saved: false,
                    charges_list: (function () {
                        let existing_charges_list = _this.state.charges_list;
                        existing_charges_list.push((function () {
                            let ct = _this.state.cache.charges_type_list.filter(ct => ct.id == cost_type_id)[0];
                            return {
                                uniqid: window.timestamp_ms(),
                                charge_type_id: ct.id,
                                charge_type_name: ct.name,
                                value: '',
                                currency_id: _this.state.cache.currency_list.filter(c => c.default)[0].id,
                                currency_conversion_rate_id: '',
                                is_shipment_cost: false,
                                charge_applies_to_hawb: false,
                                for_specific_hawb: false,
                                hawb_public_id: '',
                                is_unit_cost: false,
                            };
                        }()));
                        return existing_charges_list;
                    }())
                });
            }
        });

        window.modal_alert().append_html(selection);
    };
    refresh_charges_list = () => {
        let _this = this;
        _this.setState({
            charges_list: _this.state.selected_consolidated_shipment.job_costing_list
        });
    };

    charge_currency_selection = (uniqid) => () => {
        let _this = this;
        const currency_id = _this.state.charges_list.filter(ct => ct.uniqid == uniqid)[0].currency_id;
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
                            charges.filter(ct => ct.uniqid == uniqid)[0].currency_id = new_currency_id;
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
        let spinner = jQuery('<div><i class="fa fa-spin fa-spinner"></i> Processing</div>');
        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);

        jQuery.ajax({
            type: 'POST',
            url: window.urlfor_job_costing_save,
            data: {
                consolidated_shipment_public_id: _this.state.selected_consolidated_shipment ? _this.state.selected_consolidated_shipment.public_id : '',
                cost_list_json: JSON.stringify(_this.state.charges_list),
                currency_conversion_rate_id: _this.state.currency_conversion_rate_id
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)));
                    _this.setState({saved: true});
                } else {
                    let errors_html = resp.errors.map(err => '<div class="text-danger">{}</div>'.format(err)).join('');
                    loader.append_html(errors_html);
                    loader.append_html('<div class="text-danger">Please check for errors</div>');

                    _this.setState({
                        error_list: resp.errors.concat(resp.cost_info_errors),
                        cost_form_error_list: resp.cost_info_form_error_list,
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
            <div className="card">
                <div className="card-header">
                    Currency Conversion
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
                        : <div className="text-warning">Currency Conversion not available now as database doesn't have multiple currency </div>}
                </div>
            </div>

            {
                _this.state.charges_list.map(ct => {
                    const form_errors_q = _this.state.cost_form_error_list.filter(cfe => cfe.uniqid == ct.uniqid);
                    let form_errors = null;
                    if (form_errors_q.length) {
                        form_errors = form_errors_q[0];
                    }
                    const currency = _this.state.cache.currency_list.filter(c => c.id == ct.currency_id)[0];
                    //console.dir(ct);
                    return <div className="card" key={ct.uniqid}>
                        <div className="card-header">
                            <label className="" htmlFor={'ct_input_{}'.format(ct.uniqid)}>
                                                    <span className={!ct.is_shipment_cost ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'}>
                                                        {ct.charge_type_name}</span>
                                {!ct.is_shipment_cost ?
                                    <span className=" badge badge-success ml-2 mr-2">revenue</span>
                                    :
                                    <span className=" badge badge-danger ml-2 mr-2">expense</span>
                                }
                            </label>
                            <i className="fa fa-times cursor-pointer small ml-2 btn-outline-secondary" title="remove"
                               onClick={() => {
                                   if (confirm('Are you sure to remove this charge?')) {
                                       _this.setState({
                                           saved: false,
                                           charges_list: _this.state.charges_list.filter(c => c.uniqid != ct.uniqid)
                                       });
                                   }
                               }}></i>
                        </div>
                        <div className="card-body">
                            <div className="small">
                                <input type="radio" id={'ct_{}_expenditure'.format(ct.uniqid)}
                                       name={'ct_{}_shipment_or_house'.format(ct.uniqid)}
                                       className=""
                                       checked={ct.is_shipment_cost}
                                       onClick={_this.set_charge_type_expenditure_or_revenue(ct.uniqid, true)}
                                       onChange={() => {
                                       }}
                                /><label htmlFor={'ct_{}_expenditure'.format(ct.uniqid)}>Shipment Cost(Expenditure by forwarder)</label>
                                {(function () {
                                    return (ct.is_shipment_cost ?
                                        <span><input type="checkbox" id={'{}_shipment_cost_applies_to_hawb'.format(ct.uniqid)}
                                                     className='' checked={ct.charge_applies_to_hawb}
                                                     onClick={_this.charge_applies_to_house_or_not(ct.uniqid)}
                                                     onChange={() => {
                                                     }}>
                                                            </input><label htmlFor={'{}_shipment_cost_applies_to_hawb'.format(ct.uniqid)}>for house</label>
                                            {ct.is_shipment_cost && ct.charge_applies_to_hawb ?
                                                <select
                                                    onChange={_this.set_related_hawb_public_id(ct.uniqid)}
                                                    value={ct.hawb_public_id}>
                                                    <option value={''}>Per house({_this.state.selected_consolidated_shipment.hawb_list.length} house)</option>
                                                    {_this.state.selected_consolidated_shipment.hawb_list.map(hawb =>
                                                        <option key={hawb.public_id} value={hawb.public_id}>
                                                            {hawb.public_id} shipper:{hawb.shipper_company_name} consignee:{hawb.consignee_company_name}
                                                        </option>
                                                    )}
                                                </select>
                                                : ''}
                                                            </span>
                                        : '');
                                }())}
                                <input type="radio" id={'ct_{}_revenue'.format(ct.uniqid)}
                                       name={'ct_{}_shipment_or_house'.format(ct.uniqid)}
                                       className="ml-2"
                                       checked={!ct.is_shipment_cost}
                                       onClick={_this.set_charge_type_expenditure_or_revenue(ct.uniqid, false)}
                                       onChange={() => {
                                       }}
                                /><label htmlFor={'ct_{}_revenue'.format(ct.uniqid)}>Revenue for forwarder</label>
                                {!ct.is_shipment_cost ?
                                    <span><input type="checkbox"
                                                 id={'{}_cost_from_house'.format(ct.uniqid)} className=''
                                                 checked={ct.charge_applies_to_hawb}
                                                 onClick={_this.charge_applies_to_house_or_not(ct.uniqid)}
                                                 onChange={() => {
                                                 }}></input><label htmlFor={'{}_cost_from_house'.format(ct.uniqid)}>from house</label></span>
                                    : ''}
                                {!ct.is_shipment_cost && ct.charge_applies_to_hawb ?
                                    <select
                                        onChange={_this.set_related_hawb_public_id(ct.uniqid)}
                                        value={ct.hawb_public_id}>
                                        <option value={''}>Per house({_this.state.selected_consolidated_shipment.hawb_list.length} house)</option>
                                        {_this.state.selected_consolidated_shipment.hawb_list.map(hawb =>
                                            <option key={hawb.public_id} value={hawb.public_id}>
                                                {hawb.public_id} shipper:{hawb.shipper_company_name} consignee:{hawb.consignee_company_name}
                                            </option>
                                        )}
                                    </select>
                                    : ''}
                            </div>
                            <div className="small">
                                <input type="radio" id={'ct_{}_fixed'.format(ct.uniqid)}
                                       name={'ct_{}_fixed_or_perunit'.format(ct.uniqid)}
                                       className=""
                                       checked={!ct.is_unit_cost}
                                       onClick={_this.set_charge_type_fixed_or_unit(ct.uniqid, false)}
                                       onChange={() => {
                                       }}
                                /><label htmlFor={'ct_{}_fixed'.format(ct.uniqid)}>Fixed Cost</label>
                                {!ct.is_shipment_cost && !ct.charge_applies_to_hawb ? ''
                                    :
                                    <span><input type="radio" id={'ct_{}_perunit'.format(ct.uniqid)}
                                                 name={'ct_{}_fixed_or_perunit'.format(ct.uniqid)}
                                                 className="ml-2"
                                                 checked={ct.is_unit_cost}
                                                 onClick={_this.set_charge_type_fixed_or_unit(ct.uniqid, true)}
                                                 onChange={() => {
                                                 }}
                                    /><label htmlFor={'ct_{}_perunit'.format(ct.uniqid)}>Per Unit Cost
                                        {(function () {
                                            if (ct.is_unit_cost) {
                                                if (ct.is_shipment_cost && ct.charge_applies_to_hawb) {
                                                    return <span>(per chargable weight in hawb)</span>;
                                                } else if (ct.is_shipment_cost && !ct.charge_applies_to_hawb) {
                                                    return <span>(per chargable weight in mawb)</span>;
                                                } else if (!ct.is_shipment_cost && !ct.charge_applies_to_hawb) {
                                                    return <span>(will be interpreted as fixed cost)</span>;
                                                }
                                            }
                                        }())}
                                                    </label></span>
                                }
                            </div>
                            <div className="form-group">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                                            <span className="input-group-text" id="basic-addon1"
                                                                  title={currency.currency_name} onClick={_this.charge_currency_selection(ct.uniqid)}>
                                                                {currency.code}
                                                                </span>
                                    </div>
                                    <input id={'ct_input_{}'.format(ct.uniqid)} type="number"
                                           className="form-control"
                                           onChange={_this.set_charge_value(ct.uniqid)}
                                           value={ct.value}
                                    />
                                </div>
                                {form_errors && form_errors.hasOwnProperty('currency_id') ?
                                    <div className="text-danger small">Currency: {form_errors.currency_id}</div>
                                    : ''}
                                {form_errors && form_errors.hasOwnProperty('currency_conversion_rate_id') ?
                                    <div className="text-danger small">Currency Conversion: {form_errors.currency_conversion_rate_id}</div>
                                    : ''}
                                {form_errors && form_errors.hasOwnProperty('value') ?
                                    <div className="text-danger small">Amount: {form_errors.value}</div>
                                    : ''}
                            </div>
                        </div>
                    </div>;
                })
            }
            {
                _this.state.cache.charges_type_list.length ?
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
                        <div className="mt-4">
                            {_this.state.saved ? <i className="text-success fa fa-check-circle"></i> : ''}
                        </div>
                    </div>
                    : ''
            }
        </div>;
    }
}