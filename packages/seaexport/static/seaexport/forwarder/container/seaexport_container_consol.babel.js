"use strict";

class SeaExportContainerConsolidationForm extends React.Component {
    constructor(props) {
        super(props);
        let _this = this;

        this.state = container_consolidation_form_state();

        Object.assign(this, ContainerConsolAjaxMixin(this));

        this.init_data_loader();

        window.container_consol_react_element = this;//for debug purpose
    }

    get_container_info = (container_type_id) => {
        return this.state.cache.container_type_list.filter(ct => ct.id == container_type_id)[0];
    };

    onchange_address_selection_setstate_fill_fields = (addr_type, id) => {
        let _this = this;

        let party = addressbook_state_tpl();

        let address = null;
        if (addr_type === 'shipper') {
            address = this.state.cache.shipper_addressbook_list.filter(addr => addr.id == id)[0];
        } else if (addr_type === 'consignee') {
            address = this.state.cache.consignee_addressbook_list.filter(addr => addr.id == id)[0];
        }
        if (address) {
            party.data = Object.assign(party.data, {
                id: address.id,

                company_name: address.company_name,
                address: address.address,
                postcode: address.postcode,
                city: address.city_id,
                state: address.state,
                country: address.country_id,
                contact: address.contact,
                tel_num: address.phone,
                mobile_num: address.mobile,
                fax_num: address.fax,
                email: address.email
            });
        }
        party.form_errors = {};
        party.errors = [];
        party.msg = [];

        if (addr_type === 'shipper') {
            this.setState({
                shipper: party
            });
        } else if (addr_type === 'consignee') {
            this.setState({
                consignee: party
            });
        }
    };

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
        _this.state.container_list.forEach(linked_container => {
            linked_container.hbl_list.forEach(hbl => cbm += hbl.cbm);
        });
        return cbm;
    };

    hbl_allocated_cbm_total = () => {
        const _this = this;
        let alloc_cbm = 0;
        _this.state.container_list.forEach(linked_container => {
            linked_container.hbl_list.forEach(hbl => hbl.allocated_container_list.map(ct => alloc_cbm += parseFloat(ct.allocated_cbm)));
        });
        return alloc_cbm;
    };
    hbl_remain_cbm_total = () => {
        const _this = this;
        return _this.hbl_cbm_total() - _this.hbl_allocated_cbm_total();
    };

    calculate_container_hbl_cbm_total = (container_list_index) => {
        const _this = this;
        return _this.state.container_list.filter((linked_container_entry, i) => i == container_list_index).map(linked_container_entry =>
            linked_container_entry.hbl_list.map(hbl => hbl.cbm).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b);
    };

    setstate_add_hbl_to_linked_container = (hbl_dict, container_list_index) => {
        this.setState({
            container_list: this.state.container_list.map((linked_container_entry, i) => {
                if (i == container_list_index) {
                    linked_container_entry.hbl_list.push(hbl_dict);
                }
                return linked_container_entry;
            })
        });
    };

    setstate_remove_hbl_from_linked_container = (hbl_dict, container_list_index) => {
        this.setState({
            container_list: this.state.container_list.map((linked_container_entry, i) => {
                if (i == container_list_index) {
                    linked_container_entry.hbl_list = linked_container_entry.hbl_list.filter(hbl => hbl.public_id != hbl_dict.public_id);
                }
                return linked_container_entry;
            })
        });
    };

    hbl_prompt_for_linked_container = (container_list_index) => {
        const _this = this;
        const linked_container = _this.state.container_list.filter((e, i) => i === container_list_index)[0];
        const container = _this.get_container_info(linked_container.container_type_id);
        let selection = jQuery('<div class="">' +
            '<div>' +
            '<div>Container: {}, serial: {}, number: {}</div>'.format(container.name, linked_container.container_serial, linked_container.container_number) +
            '<div>Container Capacity: <span class="">' + container.capacity_cbm + '</span></div>' +
            '<div>Total CBM from linked hbl: <span class="cbm_allocated">' + _this.calculate_container_hbl_cbm_total(container_list_index) + '</span></div>' +
            '</div>' +
            '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th>Select</th>' +
            '<th>ID</th>' +
            '<th>Shipper</th>' +
            '<th>Consignee</th>' +
            '<th>CBM</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            _this.state.cache.unassigned_hbl_list.map(hbl => {
                let checked_prop = '';
                let disabled_prop = '';
                let disabled_msg = '';
                const allocated_container_for_hbl_in_loop_q = _this.state.container_list.filter(lnctf => lnctf.hbl_list.filter(hbltf => hbltf.public_id == hbl.public_id).length > 0);
                if (allocated_container_for_hbl_in_loop_q.length) {
                    checked_prop = 'checked';

                    if (allocated_container_for_hbl_in_loop_q[0].container_serial != linked_container.container_serial) {
                        disabled_prop = 'disabled';
                        disabled_msg = '<div class="text-warning small">for container serial {}</div>'.format(allocated_container_for_hbl_in_loop_q[0].container_serial);
                    }
                }
                return '<tr data-hbl_public_id="' + hbl.public_id + '">' +
                    '<td>' +
                    '<input class="hbl_selection" type="checkbox" ' + checked_prop + ' ' + disabled_prop + ' data-hbl_public_id="' + hbl.public_id + '"/>' + disabled_msg +
                    '</td>' +
                    '<td>' + hbl.public_id + '<br/>issued: ' + hbl.issue_date + '</td>' +
                    '<td>' + hbl.shipper_name + '</td>' +
                    '<td>' + hbl.consignee_name + '</td>' +
                    '<td>' + hbl.cbm + '</td>' +
                    '</tr>';
            }).join('')
            + '</tbody>' +
            '</table>' +
            '</div>');
        selection.find('.hbl_selection').click(function (event) {
            const clicked_hbl_public_id = jQuery(event.target).attr('data-hbl_public_id');
            const clicked_hbl = _this.state.cache.unassigned_hbl_list.filter(uashbl => uashbl.public_id == clicked_hbl_public_id)[0];
            if (jQuery(event.target).is(':checked')) {
                const thiscontainerhblcbmtotal = _this.calculate_container_hbl_cbm_total(container_list_index) + clicked_hbl.cbm;
                if (thiscontainerhblcbmtotal > container.capacity_cbm) {
                    selection.find('.cbm_allocated').html('<span class="text-danger">' + thiscontainerhblcbmtotal + ' (exceeds container capacity)</span>');
                } else {
                    selection.find('.cbm_allocated').text(thiscontainerhblcbmtotal);
                }
                _this.setstate_add_hbl_to_linked_container(clicked_hbl, container_list_index);
            } else {
                const thiscontainerhblcbmtotal = _this.calculate_container_hbl_cbm_total(container_list_index) - clicked_hbl.cbm;
                if (thiscontainerhblcbmtotal > container.capacity_cbm) {
                    selection.find('.cbm_allocated').html('<span class="text-danger">' + thiscontainerhblcbmtotal + ' (exceeds container capacity)</span>');
                } else {
                    selection.find('.cbm_allocated').text(thiscontainerhblcbmtotal);
                }
                _this.setstate_remove_hbl_from_linked_container(clicked_hbl, container_list_index);
            }
        });
        let loader = window.modal_alert({content_html: selection, more_dialog_class: 'modal-dialog-lg'});
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
        const container_types = _this.state.cache.container_type_list;
        const container_options = container_types
            .map(ct => {
                return '<option value="' + ct.id + '">' + ct.name + ', capacity:' + ct.capacity_cbm + ' CBM</option>';
            }).join('');
        let form = jQuery('<div class="form-group">' +
            '<label>Container Serial</label>' +
            '<div class="input-group"><input type="text" class="form-control container_serial"></div>' +
            '</div>' +
            '<div class="form-group"><label>Container Number</label><input type="text" class="form-control container_number"/></div>' +
            '<div class="form-group">' +
            '<label>Container Type</label>' +
            '<select class="form-control container_id"><option value="">--</option>' + container_options + '</select>' +
            '</div>' +
            '<div class="form-group"><label><input type="radio" name="lcl_or_fcl" value="fcl" checked> FCL</label></div>' +
            '<div class="form-group"><label><input type="radio" name="lcl_or_fcl" value="lcl"> LCL</label></div>'
        );
        loader.append_html(form);

        form.find('.container_serial').change(function (cs_e) {
            const serial = $(cs_e.target).val();
            if (serial && _this.state.container_list.filter(containerinloop => containerinloop.container_serial == serial).length) {
                window.modal_alert().append_html('<div class="text-danger">Serial {} is already added</div>'.format(serial));
                $(cs_e.target).val('');
            }
        });

        loader.upon_ok = function (modaljqdom) {
            const container_id = jQuery(modaljqdom).find('.container_id').val();
            const container_serial = jQuery(modaljqdom).find('.container_serial').val();
            const container_number = jQuery(modaljqdom).find('.container_number').val();
            const fcl_or_lcl = jQuery(modaljqdom).find('[name="lcl_or_fcl"]:checked').val();
            if (container_id && container_serial && container_number && fcl_or_lcl) {
                const selected_container = _this.state.cache.container_type_list.filter(ct => ct.id == container_id)[0];
                let data = container_info_dict(null, selected_container.id, container_serial, container_number, fcl_or_lcl);
                _this.setState({
                    container_list: (function () {
                        let container_list = _this.state.container_list;
                        container_list.push(data);
                        return container_list;
                    }())
                });
                return true;
            } else {
                window.modal_alert().append_html('<div class="text-danger">Container info invalid or some fields incomplete</div>');
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
        return <SeaExportContainerConsolFormRender context={this}/>;
    }
}