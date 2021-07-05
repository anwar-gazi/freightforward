/*
 'parent' is the trick for context(this)
 So that mixin functions can access the target context
 */

function HBLAjaxMixin(parent) {
    parent.get_container_serial_info = (serial, onsuccess, onerror, onmsg, onajaxcomplete) => {
        const _this = parent;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_container_serial_info,
            data: {serial: serial},
            dataType: 'json',
            success: function (resp) {
                if (resp.msg.length && onmsg) {
                    resp.msg.forEach(msg => onmsg(msg));
                }
                if (resp.success && onsuccess) {
                    onsuccess(resp.data.container_dict);
                } else {
                    if (resp.errors.length && onerror) {
                        resp.errors.forEach(err => onerror(err));
                    }
                    if (resp.form_errors.hasOwnProperty('serial') && onerror) {
                        resp.errors.forEach(err => onerror(resp.form_errors.serial));
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                if (onerror) {
                    onerror(err);
                }
            },
            complete: function (jqXHR, textStatus) {
                if (onajaxcomplete) {
                    onajaxcomplete(textStatus);
                }
            }
        });
    };
    parent.load_hbl = (public_id, onloadsuccess) => {
        const _this = parent;
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Loading HBL</div>');
        let loader = window.modal_alert();
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_hbl_info,
            data: {public_id: public_id},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    _this.setState({
                        hbl_public_id: resp.data.hbl_dict.hbl_public_id,

                        booking_applies: resp.data.hbl_dict.booking_applies,
                        supplier_public_id: resp.data.hbl_dict.supplier_public_id,

                        booking_public_id: resp.data.hbl_dict.booking_public_id,

                        shipper: (function () {
                            const blank = addressbook_state_tpl();
                            blank.data.id = resp.data.hbl_dict.shipper.id;
                            blank.data.company_name = resp.data.hbl_dict.shipper.company_name;
                            blank.data.address = resp.data.hbl_dict.shipper.address;
                            blank.data.postcode = resp.data.hbl_dict.shipper.postcode;
                            blank.data.city = resp.data.hbl_dict.shipper.city_id;
                            blank.data.state = resp.data.hbl_dict.shipper.state;
                            blank.data.country = resp.data.hbl_dict.shipper.country_id;
                            blank.data.contact = resp.data.hbl_dict.shipper.contact;
                            blank.data.tel_num = resp.data.hbl_dict.shipper.phone;
                            blank.data.mobile_num = resp.data.hbl_dict.shipper.mobile;
                            blank.data.fax_num = resp.data.hbl_dict.shipper.fax;
                            blank.data.email = resp.data.hbl_dict.shipper.email;
                            return blank;
                        }()),
                        consignee: (function () {
                            const blank = addressbook_state_tpl();
                            blank.data.id = resp.data.hbl_dict.consignee.id;
                            blank.data.company_name = resp.data.hbl_dict.consignee.company_name;
                            blank.data.address = resp.data.hbl_dict.consignee.address;
                            blank.data.postcode = resp.data.hbl_dict.consignee.postcode;
                            blank.data.city = resp.data.hbl_dict.consignee.city_id;
                            blank.data.state = resp.data.hbl_dict.consignee.state;
                            blank.data.country = resp.data.hbl_dict.consignee.country_id;
                            blank.data.contact = resp.data.hbl_dict.consignee.contact;
                            blank.data.tel_num = resp.data.hbl_dict.consignee.phone;
                            blank.data.mobile_num = resp.data.hbl_dict.consignee.mobile;
                            blank.data.fax_num = resp.data.hbl_dict.consignee.fax;
                            blank.data.email = resp.data.hbl_dict.consignee.email;
                            return blank;
                        }()),
                        agent: (function () {
                            const blank = addressbook_state_tpl();
                            blank.data.id = resp.data.hbl_dict.agent.id;
                            blank.data.company_name = resp.data.hbl_dict.agent.company_name;
                            blank.data.address = resp.data.hbl_dict.agent.address;
                            blank.data.postcode = resp.data.hbl_dict.agent.postcode;
                            blank.data.city = resp.data.hbl_dict.agent.city_id;
                            blank.data.state = resp.data.hbl_dict.agent.state;
                            blank.data.country = resp.data.hbl_dict.agent.country_id;
                            blank.data.contact = resp.data.hbl_dict.agent.contact;
                            blank.data.tel_num = resp.data.hbl_dict.agent.phone;
                            blank.data.mobile_num = resp.data.hbl_dict.agent.mobile;
                            blank.data.fax_num = resp.data.hbl_dict.agent.fax;
                            blank.data.email = resp.data.hbl_dict.agent.email;
                            return blank;
                        }()),

                        city_id_of_receipt: resp.data.hbl_dict.city_id_of_receipt,
                        port_id_of_loading: resp.data.hbl_dict.port_id_of_loading,
                        feeder_vessel_name: resp.data.hbl_dict.feeder_vessel_name,
                        voyage_number: resp.data.hbl_dict.voyage_number,
                        mother_vessel_name: resp.data.hbl_dict.mother_vessel_name,
                        mother_vessel_voyage_number: resp.data.hbl_dict.mother_vessel_voyage_number,
                        port_id_of_discharge: resp.data.hbl_dict.port_id_of_discharge,
                        city_id_of_final_destination: resp.data.hbl_dict.city_id_of_final_destination,
                        excess_value_declaration: resp.data.hbl_dict.excess_value_declaration,

                        goods_no_of_packages: resp.data.hbl_dict.goods_no_of_packages,
                        goods_gross_weight_kg: resp.data.hbl_dict.goods_gross_weight_kg,
                        goods_cbm: resp.data.hbl_dict.goods_cbm,
                        goods_note: resp.data.hbl_dict.goods_note,

                        no_of_pallet: resp.data.hbl_dict.no_of_pallet,
                        lot_number: resp.data.hbl_dict.lot_number,

                        container_list: resp.data.hbl_dict.container_list.map(ct => allocated_container_info_dict(null, ct.id, ct.serial, ct.container_number)),

                        other_notes: resp.data.hbl_dict.other_notes,

                        issue_city_id: resp.data.hbl_dict.issue_city_id,
                        issue_date: resp.data.hbl_dict.issue_date
                    }, function () {
                        if (onloadsuccess) {
                            onloadsuccess();
                        }
                    });
                    loader.append_html('<div class="text-success">HBL Loaded</div>');
                    loader.close();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.state.errors.push(err);
                _this.setState({
                    errors: _this.state.errors
                });
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };
    parent.init_data_loader = (onsuccesssetstate) => {
        const _this = parent;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_hbl_page_init_data,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: Object.assign(_this.state.cache, resp.data)
                }, function () {
                    if (onsuccesssetstate) {
                        onsuccesssetstate();
                    }
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.state.errors.push(err);
                _this.setState({
                    errors: _this.state.errors
                });
            },
            complete: function (jqXHR, textStatus) {
            }
        });
    };

    parent.load_and_apply_booking_info = (booking_public_id) => {
        const _this = parent;
        let spinner = jQuery('<div class=""><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_booking_dict,
            data: {booking_public_id: booking_public_id},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    _this.onchange_consignee_address_field('id', resp.data.booking_dict.consignee_dict.id);
                    _this.onchange_consignee_address_field('company_name', resp.data.booking_dict.consignee_dict.company_name);
                    _this.onchange_consignee_address_field('address', resp.data.booking_dict.consignee_dict.address);
                    _this.onchange_consignee_address_field('postcode', resp.data.booking_dict.consignee_dict.postcode);
                    _this.onchange_consignee_address_field('city', resp.data.booking_dict.consignee_dict.city_id);
                    _this.onchange_consignee_address_field('state', resp.data.booking_dict.consignee_dict.state);
                    _this.onchange_consignee_address_field('country', resp.data.booking_dict.consignee_dict.country_id);
                    _this.onchange_consignee_address_field('contact', resp.data.booking_dict.consignee_dict.contact);
                    _this.onchange_consignee_address_field('tel_num', resp.data.booking_dict.consignee_dict.phone);
                    _this.onchange_consignee_address_field('mobile_num', resp.data.booking_dict.consignee_dict.mobile);
                    _this.onchange_consignee_address_field('fax_num', resp.data.booking_dict.consignee_dict.fax);
                    _this.onchange_consignee_address_field('email', resp.data.booking_dict.consignee_dict.email);

                    _this.onchange_field('port_id_of_loading', resp.data.booking_dict.port_id_of_loading);
                    _this.onchange_field('port_id_of_discharge', resp.data.booking_dict.port_id_of_discharge);
                    _this.onchange_field('goods_no_of_packages', resp.data.booking_dict.goods_no_of_packages);
                    _this.onchange_field('goods_gross_weight_kg', resp.data.booking_dict.goods_gross_weight_kg);
                    _this.onchange_field('goods_cbm', resp.data.booking_dict.goods_cbm);

                    loader.append_html('<div class="text-success">{}</div>'.format('Booking info loaded'));
                } else {
                    loader.append_html('<div class="text-danger">{}</div>'.format('an error occurred'));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    parent.save = () => {
        let _this = parent;

        let loader = window.modal_alert({content_html: ''});
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader.append_html(spinner);

        // if (_this.unallocated_cbm() > 0) {
        //     loader.append_html('<div class="text-danger">{} CBM Unallocated.</div>'.format(_this.unallocated_cbm()));
        //     spinner.remove();
        //     return false;
        // }

        _this.setState({
            msg: [],
            errors: [],
            form_errors: {},
        });

        // booking main entry//
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_hbl_save,
            data: {
                hbl_public_id: _this.state.hbl_public_id,

                booking_applies: _this.state.booking_applies ? 1 : 0,
                booking_public_id: _this.state.booking_public_id,
                supplier_public_id: _this.state.supplier_public_id,

                shipper_company_name: _this.state.shipper.data.company_name,
                shipper_address: _this.state.shipper.data.address,
                shipper_postcode: _this.state.shipper.data.postcode,
                shipper_city: _this.state.shipper.data.city,
                shipper_state: _this.state.shipper.data.state,
                shipper_country: _this.state.shipper.data.country,
                shipper_contact: _this.state.shipper.data.contact,
                shipper_tel_num: _this.state.shipper.data.tel_num,
                shipper_mobile_num: _this.state.shipper.data.mobile_num,
                shipper_fax_num: _this.state.shipper.data.fax_num,
                shipper_email: _this.state.shipper.data.email,

                consignee_company_name: _this.state.consignee.data.company_name,
                consignee_address: _this.state.consignee.data.address,
                consignee_postcode: _this.state.consignee.data.postcode,
                consignee_city: _this.state.consignee.data.city,
                consignee_state: _this.state.consignee.data.state,
                consignee_country: _this.state.consignee.data.country,
                consignee_contact: _this.state.consignee.data.contact,
                consignee_tel_num: _this.state.consignee.data.tel_num,
                consignee_mobile_num: _this.state.consignee.data.mobile_num,
                consignee_fax_num: _this.state.consignee.data.fax_num,
                consignee_email: _this.state.consignee.data.email,

                agent_company_name: _this.state.agent.data.company_name,
                agent_address: _this.state.agent.data.address,
                agent_postcode: _this.state.agent.data.postcode,
                agent_city: _this.state.agent.data.city,
                agent_state: _this.state.agent.data.state,
                agent_country: _this.state.agent.data.country,
                agent_contact: _this.state.agent.data.contact,
                agent_tel_num: _this.state.agent.data.tel_num,
                agent_mobile_num: _this.state.agent.data.mobile_num,
                agent_fax_num: _this.state.agent.data.fax_num,
                agent_email: _this.state.agent.data.email,

                container_list: JSON.stringify(_this.state.container_list.map((ct, i) => {
                    return {
                        list_index: i,
                        container_type_id: ct.container_type_id,
                        container_serial: ct.container_serial,
                        container_number: ct.container_number
                    }
                })),

                city_id_of_receipt: _this.state.city_id_of_receipt,
                port_id_of_loading: _this.state.port_id_of_loading,
                feeder_vessel_name: _this.state.feeder_vessel_name,
                voyage_number: _this.state.voyage_number,
                mother_vessel_name: _this.state.mother_vessel_name,
                mother_vessel_voyage_number: _this.state.mother_vessel_voyage_number,
                port_id_of_discharge: _this.state.port_id_of_discharge,
                city_id_of_final_destination: _this.state.city_id_of_final_destination,
                excess_value_declaration: _this.state.excess_value_declaration,

                goods_no_of_packages: _this.state.goods_no_of_packages,
                goods_gross_weight_kg: _this.state.goods_gross_weight_kg,
                goods_cbm: _this.state.goods_cbm,
                goods_note: _this.state.goods_note,
                no_of_pallet: _this.state.no_of_pallet,
                lot_number: _this.state.lot_number,

                other_notes: _this.state.other_notes,

                issue_city_id: _this.state.issue_city_id,
                issue_date: _this.state.issue_date
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    msg: resp.msg
                });
                loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                if (!resp.success) {
                    _this.setState({
                        errors: resp.errors,
                        form_errors: resp.form_errors,
                        container_list: _this.state.container_list.map((ct, i) => {
                            let ceq = resp.container_error_list.filter(ce => ce.list_index == i);
                            if (ceq.length) {
                                ct.errors = ceq[0].errors;
                                ct.form_errors = ceq[0].form_errors;
                            }
                            return ct;
                        })
                    });

                    loader.append_html('<div class="text-danger">{}</div>'.format('Please check for errors'));
                } else {
                    _this.setState({
                        hbl_public_id: resp.data.hbl_public_id
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.state.errors.push(err);
                _this.setState({
                    errors: _this.state.errors
                });
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };
}