function SeaExportContainerConsolFormRender(props) {
    const _this = props.context;
    return <div className="container">
        <div className="text-center py-4 bg-success">
            <h2 className="">Container Consolidation</h2>
        </div>

        {/*<div className="row">*/}
        {/*<div className="col">*/}
        {/*<div className="form-group">*/}
        {/*<label>Container serial number</label>*/}
        {/*<input type="text" className="form-control" value={_this.state.container_serial} onChange={(event) => {*/}
        {/*_this.onchange_field('container_serial', event.target.value.trim());*/}
        {/*}}/>*/}
        {/*{_this.state.form_errors.hasOwnProperty('container_serial') ?*/}
        {/*<div className="text-danger small">{_this.state.form_errors.container_serial}</div> : ''}*/}
        {/*</div>*/}
        {/*</div>*/}
        {/*</div>*/}
        {_this.state.consol_public_id ?
            <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-header bg-dark text-white text-center">Consolidation Job Number</div>
                        <div className="card-body">
                            <div>{_this.state.consol_public_id}</div>
                            {_this.state.form_errors.hasOwnProperty('public_id') ?
                                <div className="text-danger text-center">{_this.state.form_errors.public_id}</div> : ''}
                        </div>
                    </div>
                </div>
            </div>
            :
            ''
        }
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white">MBL Number</div>
                    <div className="card-body">
                        <input type="text" className="form-control" value={_this.state.mbl_number || ''} onChange={(event) => {
                            _this.onchange_field('mbl_number', event.target.value.trim());
                        }}/>
                        {_this.state.form_errors.hasOwnProperty('mbl_number') ?
                            <div className="text-danger small">{_this.state.form_errors.mbl_number}</div> : ''}
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white">Supplier</div>
                    <div className="card-body">
                        <SuperSelect
                            key={_this.state.cache.supplier_list.length + (_this.state.supplier_public_id)}
                            value={_this.state.supplier_public_id || ''}
                            onChange={(value) => {
                                _this.setState({
                                    supplier_public_id: value
                                }, function () {
                                    _this.init_data_loader();
                                });
                            }}
                            messages={{noselection: 'none selected', nodata: 'no data'}}
                            items={(function () {
                                return _this.state.cache.supplier_list.map(s => {
                                    return {
                                        value: s.public_id,
                                        label: s.company_name
                                    };
                                });
                            }())}/>
                        {_this.state.form_errors.hasOwnProperty('supplier_public_id') ?
                            <div className="text-danger small">{_this.state.form_errors.supplier_public_id}</div> : ''}
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Shipper info
                    </div>
                    <div className="card-body">
                        {_this.state.shipper.msg.map((msg, i) => <div key={i} className="text-success">{msg}</div>)}
                        <div className="form-group">
                            <label>Select saved address</label>
                            <SuperSelect
                                key={_this.state.cache.shipper_addressbook_list.length + (_this.state.supplier_public_id)}
                                onChange={(id) => {
                                    _this.onchange_address_selection_setstate_fill_fields('shipper', id);
                                }}
                                messages={{noselection: 'none selected', nodata: 'no data'}}
                                items={(function () {
                                    return _this.state.cache.shipper_addressbook_list.map(s => {
                                        return {
                                            value: s.id,
                                            label: '{}-{}'.format(s.company_name, s.address)
                                        };
                                    });
                                }())}/>
                        </div>
                        <div className="form-group ">
                            <label htmlFor="shipper_name">Company Name </label>
                            <input type="text" className="form-control"
                                   value={_this.state.shipper.data.company_name}
                                   onChange={(event) => {
                                       _this.onchange_shipper_address_field('company_name', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('shipper_company_name') ?
                                <div className="text-danger small">{_this.state.form_errors.shipper_company_name}</div> : ''}
                        </div>

                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">Address
                            </label>
                            <div className="col-sm-8 col-xs-12">

                                {_this.state.form_errors.hasOwnProperty('shipper_address') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_address}</div> : ''}

                                <textarea className="form-control" value={_this.state.shipper.data.address}
                                          onChange={(event) => {
                                              _this.onchange_shipper_address_field('address', event.target.value);
                                          }}></textarea>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">post code
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.shipper.data.postcode}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('postcode', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('shipper_postcode') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_postcode}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">city
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.shipper.data.city)}
                                    value={_this.state.shipper.data.city || ''}
                                    onChange={(value) => {
                                        _this.onchange_shipper_address_field('city', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('shipper_city') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_city}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">state
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.state}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('state', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_state') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_state}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">country
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <SuperSelect
                                    key={_this.state.cache.country_list.length + (_this.state.shipper.data.country)}
                                    value={_this.state.shipper.data.country || ''}
                                    onChange={(value) => {
                                        _this.onchange_shipper_address_field('country', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.country_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: '{} ({})'.format(c.name, c.code_isoa2)
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('shipper_country') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_country}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">contact
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.contact}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('contact', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_contact') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_contact}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">telephone number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.tel_num}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('tel_num', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('shipper_tel_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_tel_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">mobile number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.mobile_num}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('mobile_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_mobile_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_mobile_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">fax number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.fax_num}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('fax_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_fax_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_fax_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">e-mail address
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="email" className="form-control" value={_this.state.shipper.data.email}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('email', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_email') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_email}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Consignee Info
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Select saved address</label>
                            <SuperSelect
                                key={_this.state.cache.consignee_addressbook_list.length + (_this.state.supplier_public_id)}
                                onChange={(id) => {
                                    _this.onchange_address_selection_setstate_fill_fields('consignee', id);
                                }}
                                messages={{noselection: 'none selected', nodata: 'no data'}}
                                items={(function () {
                                    return _this.state.cache.consignee_addressbook_list.map(s => {
                                        return {
                                            value: s.id,
                                            label: '{}-{}'.format(s.company_name, s.address)
                                        };
                                    });
                                }())}/>
                        </div>
                        <div className="form-group ">
                            <label htmlFor="consignee_name">Company Name </label>
                            <input type="text" className="form-control" value={_this.state.consignee.data.company_name}
                                   onChange={(event) => {
                                       _this.onchange_consignee_address_field('company_name', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('consignee_company_name') ?
                                <div className="text-danger small">{_this.state.form_errors.consignee_company_name}</div> : ''}
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">Address
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <textarea className="form-control" value={_this.state.consignee.data.address}
                                          onChange={(event) => {
                                              _this.onchange_consignee_address_field('address', event.target.value);
                                          }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_address') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_address}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">post code
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.consignee.data.postcode}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('postcode', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_postcode') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_postcode}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">city
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.consignee.data.city)}
                                    value={_this.state.consignee.data.city || ''}
                                    onChange={(value) => {
                                        _this.onchange_consignee_address_field('city', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('consignee_city') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_city}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">state
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.state}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('state', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_state') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_state}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">country
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <SuperSelect
                                    key={_this.state.cache.country_list.length + (_this.state.consignee.data.country)}
                                    value={_this.state.consignee.data.country || ''}
                                    onChange={(value) => {
                                        _this.onchange_consignee_address_field('country', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.country_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: '{} ({})'.format(c.name, c.code_isoa2)
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('consignee_country') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_country}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">contact
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.contact}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('contact', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_contact') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_contact}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">telephone number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.tel_num}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('tel_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_tel_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_tel_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">mobile number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.mobile_num}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('mobile_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_mobile_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_mobile_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">fax number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.fax_num}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('fax_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_fax_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_fax_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">e-mail address
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="email" className="form-control" value={_this.state.consignee.data.email}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('email', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_email') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_email}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card col-12">
                    <div className="card-header bg-dark text-white">
                        GOODS INFORMATION
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="goods_gross_weight">Gross <br/>Weight <br/>Kilo</label>
                                <input type="number" step=".01" className="form-control"
                                       value={_this.state.goods_gross_weight_kg}
                                       onChange={(event) => {
                                           _this.onchange_field('goods_gross_weight_kg', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('goods_gross_weight_kg') ?
                                    <div className="text-danger small">{_this.state.form_errors.goods_gross_weight_kg}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="goods_measurement_cbm">Measurement <br/>(CBM) <br/>&nbsp;</label>
                                <input type="number" step={0.01} className="form-control"
                                       value={_this.state.goods_cbm}
                                       onChange={(event) => {
                                           _this.onchange_field('goods_cbm', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('goods_cbm') ?
                                    <div className="text-danger small">{_this.state.form_errors.goods_cbm}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card col-12">
                    <div className="card-header bg-dark text-white">
                        Linked Container ({_this.state.container_list.length})
                    </div>
                    <div className="card-body">
                        {_this.state.form_errors.hasOwnProperty('container_list_json') ?
                            <div className="text-danger text-center">{_this.state.form_errors.container_list_json}</div> : ''}
                        <div>
                            <button className="" onClick={_this.container_prompt}><i className="fa fa-plus"></i> add Container</button>
                        </div>
                        {_this.state.container_list.length ? (function () {
                                return <table className="table table-bordered">
                                    {
                                        _this.state.container_list.map((linked_container, cont_i) => {
                                            const container = _this.state.cache.container_type_list.filter(ct => ct.id == linked_container.container_type_id)[0];
                                            return <tbody key={cont_i}>
                                            <tr>
                                                <th className="text-center">
                                                    <div>
                                                        {container.name}<br/>
                                                        capacity: {container.capacity_cbm} CBM<br/>
                                                        container serial: {linked_container.container_serial}<br/>
                                                        container number: {linked_container.container_number}<br/>
                                                        allocation: {linked_container.fcl_or_lcl.toUpperCase()}
                                                    </div>
                                                    <button className="small" onClick={() => {
                                                        _this.hbl_prompt_for_linked_container(cont_i);
                                                    }}><i className="fa fa-plus"></i> add HBL
                                                    </button>
                                                    {linked_container.errors.map((err, i) => <div key={i} className="text-danger">{err}</div>)}
                                                    {Object.keys(linked_container.form_errors).map(key => '{}:{}'.format(key, linked_container.form_errors[key]))}
                                                </th>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {linked_container.hbl_list.length ?
                                                        <table className="">
                                                            <thead>
                                                            <tr>
                                                                <th>check</th>
                                                                <th>Shipper</th>
                                                                <th>Consignee</th>
                                                                <th>Goods CBM</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {
                                                                linked_container.hbl_list.map((hbl, i) => {
                                                                    return <tr key={i}>
                                                                        <td>{hbl.public_id}</td>
                                                                        <td>{hbl.shipper_name}</td>
                                                                        <td>{hbl.consignee_name}</td>
                                                                        <td>{hbl.cbm}</td>
                                                                    </tr>;
                                                                })
                                                            }
                                                            </tbody>
                                                            <tfoot>
                                                            <tr className="small">
                                                                <td colSpan={3}>Total CBM for this container</td>
                                                                <td>{(function () {
                                                                    const hblcbmtotal = linked_container.hbl_list.map(hbl => hbl.cbm).reduce((total, cbm) => total + cbm);
                                                                    if (hblcbmtotal > container.capacity_cbm) {
                                                                        return <div className="text-warning">{hblcbmtotal.toFixed(3)} (exceeds container capacity)</div>;
                                                                    } else {
                                                                        return hblcbmtotal;
                                                                    }
                                                                }())}</td>
                                                            </tr>
                                                            </tfoot>
                                                        </table>
                                                        :
                                                        <div className="text-center text-danger">No HBL linked for this container</div>
                                                    }
                                                </td>
                                            </tr>
                                            </tbody>;
                                        })
                                    }
                                    <tfoot>
                                    <tr>
                                        <td colSpan={3} className="font-weight-bold">
                                            Consolidation Total: {_this.hbl_cbm_total()} CBM
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>;
                            }())
                            :
                            <div className="text-danger text-center">No container added</div>
                        }
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Feeder Vessel information
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="feeder_vessel">Feeder Vessel</label>
                                <input type="text" className="form-control"
                                       value={_this.state.feeder_vessel_name}
                                       onChange={(event) => {
                                           _this.onchange_field('feeder_vessel_name', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_vessel_name') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_vessel_name}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no">Voyage No</label>
                                <input type="text" className="form-control"
                                       value={_this.state.feeder_vessel_voyage_number}
                                       onChange={(event) => {
                                           _this.onchange_field('feeder_vessel_voyage_number', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_vessel_voyage_number') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_vessel_voyage_number}</div> : ''}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="tentative_mother_vessel">Departure</label>
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.feeder_departure_city_id)}
                                    value={_this.state.feeder_departure_city_id || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('feeder_departure_city_id', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_departure_city_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_departure_city_id}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no_2">Arrival</label>
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.feeder_arrival_city_id)}
                                    value={_this.state.feeder_arrival_city_id || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('feeder_arrival_city_id', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_arrival_city_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_arrival_city_id}</div> : ''}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="tentative_mother_vessel">ETD</label>
                                <input type="date" className="form-control"
                                       value={_this.state.feeder_etd}
                                       onChange={(event) => {
                                           _this.onchange_field('feeder_etd', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_etd') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_etd}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no_2">ETA</label>
                                <input type="date" className="form-control"
                                       value={_this.state.feeder_eta}
                                       onChange={(event) => {
                                           _this.onchange_field('feeder_eta', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('feeder_eta') ?
                                    <div className="text-danger small">{_this.state.form_errors.feeder_eta}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Mother Vessel information
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="feeder_vessel">Mother Vessel</label>
                                <input type="text" className="form-control"
                                       value={_this.state.mother_vessel_name}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_vessel_name', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_vessel_name') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_vessel_name}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no">Voyage No</label>
                                <input type="text" className="form-control"
                                       value={_this.state.mother_vessel_voyage_number}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_vessel_voyage_number', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_vessel_voyage_number') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_vessel_voyage_number}</div> : ''}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="tentative_mother_vessel">Departure</label>
                                <SuperSelect
                                    key={_this.state.cache.seaport_list.length + (_this.state.mother_departure_city_id)}
                                    value={_this.state.mother_departure_city_id || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('mother_departure_city_id', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('mother_departure_city_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_departure_city_id}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no_2">Arrival</label>
                                <SuperSelect
                                    key={_this.state.cache.seaport_list.length + (_this.state.mother_arrival_city_id)}
                                    value={_this.state.mother_arrival_city_id || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('mother_arrival_city_id', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('mother_arrival_city_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_arrival_city_id}</div> : ''}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="tentative_mother_vessel">ETD</label>
                                <input type="date" className="form-control"
                                       value={_this.state.mother_etd}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_etd', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_etd') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_etd}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="voyage_no_2">ETA</label>
                                <input type="date" className="form-control"
                                       value={_this.state.mother_eta}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_eta', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_eta') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_eta}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Origin/Destination
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="place_of_receipt">Place of Receipt (City)</label>
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.city_id_of_receipt)}
                                    value={_this.state.city_id_of_receipt || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('city_id_of_receipt', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('city_id_of_receipt') ?
                                    <div className="text-danger small">{_this.state.form_errors.city_id_of_receipt}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="port_of_loading">Port of Loading</label>
                                <SuperSelect
                                    key={_this.state.cache.seaport_list.length + (_this.state.port_id_of_loading)}
                                    value={_this.state.port_id_of_loading || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('port_id_of_loading', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.seaport_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('port_id_of_loading') ?
                                    <div className="text-danger small">{_this.state.form_errors.port_id_of_loading}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="port_of_discharge">Port of Discharge</label>
                                <SuperSelect
                                    key={_this.state.cache.seaport_list.length + (_this.state.port_id_of_discharge)}
                                    value={_this.state.port_id_of_discharge || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('port_id_of_discharge', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.seaport_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('port_id_of_discharge') ?
                                    <div className="text-danger small">{_this.state.form_errors.port_id_of_discharge}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="final_destination">Final Destination City</label>
                                <SuperSelect
                                    key={_this.state.cache.city_list.length + (_this.state.city_id_of_final_destination)}
                                    value={_this.state.city_id_of_final_destination || ''}
                                    onChange={(value) => {
                                        _this.onchange_field('city_id_of_final_destination', value);
                                    }}
                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                    items={(function () {
                                        return _this.state.cache.city_list.map(c => {
                                            return {
                                                value: c.id,
                                                label: c.name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('city_id_of_final_destination') ?
                                    <div className="text-danger small">{_this.state.form_errors.city_id_of_final_destination}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                {_this.state.msg.map((msg, i) => <div key={i} className="text-success">{msg}</div>)}
                {_this.state.errors.map((err, i) => <div key={i} className="text-danger">{err}</div>)}
                <div>
                    <button type="button" className="btn btn-primary" onClick={(event) => {
                        _this.save();
                    }}>Submit
                    </button>

                    <button type="button" className="btn btn-secondary btn-sm float-right" onClick={(event) => {
                        _this.init_data_loader();
                    }}><i className="ti-reload"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>;
}