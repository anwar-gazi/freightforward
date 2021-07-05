function SeaExportBookingForm(props) {
    let _this = props.context;

    return <div>
        <div className="">
            <div className="">
                <div className="">
                    <div className="col shippers_ref">
                        {_this.state.errors.map((txt, i) => <div key={i} className="bg-danger py-2"><p className="text-white text-center">{txt}</p></div>)}
                        {_this.state.msg.map((txt, i) => <div key={i} className="bg-success py-2"><p className="text-white text-center">{txt}</p></div>)}
                        <div className="shippers_refpartstat">
                            <div className="row">
                                <div className="col-6">
                                    <div className="form-group">
                                        <label>Supplier <span><i className="fa fa-refresh"></i></span></label>
                                        <select className="form-control" value={_this.state.supplier.public_id} onChange={(event) => {
                                            const supplier_public_id = event.target.value;
                                            const supplier_q = _this.state.cache.supplier_list.filter(sup => sup.public_id == supplier_public_id);
                                            const supplier = supplier_q.length ? supplier_q[0] : {};
                                            _this.setState({
                                                supplier: supplier
                                            }, function () {
                                                _this.init_data_loader();
                                            });
                                        }}>
                                            <option value=''>--</option>
                                            {_this.state.cache.supplier_list.map(supplier => <option key={supplier.public_id}
                                                                                                     value={supplier.public_id}>{supplier.title}</option>)}
                                        </select>
                                        {!_this.state.supplier.public_id ? <div className="text-danger">Supplier not selected</div> : ''}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <button onClick={() => {
                                        _this.init_data_loader();
                                    }}>Reload Database
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">Shipper and Consignee leg Address</div>
                            <div className="card-body">
                                <div className="btn-group">
                                    <button onClick={() => {
                                        _this.setState({
                                            addressbook_list: (function () {
                                                _this.state.addressbook_list.push(addressbook_state_tpl('', true));
                                                return _this.state.addressbook_list;
                                            }())
                                        });
                                    }}><i className="fa fa-plus">{''}</i> add more address
                                    </button>
                                </div>
                                <div className="row">
                                    {_this.state.addressbook_list.map((addressbook_state_dict, i) => {
                                        return <div className="col-6" key={i + 1}>
                                            <div className="card">
                                                <div className="card-header">
                                                    <b>{addressbook_state_dict.is_additional_address ? 'Additional address:' : ''}{addressbook_state_dict.data.address_type}</b>
                                                </div>
                                                <div className="card-body">
                                                    {addressbook_state_dict.is_additional_address ? (function () {
                                                        return <div className="">
                                                            <div className="headline">
                                                                <strong>address type <Required/></strong>
                                                                {addressbook_state_dict.field_errors.hasOwnProperty('address_type') ?
                                                                    <div className="text-danger small">{addressbook_state_dict.field_errors.address_type}</div> : ''}
                                                            </div>
                                                            <div>
                                                                <div className="custom-control custom-radio">
                                                                    <input type="radio" className="custom-control-input" id="consignor" name="tmpaddresstype"
                                                                           checked={addressbook_state_dict.data.address_type == 'consignor'}
                                                                           onClick={(event) => {
                                                                               _this.setstate_address_field(i, 'address_type', 'consignor');
                                                                           }}
                                                                           onChange={() => {
                                                                           }}
                                                                    />
                                                                    <label className="custom-control-label" htmlFor="consignor">consignor</label>
                                                                </div>
                                                            </div>
                                                            <div className="">
                                                                <div className="custom-control custom-radio">
                                                                    <input type="radio" className="custom-control-input" id="pickup" name="tmpaddresstype"
                                                                           checked={addressbook_state_dict.data.address_type == 'pickup'}
                                                                           onClick={(event) => {
                                                                               _this.setstate_address_field(i, 'address_type', 'pickup');
                                                                           }}
                                                                           onChange={() => {
                                                                           }}
                                                                    />
                                                                    <label className="custom-control-label" htmlFor="pickup">pickup address</label>
                                                                </div>
                                                            </div>
                                                            <div className="">
                                                                <div className="custom-control custom-radio">
                                                                    <input type="radio" className="custom-control-input" id="consignee" name="tmpaddresstype"
                                                                           checked={addressbook_state_dict.data.address_type == 'consignee'}
                                                                           onClick={(event) => {
                                                                               _this.setstate_address_field(i, 'address_type', 'consignee');
                                                                           }}
                                                                           onChange={() => {
                                                                           }}
                                                                    />
                                                                    <label className="custom-control-label" htmlFor="consignee">consignee</label>
                                                                </div>
                                                            </div>
                                                            <div className="">
                                                                <div className="custom-control custom-radio">
                                                                    <input type="radio" className="custom-control-input" id="delivery" name="tmpaddresstype"
                                                                           checked={addressbook_state_dict.data.address_type == 'delivery'}
                                                                           onClick={(event) => {
                                                                               _this.setstate_address_field(i, 'address_type', 'delivery');
                                                                           }}
                                                                           onChange={() => {
                                                                           }}
                                                                    />
                                                                    <label className="custom-control-label" htmlFor="delivery">delivery address</label>
                                                                </div>
                                                            </div>

                                                        </div>;
                                                    }()) : ''}
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-labels">Select address to load</label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <div className="input-group">
                                                                <select className="form-control" value={addressbook_state_dict.data.id || ''}
                                                                        onChange={_this.onchange_address_selection_setstate_fill_fields(i)}>
                                                                    <option value="">--</option>
                                                                    {(function () {
                                                                        if (addressbook_state_dict.data.address_type && !addressbook_state_dict.is_additional_address) {
                                                                            return _this.state.cache.address_list
                                                                                .filter(address => address.address_type == addressbook_state_dict.data.address_type)
                                                                                .map(add => <option key={add.id}
                                                                                                    value={add.id}>{add.company_name}, {add.address}, {add.city.name}</option>);
                                                                        } else {
                                                                            return _this.state.cache.address_list.map(add => <option key={add.id}
                                                                                                                                     value={add.id}>{add.company_name}, {add.address}, {add.city.name}</option>);
                                                                        }
                                                                    }())}
                                                                </select>
                                                                <div className="input-group-append">
                                                                    <button onClick={_this.onchange_address_selection_setstate_clear_fields(i)}>clear</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">company name<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control" value={addressbook_state_dict.data.company_name || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'company_name', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />

                                                            {addressbook_state_dict.field_errors.hasOwnProperty('company_name') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.company_name}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('company_name') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.company_name}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <textarea className="form-control"
                                                                      onChange={(event) => {
                                                                          _this.setstate_address_field(i, 'address', event.target.value);
                                                                      }}
                                                                      value={addressbook_state_dict.data.address || ''}
                                                                      readOnly={!!addressbook_state_dict.data.id}
                                                            >{1 + 1}
                                                            </textarea>
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('address') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.address}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('address') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.address}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">post code<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="number" className="form-control"
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'postcode', event.target.value);
                                                                   }}
                                                                   value={addressbook_state_dict.data.postcode || ''}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('postcode') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.postcode}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('postcode') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.postcode}</div> : ''}

                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">city<Required/>
                                                            {/*<CityAdd className="ml-2" country_list={_this.state.cache.country_list}*/}
                                                            {/*key={_this.state.cache.country_list.length}*/}
                                                            {/*onsuccess={() => {*/}
                                                            {/*_this.init_data_loader();*/}
                                                            {/*}}/>*/}
                                                        </label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <SuperSelect
                                                                key={_this.state.cache.city_list.length + (addressbook_state_dict.data.city)}
                                                                value={addressbook_state_dict.data.city || ''}
                                                                onChange={(value) => {
                                                                    if (addressbook_state_dict.data.id) {
                                                                        // event.preventDefault();
                                                                        // event.stopPropagation();
                                                                        return false;
                                                                    } else {
                                                                        _this.setstate_address_field(i, 'city', value);
                                                                    }
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
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('city') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.city}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('city') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.city}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">state</label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control"
                                                                   value={addressbook_state_dict.data.state || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'state', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('state') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.state}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('state') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.state}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">Country<Required/>
                                                            {/*<CountryAdd className="ml-2"*/}
                                                            {/*onsuccess={() => {*/}
                                                            {/*_this.init_data_loader();*/}
                                                            {/*}}/>*/}
                                                        </label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <SuperSelect
                                                                key={_this.state.cache.country_list.length + (addressbook_state_dict.data.country)}
                                                                value={addressbook_state_dict.data.country || ''}
                                                                onChange={(value) => {
                                                                    if (addressbook_state_dict.data.id) {
                                                                        // event.preventDefault();
                                                                        // event.stopPropagation();
                                                                        return false;
                                                                    } else {
                                                                        _this.setstate_address_field(i, 'country', value);
                                                                    }
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
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('country') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.country}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('country') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.country}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">contact<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control"
                                                                   value={addressbook_state_dict.data.contact || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'contact', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('contact') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.contact}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('contact') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.contact}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">telephone number<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control"
                                                                   value={addressbook_state_dict.data.tel_num || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'tel_num', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('tel_num') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.tel_num}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('tel_num') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.tel_num}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">mobile number<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control"
                                                                   value={addressbook_state_dict.data.mobile_num || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'mobile_num', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('mobile_num') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.mobile_num}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('mobile_num') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.mobile_num}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">fax number</label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="text" className="form-control"
                                                                   value={addressbook_state_dict.data.fax_num || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'fax_num', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('fax_num') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.fax_num}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('fax_num') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.fax_num}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label">e-mail address<Required/></label>
                                                        <div className="col-sm-8 col-xs-12">
                                                            <input type="email" className="form-control" value={addressbook_state_dict.data.email || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_address_field(i, 'email', event.target.value);
                                                                   }}
                                                                   readOnly={!!addressbook_state_dict.data.id}
                                                            />
                                                            {addressbook_state_dict.field_errors.hasOwnProperty('email') ?
                                                                <div className="text-danger small">{addressbook_state_dict.field_errors.email}</div> : ''}

                                                            {addressbook_state_dict.field_warns.hasOwnProperty('email') ?
                                                                <div className="text-warning small">{addressbook_state_dict.field_warns.email}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="form-group row">
                                                        <label className="col-sm-4 col-xs-12 col-form-label mr-2">notify<Required/>
                                                            {addressbook_state_dict.booking_notify ? <i className="fa fa-check-double small ml-2"> yes</i> :
                                                                <i className="fa fa-times small ml-2"> no</i>}</label>
                                                    </div>
                                                    <div className="form-check">
                                                        {addressbook_state_dict.misc_errors.map((errmsg, i) => {
                                                            return <div className="text-danger small" key={i}>{errmsg}</div>
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">
                                Bank Info
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {_this.state.bank_branch_list.map((bankbranch, list_index) => {
                                        return <div className="col" key={list_index}>
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="checkbox">
                                                        <label className="form-check-label">
                                                            <input type="checkbox" className="form-check-input"
                                                                   onClick={_this.toggle_bank_form_display(list_index)}/>
                                                            {bankbranch.leg}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {bankbranch.use ? (function () {
                                                        let selected_origin_branch_id = _this.state.bank_branch_list.filter(branch => branch.data.leg == 'origin' && branch.data.branch_id)
                                                            .map(branch => branch.data.branch_id)[0];
                                                        let dest_suggestions = _this.state.cache.bank_branch_list.filter(branch => {
                                                            if (branch.id != selected_origin_branch_id) {
                                                                return branch;
                                                            }
                                                        });
                                                        return <div>
                                                            <div className="sub_title"></div>
                                                            <div className="form-group row">
                                                                <label className="col-sm-4 col-xs-12 col-form-labels">Select existing bank info from database</label>
                                                                <div className="col-sm-8 col-xs-12">
                                                                    <select className="form-control"
                                                                            value={bankbranch.data.branch_id || ''}
                                                                            onChange={_this.onchange_bank_selection_setstate_fill_fields(list_index)}>
                                                                        <option value="">--</option>
                                                                        {(bankbranch.data.leg == 'destination' ? dest_suggestions : _this.state.cache.bank_branch_list)
                                                                            .map(branch => <option key={branch.id}
                                                                                                   value={branch.id}>{branch.bank.bank_name}: {branch.branch_name}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <label className="col-sm-4 col-xs-12 col-form-label">bank name<Required/></label>
                                                                <div className="col-sm-8 col-xs-12">
                                                                    <input type="text" className="form-control"
                                                                           onChange={(event) => _this.bankinfo_set_field_value(list_index, 'bank_name', event.target.value)}
                                                                           value={bankbranch.data.bank_name || ''}
                                                                           readOnly={!!bankbranch.data.branch_id}
                                                                    />

                                                                    {bankbranch.field_errors.hasOwnProperty('bank_name') ?
                                                                        <div className="text-danger small">{bankbranch.field_errors.bank_name}</div> : ''}

                                                                    {bankbranch.field_warns.hasOwnProperty('bank_name') ?
                                                                        <div className="text-warning small">{bankbranch.field_warns.bank_name}</div> : ''}
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <label className="col-sm-4 col-xs-12 col-form-label">branch<Required/></label>
                                                                <div className="col-sm-8 col-xs-12">
                                                                    <input type="text" className="form-control"
                                                                           onChange={(event) => _this.bankinfo_set_field_value(list_index, 'branch_name', event.target.value)}
                                                                           value={bankbranch.data.branch_name || ''}
                                                                           readOnly={!!bankbranch.data.branch_id}
                                                                    />

                                                                    {bankbranch.field_errors.hasOwnProperty('branch_name') ?
                                                                        <div className="text-danger small">{bankbranch.field_errors.branch_name}</div> : ''}

                                                                    {bankbranch.field_warns.hasOwnProperty('branch_name') ?
                                                                        <div className="text-warning small">{bankbranch.field_warns.branch_name}</div> : ''}
                                                                </div>
                                                            </div>
                                                            <div className="form-group row">
                                                                <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
                                                                <div className="col-sm-8 col-xs-12">
                                                                    <textarea className="form-control"
                                                                              onChange={
                                                                                  (event) => _this.bankinfo_set_field_value(list_index, 'branch_address', event.target.value)}
                                                                              value={bankbranch.data.branch_address || ''}
                                                                              readOnly={!!bankbranch.data.branch_id}
                                                                    >

                                                                    </textarea>

                                                                    {bankbranch.field_errors.hasOwnProperty('branch_address') ?
                                                                        <div className="text-danger small">{bankbranch.field_errors.branch_address}</div> : ''}

                                                                    {bankbranch.field_warns.hasOwnProperty('branch_address') ?
                                                                        <div className="text-warning small">{bankbranch.field_warns.branch_address}</div> : ''}
                                                                </div>
                                                            </div>
                                                            <div className="form-check">
                                                                {bankbranch.misc_errors.map((errmsg) => {
                                                                    return <div className="text-danger small" key={errmsg}>{errmsg}</div>
                                                                })}
                                                                {bankbranch.field_errors.hasOwnProperty('branch_id') ?
                                                                    <div className="text-danger small">branch_id: {bankbranch.field_errors.branch_id}</div> : ''}
                                                                {bankbranch.field_errors.hasOwnProperty('in_origin_leg') ?
                                                                    <div className="text-danger small">in_origin_leg: {bankbranch.field_errors.in_origin_leg}</div> : ''}
                                                                {bankbranch.field_errors.hasOwnProperty('in_destination_leg') ?
                                                                    <div
                                                                        className="text-danger small">in_destination_leg: {bankbranch.field_errors.in_destination_leg}</div> : ''}
                                                            </div>
                                                        </div>;
                                                    }()) : ''}
                                                </div>
                                                <div className="card-footer"></div>
                                            </div>
                                        </div>;
                                    })}
                                </div>
                            </div>
                            <div className="card-footer"></div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">Notify party(email)</div>
                            <div className="card-body">
                                {_this.state.supplier.hasOwnProperty('booking_mail_sending_enabled') && _this.state.supplier.booking_mail_sending_enabled ?
                                    (function () {
                                        return <div className="form-group">
                                            <div className="form-check">
                                                {
                                                    _this.state.addressbook_list.filter(addressbook => addressbook.data.company_name && addressbook.data.address_type
                                                        && addressbook.data.email)
                                                        .map((addressbook, list_index) => {
                                                            return <div className="checkbox" key={list_index}>
                                                                <label className="form-check-label whitespace-nr" htmlFor={'notifyaddress' + list_index}>
                                                                    <input type="checkbox" className="form-check-input" id={'notifyaddress' + list_index}
                                                                           checked={addressbook.booking_notify}
                                                                           name='notify_address'
                                                                           onClick={_this.onchange_notify_party(list_index)}/>
                                                                    {<span
                                                                        className="small badge badge-secondary mr-2">{addressbook.data.address_type}</span>}
                                                                    {addressbook.data.company_name}
                                                                </label>
                                                            </div>;
                                                        })
                                                }
                                            </div>
                                        </div>;
                                    }())
                                    : <div className="text-warning">Email Notification disabled.</div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">
                                <div className="title"><b>Destination / Loading <Required/></b></div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label>Port of destination <Required/>
                                                {/*<SeaPortAdd className="ml-2" city_list={_this.state.cache.city_list} key={_this.state.cache.city_list.length}*/}
                                                {/*onsuccess={() => {*/}
                                                {/*_this.init_data_loader();*/}
                                                {/*}}/>*/}
                                            </label>
                                            <div className="">
                                                <SuperSelect
                                                    key={_this.state.cache.sea_port_list.length + _this.state.port_of_dest}
                                                    value={_this.state.port_of_dest}
                                                    onChange={(value) => {
                                                        _this.setState({
                                                            port_of_dest: value
                                                        });
                                                    }}
                                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                                    items={(function () {
                                                        return _this.state.cache.sea_port_list.map(p => {
                                                            return {
                                                                value: p.id,
                                                                label: p.name
                                                            };
                                                        });
                                                    }())}/>
                                                {_this.state.form_errors.hasOwnProperty('port_of_dest') ?
                                                    <div className="text-danger small">{_this.state.form_errors.port_of_dest}</div> : ''}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Terms of delivery <Required/></label>
                                            <div className="">
                                                {/*<select className="custom-select" value={_this.state.terms_of_deliv} onChange={(event) => {*/}
                                                {/*_this.setState({*/}
                                                {/*terms_of_deliv: event.target.value*/}
                                                {/*});*/}
                                                {/*}}>*/}
                                                {/*<option value=""></option>*/}
                                                {/*{_this.state.cache.tod_list.map(tod => <option key={tod.id} id={tod.id}*/}
                                                {/*value={tod.id}>{tod.code} {tod.title}</option>)}*/}
                                                {/*</select>*/}
                                                <SuperSelect
                                                    key={_this.state.cache.tod_list.length + _this.state.terms_of_deliv}
                                                    value={_this.state.terms_of_deliv}
                                                    onChange={(value) => {
                                                        _this.setState({
                                                            terms_of_deliv: value
                                                        });
                                                    }}
                                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                                    items={(function () {
                                                        return _this.state.cache.tod_list.map(p => {
                                                            return {
                                                                value: p.id,
                                                                label: '{}-{}'.format(p.code, p.title)
                                                            };
                                                        });
                                                    }())}/>
                                                {_this.state.form_errors.hasOwnProperty('terms_of_deliv') ?
                                                    <div className="text-danger small">{_this.state.form_errors.terms_of_deliv}</div> : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label>Port of loading <Required/></label>
                                            <div className="">
                                                <SuperSelect
                                                    key={_this.state.cache.sea_port_list.length + _this.state.port_of_load}
                                                    value={_this.state.port_of_load}
                                                    onChange={(value) => {
                                                        _this.setState({
                                                            port_of_load: value
                                                        });
                                                    }}
                                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                                    items={(function () {
                                                        return _this.state.cache.sea_port_list.map(p => {
                                                            return {
                                                                value: p.id,
                                                                label: '{}'.format(p.name)
                                                            };
                                                        });
                                                    }())}/>
                                                {_this.state.form_errors.hasOwnProperty('port_of_load') ?
                                                    <div className="text-danger small">{_this.state.form_errors.port_of_load}</div> : ''}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Country of destination <Required/></label>
                                            <div className="">
                                                <SuperSelect
                                                    key={_this.state.cache.country_list.length + _this.state.country_of_dest}
                                                    value={_this.state.country_of_dest}
                                                    onChange={(value) => {
                                                        _this.setState({
                                                            country_of_dest: value
                                                        });
                                                    }}
                                                    messages={{noselection: 'none selected', nodata: 'no data'}}
                                                    items={(function () {
                                                        return _this.state.cache.country_list.map(country => {
                                                            return {
                                                                value: country.id,
                                                                label: '{} ({})'.format(country.name, country.code_isoa2)
                                                            };
                                                        });
                                                    }())}/>
                                                {_this.state.form_errors.hasOwnProperty('country_of_dest') ?
                                                    <div className="text-danger small">{_this.state.form_errors.country_of_dest}</div> : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer small">
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">
                                <b>goods</b>
                            </div>
                            <div className="card-body">
                                {_this.state.goods_list.map((data, i) => (function () {
                                    return <div className="card" key={i}>
                                        <div className="card-header">#{i + 1}
                                            <div className="pull-right">
                                                <span className="text-danger cursor-pointer" onClick={_this.delete_goods_form(i)}><i
                                                    className="fa fa-times-circle"></i></span>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">
                                                            <span className="mr-1">No of</span>
                                                            {data.package_type ?
                                                                _this.state.cache.package_type_list.filter(p => p.id == data.package_type)[0].name
                                                                : 'PCS'} <Required/>
                                                            {data.formerrors.hasOwnProperty('no_of_pieces') ?
                                                                <div className="text-danger small">{data.formerrors.no_of_pieces}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <input type="number" className="form-control" value={data.no_of_pieces || ''}
                                                                   onChange={(event) => {
                                                                       _this.onchange_goods_form_field(i, 'no_of_pieces', event.target.value);
                                                                   }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">Package Type <Required/>
                                                            {data.formerrors.hasOwnProperty('package_type') ?
                                                                <div className="text-danger small">{data.formerrors.package_type}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <select className="form-control" value={data.package_type || ''}
                                                                    onChange={(event) => {
                                                                        _this.onchange_goods_form_field(i, 'package_type', event.target.value);
                                                                    }}
                                                            >
                                                                <option value=''>--</option>
                                                                {_this.state.cache.package_type_list.map(pak => <option value={pak.id} key={pak.id}
                                                                                                                        className="small">
                                                                    {pak.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">Weight (kg) <Required/>
                                                            {data.formerrors.hasOwnProperty('weight_kg') ?
                                                                <div className="text-danger small">{data.formerrors.weight_kg || ''}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <input type="number" step="0.1" className="form-control" value={data.weight_kg || ''}
                                                                   onChange={(event) => {
                                                                       _this.onchange_goods_form_field(i, 'weight_kg', event.target.value);
                                                                   }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">CBM
                                                            {data.formerrors.hasOwnProperty('cbm') ?
                                                                <div className="text-danger small">{data.formerrors.cbm}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <input type="number" step='any' className="form-control"
                                                                   value={data.cbm || ''}
                                                                   onChange={(event) => {
                                                                       _this.onchange_goods_form_field(i, 'cbm', event.target.value);
                                                                   }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*<div className="col">*/}
                                                {/*<div className="form-group">*/}
                                                {/*<label className="small">Volumetric Weight KG*/}
                                                {/*{data.formerrors.hasOwnProperty('volumetric_weight') ?*/}
                                                {/*<div className="text-danger small">{data.formerrors.volumetric_weight}</div>*/}
                                                {/*: ''}*/}
                                                {/*</label>*/}
                                                {/*<div className="input-group">*/}
                                                {/*<input disabled={true} type="text" className="form-control"*/}
                                                {/*value={data.volumetric_weight || ''}*/}
                                                {/*/>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*<div className="col">*/}
                                                {/*<div className="form-group">*/}
                                                {/*<label className="small">Chargable Weight*/}
                                                {/*{data.formerrors.hasOwnProperty('chargable_weight') ?*/}
                                                {/*<div className="text-danger small">{data.formerrors.chargable_weight}</div>*/}
                                                {/*: ''}*/}
                                                {/*</label>*/}
                                                {/*<div className="input-group">*/}
                                                {/*<input disabled={true} type="text" className="form-control"*/}
                                                {/*value={data.chargable_weight || ''}*/}
                                                {/*/>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*<div className="col">*/}
                                                {/*<div className="form-group">*/}
                                                {/*<label className="small">Lengh (cm) <Required/>*/}
                                                {/*{data.formerrors.hasOwnProperty('length_cm') ?*/}
                                                {/*<div className="text-danger small">{data.formerrors.length_cm}</div>*/}
                                                {/*: ''}*/}
                                                {/*</label>*/}
                                                {/*<div className="input-group">*/}
                                                {/*<input type="number" step="0.1" className="form-control" value={data.length_cm || ''}*/}
                                                {/*onChange={(event) => {*/}
                                                {/*_this.onchange_goods_form_field(i, 'length_cm', event.target.value);*/}
                                                {/*}}*/}
                                                {/*/>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*<div className="col">*/}
                                                {/*<div className="form-group">*/}
                                                {/*<label className="small">Width (cm) <Required/>*/}
                                                {/*{data.formerrors.hasOwnProperty('width_cm') ?*/}
                                                {/*<div className="text-danger small">{data.formerrors.width_cm}</div>*/}
                                                {/*: ''}*/}
                                                {/*</label>*/}
                                                {/*<div className="input-group">*/}
                                                {/*<input type="number" step="0.1" className="form-control" value={data.width_cm || ''}*/}
                                                {/*onChange={(event) => {*/}
                                                {/*_this.onchange_goods_form_field(i, 'width_cm', event.target.value);*/}
                                                {/*}}*/}
                                                {/*/>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*<div className="col">*/}
                                                {/*<div className="form-group">*/}
                                                {/*<label className="small">Height (cm) <Required/>*/}
                                                {/*{data.formerrors.hasOwnProperty('height_cm') ?*/}
                                                {/*<div className="text-danger small">{data.formerrors.height_cm}</div>*/}
                                                {/*: ''}*/}
                                                {/*</label>*/}
                                                {/*<div className="input-group">*/}
                                                {/*<input type="number" step="0.1" className="form-control" value={data.height_cm || ''}*/}
                                                {/*onChange={(event) => {*/}
                                                {/*_this.onchange_goods_form_field(i, 'height_cm', event.target.value);*/}
                                                {/*}}*/}
                                                {/*/>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                {/*</div>*/}
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">Quantity <Required/>
                                                            {data.formerrors.hasOwnProperty('quantity') ?
                                                                <div className="text-danger small">{data.formerrors.quantity}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <input type="number" className="form-control" value={data.quantity || ''}
                                                                   onChange={(event) => {
                                                                       _this.onchange_goods_form_field(i, 'quantity', event.target.value);
                                                                   }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">Unit price <Required/>
                                                            {data.formerrors.hasOwnProperty('unit_price') ?
                                                                <div className="text-danger small">{data.formerrors.unit_price}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <input type="number" step="0.01" className="form-control" value={data.unit_price || ''}
                                                                   onChange={(event) => {
                                                                       _this.onchange_goods_form_field(i, 'unit_price', event.target.value);
                                                                   }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-group">
                                                        <label className="small">Currency <Required/>
                                                            {data.formerrors.hasOwnProperty('currency') ?
                                                                <div className="text-danger small">{data.formerrors.currency}</div>
                                                                : ''}
                                                        </label>
                                                        <div className="input-group">
                                                            <select className="form-control" value={data.currency || ''}
                                                                    onChange={(event) => {
                                                                        _this.onchange_goods_form_field(i, 'currency', event.target.value);
                                                                    }}
                                                            >
                                                                <option>--</option>
                                                                {_this.state.cache.currency_list.map(curr => <option value={curr.id} key={curr.id}
                                                                                                                     className="small">
                                                                    {curr.code}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h4>Reference numbers <span className="cursor-pointer small"
                                                                                        onClick={_this.goods_reference_add_modal(i)}>
                                                                <i className="fa fa-plus-circle"></i></span>
                                                            </h4>
                                                            <span className="small">
                                                                {data.references.length ? data.references.length : 'No'}
                                                                <span className="ml-1">reference numbers added</span>
                                                            </span>
                                                            {data.formerrors.hasOwnProperty('references_json') ?
                                                                <div className="text-danger small">{data.formerrors.references_json}</div>
                                                                : ''}
                                                        </div>
                                                        <div className="card-body">
                                                            {data.references.map((refentry, refindex) => {
                                                                const reftoshow = _this.state.cache.goods_ref_type_list
                                                                    .filter(caref => caref.id == refentry.ref_type_id)[0];
                                                                return <div key={refindex} className="padding-5p whitespace-nr col-3 position-relative">
                                                                    <i
                                                                        className="fa fa-times-circle small text-danger cursor-pointer position-absolute top0-right0"
                                                                        onClick={() => {
                                                                            _this.remove_goods_ref(i, refindex);
                                                                        }}></i>
                                                                    <label
                                                                        className="font-weight-bold">{reftoshow.name}: </label>
                                                                    <span className="ml-1">{refentry.ref_number}</span>
                                                                </div>;
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="">
                                                <div className="col-md-12 goods_middle">
                                                    <div className="row">
                                                        <div className="col-md-6 pd_all_5">
                                                            <div className="form-group">
                                                                <label className="small">Shipping Mark <Required/>
                                                                    {data.formerrors.hasOwnProperty('shipping_mark') ?
                                                                        <div className="text-danger small">{data.formerrors.shipping_mark}</div>
                                                                        : ''}
                                                                </label>
                                                                <div className="input-group">
                                                                    <select className="form-control" value={data.shipping_mark || ''}
                                                                            onChange={(event) => {
                                                                                _this.onchange_goods_form_field(i, 'shipping_mark', event.target.value);
                                                                            }}
                                                                    >
                                                                        <option value={''}>--</option>
                                                                        <option>As Per Invoice</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6 pd_all_5">
                                                            <div className="form-group">
                                                                <label className="small">Goods Description <Required/>
                                                                    {data.formerrors.hasOwnProperty('goods_desc') ?
                                                                        <div className="text-danger small">{data.formerrors.goods_desc}</div>
                                                                        : ''}
                                                                </label>
                                                                <div className="input-group">
                                                                    <textarea className="form-control" rows={6} value={data.goods_desc || ''}
                                                                              onChange={(event) => {
                                                                                  _this.onchange_goods_form_field(i, 'goods_desc', event.target.value);
                                                                              }}
                                                                    >
                                                                    </textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>;
                                }()))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">
                                <strong>Shipping services <Required/></strong>
                                {_this.state.form_errors.hasOwnProperty('shipping_service') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipping_service}</div>
                                    : ''}
                            </div>
                            <div className="card-body">
                                {['Navana LCL', 'Navana FCL'].map((service, i) => {
                                    return <div className="form-check" key={i}>
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="express">
                                                <input type="radio" className="form-check-input" id="express"
                                                       name='shipping_service_selection'
                                                       onClick={(event) => {
                                                           _this.setState({
                                                               shipping_service: service
                                                           });
                                                       }}/>{service}
                                            </label>
                                        </div>
                                    </div>;
                                })}
                            </div>
                            <div className="card-footer">
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">
                                <strong>Stakeholder References</strong>
                                <button className="btn btn-sm small btn-secondary margin-left-20p"
                                        onClick={() => {
                                            _this.state.stakeholder_ref_list.push(stakeholder_ref_state_tpl());
                                            _this.setState({
                                                stakeholder_ref_list: _this.state.stakeholder_ref_list
                                            });
                                        }}><i className="fa fa-plus"></i> add more
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="">
                                    {_this.state.stakeholder_ref_list.map((ref, i) => {
                                        return <div className='card' key={i}>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <label className="form-control-label small">Reference Type <Required/></label>
                                                            {ref.formerrors.hasOwnProperty('ref_type_id') ?
                                                                <div className="text-danger small">{ref.formerrors.ref_type_id}</div>
                                                                : ''}
                                                            <select className="form-control"
                                                                    value={ref.ref_type_id || ''}
                                                                    onChange={(event) => {
                                                                        _this.setstate_stakeholder_ref_field(i, 'ref_type_id', event.target.value);
                                                                    }}>
                                                                <option>--</option>
                                                                {_this.state.cache.stakeholder_ref_type_list.map(reftype => <option value={reftype.id}
                                                                                                                                    key={reftype.id}>{reftype.name}
                                                                </option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <label className="form-control-label small">Reference Number <Required/></label>
                                                            {ref.formerrors.hasOwnProperty('ref_number') ?
                                                                <div className="text-danger small">{ref.formerrors.ref_number}</div>
                                                                : ''}
                                                            <input type="text" className="form-control" value={ref.ref_number || ''}
                                                                   onChange={(event) => {
                                                                       _this.setstate_stakeholder_ref_field(i, 'ref_number', event.target.value);
                                                                   }}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header"><b>order notes</b></div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="selectonclick">
                                            <div className="subtitle">
                                                <strong>Freight Payment Instructions <Required/></strong>
                                                {_this.state.form_errors.hasOwnProperty('frt_payment_ins') ?
                                                    <div className="text-danger small">{_this.state.form_errors.frt_payment_ins}</div>
                                                    : ''}
                                            </div>
                                            <div className="instructions_select">
                                                {_this.state.cache.payment_type_list.map(pt => {
                                                    return <div className="custom-control custom-radio" key={pt.id}>
                                                        <input type="radio" className="custom-control-input" name="frt_payment_ins"
                                                               id={'frt_payment_ins_{}'.format(pt.id)}
                                                               checked={pt.id == _this.state.frt_payment_ins}
                                                               onClick={() => {
                                                                   _this.setState({
                                                                       frt_payment_ins: pt.id
                                                                   });
                                                               }}
                                                               onChange={() => {
                                                               }}
                                                        />
                                                        <label className="custom-control-label" htmlFor={'frt_payment_ins_{}'.format(pt.id)}>{pt.name}</label>
                                                    </div>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="agreements_select">

                                            <div className="form-group">
                                                <label>available transport agreements <Required/></label>
                                                {_this.state.form_errors.hasOwnProperty('frt_transport_agreement_id') ?
                                                    <div className="text-danger small">{_this.state.form_errors.frt_transport_agreement_id}</div>
                                                    : ''}
                                                <div className="input-group">
                                                    <select className="form-control"
                                                            value={_this.state.frt_transport_agreement_id || ''}
                                                            onChange={(event) => {
                                                                _this.setState({
                                                                    frt_transport_agreement_id: event.target.value
                                                                });
                                                            }}>
                                                        <option value="">--</option>
                                                        {_this.state.cache.transport_agreement_list.map(ta => <option value={ta.id} key={ta.id}>{ta.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="delivery_instructions">
                                            <div className="form-group">
                                                <label>delivery instructions <Required/></label>
                                                {_this.state.form_errors.hasOwnProperty('frt_delivery_instruction') ?
                                                    <div className="text-danger small">{_this.state.form_errors.frt_delivery_instruction}</div>
                                                    : ''}
                                                <div className="input-group">
                                                <textarea className="form-control"
                                                          value={_this.state.frt_delivery_instruction || ''}
                                                          onChange={(event) => {
                                                              _this.setState({
                                                                  frt_delivery_instruction: event.target.value
                                                              });
                                                          }}>{1 === 1 ? '' : ''}</textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header"><b>pickup notes</b></div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 pickup_datetimeinfo">
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">Pick-up Date <Required/></label>
                                            {_this.state.form_errors.hasOwnProperty('pickup_date') ?
                                                <div className="text-danger small">{_this.state.form_errors.pickup_date}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <input type="date" className="form-control"
                                                       value={_this.state.pickup_date || ''}
                                                       onChange={(event) => {
                                                           _this.setState({
                                                               pickup_date: event.target.value
                                                           });
                                                       }}/>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">earliest pick-up time <Required/></label>
                                            {_this.state.form_errors.hasOwnProperty('pickup_earliest_time') ?
                                                <div className="text-danger small">{_this.state.form_errors.pickup_earliest_time}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <select className="form-control"
                                                        value={_this.state.pickup_earliest_time || ''}
                                                        onChange={(event) => {
                                                            _this.setState({
                                                                pickup_earliest_time: event.target.value
                                                            });
                                                        }}>
                                                    <option value={''}>--</option>
                                                    {[...Array(24).keys()].map(hr => {
                                                        let expr = '';
                                                        if (hr === 0) {
                                                            expr = '12AM';
                                                        } else if (hr < 12) {
                                                            expr = '{}AM'.format(hr);
                                                        } else if (hr === 12) {
                                                            expr = '{}PM'.format(hr);
                                                        } else if (hr > 12) {
                                                            expr = '{}PM'.format(hr - 12);
                                                        }
                                                        return <option value={expr} key={hr}>{expr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">latest pick-up time <Required/></label>
                                            {_this.state.form_errors.hasOwnProperty('pickup_latest_time') ?
                                                <div className="text-danger small">{_this.state.form_errors.pickup_latest_time}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <select className="form-control"
                                                        value={_this.state.pickup_latest_time || ''}
                                                        onChange={(event) => {
                                                            _this.setState({
                                                                pickup_latest_time: event.target.value
                                                            })
                                                        }}>
                                                    <option value={''}>--</option>
                                                    {[...Array(24).keys()].map(hr => {
                                                        let expr = '';
                                                        if (hr === 0) {
                                                            expr = '12AM';
                                                        } else if (hr < 12) {
                                                            expr = '{}AM'.format(hr);
                                                        } else if (hr === 12) {
                                                            expr = '{}PM'.format(hr);
                                                        } else if (hr > 12) {
                                                            expr = '{}PM'.format(hr - 12);
                                                        }
                                                        return <option value={expr} key={hr}>{expr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="subtitle">
                                            <strong>Pick-up Instructions <Required/></strong>
                                            {_this.state.form_errors.hasOwnProperty('pickup_ins') ?
                                                <div className="text-danger small">{_this.state.form_errors.pickup_ins}</div>
                                                : ''}
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <div className="input-group">
                                                    <textarea className="form-control" value={_this.state.pickup_ins || ''}
                                                              onChange={(event) => {
                                                                  _this.setState({
                                                                      pickup_ins: event.target.value
                                                                  });
                                                              }}>{1 === 1 ? '' : ''}</textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">File attachment: {_this.state.uplaodedfile_url_list.length} attached</div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <button onClick={() => {
                                        setTimeout(function () {
                                            jQuery('#genericfileupload').trigger('click');
                                        }, 0);
                                    }}>
                                        <i className="fa fa-file-upload"></i> attach {_this.state.uplaodedfile_url_list.length ? 'more' : ''}
                                    </button>
                                </div>
                                <div className="row">
                                    {_this.state.uplaodedfile_url_list.map((url, i) =>
                                        <div className="col-2 mb-3 position-relative" key={i}>
                                            <i
                                                className="fa fa-times-circle text-danger small cursor-pointer"
                                                style={{position: 'absolute', right: '0'}}
                                                onClick={() => {
                                                    _this.remove_attached_file_url(url);
                                                }}
                                            ></i>
                                            <div>
                                                <a href={url} target="_blank"><img src={window.path_to_thumbnail(url)}></img></a>
                                                <span className="small">{window.get_name_from_path(url)}</span>
                                            </div>
                                        </div>)}
                                </div>
                            </div>
                            <div className="card-footer">
                                {_this.state.form_errors.hasOwnProperty('uplaodedfile_url_list_json') ?
                                    <div className="text-danger small">{_this.state.form_errors.uplaodedfile_url_list_json}</div>
                                    : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-header">Booking status: draft or confirmed from supplier.</div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Booking confirmed? </label>
                                    <span className="ml-1">{_this.state.is_booking_confirm ? 'yes' : 'no'}</span>
                                </div>
                                <div className="form-group">
                                    <label>Expected Delivery Date: </label>
                                    <span className="ml-1">{_this.state.edd ? _this.state.edd : 'unspecified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {_this.state.errors.map((err, i) => <div className="text-danger" key={i}>{err}</div>)}
                        {_this.state.msg.map((msg, i) => <div className="text-success" key={i}>{msg}</div>)}
                        <div className="">
                            <button type="button" className="btn btn-primary btn-lg" onClick={_this.save_booking(true)}>save</button>
                            <button type="button" className="ml-4 btn btn-warning btn-lg" onClick={_this.save_booking(false, true)}>book</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}