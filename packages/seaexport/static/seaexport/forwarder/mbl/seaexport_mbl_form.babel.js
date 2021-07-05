function SeaExportMBLFormRender(props) {
    const _this = props.context;
    return <div className="container">
        <h1 className="text-center text-dark font-3xl">Master Bill of Lading</h1>

        <div className="row">
            <div className="col">
                <div className="form-group">
                    <label>MBL number</label>
                    <input type="text" className="form-control" value={_this.state.mbl_number} onChange={(event) => {
                        _this.onchange_field('mbl_number', event.target.value.trim());
                    }}/>
                    {_this.state.form_errors.hasOwnProperty('mbl_number') ?
                        <div className="text-danger small">{_this.state.form_errors.mbl_number}</div> : ''}

                    {_this.state.form_errors.hasOwnProperty('mbl_public_id') ?
                        <div className="text-danger small">MBL Unique ID: {_this.state.form_errors.mbl_public_id}</div> : ''}
                </div>
            </div>
        </div>

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
                        </div>
                    </div>
                </div>
            </div>

            <div className="card col-12">
                <div className="card-header bg-dark text-white text-center">
                    Linked HBL
                </div>
                <div className="card-body">
                    <div>
                        <button className="" onClick={_this.hbl_propmt}><i className="fa fa-plus"></i> add HBL</button>
                    </div>
                    {_this.state.form_errors.hasOwnProperty('hbl_list_json') ?
                        <div className="text-danger small text-center">{_this.state.form_errors.hbl_list_json}</div> : ''}
                    {_this.state.hbl_list.length ? (function () {
                        return <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th>HBL ID</th>
                                <th>Shipper</th>
                                <th>Consignee</th>
                                <th>CBM</th>
                                <th>Allocated Container List</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.hbl_list.map((hbl, i) => {
                                return <tr key={i}>
                                    <td>{hbl.public_id}</td>
                                    <td>{hbl.shipper_name}</td>
                                    <td>{hbl.consignee_name}</td>
                                    <td>{hbl.cbm}</td>
                                    <td>
                                        {hbl.allocated_container_list.length ?
                                            <table>
                                                <thead>
                                                <tr>
                                                    <th>container serial</th>
                                                    <th>container number</th>
                                                    <th>container type</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {hbl.allocated_container_list.map((allocont, alci) =>
                                                    <tr key={alci}>
                                                        <td>{allocont.container_serial}</td>
                                                        <td>{allocont.container_number}</td>
                                                        <td>{allocont.container_type.name}</td>
                                                    </tr>)}
                                                </tbody>
                                            </table>
                                            : 'No Container Allocated'}
                                    </td>
                                </tr>;
                            })}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan={3}>Total CBM</td>
                                <td>{_this.hbl_cbm_total()}</td>
                                <td></td>
                            </tr>
                            </tfoot>
                        </table>;
                    }()) : <div className="text-center">NO HBL Linked</div>}
                </div>
            </div>

            {/*<div className="card col-12">*/}
            {/*<div className="card-header bg-dark text-white text-center">Container Plan*/}
            {/*</div>*/}
            {/*<div className="card-body">*/}
            {/*<div>*/}
            {/*<label onClick={() => {*/}

            {/*}}><input type="checkbox" checked={_this.state.use_hbl_container_plan}*/}
            {/*onChange={(event) => {*/}
            {/*_this.onchange_field('use_hbl_container_plan', true);*/}
            {/*}}/> use HBL container plan</label>*/}
            {/*</div>*/}
            {/*/!*<div>*!/*/}
            {/*/!*<button onClick={(event) => {*!/*/}
            {/*/!*_this.container_prompt();*!/*/}
            {/*/!*}}><i className="fa fa-plus"></i> add more container*!/*/}
            {/*/!*</button>*!/*/}
            {/*/!*</div>*!/*/}
            {/*<div>*/}
            {/*<div>*/}
            {/*<div>CBM: {_this.state.goods_cbm}</div>*/}
            {/*<div>Allocated CBM: {(_this.state.hbl_list.length || _this.state.container_list.length) ?*/}
            {/*_this.allocated_cbm_by_hbl_list_and_container_list() : _this.allocated_cbm_by_hbl_list_and_container_list()}</div>*/}
            {/*<div>Remaining CBM: {(_this.state.hbl_list.length || _this.state.container_list.length) ?*/}
            {/*_this.unallocated_cbm() : _this.unallocated_cbm()}</div>*/}
            {/*</div>*/}
            {/*<table className="table table-striped table-bordered">*/}
            {/*<thead>*/}
            {/*<tr>*/}
            {/*<th></th>*/}
            {/*<th>container type</th>*/}
            {/*<th>measurement(ft)(l,h,w)</th>*/}
            {/*<th>capacity cbm</th>*/}
            {/*<th>allocated cbm</th>*/}
            {/*<th>serial</th>*/}
            {/*</tr>*/}
            {/*</thead>*/}
            {/*{_this.state.use_hbl_container_plan ?*/}
            {/*(_this.state.hbl_list.length ?*/}
            {/*_this.state.hbl_list.map((hbl, hbl_i) => {*/}
            {/*return <tbody key={hbl_i}>*/}
            {/*<tr>*/}
            {/*<th colSpan={6}>HBL#{hbl.public_id}</th>*/}
            {/*</tr>*/}
            {/*{*/}
            {/*hbl.allocated_container_list.map((allocont, allocont_i) => {*/}
            {/*return <tr key={allocont_i}>*/}
            {/*<td></td>*/}
            {/*<td>{allocont.container_type.name}</td>*/}
            {/*<td>{allocont.container_type.length_ft},{allocont.container_type.height_ft},{allocont.container_type.width_ft}</td>*/}
            {/*<td>{allocont.container_type.capacity_cbm}</td>*/}
            {/*<td>{allocont.allocated_cbm}</td>*/}
            {/*<td>{allocont.container_serial}</td>*/}
            {/*</tr>;*/}
            {/*})*/}
            {/*}*/}
            {/*</tbody>;*/}
            {/*})*/}
            {/*:*/}
            {/*<thead>*/}
            {/*<tr>*/}
            {/*<th colSpan={6}>No HBL Linked</th>*/}
            {/*</tr>*/}
            {/*</thead>)*/}
            {/*:*/}
            {/*<thead>*/}
            {/*<tr>*/}
            {/*<th colSpan={6}>Not using HBL container info</th>*/}
            {/*</tr>*/}
            {/*</thead>}*/}
            {/*/!*<tbody>*!/*/}
            {/*/!*<tr>*!/*/}
            {/*/!*<th colSpan={6}>Added container for this MBL</th>*!/*/}
            {/*/!*</tr>*!/*/}
            {/*/!*{*!/*/}
            {/*/!*_this.state.container_list.length ?*!/*/}
            {/*/!*_this.state.container_list.map((ct, i) => {*!/*/}
            {/*/!*return <tr key={i}>*!/*/}
            {/*/!*<td>*!/*/}
            {/*/!*{ct.form_errors.hasOwnProperty('id') ?*!/*/}
            {/*/!*<div className="text-danger small">{ct.form_errors.id}</div> : ''}*!/*/}
            {/*/!*{ct.form_errors.hasOwnProperty('list_index') ?*!/*/}
            {/*/!*<div className="text-danger small">{ct.form_errors.list_index}</div> : ''}*!/*/}
            {/*/!*{ct.errors.map((err, i) => <div className="text-danger small" key={i}>{err}</div>)}*!/*/}
            {/*/!*<button onClick={(event) => {*!/*/}
            {/*/!*_this.remove_container_from_list(i)*!/*/}
            {/*/!*}}>remove*!/*/}
            {/*/!*</button>*!/*/}
            {/*/!*</td>*!/*/}
            {/*/!*<td>{ct.name}*!/*/}
            {/*/!*</td>*!/*/}
            {/*/!*<td>{ct.length_ft}, {ct.height_ft}, {ct.width_ft}*!/*/}
            {/*/!*</td>*!/*/}
            {/*/!*<td>{ct.capacity_cbm}</td>*!/*/}
            {/*/!*<td>{ct.allocated_cbm}*!/*/}
            {/*/!*{ct.form_errors.hasOwnProperty('allocated_cbm') ?*!/*/}
            {/*/!*<div className="text-danger small">{ct.form_errors.allocated_cbm}</div> : ''}*!/*/}
            {/*/!*</td>*!/*/}
            {/*/!*<td>{ct.serial}*!/*/}
            {/*/!*{ct.form_errors.hasOwnProperty('container_serial') ?*!/*/}
            {/*/!*<div className="text-danger small">{ct.form_errors.container_serial}</div> : ''}*!/*/}
            {/*/!*</td>*!/*/}
            {/*/!*</tr>;*!/*/}
            {/*/!*})*!/*/}
            {/*/!*: <tr>*!/*/}
            {/*/!*<th colSpan={6}>No added additional container</th>*!/*/}
            {/*/!*</tr>*!/*/}
            {/*/!*}*!/*/}
            {/*/!*</tbody>*!/*/}
            {/*</table>*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*</div>*/}

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
            <div className='col'>
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
    </div>
        ;
}