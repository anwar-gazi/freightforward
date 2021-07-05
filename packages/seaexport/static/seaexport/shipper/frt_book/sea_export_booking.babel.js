"use strict";

class BookingForm extends React.Component {
    constructor(props) {
        super(props);
        const _this = this;

        this.state = sea_export_form_state();

        Object.assign(this, BookingAjaxMixin(this));

        this.init_data_loader();

        if (props.public_id) {
            this.load_booking_info(props.public_id, function () {
                if (props.copy) { // if it is copy then reset the booking id to facilitate save as new
                    _this.setState({
                        booking_public_id: ''
                    });
                }
            });
        }

        window.booking_react_element = this;//for debug purpose
        console.log('inspect booking state via window.booking_react_element.state');
    }

    setstate_stakeholder_ref_field = (list_index, field, value) => {
        let _this = this;
        this.setState({
            stakeholder_ref_list: this.state.stakeholder_ref_list.map((ref, i) => {
                if (i == list_index) {
                    ref[field] = value;
                }
                return ref;
            })
        });
    };

    onchange_address_selection_setstate_fill_fields = (list_index) => (event) => {
        let _this = this;

        let other_address_id = _this.state.addressbook_list.filter((address, i) => i != list_index && address.data.id).map(address => address.data.id).unique();
        if (other_address_id.length && other_address_id.indexOf(parseInt(event.target.value)) !== -1) {
            window.modal_alert({content_html: '<div class="text-danger">Already Selected on another leg</div>'});
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        this.setState({
            addressbook_list: _this.state.addressbook_list.map((addr, li) => {
                if (li == list_index) {
                    let address = this.state.cache.address_list.filter(addr => addr.id == event.target.value)[0];
                    if (address) {
                        addr.data = Object.assign(addr.data, {
                            id: address.id,

                            company_name: address.company_name,
                            address: address.address,
                            postcode: address.postcode,
                            city: address.city.id,
                            state: address.state,
                            country: address.country.id,
                            contact: address.contact,
                            tel_num: address.phone,
                            mobile_num: address.mobile,
                            fax_num: address.fax,
                            email: address.email
                        });
                    } else {
                        addr.data = Object.assign(addr.data, addressbook_state_tpl(addr.data.address_type).data);
                    }
                    addr.field_errors = {};
                    addr.misc_errors = [];
                    addr.field_warns = {};
                }
                return addr;
            })
        });
    };

    onchange_address_selection_setstate_clear_fields = (list_index) => () => {
        let _this = this;

        this.setState({
            addressbook_list: _this.state.addressbook_list.map((addr, li) => {
                if (li == list_index) {
                    addr.data = Object.assign(addr.data, addressbook_state_tpl(addr.data.address_type).data);
                    addr.field_errors = {};
                    addr.misc_errors = [];
                    addr.field_warns = {};
                }
                return addr;
            })
        });
    };

    setstate_address_field = (list_index, field_name, value) => {
        let _this = this;
        this.setState({
            addressbook_list: _this.state.addressbook_list.map((addr, li) => {
                if (li == list_index) {
                    addr.data[field_name] = value;

                    if (addr.data.id) {
                        addr.field_warns[field_name] = 'will update addressbook database';
                    }
                }
                return addr;
            })
        });
    };

    onchange_notify_party = (list_index) => (event) => {
        let _this = this;
        this.setState({
            addressbook_list: _this.state.addressbook_list.map((a, i) => {
                if (i == list_index) {
                    a.booking_notify = !a.booking_notify;
                }
                return a;
            })
        });
    };

    // Bank
    toggle_bank_form_display = (list_index) => (event) => {
        let _this = this;
        _this.setState({
            bank_branch_list: (function () {
                let bank_branch_list = _this.state.bank_branch_list;
                bank_branch_list[list_index].use = !bank_branch_list[list_index].use;
                return bank_branch_list;
            }())
        });
    };
    onchange_bank_selection_setstate_fill_fields = (list_index) => (event) => {
        let _this = this;

        const leg = _this.state.bank_branch_list[list_index].data.leg;
        let other_branch_id = _this.state.bank_branch_list.filter(branch => branch.data.leg != leg && branch.data.branch_id)
            .map(branch => branch.data.branch_id)[0];
        if (other_branch_id && other_branch_id == event.target.value) {
            window.modal_alert({content_html: '<div class="text-danger">Already Selected on another leg</div>'});
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        let selected_branch_id = event.target.value;

        let bank_branch_list = _this.state.bank_branch_list;

        if (selected_branch_id) {
            let selected_branch_data = _this.state.cache.bank_branch_list.filter(branch => branch.id == selected_branch_id)[0];
            bank_branch_list[list_index].field_errors = {};
            bank_branch_list[list_index].misc_errors = [];
            bank_branch_list[list_index].field_warns = {};
            bank_branch_list[list_index].data.branch_id = selected_branch_data.id;
            bank_branch_list[list_index].data.bank_name = selected_branch_data.bank.bank_name;
            bank_branch_list[list_index].data.branch_name = selected_branch_data.branch_name;
            bank_branch_list[list_index].data.branch_address = selected_branch_data.branch_address;
        } else {
            bank_branch_list[list_index] = bank_branch_state_tpl(bank_branch_list[list_index].data.leg);
            bank_branch_list[list_index].use = true;
        }
        _this.setState({
            bank_branch_list: bank_branch_list
        });
    };

    bankinfo_set_field_value = (list_index, field_name, value) => {
        const _this = this;
        _this.setState({
            bank_branch_list: _this.state.bank_branch_list.map((branch_info, i) => {
                if (i == list_index) {
                    branch_info.data[field_name] = value;
                    if (branch_info.data.branch_id) {
                        branch_info.field_warns[field_name] = 'changes will update database';
                    }
                }
                return branch_info;
            })
        });
    };

    delete_goods_form = (list_index) => (event) => {
        const _this = this;
        _this.setState({
            goods_list: _this.state.goods_list.filter((data, i) => i != list_index)
        });
    };

    onchange_goods_form_field = (list_index, field_name, value) => {
        let _this = this;
        this.setState({
            goods_list: _this.state.goods_list.map((g, i) => {
                if (i == list_index) {
                    g[field_name] = value;
                }
                if (field_name == 'currency') {
                    g[field_name] = value;
                }
                return g;
            })
        });
        // this.setstate_calculate_volumetricwt_chargablewt_cbm(list_index);
    };

    calculate_container_cbm = (length_cm, width_cm, height_cm) => {
        if (length_cm && width_cm && height_cm) {
            let cbm = parseFloat(length_cm) * parseFloat(width_cm) * parseFloat(height_cm) * (1 / 6000);
            cbm = cbm.toFixed(2);
            return cbm;
        } else {
            return 0;
        }
    };
    calculate_total_cbm = (length_cm, width_cm, height_cm, no_of_pieces) => {
        let container_cbm = parseFloat(this.calculate_container_cbm(length_cm, width_cm, height_cm));
        no_of_pieces = parseInt(no_of_pieces);
        return no_of_pieces * container_cbm;
    };

    calculate_volumetric_weight_kg = (length_cm, width_cm, height_cm, no_of_pieces) => {
        let volumetric_weight = parseFloat(this.calculate_total_cbm(length_cm, width_cm, height_cm, no_of_pieces) * (1 / 166.6667));
        volumetric_weight = volumetric_weight.toFixed(2);
        return volumetric_weight;
    };

    setstate_calculate_volumetricwt_chargablewt_cbm = (list_index) => {
        let _this = this;
        this.setState({
            goods_list: _this.state.goods_list.map((data, i) => {
                if (i == list_index) {
                    let volumetric_wt_kg = _this.calculate_volumetric_weight_kg(data.length_cm, data.width_cm, data.height_cm, data.no_of_pieces);
                    data.chargable_weight = parseFloat(data.weight_kg) > parseFloat(volumetric_wt_kg) ? data.weight_kg : volumetric_wt_kg;
                    data.volumetric_weight = volumetric_wt_kg;
                    data.cbm = this.calculate_total_cbm(data.length_cm, data.width_cm, data.height_cm, data.no_of_pieces);
                }
                return data;
            })
        });
    };

    onclick_file_attachment = () => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        let form = $('<iframe id="upload_target" name="upload_target" src="#" style="width:0;height:0;border:0 solid #fff;"></iframe>' +
            '<form action="' + window.urlfor_file_upload + '" method="post" enctype="multipart/form-data" target="upload_target"><div>' +
            '<div class="form-group"><label>Document name</label><input id="name" type="text" class="form-control"/></div>' +
            '<div class="form-group"><label>Select file</label><input id="file" type="text" class="form-control-file"/></div>' +
            '</div></form>');
        form.find('#file').click(() => {
            console.log('here');
            $('#genericfileupload').trigger('click');
        });
        loader.append_html(form);
        loader.upon_ok = function () {
            const doc_name = form.find('#name').val();
            const file = form.find('#file').prop('files')[0];
            if (doc_name && file) {
                form.find('form').submit(() => {

                });
                form.find('form:first').submit();
                // _this.setState({
                //     fileuploadtodo_list: (function () {
                //         let fileuploadtodo_list = _this.state.fileuploadtodo_list;
                //         fileuploadtodo_list.push({
                //             input_name: doc_name,
                //             file_obj: file
                //         });
                //         return fileuploadtodo_list;
                //     }())
                // });
                // loader.close();
            } else {
                loader.set_footer_msg('<div class="text-danger">Please complete all fields</div>');
            }
        };
    };

    goods_reference_add_modal = (goods_form_index) => () => {
        const _this = this;
        let loader = window.modal_alert();
        let form = jQuery('<div>' +
            '<div class="form-group">' +
            '<label>Reference type and value</label>' +
            '<select class="form-control">' +
            '<option value="">--</option>' +
            _this.state.cache.goods_ref_type_list.map(ref => '<option value="' + ref.id + '">' + ref.name + '</option>').join('') +
            '</select>' +
            '</div>' +
            '<div class="form-group">' +
            '<input type="text" class="form-control"/>' +
            '</div>' +
            '</div>');
        loader.append_html(form);
        loader.upon_ok = function () {
            const ref_type_id = form.find('select').val();
            const value = form.find('input').val();
            if (ref_type_id && value) {
                _this.add_goods_ref_number(goods_form_index, ref_type_id, value);
                return true;
            } else {
                loader.set_footer_msg('<div class="text-danger">Field empty or invalid</div>');
            }
        };
    };

    add_goods_ref_number = (goods_form_index, ref_type_id, value) => {
        const _this = this;
        let goods_list = _this.state.goods_list;
        goods_list.map((info, i) => {
            if (i == goods_form_index) {
                info.references.push(goods_references_state_tpl(ref_type_id, value));
            }
            return info;
        });
        _this.setState({
            goods_list: goods_list
        });
    };

    remove_attached_file_url = (urltoremove) => {
        this.setState({
            uplaodedfile_url_list: this.state.uplaodedfile_url_list.filter(url => url != urltoremove)
        });
    };

    remove_goods_ref = (goodsformlistindex, goodsreflistindex) => {
        const _this = this;
        _this.setState({
            goods_list: _this.state.goods_list.map((gl, gli) => {
                if (gli == goodsformlistindex) {
                    gl.references = gl.references.filter((ref, refi) => refi != goodsreflistindex)
                }
                return gl;
            })
        });
    };

    componentWillMount = () => {
        const _this = this;
        jQuery(document).off('uploadresulturlreceive').on('uploadresulturlreceive', function (event, url) {
            _this.state.uplaodedfile_url_list.push(url);
            _this.setState({
                uplaodedfile_url_list: _this.state.uplaodedfile_url_list
            });
        });
    };

    render() {
        return <SeaExportBookingForm context={this}/>;
    }
}

