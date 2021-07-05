/*
 'parent' is the trick for context(this)
 So that mixin functions can access the target context
 */

function BookingAjaxMixin(parent) {
    parent.supplier_selection_prompt = (supplier_list) => {
        const _this = this;
        let supplier_selection = jQuery('<div class="form-group"><label for="supplier_selection">Select a supplier</label><select' +
            ' class="form-control"><option value="">--</option>'
            + supplier_list.map(supplier => '<option value="{}">{}</option>'.format(supplier.public_id, supplier.title)).join('')
            + '</select></div>');
        supplier_selection.find('select').on('change', function (event) {
            const public_id = jQuery(event.target).val();
            if (public_id) {
                _this.init_data_loader(public_id);
            }
        });
        window.modal_alert({content_html: ''}).append_html(supplier_selection);
    };
    parent.load_booking_info = (public_id, onajaxsuccess) => {
        const _this = parent;
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Loading booking info</div>');
        let loader = window.modal_alert();
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_booking_info,
            data: {public_id: public_id},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    loader.append_html('<div class="text-success">Success</div>');
                    _this.setState({
                        supplier: resp.data.booking_dict.supplier
                    }, function () {
                        _this.init_data_loader(function () {
                            _this.setState({
                                cache: _this.state.cache,

                                uplaodedfile_url_list: resp.data.booking_dict.uplaodedfile_url_list,

                                booking_public_id: resp.data.booking_dict.booking_public_id,

                                supplier: resp.data.booking_dict.supplier,

                                process_running: false,

                                msg: [],
                                errors: [],
                                form_errors: {},

                                is_draft: resp.data.booking_dict.is_draft,
                                is_booking_confirm: resp.data.booking_dict.is_booking_confirm,

                                addressbook_list: resp.data.booking_dict.addressbook_list,

                                bank_branch_list: resp.data.booking_dict.bank_branch_list,

                                // shipping service data
                                shipping_service: resp.data.booking_dict.shipping_service,

                                port_of_dest: resp.data.booking_dict.port_of_dest,
                                port_of_load: resp.data.booking_dict.port_of_load,
                                terms_of_deliv: resp.data.booking_dict.terms_of_deliv,
                                country_of_dest: resp.data.booking_dict.country_of_dest,

                                goods_list: resp.data.booking_dict.goods_list,

                                stakeholder_ref_list: resp.data.booking_dict.stakeholder_ref_list,

                                // order notes
                                frt_payment_ins: resp.data.booking_dict.frt_payment_ins,
                                frt_transport_agreement_id: resp.data.booking_dict.frt_transport_agreement_id,
                                frt_delivery_instruction: resp.data.booking_dict.frt_delivery_instruction,

                                pickup_date: resp.data.booking_dict.pickup_date,
                                pickup_earliest_time: resp.data.booking_dict.pickup_earliest_time,
                                pickup_latest_time: resp.data.booking_dict.pickup_latest_time,
                                pickup_ins: resp.data.booking_dict.pickup_ins,
                            }, function () {
                                if (onajaxsuccess) {
                                    onajaxsuccess();
                                }
                            });
                        });
                    });
                    loader.close();
                } else {
                    loader.append_html('<div class="text-danger">Error: </div>');
                    _this.setState({
                        errors: resp.errors
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">' + err + '</div>');
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
    parent.init_data_loader = (setstatecallback) => {
        const _this = parent;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_forwarder_frt_book_init_data,
            data: {supplier_public_id: _this.state.supplier.public_id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: {
                        forwarder: resp.forwarder,
                        supplier_list: resp.supplier_list,
                        currency_list: resp.currency_list,
                        transport_agreement_list: resp.transport_agreement_list,
                        country_list: resp.country_list,
                        city_list: resp.city_list,
                        address_list: resp.supplier_address_list,
                        bank_branch_list: resp.bank_branch_list,
                        sea_port_list: resp.sea_port_list,
                        tod_list: resp.tod_list,
                        package_type_list: resp.package_type_list,
                        payment_type_list: resp.payment_type_list,
                        goods_ref_type_list: resp.goods_ref_type_list,
                        stakeholder_ref_type_list: resp.stakeholder_ref_type_list
                    },
                    supplier: resp.supplier
                }, function () {
                    if (setstatecallback) {
                        setstatecallback();
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
    parent.save_booking = (is_draft, is_book_confirm) => (event) => {
        let _this = parent;
        if (_this.state.process_running) {
            window.modal_alert({content_html: '<div class="text-danger">a process is running, please wait</div>'});
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        _this.setState({
            is_booking_confirm: is_book_confirm || _this.state.is_booking_confirm
        });

        if (is_draft) {
            _this.process_booking();
        } else if (is_book_confirm) {
            window.modal_prompt({
                input_label: 'Estimated Delivery Date',
                input_type: 'date',
                on_confirm: function (value) {
                    if (!value) {
                        alert('valid date required');
                        return false;
                    }
                    _this.process_booking({
                        edd: value// note that date format should accord on form field input formats(django)
                    });
                }
            });
        }
    };

    parent.process_booking = (options) => {
        let _this = parent;

        options = Object.assign({
            edd: ''
        }, options);

        let edd = options.edd || _this.state.edd;

        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);

        _this.setState({
            msg: [],
            errors: [],
            form_errors: {},
            edd: edd
        });

        // booking main entry//
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_data_save,
            data: {
                booking_public_id: _this.state.booking_public_id,
                supplier_public_id: _this.state.supplier.public_id,
                is_confirm: _this.state.is_booking_confirm,
                edd: _this.state.edd,

                addressbook_list: JSON.stringify((function () {
                    return _this.state.addressbook_list.map((address, i) => {
                        return {
                            list_index: i,
                            id: address.data.id,
                            booking_notify: address.booking_notify,

                            is_additional_address: address.is_additional_address,

                            is_shipper: address.data.address_type === 'shipper',
                            is_consignee: address.data.address_type === 'consignee',
                            is_consignor: address.data.address_type === 'consignor',
                            is_pickup: address.data.address_type === 'pickup',
                            is_delivery: address.data.address_type === 'delivery',

                            company_name: address.data.company_name,
                            address: address.data.address,
                            postcode: address.data.postcode,
                            city: address.data.city,
                            state: address.data.state,
                            country: address.data.country,
                            contact: address.data.contact,
                            tel_num: address.data.tel_num,
                            mobile_num: address.data.mobile_num,
                            fax_num: address.data.fax_num,
                            email: address.data.email,
                        };
                    })
                }())),

                bank_branch_list: JSON.stringify((function () {
                    return _this.state.bank_branch_list.filter(data => data.use).map((bank_branch, i) => {
                        return {
                            list_index: i,
                            branch_id: bank_branch.data.branch_id,
                            in_origin_leg: bank_branch.data.leg === 'origin',
                            bank_name: bank_branch.data.bank_name,
                            branch_name: bank_branch.data.branch_name,
                            branch_address: bank_branch.data.branch_address
                        };
                    });
                }())),

                port_of_dest: _this.state.port_of_dest,
                port_of_load: _this.state.port_of_load,
                terms_of_deliv: _this.state.terms_of_deliv,
                country_of_dest: _this.state.country_of_dest,

                goods_list: JSON.stringify((function () {
                    return _this.state.goods_list.map((formdata, i) => {
                        return {
                            list_index: i,
                            id: formdata.id,
                            no_of_pieces: formdata.no_of_pieces,
                            package_type: formdata.package_type,
                            weight_kg: formdata.weight_kg,
                            cbm: formdata.cbm,
                            quantity: formdata.quantity,
                            unit_price: formdata.unit_price,
                            currency: formdata.currency,
                            references_json: JSON.stringify(formdata.references.map((ref, refi) => {
                                ref.list_index = refi;
                                return ref;
                            })),
                            shipping_mark: formdata.shipping_mark,
                            goods_desc: formdata.goods_desc,
                        };
                    });
                }())),

                shipping_service: _this.state.shipping_service,

                stakeholder_ref_list: JSON.stringify((function () {
                    return _this.state.stakeholder_ref_list.filter(formdata => formdata.ref_type_id && formdata.ref_number).map((formdata, i) => {
                        return {
                            list_index: i,
                            ref_type_id: formdata.ref_type_id,
                            ref_number: formdata.ref_number
                        };
                    });
                }())),

                frt_payment_ins: parent.state.frt_payment_ins,
                frt_transport_agreement_id: parent.state.frt_transport_agreement_id,
                frt_delivery_instruction: parent.state.frt_delivery_instruction,

                pickup_date: _this.state.pickup_date,
                pickup_earliest_time: _this.state.pickup_earliest_time,
                pickup_latest_time: _this.state.pickup_latest_time,
                pickup_ins: _this.state.pickup_ins,

                uplaodedfile_url_list_json: JSON.stringify(_this.state.uplaodedfile_url_list)
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    msg: resp.msg,
                    errors: resp.errors,
                    form_errors: resp.form_errors,
                    booking_public_id: resp.data.booking_public_id
                });
                if (resp.success) {
                    loader.append_html(resp.errors.map(msg => '<div class="text-danger">{}</div>'.format(msg)).join(''));
                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                } else {
                    loader.append_html('<div class="text-danger">Please check for errors</div>');
                    _this.setState({
                        addressbook_list: _this.state.addressbook_list.map((addr, i) => {
                            if (resp.address_form_errors.hasOwnProperty(i)) {
                                addr.field_errors = resp.address_form_errors[i];
                            }
                            if (resp.address_errors.hasOwnProperty(i)) {
                                addr.misc_errors = resp.address_errors[i];
                            }
                            return addr;
                        }),

                        bank_branch_list: _this.state.bank_branch_list.map((data, i) => {
                            if (resp.bank_form_errors.hasOwnProperty(i)) {
                                data.field_errors = resp.bank_form_errors[i];
                            }
                            if (resp.bank_errors.hasOwnProperty(i)) {
                                data.misc_errors = resp.bank_errors[i];
                            }
                            return data;
                        }),

                        goods_list: _this.state.goods_list.map((data, i) => {
                            if (resp.goodsinfo_form_errors.hasOwnProperty(i)) {
                                data.formerrors = resp.goodsinfo_form_errors[i];
                            }
                            if (resp.goodsinfo_errors.hasOwnProperty(i)) {
                                data.errors = resp.goodsinfo_errors[i];
                            }
                            return data;
                        }),

                        stakeholder_ref_list: _this.state.stakeholder_ref_list.map((data, i) => {
                            if (resp.stakeholder_ref_form_errors.hasOwnProperty(i)) {
                                data.formerrors = resp.stakeholder_ref_form_errors[i];
                            }
                            if (resp.stakeholder_ref_errors.hasOwnProperty(i)) {
                                data.errors = resp.stakeholder_ref_errors[i];
                            }
                            return data;
                        })
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
                _this.setState({
                    process_running: false
                });
                spinner.remove();
            }
        });
    };
}