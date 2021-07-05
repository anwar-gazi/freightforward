"use strict";

class SeaExportHBLForm extends React.Component {
    constructor(props) {
        super(props);
        let _this = this;

        this.state = hbl_form_state();

        Object.assign(this, HBLAjaxMixin(this));

        this.init_data_loader(function () {
            if (props.public_id) {
                _this.load_hbl(props.public_id, function () {
                    if (props.copy) {
                        _this.setState({
                            hbl_public_id: '',
                        });
                    }
                });
            }
        });

        window.hbl_react_element = this;//for debug purpose
    }

    onchange_booking_selection = (value) => {
        const _this = this;
        this.setState({
            booking_public_id: value
        });
        if (this.state.cache.forwarder_default_address) {
            // console.dir(this.state.forwarder_default_address);
            this.onchange_shipper_address_field('id', this.state.cache.forwarder_default_address.id);
            this.onchange_shipper_address_field('company_name', this.state.cache.forwarder_default_address.company_name);
            this.onchange_shipper_address_field('address', this.state.cache.forwarder_default_address.address);
            this.onchange_shipper_address_field('postcode', this.state.cache.forwarder_default_address.postcode);
            this.onchange_shipper_address_field('city', this.state.cache.forwarder_default_address.city_id);
            this.onchange_shipper_address_field('state', this.state.cache.forwarder_default_address.state);
            this.onchange_shipper_address_field('country', this.state.cache.forwarder_default_address.country_id);
            this.onchange_shipper_address_field('contact', this.state.cache.forwarder_default_address.contact);
            this.onchange_shipper_address_field('tel_num', this.state.cache.forwarder_default_address.phone);
            this.onchange_shipper_address_field('mobile_num', this.state.cache.forwarder_default_address.mobile);
            this.onchange_shipper_address_field('fax_num', this.state.cache.forwarder_default_address.fax);
            this.onchange_shipper_address_field('email', this.state.cache.forwarder_default_address.email);

            this.onchange_field('issue_city_id', this.state.cache.forwarder_default_address.city_id);

            let shipper = this.state.shipper;
            shipper.msg = ['Forwarder default address applied'];
            this.setState({
                shipper: shipper
            });
            _this.load_and_apply_booking_info(value);
        } else {
            let prompt = window.modal_alert({});
            let prompt_dom = jQuery('<div class="form-group"><label>Forwarder doesnt have a default address(to autofill shipper info).</label>' +
                '<div><a class="btn btn-primary" href="' + window.forwarder_org_edit_url + '">Add a default address</a><button id="continue" class="btn btn-secondary" type="button">Continue without default address</button></div>' +
                '</div>');
            prompt_dom.find('button#continue').click(function () {
                prompt.close();
                _this.load_and_apply_booking_info(value);
            });
            prompt.append_html(prompt_dom);
        }

        //

        //now load booking info
    };

    onchange_shipper_address_field = (field_name, value) => {
        let shipper = this.state.shipper;
        shipper.data[field_name] = value;
        this.setState({
            shipper: shipper
        });
    };

    onchange_consignee_address_field = (field_name, value) => {
        let consignee = this.state.consignee;
        consignee.data[field_name] = value;
        this.setState({
            consignee: consignee
        });
    };

    onchange_agent_address_field = (field_name, value) => {
        let agent = this.state.agent;
        agent.data[field_name] = value;
        this.setState({
            agent: agent
        });
    };

    onchange_field = (field_name, value) => {
        this.setState({
            [field_name]: value
        });
    };

    remove_container_from_list = (list_index) => {
        const _this = this;
        let ctlistfiltered = _this.state.container_list.filter((ct, li) => li !== list_index);
        _this.setState({
            container_list: ctlistfiltered
        });
    };

    load_container_serial = (serial, callback, onnotsuccess) => {
        const _this = this;
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i></div>');
        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_container_serial_info,
            data: {serial: serial},
            dataType: 'json',
            success: function (resp) {
                if (resp.errors.length) {
                    resp.errors.forEach(err => loader.append_html('<div class="text-danger">' + err + '</div>'));
                }
                if (resp.msg.length) {
                    resp.msg.forEach(msg => loader.append_html('<div class="text-success">' + msg + '</div>'));
                }
                if (resp.form_errors.hasOwnProperty('serial')) {
                    loader.append_html('<div class="text-danger">serial:' + resp.form_errors.serial + '</div>');
                }
                if (resp.success) {
                    if (callback) {
                        callback(resp.data.container_dict);
                    }
                    const container_dict = resp.data.container_dict;
                    if (!container_dict.can_allocate_more) {
                        loader.append_html('<div class="text-danger small">This container is already loaded to full capacity</div>');
                    }
                    const remain_cbm = container_dict.capacity_cbm - container_dict.allocated_cbm;
                    let container_info = jQuery('<div class="form-group">' +
                        '<div><p>container: ' + container_dict.name + '</p></div>' +
                        '<div><p>dimension(l,w,h in ft): ' + container_dict.length_ft + 'X' + container_dict.width_ft + 'X' + container_dict.height_ft + '</p></div>' +
                        '<div><p>Capacity CBM: ' + container_dict.capacity_cbm + '</p></div>' +
                        '<div><p>Allocated CBM: ' + container_dict.allocated_cbm + '</p></div>' +
                        '<div class="">' + remain_cbm + ' CBM remaining capacity</div>' +
                        '<div>' +
                        '<table class="table table-bordered"><thead><tr><th>container added to</th><th>allocated cbm</th></tr></thead>' +
                        '<tbody>' +
                        container_dict.allocation_list.hbl.map(alloc => '<tr><td>HBL#' + alloc.hbl + '</td><td>' + alloc.loaded + '</td></tr>').join('') +
                        container_dict.allocation_list.mbl.map(alloc => '<tr><td>MBL#' + alloc.mbl + '</td><td>' + alloc.loaded + '</td></tr>').join('') +
                        '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '</div>');
                    loader.append_html(container_info);
                } else {
                    if (onnotsuccess) {
                        onnotsuccess();
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger small">' + err + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    container_prompt = (event) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert({content_html: ''});
        const container_list_available = _this.state.cache.container_type_list;
        const container_options = container_list_available
            .map(ct => {
                return '<option value="' + ct.id + '">' + ct.name + ', capacity:' + ct.capacity_cbm + ' cbm</option>';
            }).join('');
        let form = jQuery('<div class="form-group">' +
            '<label>Container Serial</label>' +
            '<div class="input-group">' +
            '<input type="text" class="form-control container_serial">' +
            '<!--<button type="button" class="input-group-append load_serial">load</button>-->' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Container Number</label>' +
            '<input type="text" class="form-control container_number">' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Container Type</label>' +
            '<select class="form-control container_id"><option value="">--</option>' + container_options + '</select>' +
            '</div>'
        );
        loader.append_html(form);

        // container serial capacity validation|not now
        // form.find('#existing_container_selection').click(function () {
        //     loader.close();
        // });
        // form.find('.load_serial').click(event => form.find('.container_serial').trigger('change'));
        // form.find('.container_serial').change(function (event) {
        //     const serial = jQuery(event.target).val();
        //     if (serial) {
        //         if (_this.state.container_list.filter(ct => ct.serial == serial).length) {
        //             window.modal_alert().append_html('<div class="text-danger">This serial container is already added to this HBL</div>');
        //             $(event.target).val('');
        //             return false;
        //         } else {
        //             // check in database
        //             _this.load_container_serial(serial, function (container_dict) {
        //                 const remain = parseFloat(container_dict.capacity_cbm) - parseFloat(container_dict.allocated_cbm);
        //                 if (remain > 0) {
        //                     $(event.target).prop('readonly', true);//lock this serial number
        //                     form.find('.allocated_cbm').prop('disabled', false);
        //                     form.find('.container_id').prop('disabled', false);
        //                 } else {
        //                     form.find('.allocated_cbm').prop('disabled', true);
        //                     form.find('.container_id').prop('disabled', true);
        //                 }
        //
        //                 form.find('.allocated_cbm').change(event => {
        //                     const val = $(event.target).val();
        //                     if (val > remain) {
        //                         window.modal_alert({content_html: '<div class="text-danger">This container already has {} cbm allocated. You can allocate {} more</div>'.format(container_dict.allocated_cbm, remain)});
        //                         $(event.target).val('');
        //                     }
        //                 });
        //
        //                 form.find('.container_id').val(container_dict.id);
        //                 form.find('.container_id').change(event => {
        //                     if ($(event.target).val() != container_dict.id) {
        //                         window.modal_alert({content_html: '<div class="text-danger">The container serial implies the container type from database</div>'});
        //                         $(event.target).val(container_dict.id);
        //                     }
        //                 });
        //             }, function () {
        //                 form.find('.allocated_cbm').prop('disabled', false);
        //                 form.find('.container_id').prop('disabled', false);
        //             });
        //         }
        //     }
        // });
        form.find('.container_serial').change(function (event) {
            const container_serial = $(event.target).val();
            if (_this.state.container_list.filter(alocontinloop => alocontinloop.container_serial == container_serial).length) {
                window.modal_alert().append_html('<div class="text-danger">The serial number already added for this HBL</div>');
                $(event.target).val('');
                return false;
            }
        });
        loader.upon_ok = function (modaljqdom) {
            const container_id = jQuery(modaljqdom).find('.container_id').val();
            const container_number = jQuery(modaljqdom).find('.container_number').val();
            const container_serial = jQuery(modaljqdom).find('.container_serial').val();
            if (container_id && container_number && container_serial) {
                const selected_container = container_list_available.filter(ct => ct.id == container_id)[0];
                let data = allocated_container_info_dict(null, selected_container.id, container_serial, container_number);
                _this.setState({
                    container_list: (function () {
                        let container_list = _this.state.container_list;
                        container_list.push(data);
                        return container_list;
                    }())
                });
                return true;
            } else {
                window.modal_alert().append_html('<div class="text-danger">Container info invalid or incomplete</div>');
                return false;
            }
        };
    };

    unallocated_cbm = () => {
        const _this = this;
        let container_cbm_total = 0;
        _this.state.container_list.forEach(ct => container_cbm_total += parseFloat(ct.allocated_cbm));
        return parseFloat(_this.state.goods_cbm) - container_cbm_total;
    };

    render() {
        return <SeaExportHBLFormRender context={this}/>;
    }
}
