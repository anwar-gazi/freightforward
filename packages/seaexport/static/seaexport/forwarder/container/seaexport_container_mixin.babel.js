/*
 'parent' is the trick for context(this)
 So that mixin functions can access the target context
 */

function ContainerConsolAjaxMixin(parent) {
    parent.init_data_loader = () => {
        const _this = parent;
        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Loading</div>');
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_container_consol_page_init_data,
            data: {supplier_public_id: _this.state.supplier_public_id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: Object.assign(_this.state.cache, resp.data)
                });
                loader.close();
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

    parent.save = () => {
        let _this = parent;

        let loader = window.modal_alert({content_html: ''});
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader.append_html(spinner);

        _this.setState({
            msg: [],
            errors: [],
            form_errors: {},
        });

        // booking main entry//
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_container_consol_save,
            data: {
                public_id: _this.state.consol_public_id,
                mbl_number: _this.state.mbl_number,
                supplier_public_id: _this.state.supplier_public_id,

                container_list_json: JSON.stringify(_this.state.container_list.map((ct, i) => {
                    return {
                        list_index: i,
                        allocated_container_id: ct.allocated_container_id,
                        container_type_id: ct.container_type_id,
                        container_number: ct.container_number,
                        container_serial: ct.container_serial,
                        fcl_or_lcl: ct.fcl_or_lcl,

                        hbl_public_id_list_json: JSON.stringify(ct.hbl_list.map(hbl => hbl.public_id))
                    }
                })),

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

                feeder_vessel_name: _this.state.feeder_vessel_name,
                feeder_vessel_voyage_number: _this.state.feeder_vessel_voyage_number,
                feeder_departure_city_id: _this.state.feeder_departure_city_id,
                feeder_arrival_city_id: _this.state.feeder_arrival_city_id,
                feeder_etd: _this.state.feeder_etd,
                feeder_eta: _this.state.feeder_eta,

                mother_vessel_name: _this.state.mother_vessel_name,
                mother_vessel_voyage_number: _this.state.mother_vessel_voyage_number,
                mother_departure_city_id: _this.state.mother_departure_city_id,
                mother_arrival_city_id: _this.state.mother_arrival_city_id,
                mother_etd: _this.state.mother_etd,
                mother_eta: _this.state.mother_eta,

                city_id_of_receipt: _this.state.city_id_of_receipt,
                port_id_of_loading: _this.state.port_id_of_loading,
                port_id_of_discharge: _this.state.port_id_of_discharge,
                city_id_of_final_destination: _this.state.city_id_of_final_destination,
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    msg: resp.msg
                });
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
                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                    _this.setState({
                        consol_public_id: resp.data.consol_public_id
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