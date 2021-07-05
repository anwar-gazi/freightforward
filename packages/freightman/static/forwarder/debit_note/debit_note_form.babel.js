"use strict";

function EditableHint() {
    return <span className="position-absolute small" style={{left: '-20px'}}><i className="fa fa-pencil-alt"></i></span>;
}

function DebitNoteForm(props) {
    let _this = props.context;
    return <div>
        <div>
            {_this.state.msg.map((msg, i) => <div className="text-success" key={i}>{msg}</div>)}
            {_this.state.errors.map((msg, i) => <div className="text-danger" key={i}>{msg}</div>)}
        </div>
        <div className="">
            <button className="cursor-pointer"
                    onClick={() => {
                        _this.setState({print_preview: true}, function () {
                            _this.open_print_preview()
                        });
                    }}>
                <i className="fa fa-print"></i> print preview
            </button>

            <button className="cursor-pointer"
                    onClick={() => {
                        _this.setState({print_preview: false});
                    }}>
                <i className="fa fa-edit"></i> edit preview
            </button>

            <button className="cursor-pointer"
                    onClick={() => {
                        _this.charge_define()
                    }}>
                <i className="fa fa-plus-circle"></i> add charge
            </button>

            <button className="cursor-pointer float-right"
                    onClick={() => {
                        _this.save()
                    }}>
                <i className="fa fa-save"></i> save
            </button>
        </div>
        <div id="invoice" className="invoice overflow-auto">
            <div className="minWidth600">
                <header>
                    <div className="row">
                        <div className="col">
                            <img src="/static/img/navana_logistics_logo.jpg" data-holder-rendered="true" alt="NLL LOGO"/>
                        </div>
                        <div className="col company-details">
                            <h2 className="name">
                                NAVANA LOGISTICS LIMITED
                            </h2>
                            <div>INTERNATIONAL AIR AND SEA FORWARDER</div>
                            <div>A NAVANA GROUP COMPANY</div>
                            <div>37, Agrabad C/A, Chittagong-4100, Bangladesh</div>
                            <div>Tel: +880312517861 Fax: +880312517862</div>
                            <div>Email: info@navana-logistics.com</div>
                            <div>Website: www.navana-logistics.com</div>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="row">
                        <div className="col">
                            <h2 className="text-uppercase text-center font-weight-bold mb-3"><u>debit note</u></h2>
                        </div>
                    </div>
                    <div className="row contacts">
                        <div className="col invoice-to">
                            {/*<div className="input-group">*/}
                            {/*<input type="text" className="form-control" placeholder="mawb" value={_this.state.mawb_public_id} onChange={(event) => {*/}
                            {/*_this.setState({mawb_public_id: event.target.value.trim()});*/}
                            {/*}}/>*/}
                            {/*<button type="button" className="input-group-addon" onClick={_this.state.mawb_public_id ? _this.load_mawb : () => {*/}
                            {/*}}>load*/}
                            {/*</button>*/}
                            {/*</div>*/}
                            <div className="border-1px-solid padding-20p" style={{minHeight: '200px'}}>
                                <h4 className="to">{_this.state.to_address_dict.company_name}</h4>
                                <div className="address">{_this.state.to_address_dict.address}</div>
                            </div>
                        </div>
                        <div className="col invoice-details">
                            <div><label className="font-weight-bold">INV#:</label>{_this.state.debitnote_public_id}</div>
                            <div className="date"><label className="font-weight-bold">DT:</label>
                                {_this.state.print_preview ? <span className="ml-2">{_this.state.date}</span>
                                    : <input type="date" value={_this.state.date} onChange={(event) => {
                                        _this.setState({date: event.target.value});
                                    }}/>
                                }
                            </div>
                        </div>
                    </div>
                    <table className="table table-bordered">
                        <thead>
                        <tr>
                            <th className="text-left">DESCRIPTION</th>
                            <th className="text-right">TOTAL</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="text-uppercase">
                                <div className="position-relative">
                                    {_this.state.print_preview || _this.state.mawb.goods_commodityitemno ? '' : <EditableHint/>}
                                    <span className="cursor-pointer"
                                          onClick={_this.set_custom_commodity_code}>{_this.state.mawb.is_consolidated ? 'consol shipment ' : 'non-consol shipment '}</span>
                                    <span> of {_this.state.mawb.goods_commodityitemno ? _this.state.mawb.goods_commodityitemno : _this.state.custom_commodity_code}</span>
                                </div>
                                <div className="position-relative">
                                    {_this.state.print_preview ? '' : <EditableHint/>}
                                    <span className="cursor-pointer" onClick={_this.set_custom_destiantion}>destination: </span>
                                    <span>{_this.state.custom_destination ? _this.state.custom_destination : _this.state.mawb.destination}</span>
                                </div>
                                <div className="position-relative">
                                    {_this.state.print_preview ? '' : <EditableHint/>}
                                    <span className="cursor-pointer" onClick={_this.set_custom_mawb_id}>mawb no: </span>
                                    <span>{_this.state.custom_mawb_id ? _this.state.custom_mawb_id : _this.state.mawb.public_id}</span>
                                </div>
                                <div className="position-relative">
                                    {_this.state.print_preview ? '' : <EditableHint/>}
                                    <span className="cursor-pointer" onClick={_this.set_custom_hawb_id}>hawb no: </span>
                                    <span>{_this.state.custom_hawb_id ? _this.state.custom_hawb_id : _this.state.hawb.public_id}</span>
                                </div>
                                <div>
                                    <span>{_this.state.mawb.package_type_code}s: </span>
                                    <span>{_this.state.mawb.no_of_packages} {_this.state.mawb.package_type_code}{_this.state.mawb.no_of_packages > 1 ? 's' : ''}</span>
                                </div>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>
                                <h4>Total collect from {_this.is_bill_to_mawb() === true ? 'consignee' : 'shipper'}</h4>
                            </td>
                            <td></td>
                        </tr>
                        {_this.state.charges_list.map((charge, i) => {
                            const charge_name = _this.state.cache.charge_type_list.filter(ct => ct.id == charge.charge_type_id)[0].name;
                            const chargable_wt = _this.is_bill_to_mawb() ? _this.state.mawb.chargable_weight : _this.state.hawb.chargable_weight;
                            const chargable_wt_unit_name = _this.is_bill_to_mawb() ? _this.state.mawb.weight_unit : _this.state.hawb.weight_unit;
                            const amount_total = (charge.is_unit_cost ? chargable_wt * charge.fixed_or_unit_amount : charge.fixed_or_unit_amount).toFixed(2);
                            return <tr key={i} className="text-uppercase">
                                {(charge.errors.length || Object.keys(charge.form_errors).length) ? <div className="text-danger">Charge has errors, save failed!</div> : null}
                                <td className="text-left">
                                    <div className="whitespace-nr">
                                        {_this.state.print_preview ? '' :
                                            <span>
                                                {_this.state.print_preview ? '' : <EditableHint/>}
                                                <span className="small cursor-pointer" onClick={() => {
                                                    _this.setState({
                                                        charges_list: _this.state.charges_list.filter((c, list_index) => list_index !== i)
                                                    });
                                                }}><i className="fa fa-times text-danger"></i></span>
                                            </span>
                                        }
                                        <span className="mr-2">{charge_name}</span>
                                        {charge.is_unit_cost ?
                                            <span>{chargable_wt}{chargable_wt_unit_name} X {_this.state.currency.code}{charge.fixed_or_unit_amount}/{chargable_wt_unit_name}</span> : ''}
                                        <span className="float-right">{_this.state.currency.code} {amount_total}</span>
                                    </div>
                                </td>
                                <td className="text-right">
                                        <span>
                                            {_this.state.currency_conversion.to_currency_id && _this.state.currency_conversion.rate ? (function () {
                                                    const to_currency = _this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.to_currency_id)[0];
                                                    const amount_total_converted = (amount_total * parseFloat(_this.state.currency_conversion.rate)).toFixed(2);
                                                    return '{} {}'.format(to_currency.code, amount_total_converted);
                                                }())
                                                : '{} {}'.format(_this.state.currency.code, amount_total)}
                                        </span>
                                </td>
                            </tr>;
                        })}
                        <tr>
                            <td>Total</td>
                            <td className="text-right">{_this.state.charges_list.length ? (function () {
                                    const amount_total = _this.calculate_total_charge();
                                    if (_this.state.currency_conversion.to_currency_id && _this.state.currency_conversion.rate) {
                                        const to_currency = _this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.to_currency_id)[0];
                                        const amount_total_converted = (amount_total * parseFloat(_this.state.currency_conversion.rate)).toFixed(2);
                                        return '{} {}'.format(to_currency.code, amount_total_converted);
                                    } else {
                                        return '{} {}'.format(_this.state.currency.code, amount_total);
                                    }
                                }())
                                : 0}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {_this.state.print_preview ? '' : <EditableHint/>}
                                Net Receivable
                                <span className="ml-1 cursor-pointer" onClick={() => {
                                    _this.define_currency_conversion(_this.state.currency.id);
                                }}>
                                        <span>
                                        {_this.state.currency_conversion.to_currency_id && _this.state.currency_conversion.rate ? (function () {
                                                const to_currency = _this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.to_currency_id)[0];
                                                return '{}; 1 {} = {} {}'.format(to_currency.code, _this.state.currency.code, _this.state.currency_conversion.rate, to_currency.code);
                                            }())
                                            : _this.state.currency.code}
                                        </span>
                                </span>
                            </td>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <td colSpan='2' className="text-uppercase font-weight-bold">
                                <p className="whitespace-nr">
                                    {_this.state.print_preview ? '' : <EditableHint/>}
                                    <span>in word:</span>
                                    <span className="ml-2 cursor-pointer" onClick={_this.set_total_amount_in_words}>{_this.state.charges_list.length ? (function () {
                                            if (_this.state.total_amount_repr) {
                                                return _this.state.total_amount_repr;
                                            } else {
                                                const amount_total = _this.calculate_total_charge();
                                                if (_this.state.currency_conversion.to_currency_id && _this.state.currency_conversion.rate) {
                                                    const to_currency = _this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.to_currency_id)[0];
                                                    const amount_total_converted = (amount_total * parseFloat(_this.state.currency_conversion.rate)).toFixed(2);
                                                    return window.money_amount_in_words(amount_total_converted, to_currency.code);
                                                } else {
                                                    return window.money_amount_in_words(amount_total, _this.state.currency.code);
                                                }
                                            }
                                        }())
                                        : 0}
                                    </span>
                                </p>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table className="table">
                        <tbody>
                        <tr>
                            <td className="width60pc">
                                <div className="border-bottom" style={{width: 40 + '%', height: 200 + 'px'}}></div>
                                <div>Authorized Signature</div>
                            </td>
                            <td>
                                <div>Our Bank Detail:</div>
                                <table className="table bank-info">
                                    <tbody>
                                    <tr>
                                        <th className="width30pc">Beneficiary:</th>
                                        <td>
                                            Navana Logistics Limited<br/>
                                            205-206 Tejgaon I/A<br/>
                                            Dhaka-1208, Bangladesh
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Account Name:</th>
                                        <td>Navana Logistics Limited</td>
                                    </tr>
                                    <tr>
                                        <th>Account Number:</th>
                                        <td>11100042090</td>
                                    </tr>
                                    <tr>
                                        <th>Bank Name:</th>
                                        <td>Southeast Bank Ltd</td>
                                    </tr>
                                    <tr>
                                        <th>Swift Code:</th>
                                        <td>SEBDBDDHSPB</td>
                                    </tr>
                                    <tr>
                                        <th>Bank Address:</th>
                                        <td>
                                            Southeast Bank Lts<br/>
                                            Principal Branch<br/>
                                            01, Dilkusha C/A, Dhaka<br/>
                                            Bangladesh
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </main>
                <footer>
                    <div className="text-uppercase">A Navana Group Company</div>
                    <div>Dhaka Office: Green Square(3rd Floor), Road #08, House #1/B, Gulshan-1, Dhaka-1212, Tel: +880-2-58810836, Fax: +880-2-58813735</div>
                </footer>
            </div>
            <div></div>
        </div>
    </div>;
}