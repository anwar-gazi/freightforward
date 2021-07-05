"use strict";

class SeaExportMBLForm extends React.Component {
    constructor(props) {
        super(props);
        let _this = this;

        this.state = mbl_form_state();

        Object.assign(this, MBLAjaxMixin(this));

        this.init_data_loader();

        window.mbl_react_element = this;//for debug purpose
    }

    onchange_shipper_address_field = (field_name, value) => {
        const _this = this;
        let shipper = this.state.shipper;
        shipper.data[field_name] = value;
        this.setState({
            shipper: shipper
        });
        // autofill executed location
        if (field_name == 'city' && !_this.state.mbl_public_id && !_this.state.issue_city_id) {
            this.setState({
                issue_city_id: value
            });
        }
    };

    onchange_consignee_address_field = (field_name, value) => {
        let consignee = this.state.consignee;
        consignee.data[field_name] = value;
        this.setState({
            consignee: consignee
        });
    };

    onchange_field = (field_name, value) => {
        this.setState({
            [field_name]: value
        });
    };

    hbl_cbm_total = () => {
        const _this = this;
        let cbm = 0;
        _this.state.hbl_list.map(hbl => cbm += hbl.cbm);
        return cbm;
    };

    hbl_allocated_cbm_total = () => {
        const _this = this;
        let alloc_cbm = 0;
        _this.state.hbl_list.map(hbl => hbl.allocated_container_list.map(ct => alloc_cbm += parseFloat(ct.allocated_cbm)));
        return alloc_cbm;
    };
    hbl_remain_cbm_total = () => {
        const _this = this;
        return _this.hbl_cbm_total() - _this.hbl_allocated_cbm_total();
    };
    mbl_remain_cbm_total = () => {
        const _this = this;
        let mbl_alloc_cbm = _this.hbl_allocated_cbm_total();
        let mbl_remain_cbm = parseFloat(_this.state.goods_cbm) - mbl_alloc_cbm;
        return mbl_remain_cbm;
    };

    hbl_container_list_reformat = () => {
        const _this = this;
        let container_list = [];
        _this.state.hbl_list.map(hbl => hbl.allocated_container_list.map(ct => {
            const container = _this.state.cache.container_list.filter(c => c.id == ct.container_type.id)[0];
            container_list.push(container_info_dict(container.id, container.name, container.length_ft, container.height_ft, container.width_ft, container.capacity_cbm, ct.allocated_cbm, ct.container_serial));
        }));
        return container_list;
    };

    hbl_propmt = () => {
        const _this = this;
        let selection = jQuery('<div class="">' +
            '<div>' +
            '</div>' +
            '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th>Select</th>' +
            '<th>ID</th>' +
            '<th>shipper</th>' +
            '<th>consignee</th>' +
            '<th>CBM</th>' +
            '<th>Container List</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            _this.state.cache.unassigned_hbl_list.map(hbl => {
                const hbl_assigned_already = _this.state.hbl_list.filter(asshbl => asshbl.public_id == hbl.public_id).length > 0;
                const checked_attr = hbl_assigned_already ? 'checked' : '';
                const disabled_attr = hbl.allocated_container_list.length ? '' : 'disabled';
                const disabled_msg = hbl.allocated_container_list.length ? '' : '<div class="text-danger small">no container allocated, cannot select now</div>';
                return '<tr data-hbl_public_id="' + hbl.public_id + '">' +
                    '<td><input class="hbl_selection" type="checkbox" ' + checked_attr + ' ' + disabled_attr + ' data-hbl_public_id="' + hbl.public_id + '"/>' + disabled_msg + '</td>' +
                    '<td>' + hbl.public_id + '<br/>issued: ' + hbl.issue_date + '</td>' +
                    '<td>' + hbl.shipper_name + '</td>' +
                    '<td>' + hbl.consignee_name + '</td>' +
                    '<td>' + hbl.cbm + '</td>' +
                    '<td>' +
                    '<table>' +
                    (hbl.allocated_container_list.length ?
                        '<thead><th>container serial</th><th>container number</th><th>container type</th></thead>' +
                        '<tbody>' +
                        hbl.allocated_container_list.map(allocont => {
                            return '<tr><td>' + allocont.container_serial + '</td><td>' + allocont.container_number + '</td><td>' + allocont.container_type.name + '</td></tr>';
                        }).join('') + '</tbody>'
                        : '<thead><tr><td colspan="3">No container allocated</td></tr></thead>') +
                    '</table>' +
                    '</td>' +
                    '</tr>';
            }).join('')
            + '</tbody>' +
            '</table>' +
            '</div>');
        selection.find('.hbl_selection').click(function (event) {
            const clicked_hbl_public_id = jQuery(event.target).attr('data-hbl_public_id');
            const clicked_hbl = _this.state.cache.unassigned_hbl_list.filter(uashbl => uashbl.public_id == clicked_hbl_public_id)[0];
            if (jQuery(event.target).is(':checked')) {
                _this.state.hbl_list.push(clicked_hbl);
                _this.setState({
                    hbl_list: _this.state.hbl_list
                });
            } else {
                _this.setState({
                    hbl_list: _this.state.hbl_list.filter(asshbl => asshbl.public_id != clicked_hbl_public_id)
                });
            }
        });
        let loader = window.modal_alert({content_html: selection, more_dialog_class: 'modal-dialog-lg'});
        loader.upon_ok = function () {
            _this.setState({
                goods_cbm: _this.hbl_cbm_total()
            });
            return true;
        };
    };

    // build_container_list_from_hbl_list = () => {
    //     const _this = this;
    //     let container_list = [];
    //     _this.state.hbl_list.forEach(hbl => {
    //         const hbl_container_list = hbl.allocated_container_list.map(alloct => container_info_dict(alloct.id, alloct.container_type.name, alloct.container_type.length_ft, alloct.container_type.width_ft, alloct.container_type.height_ft, alloct.container_type.capacity_cbm, alloct.allocated_cbm, alloct.container_serial));
    //         container_list = container_list.concat(hbl_container_list);
    //     });
    //     return container_list;
    // };

    // remove_container_from_list = (list_index) => {
    //     const _this = this;
    //     let ctlistfiltered = _this.state.container_list.filter((ct, li) => li !== list_index);
    //     _this.setState({
    //         container_list: ctlistfiltered
    //     });
    // };

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
        const container_list_available = _this.state.cache.container_list;
        const container_options = container_list_available
            .map(ct => {
                return '<option value="' + ct.id + '">' + ct.name + ' length:' + ct.length_ft + ' width:' + ct.width_ft + ' height:' + ct.height_ft + ' capacity:' + ct.capacity_cbm + '</option>';
            }).join('');
        let form = jQuery('<div class="form-group">' +
            '<div>Unallocated CBM: <span class="unallocated_cbm">' + _this.unallocated_cbm() + '</span></div>' +
            '<label>Container Serial</label>' +
            '<div class="input-group"><input type="text" class="form-control container_serial"><button type="button" class="input-group-append load_serial">load</button></div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label>Container Type</label>' +
            '<select disabled class="form-control container_id"><option value="">--</option>' + container_options + '</select>' +
            '</div>'
            + '<div class="form-group">' +
            '<label>Allocated CBM</label>' +
            '<input disabled type="number" step=".01" class="form-control allocated_cbm">' +
            '</div>'
        );
        loader.append_html(form);
        form.find('#existing_container_selection').click(function () {
            loader.close();
        });
        form.find('.load_serial').click(event => form.find('.container_serial').trigger('change'));
        form.find('.container_serial').change(function (event) {
            const serial = jQuery(event.target).val();
            if (serial) {
                if (_this.state.container_list.filter(ct => ct.serial == serial).length) {
                    window.modal_alert().append_html('<div class="text-danger">This serial container is already added to this HBL</div>');
                    $(event.target).val('');
                    return false;
                } else {
                    // check in database
                    _this.load_container_serial(serial, function (container_dict) {
                        const remain = parseFloat(container_dict.capacity_cbm) - parseFloat(container_dict.allocated_cbm);
                        if (remain > 0) {
                            $(event.target).prop('readonly', true);//lock this serial number
                            form.find('.allocated_cbm').prop('disabled', false);
                            form.find('.container_id').prop('disabled', false);
                        } else {
                            form.find('.allocated_cbm').prop('disabled', true);
                            form.find('.container_id').prop('disabled', true);
                        }

                        form.find('.allocated_cbm').change(event => {
                            const val = $(event.target).val();
                            if (val > remain) {
                                window.modal_alert({content_html: '<div class="text-danger">This container already has {} cbm allocated. You can allocate {} more</div>'.format(container_dict.allocated_cbm, remain)});
                                $(event.target).val('');
                            }
                        });

                        form.find('.container_id').val(container_dict.id);
                        form.find('.container_id').change(event => {
                            if ($(event.target).val() != container_dict.id) {
                                window.modal_alert({content_html: '<div class="text-danger">The container serial implies the container type from database</div>'});
                                $(event.target).val(container_dict.id);
                            }
                        });
                    }, function () {
                        form.find('.allocated_cbm').prop('disabled', false);
                        form.find('.container_id').prop('disabled', false);
                    });
                }
            }
        });
        loader.upon_ok = function (modaljqdom) {
            const container_id = jQuery(modaljqdom).find('.container_id').val();
            const allocated_cbm = jQuery(modaljqdom).find('.allocated_cbm').val();
            const container_serial = jQuery(modaljqdom).find('.container_serial').val();
            if (container_id && allocated_cbm && container_serial) {
                const selected_container = container_list_available.filter(ct => ct.id == container_id)[0];
                if (allocated_cbm > selected_container.capacity_cbm) {
                    loader.set_footer_msg('<div class="text-danger">Allocated CBM exceeds capacity</div>');
                    return false;
                } else {
                    let data = container_info_dict(selected_container.id, selected_container.name, selected_container.length_ft, selected_container.width_ft, selected_container.height_ft,
                        selected_container.capacity_cbm, allocated_cbm, container_serial);
                    _this.setState({
                        container_list: (function () {
                            let container_list = _this.state.container_list;
                            container_list.push(data);
                            return container_list;
                        }())
                    });
                    return true;
                }
            } else {
                loader.set_footer_msg('<div class="text-danger">Container info invalid or incomplete</div>');
                return false;
            }
        };
    };

    allocated_cbm_by_hbl_list_and_container_list = () => {
        const _this = this;
        let container_cbm_total = 0;
        _this.state.hbl_list.forEach(hbl => hbl.allocated_container_list.forEach(ct => container_cbm_total += parseFloat(ct.allocated_cbm)));
        _this.state.container_list.forEach(ct => container_cbm_total += parseFloat(ct.allocated_cbm));
        return container_cbm_total;
    };

    unallocated_cbm = () => {
        const _this = this;
        let container_cbm_total = _this.allocated_cbm_by_hbl_list_and_container_list();
        return parseFloat(_this.state.goods_cbm) - container_cbm_total;
    };

    render() {
        return <SeaExportMBLFormRender context={this}/>;
    }
}