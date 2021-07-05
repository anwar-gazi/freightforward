/*
 'parent' is the trick for context(this)
 So that mixin functions can access the target context
 */

function MBLAjaxMixin(parent) {
    parent.init_data_loader = () => {
        const _this = parent;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_mbl_page_init_data,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    cache: Object.assign(_this.state.cache, resp.data)
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
            url: window.urlfor_mbl_save,
            data: {
                mbl_public_id: _this.state.mbl_public_id,
                mbl_number: _this.state.mbl_number,

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

                hbl_list_json: JSON.stringify(_this.state.hbl_list.map((hbl, i) => {
                    return {
                        list_index: i,
                        public_id: hbl.public_id,
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

                goods_no_of_packages: _this.state.goods_no_of_packages,
                goods_gross_weight_kg: _this.state.goods_gross_weight_kg,
                goods_cbm: _this.state.goods_cbm,

                issue_city_id: _this.state.issue_city_id,
                issue_date: _this.state.issue_date
            },
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    msg: resp.msg
                });
                if (!resp.success) {
                    _this.setState({
                        errors: resp.errors,
                        form_errors: resp.form_errors
                    });

                    loader.append_html('<div class="text-danger">{}</div>'.format('Please check for errors'));
                } else {
                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                    _this.setState({
                        mbl_public_id: resp.data.mbl_public_id
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