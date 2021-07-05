function Expandbtn(props) {
    return <div className="pull-right position-absolute right0 top0 cursor-pointer" onClick={props.onClick}><i className="fa fa-expand"></i></div>;
}

function Minimizebtn(props) {
    return <div className="pull-right position-absolute right0 top0 cursor-pointer" onClick={props.onClick}><i className="fa fa-window-minimize"></i></div>;
}

function ShipperForm(props) {
    let context = props.context;
    const _this = props.context;
    return <div className="card">
        <div className="card-header">
            <div className="small">
                {context.state.formdata.error_msg ? <div className="text-danger">{context.state.formdata.error_msg}</div> : ''}
                {Object.keys(context.state.formdata.field_errors).length ? <div className="text-danger">please correct errors below</div> : ''}
                {context.state.formdata.msg ?
                    <div className="text-success">{context.state.formdata.msg}</div> : ''}
            </div>
        </div>
        <div className="card-body card-block" hidden={props.minimize}>
            <div className="form-group">
                <label htmlFor="company" className=" form-control-label">Company <Required/></label>
                <input type="text" id="company" value={_this.state.formdata.company_name}
                       className={context.state.formdata.field_errors.hasOwnProperty('company_name') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_companyname}/>
                {context.state.formdata.field_errors.hasOwnProperty('company_name') ?
                    <div className="text-danger small">{context.state.formdata.field_errors.company_name}</div> : ''}
            </div>

            <div className="form-group">
                <label htmlFor="prefix" className=" form-control-label">Prefix <Required/></label>
                <input type="text" maxLength={3} minLength={3} id="prefix" value={_this.state.formdata.prefix}
                       className={_this.state.formdata.field_errors.hasOwnProperty('prefix') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_companyprefix}/>
                {context.state.formdata.field_errors.hasOwnProperty('prefix') ?
                    <div className="text-danger small">{context.state.formdata.field_errors.prefix}</div> : ''}
            </div>

            <div className="card">
                <div className="card-header">
                    <strong>Default Address</strong>
                </div>
                <div className="card-body card-block">
                    <div className="form-group">
                        <label htmlFor="address" className="form-control-label">Address <Required/></label>
                        <textarea id="address"
                                  value={_this.state.formdata.address}
                                  className={context.state.formdata.field_errors.hasOwnProperty('address') ? 'is-invalid form-control' : 'form-control'}
                                  onChange={context.onchange_address}></textarea>
                        {context.state.formdata.field_errors.hasOwnProperty('address') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.address}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="postcode" className="form-control-label">Postcode <Required/></label>
                        <input id="postcode" value={_this.state.formdata.postcode}
                               className={context.state.formdata.field_errors.hasOwnProperty('postcode') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_postcode}/>
                        {context.state.formdata.field_errors.hasOwnProperty('postcode') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.postcode}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="city" className=" form-control-label">City <Required/></label>
                        <select id="city" value={_this.state.formdata.city}
                                className={context.state.formdata.field_errors.hasOwnProperty('city') ? 'is-invalid form-control' : 'form-control'}
                                onChange={context.onchange_city}>
                            <option>--</option>
                            {context.state.city_list.map(city => <option value={city.id}
                                                                         key={city.id}>{city.name}
                            </option>)}
                        </select>
                        {context.state.formdata.field_errors.hasOwnProperty('city') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.city}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="state" className=" form-control-label">State <Required/></label>
                        <input type="text" id="state" value={_this.state.formdata.state}
                               className={context.state.formdata.field_errors.hasOwnProperty('state') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_state}/>
                        {context.state.formdata.field_errors.hasOwnProperty('state') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.state}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="country" className=" form-control-label">Country <Required/></label>
                        <select id="country" value={_this.state.formdata.country}
                                className={context.state.formdata.field_errors.hasOwnProperty('country') ? 'is-invalid form-control' : 'form-control'}
                                onChange={context.onchange_country}>
                            <option>--</option>
                            {context.state.country_list.map(country => <option value={country.id}
                                                                               key={country.id}>{country.code_isoa2}
                            </option>)}
                        </select>
                        {context.state.formdata.field_errors.hasOwnProperty('country') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.country}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="contact" className=" form-control-label">Contact <Required/></label>
                        <input type="text" id="contact" value={_this.state.formdata.contact}
                               className={context.state.formdata.field_errors.hasOwnProperty('contact') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_contact}/>
                        {context.state.formdata.field_errors.hasOwnProperty('contact') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.contact}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone" className=" form-control-label">Phone <Required/></label>
                        <input type="text" id="phone" value={_this.state.formdata.tel_num}
                               className={context.state.formdata.field_errors.hasOwnProperty('tel_num') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_tel_num}/>
                        {context.state.formdata.field_errors.hasOwnProperty('tel_num') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.tel_num}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobile" className="form-control-label">Mobile <Required/></label>
                        <input type="text" id="mobile" value={_this.state.formdata.mobile_num}
                               className={context.state.formdata.field_errors.hasOwnProperty('mobile_num') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_mobile_num}/>
                        {context.state.formdata.field_errors.hasOwnProperty('mobile_num') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.mobile_num}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="fax" className="form-control-label">Fax <Required/></label>
                        <input type="text" id="fax" value={_this.state.formdata.fax_num}
                               className={context.state.formdata.field_errors.hasOwnProperty('fax_num') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_fax_num}/>
                        {context.state.formdata.field_errors.hasOwnProperty('fax_num') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.fax_num}</div> : ''}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-control-label">Email <Required/></label>
                        <input type="text" id="email" value={_this.state.formdata.email}
                               className={context.state.formdata.field_errors.hasOwnProperty('email') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_email}/>
                        {context.state.formdata.field_errors.hasOwnProperty('email') ?
                            <div className="text-danger small">{context.state.formdata.field_errors.email}</div> : ''}
                    </div>
                </div>
            </div>
            <div className="form-actions">
                <div>{context.state.formdata.error_msg ? <div className="text-danger small">{context.state.formdata.error_msg}</div> : ''}</div>
                <div>
                    <button type="submit" className="btn btn-outline-primary btn-sm px-4" onClick={context.onsavebuttonclick}
                            disabled={context.state.formdata.save_processing}>
                        Save
                    </button>
                    {context.state.formdata.save_processing ?
                        <span className="whitespace-nr mx-1">
                                            <i className="fa fa-spin fa-spinner"></i>
                                            <span className="small"> processing</span>
                                        </span>
                        : ''}
                    {context.state.formdata.msg ?
                        <div className="text-success small">{context.state.formdata.msg}</div> : ''}
                </div>
            </div>
        </div>
    </div>;
}

function ShipperUserForm(props) {
    let context = props.context;

    return <div className="card">
        <div className="card-header">
            <div className="cursor-pointer" onClick={context.toggle_user_form}>Register User
                {context.state.formdata.id ? ' for ' + context.state.formdata.company_name : <span className="small text-danger"> (register shipper first)</span>}
            </div>
            {context.state.show_user_add_form ? '' : <Expandbtn onClick={context.expand_user_form}/>}
            {context.state.show_user_add_form ? <Minimizebtn onClick={context.minimize_user_form}/> : ''}
        </div>
        <div className="card-body card-block" hidden={props.minimize}>
            {/*<div className="form-group">*/}
            {/*<label htmlFor="uname" className=" form-control-label">Username <Required/></label>*/}
            {/*<input type="text" id="uname" placeholder=""*/}
            {/*className={context.state.user_formdata.field_errors.hasOwnProperty('username') ? 'is-invalid form-control' : 'form-control'}*/}
            {/*onChange={context.onchange_user_username}/>*/}
            {/*{context.state.user_formdata.field_errors.hasOwnProperty('username') ?*/}
            {/*<div className="text-danger small">{context.state.user_formdata.field_errors.username}</div> : ''}*/}
            {/*</div>*/}
            <div className="form-group">
                <label htmlFor="fname" className=" form-control-label">First Name <Required/></label>
                <input type="text" id="fname" placeholder=""
                       className={context.state.user_formdata.field_errors.hasOwnProperty('firstname') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_user_fname}/>
                {context.state.user_formdata.field_errors.hasOwnProperty('firstname') ?
                    <div className="text-danger small">{context.state.user_formdata.field_errors.firstname}</div> : ''}
            </div>
            <div className="form-group">
                <label htmlFor="lname" className=" form-control-label">Last Name <Required/></label>
                <input type="text" id="lname" placeholder=""
                       className={context.state.user_formdata.field_errors.hasOwnProperty('lastname') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_user_lname}/>
                {context.state.user_formdata.field_errors.hasOwnProperty('lastname') ?
                    <div className="text-danger small">{context.state.formdata.field_errors.lastname}</div> : ''}
            </div>
            <div className="form-group">
                <label htmlFor="email" className=" form-control-label">Email <Required/></label>
                <input type="text" id="email" placeholder=""
                       className={context.state.user_formdata.field_errors.hasOwnProperty('email') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_user_email}/>
                {context.state.user_formdata.field_errors.hasOwnProperty('email') ?
                    <div className="text-danger small">{context.state.user_formdata.field_errors.email}</div> : ''}
            </div>
            <div className="form-group">
                <label htmlFor="pass" className=" form-control-label">Password <Required/></label>
                <input type="text" id="pass" placeholder=""
                       className={context.state.user_formdata.field_errors.hasOwnProperty('password') ? 'is-invalid form-control' : 'form-control'}
                       onChange={context.onchange_user_password}/>
                {context.state.user_formdata.field_errors.hasOwnProperty('password') ?
                    <div className="text-danger small">{context.state.user_formdata.field_errors.password}</div> : ''}
            </div>
            <div className="form-group">
                <label htmlFor="auth" className="form-control-label">User Level <Required/></label>
                <select id="auth" placeholder=""
                        className={context.state.user_formdata.field_errors.hasOwnProperty('auth_level_id') ? 'is-invalid form-control' : 'form-control'}
                        onChange={context.onchange_auth_level_id}>
                    <option value={''}>--</option>
                    {context.state.auth_level_list.map(level => <option key={level.id} value={level.id}>{level.level_name}</option>)}
                </select>
                {context.state.user_formdata.field_errors.hasOwnProperty('auth_level_id') ?
                    <div className="text-danger small">{context.state.user_formdata.field_errors.auth_level_id}</div> : ''}
            </div>
            <div className="form-actions">
                <div>{context.state.user_formdata.error_msg ? <div className="text-danger small">{context.state.user_formdata.error_msg}</div> : ''}</div>
                {context.state.user_formdata.field_errors.hasOwnProperty('shipper_id') ?
                    <div className="text-danger small">Shipper: {context.state.user_formdata.field_errors.shipper_id}</div> : ''}
                <div>
                    <button type="submit" className="btn btn-outline-primary btn-sm" onClick={context.onusersavebuttonclick}
                            disabled={context.state.user_formdata.save_processing}>
                        Complete user registration
                    </button>
                    {context.state.user_formdata.save_processing ?
                        <span className="whitespace-nr mx-1">
                                            <i className="fa fa-spin fa-spinner"></i>
                                            <span className="small"> processing</span>
                                        </span>
                        : ''}
                    {context.state.user_formdata.msg ?
                        <div className="text-success small">{context.state.user_formdata.msg}</div> : ''}
                </div>
            </div>
        </div>
    </div>;
}