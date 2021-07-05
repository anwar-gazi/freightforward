function SeaExportHBLFormRender(props) {
    const _this = props.context;
    return <div>
        <div className="row">
            <div className="col">
                <div className='card'>
                    <div className="card-header bg-dark text-white text-uppercase">
                        Booking Applicable
                    </div>
                    <div className="card-body">
                        <div>
                            <label className="mr-4">Booking Applies</label>
                            <input type="checkbox" checked={_this.state.booking_applies} onClick={() => {
                                _this.onchange_field('booking_applies', !_this.state.booking_applies);
                            }}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {_this.state.booking_applies ?
            <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-header bg-dark text-white text-uppercase">
                            Freight Booking
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Select Booking</label><br/>
                                <SuperSelect
                                    key={_this.state.cache.confirmed_bookings_without_bl.length + _this.state.booking_public_id}
                                    value={_this.state.booking_public_id}
                                    onChange={_this.onchange_booking_selection}
                                    messages={{nodata: 'no booking in database'}}
                                    items={(function () {
                                        return _this.state.cache.confirmed_bookings_without_bl.map(booking => {
                                            return {
                                                value: booking.public_id,
                                                label: booking.public_id
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('booking_public_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.booking_public_id}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            : ''}

        {_this.state.booking_applies ? ''
            : <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-header bg-dark text-white text-uppercase">
                            Supplier
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Select Supplier</label>
                                <SuperSelect
                                    key={_this.state.cache.supplier_list.length + _this.state.supplier_public_id}
                                    value={_this.state.supplier_public_id}
                                    onChange={(value) => {
                                        _this.onchange_field('supplier_public_id', value);
                                    }}
                                    messages={{nodata: 'not available'}}
                                    items={(function () {
                                        return _this.state.cache.supplier_list.map(supplier => {
                                            return {
                                                value: supplier.public_id,
                                                label: supplier.company_name
                                            };
                                        });
                                    }())}/>
                                {_this.state.form_errors.hasOwnProperty('supplier_public_id') ?
                                    <div className="text-danger small">{_this.state.form_errors.supplier_public_id}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

        <div className="row mt-3">
            <div className="col-6">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Shipper info
                    </div>
                    <div className="card-body">
                        {_this.state.shipper.msg.map((msg, i) => <div key={i} className="text-success">{msg}</div>)}
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
                                <select className="form-control" value={_this.state.shipper.data.city}
                                        onChange={(event) => {
                                            _this.onchange_shipper_address_field('city', event.target.value);
                                        }}>
                                    <option value="">--</option>
                                    {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
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
                                <select className="form-control" value={_this.state.shipper.data.country}
                                        onChange={(event) => {
                                            _this.onchange_shipper_address_field('country', event.target.value);
                                        }}>
                                    <option value="">--</option>
                                    {_this.state.cache.country_list.map(country => <option key={country.id} value={country.id}>{country.code_isoa2}</option>)}
                                </select>
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
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">
                                reference
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.shipper.data.reference}
                                       onChange={(event) => {
                                           _this.onchange_shipper_address_field('reference', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('shipper_reference') ?
                                    <div className="text-danger small">{_this.state.form_errors.shipper_reference}</div> : ''}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="shipper_acc_no">Account Number </label>
                            <input type="text" className="form-control" value={_this.state.shipper.data.account_number}
                                   onChange={(event) => {
                                       _this.onchange_shipper_address_field('account_number', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('shipper_account_number') ?
                                <div className="text-danger small">{_this.state.form_errors.shipper_account_number}</div> : ''}
                        </div>

                    </div>
                </div>
            </div>

            <div className="col-6">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Consignee Info
                    </div>
                    <div className="card-body">
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
                                <select className="form-control city_select" value={_this.state.consignee.data.city}
                                        onChange={(event) => {
                                            _this.onchange_consignee_address_field('city', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
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
                                <select className="form-control country_select" value={_this.state.consignee.data.country}
                                        onChange={(event) => {
                                            _this.onchange_consignee_address_field('country', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.country_list.map(country => <option key={country.id} value={country.id}>{country.code_isoa2}</option>)}
                                </select>
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
                                <input type="number" className="form-control" value={_this.state.consignee.data.tel_num}
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
                                <input type="number" className="form-control" value={_this.state.consignee.data.mobile_num}
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
                                <input type="number" className="form-control" value={_this.state.consignee.data.fax_num}
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
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label" htmlFor="consignee_reference">
                                reference </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.consignee.data.reference}
                                       onChange={(event) => {
                                           _this.onchange_consignee_address_field('reference', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('consignee_reference') ?
                                    <div className="text-danger small">{_this.state.form_errors.consignee_reference}</div> : ''}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="consignee_acc_no">
                                Account Number </label>
                            <input type="text" className="form-control" value={_this.state.consignee.data.account_number}
                                   onChange={(event) => {
                                       _this.onchange_consignee_address_field('account_number', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('consignee_account_number') ?
                                <div className="text-danger small">{_this.state.form_errors.consignee_account_number}</div> : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-6">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Agent
                    </div>
                    <div className="card-body">
                        <div className="form-group ">
                            <label htmlFor="agent_name">Agent Company Name </label>
                            <input type="text" className="form-control" value={_this.state.agent.data.company_name}
                                   onChange={(event) => {
                                       _this.onchange_agent_address_field('company_name', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('agent_company_name') ?
                                <div className="text-danger small">{_this.state.form_errors.agent_company_name}</div> : ''}
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">Address
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <textarea className="form-control" value={_this.state.agent.data.address}
                                          onChange={(event) => {
                                              _this.onchange_agent_address_field('address', event.target.value);
                                          }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_address') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_address}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">post code
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.agent.data.postcode}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('postcode', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_postcode') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_postcode}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">city
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <select className="form-control city_select" value={_this.state.agent.data.city}
                                        onChange={(event) => {
                                            _this.onchange_agent_address_field('city', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('agent_city') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_city}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">state
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.agent.data.state}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('state', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_state') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_state}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">country
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <select className="form-control country_select" value={_this.state.agent.data.country}
                                        onChange={(event) => {
                                            _this.onchange_agent_address_field('country', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.country_list.map(country => <option key={country.id} value={country.id}>{country.code_isoa2}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('agent_country') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_country}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">contact
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="text" className="form-control" value={_this.state.agent.data.contact}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('contact', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_contact') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_contact}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">telephone number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.agent.data.tel_num}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('tel_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_tel_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_tel_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">mobile number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.agent.data.mobile_num}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('mobile_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_mobile_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_mobile_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">fax number
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="number" className="form-control" value={_this.state.agent.data.fax_num}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('fax_num', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_fax_num') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_fax_num}</div> : ''}
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-4 col-xs-12 col-form-label">e-mail address
                            </label>
                            <div className="col-sm-8 col-xs-12">
                                <input type="email" className="form-control" value={_this.state.agent.data.email}
                                       onChange={(event) => {
                                           _this.onchange_agent_address_field('email', event.target.value);
                                       }}
                                />
                                {_this.state.form_errors.hasOwnProperty('agent_email') ?
                                    <div className="text-danger small">{_this.state.form_errors.agent_email}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="card">
                    <div className="card-header bg-dark text-white text-uppercase">
                        Origin/Destination Port and information
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-3">
                                <label htmlFor="place_of_receipt">Place of Receipt</label>
                                <select className="form-control" value={_this.state.city_id_of_receipt}
                                        onChange={(event) => {
                                            _this.onchange_field('city_id_of_receipt', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('city_id_of_receipt') ?
                                    <div className="text-danger small">{_this.state.form_errors.city_id_of_receipt}</div> : ''}
                            </div>

                            <div className="col-3">
                                <label htmlFor="port_of_loading">Port of Loading</label>
                                <select className="form-control city_select"
                                        value={_this.state.port_id_of_loading}
                                        onChange={(event) => {
                                            _this.onchange_field('port_id_of_loading', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.seaport_list.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('port_id_of_loading') ?
                                    <div className="text-danger small">{_this.state.form_errors.port_id_of_loading}</div> : ''}
                            </div>

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
                                       value={_this.state.voyage_number}
                                       onChange={(event) => {
                                           _this.onchange_field('voyage_number', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('voyage_number') ?
                                    <div className="text-danger small">{_this.state.form_errors.voyage_number}</div> : ''}
                            </div>

                            <div className="col-3 mt-3">
                                <label htmlFor="tentative_mother_vessel">Tentative Mother Vessel</label>
                                <input type="text" className="form-control"
                                       value={_this.state.mother_vessel_name}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_vessel_name', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_vessel_name') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_vessel_name}</div> : ''}
                            </div>

                            <div className="col-3 mt-3">
                                <label htmlFor="voyage_no_2">Voyage No</label>
                                <input type="text" className="form-control"
                                       value={_this.state.mother_vessel_voyage_number}
                                       onChange={(event) => {
                                           _this.onchange_field('mother_vessel_voyage_number', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('mother_vessel_voyage_number') ?
                                    <div className="text-danger small">{_this.state.form_errors.mother_vessel_voyage_number}</div> : ''}
                            </div>

                            <div className="col-3 mt-3">
                                <label htmlFor="port_of_discharge">Port of Discharge</label>
                                <select className="form-control" value={_this.state.port_id_of_discharge}
                                        onChange={(event) => {
                                            _this.onchange_field('port_id_of_discharge', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.seaport_list.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('port_id_of_discharge') ?
                                    <div className="text-danger small">{_this.state.form_errors.port_id_of_discharge}</div> : ''}
                            </div>

                            <div className="col-3 mt-3">
                                <label htmlFor="final_destination">Final Destination</label>
                                <select className="form-control city_select" value={_this.state.city_id_of_final_destination}
                                        onChange={(event) => {
                                            _this.onchange_field('city_id_of_final_destination', event.target.value);
                                        }}
                                >
                                    <option value="">--</option>
                                    {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                                </select>
                                {_this.state.form_errors.hasOwnProperty('city_id_of_final_destination') ?
                                    <div className="text-danger small">{_this.state.form_errors.city_id_of_final_destination}</div> : ''}
                            </div>

                            <div className="col-12 mt-3">
                                <label htmlFor="excess_value_declaration">Excess value declaration refers to clause 6(4) (8) &
                                    (C) on reverse side</label>
                                <input type="text" className="form-control"
                                       value={_this.state.excess_value_declaration}
                                       onChange={(event) => {
                                           _this.onchange_field('excess_value_declaration', event.target.value);
                                       }}/>
                                {_this.state.form_errors.hasOwnProperty('excess_value_declaration') ?
                                    <div className="text-danger small">{_this.state.form_errors.excess_value_declaration}</div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card col-12">
                <div className="card-header bg-dark text-white">Container Plan
                </div>
                <div className="card-body">
                    {_this.state.form_errors.hasOwnProperty('container_list') ? <div className="text-danger">{_this.state.form_errors.container_list}</div> : ''}
                    <div>
                        <button onClick={(event) => {
                            _this.container_prompt();
                        }}><i className="fa fa-plus"></i> add container
                        </button>
                    </div>
                    <div>
                        <table className="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th></th>
                                <th>container type</th>
                                <th>capacity cbm</th>
                                <th>container number</th>
                                <th>container serial</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.container_list.length ?
                                _this.state.container_list.map((ct, i) => {
                                    const container_type = _this.state.cache.container_type_list.filter(ctinloop => ctinloop.id == ct.container_type_id)[0];
                                    return <tr key={i}>
                                        <td>
                                            <div className="position-relative">
                                                {ct.form_errors.hasOwnProperty('id') ?
                                                    <div className="text-danger small">{ct.form_errors.id}</div> : ''}
                                                {ct.form_errors.hasOwnProperty('list_index') ?
                                                    <div className="text-danger small">{ct.form_errors.list_index}</div> : ''}
                                                {ct.form_errors.hasOwnProperty('container_serial') ?
                                                    <div className="text-danger small">{ct.form_errors.container_serial}</div> : ''}
                                                {ct.form_errors.hasOwnProperty('container_number') ?
                                                    <div className="text-danger small">{ct.form_errors.container_number}</div> : ''}
                                                {ct.errors.map((err, i) => <div className="text-danger small" key={i}>{err}</div>)}
                                                <div className="fa fa-times-circle text-danger small position-absolute top0-right0" onClick={(event) => {
                                                    _this.remove_container_from_list(i)
                                                }}></div>
                                            </div>
                                        </td>
                                        <td>{container_type.name}</td>
                                        <td>{container_type.capacity_cbm}</td>
                                        <td>{ct.container_serial}</td>
                                        <td>{ct.container_number}</td>
                                    </tr>;
                                })
                                : <tr>
                                    <td colSpan={5} className="text-center">No container added</td>
                                </tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card col-12">
                <div className="card-header bg-dark text-white">
                    GOODS INFORMATION
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-3">
                            <label htmlFor="goods_no_of_packages">Number <br/>of <br/>Packages</label>
                            <input type="number" className="form-control"
                                   value={_this.state.goods_no_of_packages}
                                   onChange={(event) => {
                                       _this.onchange_field('goods_no_of_packages', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('goods_no_of_packages') ?
                                <div className="text-danger small">{_this.state.form_errors.goods_no_of_packages}</div> : ''}
                        </div>

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
                    <div className="row">
                        <div className="col-3">
                            <label htmlFor="goods_measurement_cbm">Number of Pallets</label>
                            <input type="number" step={0.01} className="form-control"
                                   value={_this.state.no_of_pallet}
                                   onChange={(event) => {
                                       _this.onchange_field('no_of_pallet', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('no_of_pallet') ?
                                <div className="text-danger small">{_this.state.form_errors.no_of_pallet}</div> : ''}
                        </div>

                        <div className="col-3">
                            <label htmlFor="goods_measurement_cbm">Lot Number</label>
                            <input type="number" step={0.01} className="form-control"
                                   value={_this.state.lot_number}
                                   onChange={(event) => {
                                       _this.onchange_field('lot_number', event.target.value);
                                   }}
                            />
                            {_this.state.form_errors.hasOwnProperty('lot_number') ?
                                <div className="text-danger small">{_this.state.form_errors.lot_number}</div> : ''}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label htmlFor="goods_description" className="mt-3">Description of packages goods particulars furnishing
                                by shipper</label>
                            {_this.state.form_errors.hasOwnProperty('goods_note') ?
                                <div className="text-danger small">{_this.state.form_errors.goods_note}</div> : ''}
                            <textarea className="form-control" cols="30"
                                      rows="10"
                                      value={_this.state.goods_note}
                                      onChange={(event) => {
                                          _this.onchange_field('goods_note', event.target.value);
                                      }}
                            >
                            </textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card col-12">
                <div className="card-header bg-dark text-white">
                    OTHERS
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-12">
                            <label htmlFor="sea_freight_details">FREIGHT DETAILS, CHARGES, ETC.</label>
                            {_this.state.form_errors.hasOwnProperty('other_notes') ?
                                <div className="text-danger small">{_this.state.form_errors.other_notes}</div> : ''}
                            <textarea className="form-control" cols="30" rows="10"
                                      value={_this.state.other_notes}
                                      onChange={(event) => {
                                          _this.onchange_field('other_notes', event.target.value);
                                      }}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card col-12">
                <div className="card-header bg-dark text-white text-uppercase">
                    Notes
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-6">
                            <label htmlFor="place_of_issue">Place of Issue</label>
                            <select className="form-control"
                                    value={_this.state.issue_city_id}
                                    onChange={(event) => {
                                        _this.onchange_field('issue_city_id', event.target.value);
                                    }}
                            >
                                <option value="">--</option>
                                {_this.state.cache.city_list.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                            </select>
                            {_this.state.form_errors.hasOwnProperty('issue_city_id') ?
                                <div className="text-danger small">{_this.state.form_errors.issue_city_id}</div> : ''}
                        </div>

                        <div className="col-6">
                            <label htmlFor="date_of_issue">Date of Issue</label>
                            <div className="input-group">
                                <input type="date" className="form-control"
                                       value={_this.state.issue_date}
                                       onChange={(event) => {
                                           _this.onchange_field('issue_date', event.target.value);
                                       }}
                                />
                                <button className="input-group-addon btn" onClick={(event) => {
                                    _this.setState({
                                        issue_date: window.today_date_for_dateinput()
                                    });
                                }}>today
                                </button>
                            </div>
                            {_this.state.form_errors.hasOwnProperty('issue_date') ?
                                <div className="text-danger small">{_this.state.form_errors.issue_date}</div> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div>
                    {_this.state.msg.map((msg, i) => <div key={i} className="text-success">{msg}</div>)}
                    {_this.state.errors.map((err, i) => <div key={i} className="text-danger">{err}</div>)}
                </div>
                <div>
                    <button type="button" className="btn btn-primary" onClick={(event) => {
                        _this.save();
                    }}>Submit
                    </button>
                </div>
            </div>
        </div>
    </div>;
}