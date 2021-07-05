/*
 'parent' is the trick for context(this)
 So that mixin functions can access the target context
 */

let _modal_alert = (options) => {
    let _modal_alert = function (options) {
        options = Object.assign({
            content_html: '',
        }, options);

        let _modal_tpl = '<div class="modal" tabindex="-1" role="dialog">\n' +
            '  <div class="modal-dialog" role="document">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '          <span aria-hidden="true">&times;</span>\n' +
            '        </button>\n' +
            '      </div>\n' +
            '      <div class="modal-body">\n' +
            options.content_html +
            '      </div>' +
            '      <div class="modal-footer"><button type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">close</span></button></div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>';

        let modal = jQuery(_modal_tpl);
        modal.modal('show');
        this.append_html = function (html) {
            modal.find('.modal-body').append(html);
        };
    };
    return new _modal_alert(options);
};

let _modal_prompt = (options) => {
    options = Object.assign({
        input_label: '',
        input_type: '',
        on_confirm: ''
    }, options);

    let _modal_tpl = '<div class="modal" tabindex="-1" role="dialog">\n' +
        '  <div class="modal-dialog" role="document">\n' +
        '    <div class="modal-content">\n' +
        '      <div class="modal-header">\n' +
        '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '          <span aria-hidden="true">&times;</span>\n' +
        '        </button>\n' +
        '      </div>\n' +
        '      <div class="modal-body">\n' +
        '        <div class="form-group"><label>' + options.input_label + '</label><input type="' + options.input_type + '" class="form-control"></div>' +
        '        <div class="form-group"><button type="button" class="btn btn-sm btn-primary" data-dismiss="modal" aria-label="Confirm">continue</button></div>' +
        '      </div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>';

    let modal = jQuery(_modal_tpl);
    modal.find('button').click(function (event) {
        options.on_confirm(modal.find('input').val());
    });

    modal.modal('show');
};

function BookingAjaxMixin(parent) {
    parent.booking_entry_completion = (callbacks) => {
        callbacks = Object.assign({
            onajaxsuccess: null,
            onsuccess: null,
            onfail: null,
            onajaxerror: null,
            onajaxcomplete: null,
        }, callbacks);
        let _this = parent;
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_entry_completion,
            data: {
                booking_id: _this.state.booking_id,
                operation: 'continue'
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    globalid: resp.data.globalid,
                    booking_entry_complete: resp.success,
                    booking_misc_msg: resp.msg ? resp.msg : [],
                    booking_misc_errors: resp.misc_errors ? resp.misc_errors : [],
                });
                _this.setState({
                    booking_misc_errors: _this.state.booking_misc_errors.concat(Object.keys(resp.form_errors).map(key => key + ':' + resp.form_errors[key]))
                });
                if (resp.success && callbacks.onsuccess) {
                    callbacks.onsuccess(resp);
                } else if (!resp.success && callbacks.onfail) {
                    callbacks.onfail(resp);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    page_errors: [err]
                });
            },
            complete: function (jqXHR, textStatus) {
                if (callbacks.onajaxcomplete) {
                    callbacks.onajaxcomplete();
                }
            }
        });
    };
    parent.save_goodsinfo_references = (goods_form_id, ref_form_id, onsuccess, onfail) => {
        let _this = parent;
        let goodsinfo_formdata = _this._goods_formdata(goods_form_id);
        let ref_formdata = _this._goods_ref_formdata(goods_form_id, ref_form_id);
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_goodsrefinfo_entry,
            data: {
                id: ref_formdata.id,
                operation: ref_formdata.id ? 'update' : 'create',
                goodsinfo_id: goodsinfo_formdata.db_id,
                ref_type_id: ref_formdata.ref_type,
                ref_number: ref_formdata.ref_number
            },
            dataType: 'json',
            success: function (resp) {
                _this.set_goods_ref_formdata(goods_form_id, ref_form_id, {
                    id: resp.data.id,
                    saved: resp.success,
                    msg: resp.msg ? resp.msg : [],
                    errors: resp.misc_errors ? resp.misc_errors : [],
                    formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.state.booking_misc_errors.push('Error: goods reference not saved. {} {}'.format(goods_form_id, ref_form_id));
                    _this.setState({
                        booking_misc_errors: _this.state.booking_misc_errors
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.set_goods_ref_formdata(goods_form_id, ref_form_id, {
                    errors: [err],
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: goods reference not saved. {} {}'.format(goods_form_id, ref_form_id));
                        return this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_goodsinfo = (form_id, onsuccess, onfail) => {
        let _this = parent;
        let formdata = _this._goods_formdata(form_id);
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_goodsinfo_entry,
            data: {
                id: formdata.db_id,
                operation: formdata.db_id ? 'update' : 'create',
                booking_id: _this.state.booking_id,
                no_of_pieces: formdata.no_of_pieces,
                package_type: formdata.package_type,
                weight_kg: formdata.weight_kg,
                chargable_weight: formdata.chargable_weight,
                volumetric_weight: formdata.volumetric_weight,
                cbm: formdata.cbm,
                length_cm: formdata.length_cm,
                width_cm: formdata.width_cm,
                height_cm: formdata.height_cm,
                quantity: formdata.quantity,
                unit_price: formdata.unit_price,
                currency: formdata.currency,
                ref_type: formdata.ref_type,
                shipping_mark: formdata.shipping_mark,
                goods_desc: formdata.goods_desc,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    goods_form_data: _this.state.goods_form_data.map(gfd => {
                        if (gfd.id == form_id) {
                            gfd.db_id = resp.data.id;
                            gfd.saved = resp.success;
                            gfd.msg = resp.msg ? resp.msg : [];
                            gfd.errors = resp.misc_errors ? resp.misc_errors : [];
                            gfd.formerrors = resp.form_errors ? resp.form_errors : {};
                        }
                        return gfd;
                    })
                });

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: goods data not saved. {} {}'.format(form_id));
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    goods_form_data: _this.state.goods_form_data.map(gfd => {
                        if (gfd.id == form_id) {
                            gfd.saved = false;
                            gfd.errors = [err];
                        }
                        return gfd;
                    })
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: goods data not saved. {} {}'.format(form_id));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_dest_load_info = (onsuccess, onfail) => {
        let _this = parent;
        _this.setstate_clear_destload_feedback_messages();
        jQuery.ajax({
            type: 'post',
            url: urlfor_booking_portsinfo_entry,
            data: {
                booking_id: _this.state.booking_id,
                portinfo_id: _this.state.portinfo_id,
                operation: _this.state.portinfo_id ? 'update' : 'create',
                port_of_dest: _this.state.port_of_dest,
                port_of_load: _this.state.port_of_load,
                terms_of_deliv: _this.state.terms_of_deliv,
                country_of_dest: _this.state.country_of_dest
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    portinfo_id: resp.data.id,
                    portinfo_saved: resp.success,
                    portinfo_msg: resp.msg ? resp.msg : [],
                    portinfo_errors: resp.misc_errors ? resp.misc_errors : [],
                    portinfo_formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: loading and destination info not saved');
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    portinfo_errors: [err]
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: load and destination info not saved. {}'.format(err));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_shipping_service = (onsuccess, onfail) => {
        let _this = parent;
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_shippingsrvc_entry,
            data: {
                id: _this.state.shipping_service_db_id,
                operation: _this.state.shipping_service_db_id ? 'update' : 'create',
                booking_id: _this.state.booking_id,
                service: _this.state.shipping_service
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    shipping_service_saved: resp.success,
                    shipping_service_msg: resp.msg ? resp.msg : [],
                    shipping_service_errors: resp.misc_errors ? resp.misc_errors : [],
                    shipping_service_formerrors: resp.form_errors ? resp.form_errors : {},
                    shipping_service_db_id: resp.data.id,
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: shipping service not saved');
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    shipping_service_errors: [err]
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: shipping service info not saved. {}'.format(err));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_stakeholder_refs = (form_id, onsuccess, onfail) => {
        let _this = parent;
        let formdata = _this.stakeholder_ref_form(form_id);
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_stakeholder_ref_entry,
            data: {
                id: formdata.id,
                operation: formdata.id ? 'update' : 'create',
                booking_id: _this.state.booking_id,
                ref_type_id: formdata.ref_type,
                ref_number: formdata.ref_number
            },
            dataType: 'json',
            success: function (resp) {
                _this.setstate_stakeholder_ref_formdata(form_id, {
                    id: resp.data.id,
                    saved: resp.success,
                    msg: resp.msg ? resp.msg : [],
                    errors: resp.misc_errors ? resp.misc_errors : [],
                    formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: stakeholder reference data not saved. {}'.format(form_id));
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setstate_stakeholder_ref_formdata(form_id, {
                    errors: [err],
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: {}: stakeholder reference data not saved. {}'.format(form_id, err));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_order_notes = (onsuccess, onfail) => {
        let _this = parent;
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_ordernotes_entry,
            data: {
                id: _this.state.order_notes_id,
                operation: _this.state.order_notes_id ? 'update' : 'create',
                booking_id: _this.state.booking_id,
                payment_ins_id: _this.state.frt_payment_ins,
                transport_agreement_id: _this.state.frt_transport_agreement,
                delivery_instruction: _this.state.frt_delivery_instruction,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    order_notes_id: resp.data.id,
                    order_notes_saved: resp.success,
                    order_notes_msg: resp.msg ? resp.msg : [],
                    order_notes_errors: resp.misc_errors ? resp.misc_errors : [],
                    order_notes_formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: order notes not saved.');
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    order_notes_errors: [err],
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: order notes not saved! {}'.format(err));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_pickup_notes = (onsuccess, onfail) => {
        let _this = parent;
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_booking_pickupnotes_entry,
            data: {
                id: _this.state.pickup_notes_id,
                operation: _this.state.pickup_notes_id ? 'update' : 'create',
                booking_id: _this.state.booking_id,
                pickup_date: _this.state.pickup_date,
                pickup_time_early: _this.state.pickup_earliest_time,
                pickup_time_latest: _this.state.pickup_latest_time,
                pickup_instruction: _this.state.pickup_ins,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    pickup_notes_id: resp.data.id,
                    pickup_notes_saved: resp.success,
                    pickup_notes_msg: resp.msg ? resp.msg : [],
                    pickup_notes_errors: resp.misc_errors ? resp.misc_errors : [],
                    pickup_notes_formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }

                if (!resp.success) {
                    _this.setState({
                        booking_misc_errors: (function () {
                            _this.state.booking_misc_errors.push('Error: pickup notes not saved');
                            return _this.state.booking_misc_errors;
                        }())
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    pickup_notes_errors: [err],
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: pickup notes not saved. {}'.format(err));
                        return _this.state.booking_misc_errors;
                    }())
                });
            }
        });
    };
    parent.save_address = (addr_key, onsuccess, onfail) => {
        let _this = parent;
        parent.address_save_process(addr_key, true);
        _this.setstate_clear_address_feedback_messages(addr_key);
        let formdata = _this.state.addressbook[addr_key];
        jQuery.ajax({
            type: 'post',
            url: urlfor_booking_save_address,
            data: {
                operation: _this.state.addressbook[addr_key].data.address_id ? 'update' : 'create',

                address_id: _this.state.addressbook[addr_key].data.address_id,
                org_id: _this.state.organization.id,
                booking_id: _this.state.booking_id,
                booking_notify: _this.state.addressbook[addr_key].booking_notify,

                is_shipper: _this.state.addressbook[addr_key].data.address_type == 'shipper',
                is_consignee: _this.state.addressbook[addr_key].data.address_type == 'consignee',
                is_default_consignee: addr_key == 'consignee',
                is_consignor: _this.state.addressbook[addr_key].data.address_type == 'consignor',
                is_pickup: _this.state.addressbook[addr_key].data.address_type == 'pickup',
                is_delivery: _this.state.addressbook[addr_key].data.address_type == 'delivery',

                company_name: _this.state.addressbook[addr_key].data.company_name,
                address: _this.state.addressbook[addr_key].data.address,
                postcode: _this.state.addressbook[addr_key].data.postcode,
                city: _this.state.addressbook[addr_key].data.city,
                state: _this.state.addressbook[addr_key].data.state,
                country: _this.state.addressbook[addr_key].data.country,
                contact: _this.state.addressbook[addr_key].data.contact,
                tel_num: _this.state.addressbook[addr_key].data.tel_num,
                mobile_num: _this.state.addressbook[addr_key].data.mobile_num,
                fax_num: _this.state.addressbook[addr_key].data.fax_num,
                email: _this.state.addressbook[addr_key].data.email,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    addressbook: (function () {
                        let addressbook = _this.state.addressbook;
                        addressbook[addr_key].data.address_id = resp.data.address_id;
                        addressbook[addr_key].msg = resp.msg ? resp.msg : [];
                        addressbook[addr_key].field_errors = resp.form_errors ? resp.form_errors : {};
                        addressbook[addr_key].misc_errors = resp.errors ? resp.errors : [];
                        addressbook[addr_key].saved = resp.success;
                        if (resp.success) {
                            addressbook[addr_key].msg.push('Success');
                        } else {
                            addressbook[addr_key].misc_errors.push('Error: Address Not Saved');
                            _this.setState({
                                booking_misc_errors: (function () {
                                    _this.state.booking_misc_errors.push('Error: {} address not saved'.format(formdata.form_title));
                                    return _this.state.booking_misc_errors;
                                }())
                            });
                        }
                        return addressbook;
                    }())
                });

                if (resp.success && onsuccess) {
                    onsuccess(resp);
                } else if (!resp.success && onfail) {
                    onfail(resp);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    addressbook: (function () {
                        let addressbook = _this.state.addressbook;
                        addressbook[addr_key].saved = false;
                        addressbook[addr_key].misc_errors = [err];
                        return addressbook;
                    }())
                });
                _this.setState({
                    booking_misc_errors: (function () {
                        _this.state.booking_misc_errors.push('Error: {} address not saved'.format(formdata.form_title));
                        return _this.state.booking_misc_errors;
                    }())
                });
            },
            complete: function (jqXHR, textStatus) {
                _this.address_save_process(addr_key, false);
            }
        });
    };
    parent.save_booking = (is_draft, is_book_confirm) => (event) => {
        let _this = parent;
        if (_this.booking_entry_is_running()) {
            window.modal_alert({content_html: '<div class="text-danger">a process is running, please wait</div>'});
            return false;
        }

        if (!_this.state.organization.public_id) {
            window.modal_alert({content_html: '<div class="text-danger">Error: Supplier not selected</div>'});
            return false;
        }

        _this.state.is_draft = is_draft;
        _this.state.is_booking_confirm = is_book_confirm;

        if (is_draft) {
            _this.process_booking();
        } else if (is_book_confirm) {
            _modal_prompt({
                input_label: 'Estimated Delivery Date',
                input_type: 'date',
                on_confirm: function (value) {
                    if (!value) {
                        alert('valid date required');
                        return false;
                    }
                    _this.process_booking({
                        edd: value
                        // note that date format should accord on form field input formats(django)
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

        let loader = window.modal_alert({content_html: '<div class="text-info">Processing ...</div>'});

        _this.setstate_clear_feedback_messages();
        _this.setstate_booking_entry_start();

        // for ajax jobs completion notifier
        let queue = new BookingProcessQueueManager();
        queue.on_all_job_complete = function () {
            _this.setstate_booking_entry_start();
            _this.booking_entry_completion({
                onajaxcomplete: function () {
                    _this.setstate_booking_entry_complete();
                },
                onsuccess: function (resp) {
                    loader.append_html(function () {
                        return resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join('');
                    });
                },
                onfail: function (resp) {
                    loader.append_html(function () {
                        return resp.misc_errors.map(err => '<div class="text-success">{}</div>'.format(err)).join('')
                            + Object.keys(resp.form_errors).map(key => '<div class="text-success">{}</div>'.format(resp.form_errors[key])).join('');
                    });
                }
            });
        };

        // booking main entry//
        jQuery.ajax({
            type: 'post',
            url: urlfor_booking_mainentry,
            data: {
                booking_id: _this.state.booking_id,
                operation: _this.state.booking_id ? 'update' : 'create',
                status: (function () {
                    if (_this.state.is_draft) {
                        return 'draft';
                    } else if (_this.state.is_booking_confirm) {
                        return 'book';
                    }
                }()),
                org_id: _this.state.organization.id,
                edd: options.edd,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    booking_id: resp.data.booking_id,
                    booking_saved: resp.success,
                    booking_mainentry_msg: resp.msg ? resp.msg : [],
                    booking_mainentry_errors: resp.errors ? resp.errors : [],
                    booking_mainentry_formerrors: resp.form_errors ? resp.form_errors : {},
                });

                if (resp.success) {
                    // save addresses
                    for (let addrkey of Object.keys(_this.state.addressbook)) {
                        let addrsavejobid = queue.add_job();
                        _this.save_address(addrkey, function () {
                            queue.job_complete(addrsavejobid);
                        }, function (resp) {
                            loader.append_html('<div class="text-danger">Address save error</div>');
                        });
                    }

                    // origin bank info
                    if (_this.state.origin_bank.use) {
                        let savejobid = queue.add_job();
                        _this.save_bankinfo('origin_bank', function () {
                            queue.job_complete(savejobid);
                        }, function (resp) {
                            loader.append_html('<div class="text-danger">Origin bank Info save error</div>');
                        });
                    }
                    //destination bank info
                    if (_this.state.destination_bank.use) {
                        let savejobid = queue.add_job();
                        _this.save_bankinfo('destination_bank', function () {
                            queue.job_complete(savejobid);
                        }, function (resp) {
                            loader.append_html('<div class="text-danger">Destination bank Info save error</div>');
                        });
                    }

                    // destination/loading info
                    let portinfosavejobid = queue.add_job();
                    _this.save_dest_load_info(function () {
                        queue.job_complete(portinfosavejobid);
                    }, function (resp) {
                        loader.append_html('<div class="text-danger">Portsinfo save error</div>');
                    });

                    // goods info
                    for (let i = 0; i < _this.state.goods_form_data.length; i++) {
                        let goods_form_id = _this.state.goods_form_data[i].id;
                        let goods_formdata = _this.state.goods_form_data[i];

                        let goodsinfosavejobid = queue.add_job();

                        // Goods reference dropdown not required by Navana
                        // create these job entry too now(not inside goods ajax success), so that not delayed by ajax
                        // let goodsrefinfosavejobid_list = [];
                        // for (let i = 0; i < goods_formdata.references.length; i++) {
                        //     let goodsrefinfosavejobid = queue.add_job();
                        //     goodsrefinfosavejobid_list.push(goodsrefinfosavejobid);
                        // }

                        _this.save_goodsinfo(goods_form_id, function () {
                            queue.job_complete(goodsinfosavejobid);

                            //Goods reference dropdown not required by Navana
                            // now save goods references
                            // for (let i = 0; i < goods_formdata.references.length; i++) {
                            //     let goodsrefinfosavejobid = goodsrefinfosavejobid_list[i];
                            //     _this.save_goodsinfo_references(goods_form_id, goods_formdata.references[i].form_id, function () {
                            //         queue.job_complete(goodsrefinfosavejobid);
                            //     }, function (resp) {
                            //         loader.append_html('<div class="text-danger">Goods reference {} save error</div>'.format(i + 1));
                            //     });
                            // }
                        }, function (resp) {
                            loader.append_html('<div class="text-danger">Goodsinfo {} save error</div>'.format(i + 1));
                        });
                    }

                    let shippingsrvcsavejobid = queue.add_job();
                    _this.save_shipping_service(function () {
                        queue.job_complete(shippingsrvcsavejobid);
                    }, function (resp) {
                        loader.append_html('<div class="text-danger">Shipping service save error</div>');
                    });

                    _this.state.stakeholder_refs.filter(ref => ref.ref_type && ref.ref_number).map(function (stakeholder_ref) {
                        let stakeholderrefsavejobid = queue.add_job();
                        _this.save_stakeholder_refs(stakeholder_ref.form_id, function () {
                            queue.job_complete(stakeholderrefsavejobid);
                        }, function (resp) {
                            loader.append_html('<div class="text-danger">Stakeholder references save error</div>');
                        });
                    });

                    let ordernotessavejobid = queue.add_job();
                    _this.save_order_notes(function () {
                        queue.job_complete(ordernotessavejobid);
                    }, function (resp) {
                        loader.append_html('<div class="text-danger">Order notes save error</div>');
                    });

                    let pickupnotessavejobid = queue.add_job();
                    queue.job_add_complete = true;

                    _this.save_pickup_notes(function () {
                        queue.job_complete(pickupnotessavejobid);
                    }, function (resp) {
                        loader.append_html('<div class="text-danger">Pickup notes save error</div>');
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    booking_misc_errors: [err]
                });
            },
            complete: function (jqXHR, textStatus) {
                _this.setstate_booking_entry_complete();
                _this.load_data(_this.state.organization.public_id);
            }
        });
    };
}