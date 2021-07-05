function Errmsg(props) {
    return <div className={props.className + " text-danger"}>{props.msg}</div>;
}

function Required() {
    return <i className="text-danger small">*</i>;
}

function AddressBookInput(props) {
    return <div>
        <div className="sub_title"><b>{props.identifier}</b></div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-labels">Select address to load</label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.onchange_address_selection_setstate_fill_fields(props.identifier)}>
                    <option value="">--</option>
                    {(function () {
                        if (props.identifier == 'shipper') {
                            return props.context.state.address_list.filter(address => address.is_shipper)
                                .map(add => <option key={add.id} value={add.id}>{add.company_name}, {add.address}, {add.city.name}</option>);
                        } else if (props.identifier == 'consignee') {
                            return props.context.state.address_list.filter(address => address.is_consignee)
                                .map(add => <option key={add.id} value={add.id}>{add.company_name}, {add.address}, {add.city.name}</option>);
                        } else {
                            return props.context.state.address_list
                                .map(add => <option key={add.id} value={add.id}>{add.company_name}, {add.address}, {add.city.name}</option>);
                        }
                    }())}
                </select>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">company name<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="company name" onChange={props.context.address_onchange_companyname(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.company_name || ''}/>

                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('company_name') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.company_name}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('company_name') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.company_name}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" onChange={props.context.address_onchange_address(props.identifier)}
                          value={props.context.state.addressbook[props.identifier].data.address || ''}></textarea>

                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('address') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.address}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('address') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.address}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">post code<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="number" className="form-control" onChange={props.context.address_onchange_postcode(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.postcode || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('postcode') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.postcode}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('postcode') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.postcode}</div> : ''}

            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">city<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.address_onchange_city(props.identifier)}
                        value={props.context.state.addressbook[props.identifier].data.city || ''}>
                    <option>--</option>
                    {props.context.state.city_list.map(city => <option value={city.id}
                                                                       key={city.id}>{city.name}
                    </option>)}
                </select>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('city') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.city}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('city') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.city}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">state</label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="state" onChange={props.context.address_onchange_state(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.state || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('state') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.state}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('state') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.state}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">country<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.address_onchange_country(props.identifier)}
                        value={props.context.state.addressbook[props.identifier].data.country || ''}>
                    <option>--</option>
                    {props.context.state.country_list.map(country => <option value={country.id}
                                                                             key={country.id}>{country.code_isoa2}
                    </option>)}
                </select>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('country') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.country}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('country') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.country}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">contact<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="contact" onChange={props.context.address_onchange_contact(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.contact || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('contact') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.contact}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('contact') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.contact}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">telephone number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" onChange={props.context.address_onchange_tel_num(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.tel_num || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('tel_num') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.tel_num}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('tel_num') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.tel_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">mobile number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" onChange={props.context.address_onchange_mobile_num(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.mobile_num || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('mobile_num') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.mobile_num}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('mobile_num') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.mobile_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">fax number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" onChange={props.context.address_onchange_fax_num(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.fax_num || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('fax_num') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.fax_num}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('fax_num') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.fax_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">e-mail address<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="email" className="form-control" placeholder="e-mail address" onChange={props.context.address_onchange_email(props.identifier)}
                       value={props.context.state.addressbook[props.identifier].data.email || ''}/>
                {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('email') ?
                    <div className="text-danger small">{props.context.state.addressbook[props.identifier].field_errors.email}</div> : ''}

                {props.context.state.addressbook[props.identifier].field_warns.hasOwnProperty('email') ?
                    <div className="text-warning small">{props.context.state.addressbook[props.identifier].field_warns.email}</div> : ''}
            </div>
        </div>
        {props.show_addr_type_selection ? (function () {
            return <div className="">
                <div className="headline">
                    <strong>address type <Required/></strong>
                    {props.data.field_errors.hasOwnProperty('address_type') ?
                        <div className="text-danger small">{props.data.field_errors.address_type}</div> : ''}
                </div>
                <div>
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="consignor" name="tmpaddresstype" value='consignor'
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="consignor">consignor</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="pickup" name="tmpaddresstype" value={'pickup'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="pickup">pickup address</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="consignee" name="tmpaddresstype" value={'consignee'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="consignee">consignee</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="delivery" name="tmpaddresstype" value={'delivery'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="delivery">delivery address</label>
                    </div>
                </div>

            </div>;
        }()) : ''}
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label mr-2">notify<Required/>
                {props.data.booking_notify ? <i className="fa fa-check-double small ml-2"> yes</i> : <i className="fa fa-times small ml-2"> no</i>}</label>
        </div>
        <div className="form-check">
            {props.context.state.addressbook[props.identifier].msg.map((msg) => {
                return <div className="text-success small" key={msg}>{msg}</div>
            })}
            {props.context.state.addressbook[props.identifier].misc_errors.map((errmsg) => {
                return <div className="text-danger small" key={errmsg}>{errmsg}</div>
            })}
            {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('address_type') ?
                <div className="text-danger small">Address type: {props.context.state.addressbook[props.identifier].field_errors.address_type}</div> : ''}
            {props.context.state.addressbook[props.identifier].field_errors.hasOwnProperty('org_id') ?
                <div className="text-danger small">Org id: {props.context.state.addressbook[props.identifier].field_errors.org_id}</div> : ''}
            <div className="btn-group">
                {props.context.state.addressbook[props.identifier].save_processing ?
                    <span className="margin-left-10p"><i className="fa fa-spinner fa-spin"></i> processing</span> : ''}
            </div>
        </div>
    </div>;
}

//consignee
function Consigneeaddressinput(props) {
    return <div>
        <div className="sub_title"><b>consignee</b></div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">id</label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="" disabled={true}
                       value={props.context.state.addressbook.consignee.data.address_id ? props.context.state.addressbook.consignee.data.address_id : ''}/>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">company name<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="company name" onChange={props.context.address_onchange_companyname('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('company_name') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.company_name}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" onChange={props.context.address_onchange_address('consignee')} defaultValue={''}></textarea>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('address') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.address}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">post code<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="number" className="form-control" placeholder="post code" onChange={props.context.address_onchange_postcode('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('postcode') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.postcode}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">city<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.address_onchange_city('consignee')}>
                    <option>--</option>
                    {props.context.state.city_list.map(city => <option value={city.id}
                                                                       key={city.id}>{city.name}
                    </option>)}
                </select>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('city') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.city}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">state<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="state" onChange={props.context.address_onchange_state('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('state') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.state}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">country<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <select className="form-control" onChange={props.context.address_onchange_country('consignee')}>
                    <option>--</option>
                    {props.context.state.country_list.map(country => <option value={country.id}
                                                                             key={country.id}>{country.code_isoa2}
                    </option>)}
                </select>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('country') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.country}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">contact<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="contact" onChange={props.context.address_onchange_contact('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('contact') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.contact}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">telephone number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="number" className="form-control" placeholder="telephone number" onChange={props.context.address_onchange_tel_num('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('tel_num') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.tel_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">mobile number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="number" className="form-control" placeholder="mobile number" onChange={props.context.address_onchange_mobile_num('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('mobile_num') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.mobile_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">fax number<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="number" className="form-control" placeholder="fax number" onChange={props.context.address_onchange_fax_num('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('fax_num') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.fax_num}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">e-mail address<Required/></label>
            <div className="col-sm-8 col-xs-12">
                <input type="email" className="form-control" placeholder="e-mail address" onChange={props.context.address_onchange_email('consignee')}/>
                {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('email') ?
                    <div className="text-danger small">{props.context.state.addressbook.consignee.field_errors.email}</div> : ''}
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">notes 1</label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" placeholder="notes 1"></textarea>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">notes 2</label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" placeholder="notes 2"></textarea>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">notes 3</label>
            <div className="col-sm-8 col-xs-12">
                <textarea className="form-control" placeholder="notes 3"></textarea>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label">reference</label>
            <div className="col-sm-8 col-xs-12">
                <input type="text" className="form-control" placeholder="reference"/>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label mr-2">notify<Required/>
                {props.data.booking_notify ? <i className="fa fa-check-double small"></i> : <i className="fa fa-times"></i>}</label>
        </div>
        <div className="form-check">
            {props.context.state.addressbook.consignee.msg.map((msg) => {
                return <div className="text-success small" key={msg}>{msg}</div>
            })}
            {props.context.state.addressbook.consignee.misc_errors.map((errmsg) => {
                return <div className="text-danger small" key={errmsg}>{errmsg}</div>
            })}
            {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('address_type') ?
                <div className="text-danger small">Address type: {props.context.state.addressbook.consignee.field_errors.address_type}</div> : ''}
            {props.context.state.addressbook.consignee.field_errors.hasOwnProperty('org_id') ?
                <div className="text-danger small">Org id: {props.context.state.addressbook.consignee.field_errors.org_id}</div> : ''}
            <div className="btn-group">
                {props.context.state.addressbook.consignee.save_processing ?
                    <span className="margin-left-10p"><i className="fa fa-spinner fa-spin">{''}</i> processing</span> : ''}
            </div>
        </div>
    </div>;
}

function Tempaddressinput(props) {
    return <div className="card">
        <div className="card-header"><b>temporary address</b></div>
        <div className="card-body">
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">id</label>
                <div className="col-sm-8 col-xs-12">
                    <input type="text" className="form-control" placeholder="" disabled={true}
                           value={props.data.data.address_id ? props.data.data.address_id : ''}/>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">company name<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="text" className="form-control" placeholder="company name" onChange={props.context.address_onchange_companyname(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('company_name') ?
                        <div className="text-danger small">{props.data.field_errors.company_name}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">Address<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <textarea className="form-control" onChange={props.context.address_onchange_address(props.identifier)} defaultValue={''}></textarea>
                    {props.data.field_errors.hasOwnProperty('address') ?
                        <div className="text-danger small">{props.data.field_errors.address}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">post code<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="number" className="form-control" placeholder="post code" onChange={props.context.address_onchange_postcode(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('postcode') ?
                        <div className="text-danger small">{props.data.field_errors.postcode}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">city<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <select className="form-control" onChange={props.context.address_onchange_city(props.identifier)}>
                        <option>--</option>
                        {props.context.state.city_list.map(city => <option value={city.id}
                                                                           key={city.id}>{city.name}
                        </option>)}
                    </select>
                    {props.data.field_errors.hasOwnProperty('city') ?
                        <div className="text-danger small">{props.data.field_errors.city}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">state<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="text" className="form-control" placeholder="state" onChange={props.context.address_onchange_state(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('state') ?
                        <div className="text-danger small">{props.data.field_errors.state}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">country<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <select className="form-control" onChange={props.context.address_onchange_country(props.identifier)}>
                        <option>--</option>
                        {props.context.state.country_list.map(country => <option value={country.id}
                                                                                 key={country.id}>{country.code_isoa2}
                        </option>)}
                    </select>
                    {props.data.field_errors.hasOwnProperty('country') ?
                        <div className="text-danger small">{props.data.field_errors.country}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">contact<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="text" className="form-control" placeholder="contact" onChange={props.context.address_onchange_contact(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('contact') ?
                        <div className="text-danger small">{props.data.field_errors.contact}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">telephone number<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="number" className="form-control" placeholder="telephone number" onChange={props.context.address_onchange_tel_num(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('tel_num') ?
                        <div className="text-danger small">{props.data.field_errors.tel_num}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">mobile number<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="number" className="form-control" placeholder="mobile number" onChange={props.context.address_onchange_mobile_num(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('mobile_num') ?
                        <div className="text-danger small">{props.data.field_errors.mobile_num}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">fax number<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="number" className="form-control" placeholder="fax number" onChange={props.context.address_onchange_fax_num(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('fax_num') ?
                        <div className="text-danger small">{props.data.field_errors.fax_num}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">e-mail address<Required/></label>
                <div className="col-sm-8 col-xs-12">
                    <input type="email" className="form-control" placeholder="e-mail address" onChange={props.context.address_onchange_email(props.identifier)}/>
                    {props.data.field_errors.hasOwnProperty('email') ?
                        <div className="text-danger small">{props.data.field_errors.email}</div> : ''}
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">notes 1</label>
                <div className="col-sm-8 col-xs-12">
                    <textarea className="form-control" placeholder="notes 1"></textarea>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">notes 2</label>
                <div className="col-sm-8 col-xs-12">
                    <textarea className="form-control" placeholder="notes 2"></textarea>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">notes 3</label>
                <div className="col-sm-8 col-xs-12">
                    <textarea className="form-control" placeholder="notes 3"></textarea>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-sm-4 col-xs-12 col-form-label">reference</label>
                <div className="col-sm-8 col-xs-12">
                    <input type="text" className="form-control" placeholder="reference"/>
                </div>
            </div>
            <div className="">
                <div className="headline">
                    <strong>address type <Required/></strong>
                    {props.data.field_errors.hasOwnProperty('address_type') ?
                        <div className="text-danger small">{props.data.field_errors.address_type}</div> : ''}
                </div>
                <div>
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="consignor" name="tmpaddresstype" value='consignor'
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="consignor">consignor</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="pickup" name="tmpaddresstype" value={'pickup'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="pickup">pickup address</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="consignee" name="tmpaddresstype" value={'consignee'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="consignee">consignee</label>
                    </div>
                </div>
                <div className="">
                    <div className="custom-control custom-radio">
                        <input type="radio" className="custom-control-input" id="delivery" name="tmpaddresstype" value={'delivery'}
                               onChange={props.context.address_onchange_addresstypefield(props.identifier)}/>
                        <label className="custom-control-label" htmlFor="delivery">delivery address</label>
                    </div>
                </div>
            </div>
        </div>
        <div className="form-group row">
            <label className="col-sm-4 col-xs-12 col-form-label mr-2">notify<Required/>
                {props.data.booking_notify ? <i className="fa fa-check-double small"></i> : <i className="fa fa-times"></i>}</label>
        </div>
        <div className="">
            <div className="btn-group">
                {props.data.save_processing ? <span className="margin-left-10p"><i className="fa fa-spinner fa-spin">{''}</i> processing</span> : ''}
            </div>
        </div>
        <div className="card-footer">
            <div className="margin-top-20p">
                {props.data.msg.map((msg) => {
                    return <div className="text-success small" key={msg}>{msg}</div>
                })}
                {props.data.misc_errors.map((errmsg) => {
                    return <div className="text-danger small" key={errmsg}>{errmsg}</div>
                })}
                {props.data.field_errors.hasOwnProperty('org_id') ?
                    <div className="text-danger small">Org id: {props.field_errors.org_id}</div> : ''}
            </div>
        </div>
    </div>;
}

function Goodsinput(props) {
    let data = props.form_data;
    let tmp = {};
    tmp.formdata = props.context._goods_formdata(props.data.id);
    return <div className="card">
        <div className="card-header">#{props.loopindex + 1}
            <div className="pull-right">
                <button type="button" className="btn btn-sm" onClick={props.context.delete_goods_form(props.data.id)}>delete goods info form</button>
            </div>
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-md-2">
                    <div className="form-group">
                        <label className="small">No of PCS <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('no_of_pieces') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.no_of_pieces}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_no_of_pieces(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label className="small">Package Type <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('package_type') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.package_type}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <select className="form-control" onChange={props.context.onchange_goods_package_type(props.data.id)}>
                                <option value="">--</option>
                                {props.context.state.package_types.map(pak => <option value={pak.id} key={pak.id} className="small">
                                    {pak.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 ">
                    <div className="form-group">
                        <label className="small">Weight (kg) <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('weight_kg') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.weight_kg}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" step="0.1" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_weight_kg(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 ">
                    <div className="form-group">
                        <label className="small">Lengh (cm) <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('length_cm') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.length_cm}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" step="0.1" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_length_cm(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 ">
                    <div className="form-group">
                        <label className="small">Width (cm) <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('width_cm') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.width_cm}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" step="0.1" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_width_cm(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 ">
                    <div className="form-group">
                        <label className="small">Height (cm) <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('height_cm') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.height_cm}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" step="0.1" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_height_cm(props.data.id)}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-3">
                    <div className="form-group">
                        <label className="small">Volumetric Weight KG
                            (cbm <i className="fa fa-question-circle small"
                                    title="l*b*h(all in cm)/6000=volumetric weight;"></i>)
                        </label>
                        <div className="input-group">
                            <input disabled={true} type="text" className="form-control"
                                   value={props.data.volumetric_weight}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label className="small">Chargable Weight
                            {tmp.formdata.formerrors.hasOwnProperty('chargable_weight') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.chargable_weight}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input readOnly={true} type="text" className="form-control"
                                   value={props.data.chargable_weight}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <label className="small">CBM
                            {tmp.formdata.formerrors.hasOwnProperty('cbm') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.cbm}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input readOnly={true} type="text" className="form-control"
                                   value={props.data.cbm}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-2">
                    <div className="form-group">
                        <label className="small">Quantity <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('quantity') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.quantity}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" className="form-control" placeholder="" onChange={props.context.onchange_goods_quantity(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label className="small">Unit price <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('unit_price') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.unit_price}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <input type="number" step="0.01" className="form-control" placeholder=""
                                   onChange={props.context.onchange_goods_unit_price(props.data.id)}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label className="small">Currency <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('currency') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.currency}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <select className="form-control" onChange={props.context.setstate_all_goodsform_currency} value={tmp.formdata.currency}>
                                <option value="">--</option>
                                {props.context.state.currency.map(curr => <option value={curr.id} key={curr.id}
                                                                                  className="small">
                                    {curr.currency_name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <div className="form-group">
                        <label className="small">Shipping Mark <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('shipping_mark') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.shipping_mark}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                            <select className="form-control" onChange={props.context.onchange_goods_shipping_mark(props.data.id)}>
                                <option value="">--</option>
                                <option>As Per Invoice</option>
                            </select>
                            {/*<input type="text" className="form-control" placeholder="" onChange={props.context.onchange_goods_shipping_mark(props.data.id)}/>*/}
                        </div>
                    </div>
                </div>

                <div className="col-md-6 ">
                    <div className="form-group">
                        <label className="small">Goods Description <Required/>
                            {tmp.formdata.formerrors.hasOwnProperty('goods_desc') ?
                                <div className="text-danger small">{tmp.formdata.formerrors.goods_desc}</div>
                                : ''}
                        </label>
                        <div className="input-group">
                                    <textarea className="form-control" onChange={props.context.onchange_goods_goods_desc(props.data.id)} rows={6}>

                                    </textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div className="goods_middle d-none">
                <strong>References</strong>
                <button className="margin-left-20p btn btn-sm btn-secondary small"
                        onClick={props.context.onclick_add_ref_form(props.data.id)}><i className="fa fa-plus"></i> add
                </button>
                {props.data.references.map(ref => {
                    return <div key={ref.form_id}>
                        {ref.errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
                        {ref.formerrors.hasOwnProperty('goodsinfo_id') ?
                            <div className="text-danger small">goodsinfo_id: {ref.formerrors.goodsinfo_id}</div>
                            : ''}
                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label className="form-control-label small">Reference Type <Required/></label>
                                    {ref.formerrors.hasOwnProperty('ref_type_id') ?
                                        <span className="text-danger small">{ref.formerrors.ref_type_id}</span>
                                        : ''}
                                    <select className="form-control" onChange={props.context.onchange_ref_type(props.data.id, ref.form_id)}>
                                        <option>--</option>
                                        {props.context.state.reference_types.map(reftype => <option value={reftype.id}
                                                                                                    key={reftype.id}>{reftype.name}
                                        </option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label className="form-control-label small">Reference Number <Required/></label>
                                    {ref.formerrors.hasOwnProperty('ref_number') ?
                                        <span className="text-danger small">{ref.formerrors.ref_number}</span>
                                        : ''}
                                    <input type="text" className="form-control"
                                           onChange={props.context.onchange_ref_number(props.data.id, ref.form_id)}/>
                                </div>
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-sm" onClick={props.context.delete_goodsref_form(props.data.id, ref.form_id)}>
                                    <i className="fa fa-times"></i></button>
                            </div>
                        </div>
                    </div>;
                })}
            </div>

            <div className="">
                <div className="col-md-12 ">
                    {//<button type="button" className="btn btn-secondary">minimize</button>
                        //<button type="button" className="btn btn-success" onClick={props.on_form_delete}>delete</button>
                    }
                </div>
            </div>
        </div>
        <div className="card-footer">
            {tmp.formdata.saved ?
                <div className="text-success small">Goods Info Save Success</div> : <div className="text-danger small">* Goods Info Data not saved</div>}
            {tmp.formdata.msg.map(msg => <div className="text-info small" key={msg}>{msg}</div>)}
            {tmp.formdata.errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
            {tmp.formdata.formerrors.hasOwnProperty('booking_id') ?
                <div className="text-danger small">booking id: {tmp.formdata.formerrors.booking_id}</div>
                : ''}
        </div>
    </div>
        ;
}

function BookingProcessQueueManager() {
    let jobs = [];
    this.job_add_complete = false;
    this.add_job = function () {
        let job_id = jobs.length + 1;
        jobs.push(job_id);
        return job_id;
    };
    this.job_complete = function (job_id, note) {
        jobs = jobs.filter(each_job_id => each_job_id != job_id);
        if (this.job_add_complete && !jobs.length) {
            //console.info('all job complete. latest job ' + job_id + ' ' + note);
            this.on_all_job_complete();
        }
    };
    this.on_all_job_complete = '';
}