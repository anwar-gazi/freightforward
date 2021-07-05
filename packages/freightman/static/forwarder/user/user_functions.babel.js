function ForwarderUserForm(props) {
    let context = props.context;
    const _this = props.context;

    return <div className="container">
        <div className="text-center py-4 bg-success">
            <h2 className="">{_this.state.user_formdata.id ? 'View/Update' : 'Register'} User for {_this.state.organization.title} <span
                className="badge badge-info">{_this.state.organization.type}</span></h2>
        </div>
        <div className="card">
            <div className="card-header">
                {context.state.user_formdata.field_errors.hasOwnProperty('org_id') ?
                    <div className="text-danger small">Organization: {context.state.user_formdata.field_errors.org_id}</div> : ''}
            </div>
            <div className="card-body card-block">
                <div className="form-group">
                    <label htmlFor="fname" className=" form-control-label">First Name <Required/></label>
                    <input type="text" id="fname" value={_this.state.user_formdata.firstname}
                           className={context.state.user_formdata.field_errors.hasOwnProperty('firstname') ? 'is-invalid form-control' : 'form-control'}
                           onChange={context.onchange_user_fname}/>
                    {context.state.user_formdata.field_errors.hasOwnProperty('firstname') ?
                        <div className="text-danger small">{context.state.user_formdata.field_errors.firstname}</div> : ''}
                </div>
                <div className="form-group">
                    <label htmlFor="lname" className=" form-control-label">Last Name <Required/></label>
                    <input type="text" id="lname" value={_this.state.user_formdata.lastname}
                           className={context.state.user_formdata.field_errors.hasOwnProperty('lastname') ? 'is-invalid form-control' : 'form-control'}
                           onChange={context.onchange_user_lname}/>
                    {context.state.user_formdata.field_errors.hasOwnProperty('lastname') ?
                        <div className="text-danger small">{context.state.user_formdata.field_errors.lastname}</div> : ''}
                </div>
                <div className="form-group">
                    <label htmlFor="email" className=" form-control-label">Email <Required/></label>
                    <input type="text" id="email" value={_this.state.user_formdata.email}
                           className={context.state.user_formdata.field_errors.hasOwnProperty('email') ? 'is-invalid form-control' : 'form-control'}
                           onChange={context.onchange_user_email}/>
                    {context.state.user_formdata.field_errors.hasOwnProperty('email') ?
                        <div className="text-danger small">{context.state.user_formdata.field_errors.email}</div> : ''}
                </div>
                <div className="form-group">
                    <label htmlFor="pass" className=" form-control-label">Password <Required/></label>
                    {_this.state.user_formdata.id ?
                        <a href={_this.state.user_formdata.password_reset_url} target="_blank">Reset</a>
                        :
                        <input type="text" id="pass" placeholder=""
                               className={context.state.user_formdata.field_errors.hasOwnProperty('password') ? 'is-invalid form-control' : 'form-control'}
                               onChange={context.onchange_user_password}/>
                    }

                    {context.state.user_formdata.field_errors.hasOwnProperty('password') ?
                        <div className="text-danger small">{context.state.user_formdata.field_errors.password}</div> : ''}
                </div>
                <div className="form-group">
                    <label htmlFor="auth" className="form-control-label">User Level <Required/>
                        <a className="btn btn-sm btn-outline-secondary" href={window.urlfor_auth_level_create}><i className="fa fa-plus small"></i> add</a></label>
                    {_this.state.auth_level_list.length ?
                        <select id="auth" value={_this.state.user_formdata.auth_level_name}
                                className={context.state.user_formdata.field_errors.hasOwnProperty('auth_level_name') ? 'is-invalid form-control' : 'form-control'}
                                onChange={context.onchange_auth_level_id}>
                            <option value={''}>--</option>
                            {context.state.auth_level_list.map((levelname, i) => <option key={i} value={levelname}>{levelname}</option>)}
                        </select>
                        :
                        <p>No Auth Level defined for this organization. </p>
                    }

                    {context.state.user_formdata.field_errors.hasOwnProperty('auth_level_name') ?
                        <div className="text-danger small">{context.state.user_formdata.field_errors.auth_level_name}</div> : ''}
                </div>
                <div className="form-actions">
                    <div>{context.state.user_formdata.error_msg ? <div className="text-danger small">{context.state.user_formdata.error_msg}</div> : ''}</div>
                    <div>
                        <button type="submit" className="btn btn-outline-primary px-4 btn-lg" onClick={context.onusersavebuttonclick}
                                disabled={context.state.user_formdata.save_processing}>
                            Save
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
        </div>
    </div>;
}