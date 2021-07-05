"use strict";

class BookingForm extends React.Component {
    default_stakeholder_refs_count = 3;
    default_refs_count = 3;
    goods_form_count_initial = 3;
    goods_form_data_structure = {
        id: '',// form id

        db_id: '',
        no_of_pieces: '',
        package_type: '',
        weight_kg: '',
        volumetric_weight: '',
        cbm: '',
        chargable_weight: '',
        length_cm: '',
        width_cm: '',
        height_cm: '',
        quantity: '',
        unit_price: '',
        currency: '',
        ref_type: '',
        shipping_mark: '',
        goods_desc: '',
        references: [],

        saved: false,
        msg: [],
        errors: [],
        formerrors: [],
    };
    goods_ref_form_data_structure = {
        form_id: '',
        ref_type: '',
        ref_number: '',

        id: '', // db id
        saved: false,
        msg: [],
        errors: [],
        formerrors: [],
    };

    constructor(props) {
        super(props);
        let _this = this;
        this.state = {
            //cache
            organization: {},
            stakeholder_reference_types: [],
            reference_types: [],// goods reference types
            package_types: [],
            currency: [],
            transport_agreements: [],
            country_list: [],
            city_list: [],
            airport_list: [],
            tod_list: [],
            address_list: [],
            bank_list: [],
            payment_type_list: [],

            // top
            page_errors: [],
            page_msg: [],

            booking_success: false,

            booking_entry_started: false,
            booking_entry_ended: false,

            is_draft: false,
            is_booking_confirm: false,
            booking_id: '',
            globalid: '',

            booking_misc_errors: [],
            booking_misc_msg: [],

            booking_saved: false,
            booking_mainentry_msg: [],
            booking_mainentry_errors: [],
            booking_mainentry_formerrors: [],

            origin_bank: {
                use: false,

                save_processing: false,

                saved: false,
                msg: [],
                field_errors: {},
                misc_errors: [],

                field_warns: {},

                form_title: 'Origin Bank Branch',

                data: {
                    branch_id: '', //branch id

                    bank_name: '',
                    branch_name: '',
                    branch_address: '',

                    notify: false
                }
            },
            destination_bank: {
                use: false,

                save_processing: false,
                saved: false,
                msg: [],
                field_errors: {},
                misc_errors: [],

                field_warns: {},

                form_title: 'Destination Bank Branch',

                data: {
                    branch_id: '', //branch id

                    bank_name: '',
                    branch_name: '',
                    branch_address: '',

                    notify: false
                }
            },

            // shipping service data
            shipping_service_db_id: null,
            shipping_service: '',

            shipping_service_saved: false,
            shipping_service_msg: [],
            shipping_service_errors: [],
            shipping_service_formerrors: [],

            //ports info
            portinfo_saved: false,
            portinfo_msg: [],
            portinfo_errors: [],
            portinfo_formerrors: [],

            portinfo_id: '',

            port_of_dest: '',
            port_of_load: '',
            terms_of_deliv: '',
            country_of_dest: '',

            goods_form_data: [],
            stakeholder_refs: [],

            // order notes
            frt_payment_ins: '',
            frt_transport_agreement: '',
            frt_delivery_instruction: '',

            order_notes_saved: false,
            order_notes_id: '',
            order_notes_msg: [],
            order_notes_errors: [],
            order_notes_formerrors: [],

            pickup_date: '',
            pickup_earliest_time: '',
            pickup_latest_time: '',
            pickup_ins: '',

            pickup_notes_saved: false,
            pickup_notes_id: '',
            pickup_notes_msg: [],
            pickup_notes_errors: [],
            pickup_notes_formerrors: [],

            notify_parties: [],

            addressbook: {
                shipper: {
                    save_processing: false,
                    saved: false,
                    msg: [],
                    field_errors: {},
                    misc_errors: [],

                    field_warns: {},

                    form_title: 'Shipper',
                    booking_notify: false,

                    data: {
                        address_id: null,

                        company_name: '',
                        address: '',
                        postcode: '',
                        city: '',
                        state: '',
                        country: '',
                        contact: '',
                        tel_num: '',
                        mobile_num: '',
                        fax_num: '',
                        email: '',

                        address_type: 'shipper'
                    }
                },
                consignee: {
                    save_processing: false,
                    saved: false,
                    msg: [],
                    field_errors: {},
                    misc_errors: [],

                    field_warns: {},

                    form_title: 'Consignee',
                    booking_notify: false,

                    data: {
                        address_id: null,

                        company_name: '',
                        address: '',
                        postcode: '',
                        city: '',
                        state: '',
                        country: '',
                        contact: '',
                        tel_num: '',
                        mobile_num: '',
                        fax_num: '',
                        email: '',

                        address_type: 'consignee'
                    }
                }
            }
        };

        for (let i = 1; i <= this.goods_form_count_initial; i++) {
            this.state.goods_form_data.push(this._create_goods_form(this._create_goods_form_id(i)));
        }

        for (let i = 1; i <= this.default_stakeholder_refs_count; i++) {
            this.state.stakeholder_refs.push(this._create_stakeholder_ref_form(this._create_stakeholder_ref_form_id(i)));
        }

        Object.assign(this, BookingAjaxMixin(this));
        Object.assign(this, BankInfoMixin(this));

        this.load_data(null);

        window.booking_react_element = this;//for debug purpose
        console.log('inspect booking state via window.booking_react_element.state');
    }

    // initial page data
    load_data = (supplier_public_id, onsuccess, onerror, onajaxcomplete) => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_init_data,
            data: {supplier_public_id: supplier_public_id},
            dataType: 'json',
            success: function (resp) {
                if (!resp.org.public_id) {
                    let supplier_selection = jQuery('<div class="form-group"><label for="supplier_selection">Select a supplier</label><select' +
                        ' class="form-control"><option value="">--</option>'
                        + resp.supplier_list.map(supplier => '<option value="{}">{}</option>'.format(supplier.public_id, supplier.title)).join('')
                        + '</select></div>');
                    supplier_selection.find('select').on('change', function (event) {
                        const public_id = jQuery(event.target).val();
                        if (public_id) {
                            _this.load_data(public_id);
                        }
                    });
                    window.modal_alert({content_html: ''}).append_html(supplier_selection);
                    return false;
                }
                _this.setState({
                    organization: resp.org,
                    reference_types: resp.reference_types,
                    stakeholder_reference_types: resp.stakeholder_reference_types,
                    package_types: resp.package_types,
                    currency: resp.currency,
                    transport_agreements: resp.transport_agreements,
                    country_list: resp.country_list,
                    city_list: resp.city_list,
                    airport_list: resp.airport_list,
                    tod_list: resp.tod_list,
                    address_list: resp.address_list,
                    bank_list: resp.bank_list,
                    payment_type_list: resp.payment_type_list,
                });
                if (onsuccess) {
                    onsuccess(resp);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    page_errors: [err]
                });
                if (onerror) {
                    onerror(err);
                }
            }, complete: function (jqXHR, textStatus) {
                if (onajaxcomplete) {
                    onajaxcomplete();
                }
            }
        });
    };

    setstate_draft = () => {
        this.setState({
            is_draft: true,
            is_booking_confirm: false
        });
    };
    setstate_booking_confirm = () => {
        this.setState({
            is_draft: false,
            is_booking_confirm: true
        });
    };

    setstate_reset_booking_entry = () => {
        this.setState(
            {
                booking_entry_started: false,
                booking_entry_ended: false
            }
        );
    };
    setstate_booking_entry_start = () => {
        this.setState(
            {
                booking_entry_started: true,
                booking_entry_ended: false
            }
        );
    };
    setstate_booking_entry_complete = () => {
        this.setState(
            {
                booking_entry_ended: true
            }
        );
    };
    booking_entry_is_running = () => {
        return !this.state.booking_entry_ended && this.state.booking_entry_started;
    };
    booking_entry_is_complete = () => {
        return this.state.booking_entry_ended;
    };
    setstate_clear_feedback_messages = () => {
        this.setState({
            booking_misc_errors: [],
            booking_misc_msg: [],
            booking_mainentry_msg: [],
            booking_mainentry_errors: [],
            booking_mainentry_formerrors: {}
        });
    };

    _goods_formdata = (form_id) => {
        return this.state.goods_form_data.filter(fd => fd.id == form_id)[0];
    };

    _goods_ref_formdata = (goods_form_id, refers_form_id) => {
        return this.state.goods_form_data.filter(fd => fd.id == goods_form_id)[0].references.filter(ref => ref.form_id == refers_form_id)[0];
    };

    set_goods_ref_formdata = (goods_form_id, ref_form_id, data) => {
        let _this = this;
        this.setState({
            goods_form_data: _this.state.goods_form_data.map(gfd => {
                if (gfd.id == goods_form_id) {
                    gfd.references.map(ref => {
                        if (ref.form_id == ref_form_id) {
                            Object.assign(ref, data);
                        }
                        return ref;
                    });
                }
                return gfd;
            })
        });
    };

    //order notes
    set_freight_payment_ins = (value) => (event) => {
        this.setState({
            frt_payment_ins: value
        });
    };
    onchange_freight_transport_agreement = (event) => {
        this.setState({
            frt_transport_agreement: event.target.value.trim()
        });
    };
    onchange_freight_delivery_ins = (event) => {
        this.setState({
            frt_delivery_instruction: event.target.value.trim()
        });
    };

    //pickup notes
    onchange_pickup_date = (event) => {
        this.setState({
            pickup_date: event.target.value.trim()
        });
    };
    onchange_earliest_pickup_time = (event) => {
        this.setState({
            pickup_earliest_time: event.target.value.trim()
        });
    };
    onchange_latest_pickup_time = (event) => {
        this.setState({
            pickup_latest_time: event.target.value.trim()
        });
    };
    onchange_pickup_instructions = (event) => {
        this.setState({
            pickup_ins: event.target.value.trim()
        });
    };

    stakeholder_ref_form = (form_id) => {
        return this.state.stakeholder_refs.filter(ref => ref.form_id == form_id)[0];
    };

    //stakeholder
    _create_stakeholder_ref_form_id = (salt) => {
        return 'stakeholder_ref{}'.format(salt);
    };
    _create_stakeholder_ref_form = (ref_form_id) => {
        return {
            form_id: ref_form_id,
            ref_type: '',
            ref_number: '',

            id: '',
            saved: false,
            msg: [],
            errors: [],
            formerrors: [],
        };
    };
    setstate_stakeholder_ref_formdata = (form_id, data) => {
        this.state.stakeholder_refs.map(ref => {
            if (ref.form_id == form_id) {
                Object.assign(ref, data);
            }
            return ref;
        });
    };
    onclick_add_stakeholder_ref_form = (event) => {
        let refs = this.state.stakeholder_refs;
        refs.push(this._create_stakeholder_ref_form(this._create_stakeholder_ref_form_id(refs.length + 1)));
        this.setState({
            stakeholder_refs: refs
        });
    };
    onchange_stakeholder_ref_type = (ref_form_id) => (event) => {
        let _this = this;
        this.setState({
            stakeholder_refs: this.state.stakeholder_refs.map(ref => {
                if (ref.form_id == ref_form_id) {
                    ref.ref_type = event.target.value.trim();
                }
                return ref;
            })
        });
    };
    onchange_stakeholder_ref_number = (ref_form_id) => (event) => {
        let _this = this;
        this.setState({
            stakeholder_refs: this.state.stakeholder_refs.map(ref => {
                if (ref.form_id == ref_form_id) {
                    ref.ref_number = event.target.value.trim();
                }
                return ref;
            })
        });
    };

    // goods
    onchange_ref_type = (goods_form_id, ref_form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: this.state.goods_form_data.map(gfd => {
                if (gfd.id == goods_form_id) {
                    gfd.references.map(rf => {
                        if (rf.form_id == ref_form_id) {
                            rf.ref_type = event.target.value.trim();
                        }
                        return rf;
                    });
                }
                return gfd;
            })
        });
    };
    onchange_ref_number = (goods_form_id, ref_form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: this.state.goods_form_data.map(gfd => {
                if (gfd.id == goods_form_id) {
                    gfd.references.map(rf => {
                        if (rf.form_id == ref_form_id) {
                            rf.ref_number = event.target.value.trim();
                        }
                        return rf;
                    });
                }
                return gfd;
            })
        });
    };

    onclick_add_ref_form = (goods_form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: this.state.goods_form_data.map(fd => {
                if (fd.id == goods_form_id) {
                    fd.references.push(_this._create_ref_form(goods_form_id, _this._create_ref_form_id(goods_form_id, fd.references.length + 1)));
                }
                return fd;
            })
        });
    };

    _create_goods_form_id = (salt) => {
        return 'goodsform{}'.format(salt);
    };

    _create_ref_form_id = (goods_form_id, salt) => {
        return 'goodsform{}ref{}'.format(goods_form_id, salt);
    };

    _references = (goods_form_id) => {
        return this.state.goods_form_data.filter(fd => fd.id == goods_form_id)[0].references;
    };

    _create_goods_form = (goods_form_id) => {
        let emptyformdata = JSON.parse(JSON.stringify(this.goods_form_data_structure));
        emptyformdata.id = goods_form_id;
        for (let i = 1; i <= this.default_refs_count; i++) {
            emptyformdata.references.push(this._create_ref_form(goods_form_id, this._create_ref_form_id(goods_form_id, i)));
        }
        return emptyformdata;
    };

    _create_ref_form = (goods_form_id, ref_form_id) => {
        let emptyformdata = JSON.parse(JSON.stringify(this.goods_ref_form_data_structure));
        emptyformdata.form_id = ref_form_id;
        return emptyformdata;
    };

    onchange_address_selection_setstate_fill_fields = (addr_type) => (event) => {
        let _this = this;
        let addr_id = event.target.value;
        let address = this.state.address_list.filter(addr => addr.id == addr_id)[0];
        // console.dir(address);
        if (address) {
            this.setState({
                addressbook: (function () {
                    let addressbook = _this.state.addressbook;
                    addressbook[addr_type].saved = false;
                    addressbook[addr_type].data.address_id = address.id;
                    addressbook[addr_type].data.address = address.address;
                    addressbook[addr_type].data.city = address.city.id;
                    addressbook[addr_type].data.company_name = address.company_name;
                    addressbook[addr_type].data.contact = address.contact;
                    addressbook[addr_type].data.country = address.country.id;
                    addressbook[addr_type].data.email = address.email;
                    addressbook[addr_type].data.fax_num = address.fax;
                    addressbook[addr_type].data.mobile_num = address.mobile;
                    addressbook[addr_type].data.postcode = address.postcode;
                    addressbook[addr_type].data.state = address.state;
                    addressbook[addr_type].data.tel_num = address.phone;
                    return addressbook;
                }())
            });
        } else { //reset fields
            this.setState({
                addressbook: (function () {
                    let addressbook = _this.state.addressbook;
                    addressbook[addr_type].saved = false;
                    addressbook[addr_type].data.address_id = null;
                    addressbook[addr_type].data.address = null;
                    addressbook[addr_type].data.city = null;
                    addressbook[addr_type].data.company_name = null;
                    addressbook[addr_type].data.contact = null;
                    addressbook[addr_type].data.country = null;
                    addressbook[addr_type].data.email = null;
                    addressbook[addr_type].data.fax_num = null;
                    addressbook[addr_type].data.mobile_num = null;
                    addressbook[addr_type].data.postcode = null;
                    addressbook[addr_type].data.state = null;
                    addressbook[addr_type].data.tel_num = null;
                    return addressbook;
                }())
            });
        }
    };


    address_onchange_companyname = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.company_name = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['company_name'] = 'your change will update addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_address = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.address = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['address'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_postcode = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.postcode = event.target.value.trim();
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['postcode'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_city = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.city = event.target.value.trim();
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['city'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_state = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.state = event.target.value.trim();
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['state'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_country = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.country = event.target.value.trim();
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['country'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_contact = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.contact = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['contact'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_tel_num = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.tel_num = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['tel_num'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_mobile_num = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.mobile_num = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['mobile_num'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_fax_num = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.fax_num = event.target.value;
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['fax_num'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_email = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].saved = false;
                addressbook[addr_type].data.email = event.target.value.trim();
                if (addressbook[addr_type].data.address_id) {
                    addressbook[addr_type].field_warns['email'] = 'your change will update the addressbook database';
                }
                return addressbook;
            }())
        });
    };
    address_onchange_addresstypefield = (addr_id) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_id].saved = false;
                addressbook[addr_id].data.address_type = event.target.value.trim();
                return addressbook;
            }())
        });
    };

    setstate_clear_address_feedback_messages = (addr_type) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].msg = [];
                addressbook[addr_type].field_errors = {};
                addressbook[addr_type].misc_errors = [];
                return addressbook;
            }())
        });
    };
    setstate_clear_destload_feedback_messages = (addr_type) => {
        let _this = this;
        this.setState({
            portinfo_saved: false,
            portinfo_msg: [],
            portinfo_errors: [],
            portinfo_formerrors: {},
        });
    };
    setstate_clear_goodsinfo_feedback_messages = (form_id) => {
        _this.setState({
            goods_form_data: _this.state.goods_form_data.map(gfd => {
                if (gfd.id == form_id) {
                    gfd.db_id = resp.data.goodsinfo_id;
                    gfd.saved = resp.success;
                    gfd.msg = resp.msg ? resp.msg : [];
                    gfd.errors = resp.misc_errors ? resp.misc_errors : [];
                    gfd.formerrors = resp.form_errors ? resp.form_errors : {};
                }
                return gfd;
            })
        });
    };
    address_save_process = (addr_type, process_running) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].save_processing = process_running;
                return addressbook;
            }())
        });
    };
    address_onsave = (addr_type) => (event) => {
        this.address_save_process(addr_type, true);
        let _this = this;
        jQuery.ajax({
            type: 'post',
            url: window.urlfor_save_shipper_address,
            data: {..._this.state.addressbook[addr_type].data, org_id: this.state.organization.id},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    addressbook: (function () {
                        let addressbook = _this.state.addressbook;
                        addressbook[addr_type].data.address_id = resp.data.address_id;
                        addressbook[addr_type].msg = resp.msg;
                        addressbook[addr_type].field_errors = resp.form_errors ? resp.form_errors : {};
                        addressbook[addr_type].misc_errors = [resp.errors];
                        addressbook[addr_type].saved = resp.success;
                        if (resp.success) {
                            addressbook[addr_type].msg.push('Address Save Success');
                        } else {
                            addressbook[addr_type].misc_errors.push('Error: Address Not Saved');
                        }
                        return addressbook;
                    }())
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    addressbook: (function () {
                        let addressbook = _this.state.addressbook;
                        addressbook[addr_type].saved = false;
                        addressbook[addr_type].misc_errors = [err];
                        return addressbook;
                    }())
                });
            },
            complete: function (jqXHR, textStatus) {
                _this.address_save_process(addr_type, false);
            }
        });
    };

    // toggle_bank_info = (key) =>() => {
    //     this.setState({
    //         origin_bank: !this.state[key].use
    //     });
    // };
    // onchange_bank_selection_setstate_fill_fields = (key) => {
    // };
    // bankinfo_onchange_bankname = (key) => {
    // };
    // bankinfo_onchange_branch = (key) => {
    // };
    // bankinfo_onchange_address = (key) => {
    // };


    add_goods_form = (sth) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let new_form_serial = _this.state.goods_form_data.length + 1;
                let allformdata = _this.state.goods_form_data;
                let emptyformdata = JSON.parse(JSON.stringify(_this.goods_form_data_structure));
                emptyformdata.id = new_form_serial;
                allformdata.push(emptyformdata);
                return allformdata;
            }())
        });
    };

    delete_goods_form = (form_id) => (event) => {
        this.setState({
            goods_form_data: this.state.goods_form_data.filter(formdata => formdata.id != form_id)
        });
    };
    delete_goodsref_form = (goodsform_id, goodsref_form_id) => (event) => {
        this.setState({
            goods_form_data: this.state.goods_form_data.map(goodsformdata => {
                if (goodsformdata.id == goodsform_id) {
                    goodsformdata.references = goodsformdata.references.filter(ref => ref.form_id != goodsref_form_id);
                }
                return goodsformdata;
            })
        });
    };

    onchange_goods_no_of_pieces = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.no_of_pieces = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    onchange_goods_package_type = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.package_type = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    onchange_goods_weight_kg = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.weight_kg = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    calculate_cbm = (volumetric_weight_kg) => {
        return (volumetric_weight_kg / 166.6667).toFixed(2);
    };

    calculate_volumetric_weight_kg = (length_cm, width_cm, height_cm, no_of_pieces) => {
        if (length_cm && width_cm && height_cm && no_of_pieces) {
            let volumetric_weight = parseFloat(length_cm) * parseFloat(width_cm) * parseFloat(height_cm) * (1 / 6000);
            volumetric_weight = volumetric_weight * parseInt(no_of_pieces);
            volumetric_weight = volumetric_weight.toFixed(2);
            return volumetric_weight;
        } else {
            return '';
        }
    };

    setstate_calculate_volumetricwt_chargablewt = (form_id) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        let volumetric_wt_kg = _this.calculate_volumetric_weight_kg(data.length_cm, data.width_cm, data.height_cm, data.no_of_pieces);
                        data.chargable_weight = parseFloat(data.weight_kg) > parseFloat(volumetric_wt_kg) ? data.weight_kg : volumetric_wt_kg;
                        data.volumetric_weight = volumetric_wt_kg;
                        data.cbm = _this.calculate_cbm(volumetric_wt_kg);
                    }
                    return data;
                });
                return goods_form_data;
            }())
        });
    };

    // onchange_goods_volume_m3 = (form_id) => (event) => {
    //     let _this = this;
    //     this.setState({
    //         goods_form_data: (function () {
    //             let goods_form_data = _this.state.goods_form_data;
    //             goods_form_data.map((data) => {
    //                 if (data.id == form_id) {
    //                     data.chargable_weight = event.target.value.trim();
    //                 }
    //             });
    //             return goods_form_data;
    //         }())
    //     });
    // };

    onchange_goods_length_cm = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.length_cm = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    onchange_goods_width_cm = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.width_cm = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    onchange_goods_height_cm = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.height_cm = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
        this.setstate_calculate_volumetricwt_chargablewt(form_id);
    };

    onchange_goods_quantity = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.quantity = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    onchange_goods_unit_price = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.unit_price = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    onchange_goods_currency = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.currency = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    setstate_all_goodsform_currency = (event) => {
        let _this = this;
        //set this currency for all goods form
        this.setState({
            goods_form_data: _this.state.goods_form_data.map(data => {
                data.currency = event.target.value.trim();
                return data;
            })
        });
    };

    onchange_goods_ref_type = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.ref_type = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    onchange_goods_shipping_mark = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.shipping_mark = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    onchange_goods_goods_desc = (form_id) => (event) => {
        let _this = this;
        this.setState({
            goods_form_data: (function () {
                let goods_form_data = _this.state.goods_form_data;
                goods_form_data.map((data) => {
                    if (data.id == form_id) {
                        data.goods_desc = event.target.value.trim();
                    }
                });
                return goods_form_data;
            }())
        });
    };

    log_goods_form = (event) => {
        console.dir(this.state);
    };

    onchange_shipping_service_selection = (event) => {
        this.setState({
            shipping_service: event.target.value.trim()
        });
    };

    onchange_notify_party = (addr_type) => (event) => {
        let _this = this;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[addr_type].booking_notify = !addressbook[addr_type].booking_notify;
                return addressbook;
            }())
        });
    };

    added_more_address_keys = () => {
        return Object.keys(this.state.addressbook).filter(key => key != 'shipper' && key != 'consignee');
    };

    add_more_address = (event) => {
        let _this = this;
        let new_serial = this.added_more_address_keys().length + 1;
        let new_key = 'tmpaddr_' + new_serial;
        this.setState({
            addressbook: (function () {
                let addressbook = _this.state.addressbook;
                addressbook[new_key] = {
                    save_processing: false,
                    saved: false,
                    msg: [],
                    field_errors: {},
                    misc_errors: [],

                    field_warns: {},

                    form_title: 'Temporary Address {}'.format(new_serial),
                    booking_notify: false,

                    data: {
                        address_id: null,

                        company_name: '',
                        address: '',
                        postcode: '',
                        city: '',
                        state: '',
                        country: '',
                        contact: '',
                        tel_num: '',
                        mobile_num: '',
                        fax_num: '',
                        email: '',

                        address_type: '',
                    }
                };
                return addressbook;
            }())
        });
    };

    onchange_port_of_destination = (event) => {
        this.setState({
            port_of_dest: event.target.value.trim()
        });
    };
    onchange_port_of_loading = (event) => {
        this.setState({
            port_of_load: event.target.value.trim()
        });
    };
    onchange_terms_of_delivery = (event) => {
        this.setState({
            terms_of_deliv: event.target.value.trim()
        });
    };
    onchange_country_of_destination = (event) => {
        this.setState({
            country_of_dest: event.target.value.trim()
        });
    };

    componentDidMount = () => {
        //setInterval(function() {}, 1000);
    };

    componentWillUnmount = () => {
        //$(this.refs.input).datepicker('destroy');
    };

    render() {
        let _this = this;
        return <div>
            <div className="container-fluid">
                <div className="container">
                    <div className="py-4 text-center bg-success">
                        <h2 className="">Air Export Freight Booking</h2>
                    </div>
                    {
                        this.state.page_errors.length ?
                            this.state.page_errors.map((txt) => {
                                return <div key={txt} className="text-danger">{txt}</div>;
                            })
                            :
                            ''
                    }
                    <div className="btn-group">
                        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => {
                            let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
                            let loader = window.modal_alert({content_html: ''});
                            loader.append_html(spinner);
                            _this.load_data(null, function () {
                                loader.append_html('<div class="text-success">Success</div>');
                                loader.close();
                            }, function (error) {
                                loader.append_html('<div class="text-danger">{}</div>'.format(error));
                            }, function () {
                                spinner.remove();
                            });
                        }}><i className="fa fa-refresh"></i> Reload Database
                        </button>
                    </div>
                    <div className="">
                        <div className="col-md-12 shippers_ref">
                            <div className="shippers_refpartstat">
                                <div className="title"><b></b></div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <form>
                                            <div className="form-group">
                                                <label>Supplier</label>
                                                {!_this.state.organization.public_id ? <div className="text-danger">Error: Supplier not selected</div> : ''}
                                                <input type="text" className="form-control" readOnly={true} value={_this.state.organization.title || ''}/>
                                                <input type="text" className="form-control" readOnly={true} value={_this.state.organization.public_id || ''}/>
                                            </div>
                                        </form>
                                    </div>
                                    {/*<div className="col-md-6">*/}
                                    {/*<div className="refresh float-right">*/}
                                    {/*<button type="button" className="btn btn-primary">refresh</button>*/}
                                    {/*</div>*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12 senderpart_ref">
                        <div className="Shippers_partstart">
                            <div className="title"><b>sender</b></div>
                            <div className="row">
                                <div className="col-md-6 leftpart">
                                    <div className="shippers_part">
                                        <form>
                                            <AddressBookInput
                                                key={'shipper'}
                                                context={this}
                                                identifier={'shipper'}
                                                data={this.state.addressbook.shipper}
                                            />
                                        </form>
                                    </div>
                                    <div className="consignee_part">
                                        <div className="col-md-12 title"><b>receiver</b></div>

                                        <div className="consignee_partstart">
                                            <form>
                                                <AddressBookInput
                                                    key={'consignee'}
                                                    context={this}
                                                    identifier={'consignee'}
                                                    data={this.state.addressbook.consignee}
                                                />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 tempoaddress_part">
                                    <div className="">
                                        <button onClick={this.add_more_address}><i className="fa fa-plus">{''}</i> add more address</button>
                                        {this.added_more_address_keys().map(key => <AddressBookInput
                                            show_addr_type_selection={true}
                                            key={key}
                                            context={this}
                                            identifier={key}
                                            data={this.state.addressbook[key]
                                            }/>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-12 notify_part">
                            <div className="card">
                                <div className="card-header">
                                    Bank Info
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="checkbox">
                                                        <label className="form-check-label"><input type="checkbox" className="form-check-input"
                                                                                                   onClick={_this.toggle_bank_info('origin_bank')}/>
                                                            Origin Bank Info</label>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {_this.state.origin_bank.use ? <BankInfoInput identifier='origin_bank' context={_this}/> : ''}
                                                </div>
                                                <div className="card-footer"></div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="checkbox">
                                                        <label className="form-check-label"><input type="checkbox" className="form-check-input"
                                                                                                   onClick={_this.toggle_bank_info('destination_bank')}/>
                                                            Destination Bank Info</label>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {_this.state.destination_bank.use ? <BankInfoInput identifier='destination_bank' context={_this}/> : ''}
                                                </div>
                                                <div className="card-footer"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer"></div>
                            </div>
                        </div>

                        <div className="col-md-12 notify_part">
                            <div className="card">
                                <div className="card-header">Notify party</div>
                                <div className="card-body">
                                    {_this.state.organization.booking_mail_sending_enabled ? (function () {
                                        return <div className="form-group">
                                            <div className="form-check">
                                                {
                                                    Object.keys(_this.state.addressbook).map((key) => {
                                                        let addressbook = _this.state.addressbook[key];
                                                        if (addressbook.data.company_name && addressbook.data.address_type) {
                                                            return <div className="checkbox" key={key}>
                                                                <label className="form-check-label whitespace-nr" htmlFor={'notify' + key}>
                                                                    <input type="checkbox" className="form-check-input" id={'notify' + key}
                                                                           checked={addressbook.booking_notify}
                                                                           name='notify_address'
                                                                           onClick={_this.onchange_notify_party(key)}/>
                                                                    {<span
                                                                        className="small badge badge-secondary mr-2">{addressbook.data.address_type}</span>}
                                                                    {addressbook.data.company_name}
                                                                </label>
                                                            </div>;
                                                        }
                                                    })
                                                }
                                            </div>
                                        </div>;
                                    }()) : <div className="text-warning">Email Notification disabled.</div>}
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="title"><b>Destination / Loading <Required/></b></div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label>Airport of destination <Required/></label>
                                            <div className="input-group">
                                                {_this.state.airport_list.length ?
                                                    <SuperSelect
                                                        onChange={(value) => {
                                                            _this.setState({
                                                                port_of_dest: value
                                                            });
                                                        }}
                                                        messages={{noselection: 'none selected', nodata: 'no data'}}
                                                        items={(function () {
                                                            return _this.state.airport_list.map(ap => {
                                                                return {
                                                                    value: ap.id,
                                                                    label: '{}: {}'.format(ap.code, ap.name)
                                                                };
                                                            });
                                                        }())}/>
                                                    : ''
                                                }
                                                {/*<select className="form-control" onChange={this.onchange_port_of_destination}>*/}
                                                {/*<option>--</option>*/}
                                                {/*{_this.state.airport_list.map(ap => <option value={ap.id} key={ap.id} className="small">*/}
                                                {/*{ap.code} ({ap.name})</option>)}*/}
                                                {/*</select>*/}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Terms of delivery <Required/></label>
                                            <div className="input-group">
                                                {_this.state.tod_list.length ?
                                                    <SuperSelect
                                                        onChange={(value) => {
                                                            _this.setState({
                                                                terms_of_deliv: value
                                                            });
                                                        }}
                                                        messages={{noselection: 'none selected', nodata: 'no data'}}
                                                        items={(function () {
                                                            return _this.state.tod_list.map(tod => {
                                                                return {
                                                                    value: tod.id,
                                                                    label: '{} {}'.format(tod.code, tod.title)
                                                                };
                                                            });
                                                        }())}/>
                                                    : ''
                                                }
                                                {/*<select className="custom-select" onChange={this.onchange_terms_of_delivery}>*/}
                                                {/*<option value=""></option>*/}
                                                {/*{_this.state.tod_list.map(tod => <option key={tod.id} id={tod.id} value={tod.id}>{tod.code} {tod.title}</option>)}*/}
                                                {/*/!*<option value="EXW">EXW Ex Works</option>*!/*/}
                                                {/*/!*<option value="FCA">FCA Free Carrier</option>*!/*/}
                                                {/*/!*<option value="CPT">CPT Carriage Paid To</option>*!/*/}
                                                {/*/!*<option value="CIP">CIP Carriage and Insurance Paid To</option>*!/*/}
                                                {/*/!*<option value="DAT">DAT Delivered at Terminal</option>*!/*/}
                                                {/*/!*<option value="DAP">DAP Delivered at Place</option>*!/*/}
                                                {/*/!*<option value="DDP">DDP Delivered Duty Paid</option>*!/*/}
                                                {/*/!*<option value="FAS">FAS Free Alongside Ship</option>*!/*/}
                                                {/*/!*<option value="FOB">FOB Free on Board</option>*!/*/}
                                                {/*/!*<option value="CFR">CFR Cost and Freight</option>*!/*/}
                                                {/*/!*<option value="CIF">CIF Cost, Insurance, and Freight</option>*!/*/}
                                                {/*</select>*/}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label>Airport of loading <Required/></label>
                                            <div className="input-group">
                                                {_this.state.airport_list.length ?
                                                    <SuperSelect
                                                        onChange={(value) => {
                                                            _this.setState({
                                                                port_of_load: value
                                                            });
                                                        }}
                                                        messages={{noselection: 'none selected', nodata: 'no data'}}
                                                        items={(function () {
                                                            return _this.state.airport_list.map(ap => {
                                                                return {
                                                                    value: ap.id,
                                                                    label: '{}: {}'.format(ap.code, ap.name)
                                                                };
                                                            });
                                                        }())}/>
                                                    : ''
                                                }
                                                {/*<select className="form-control" onChange={this.onchange_port_of_loading}>*/}
                                                {/*<option>--</option>*/}
                                                {/*{_this.state.airport_list.map(ap => <option value={ap.id} key={ap.id} className="small">*/}
                                                {/*{ap.code} ({ap.name})</option>)}*/}
                                                {/*</select>*/}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Country of destination <Required/></label>
                                            <div className="input-group">
                                                {_this.state.country_list.length ?
                                                    <SuperSelect
                                                        onChange={(value) => {
                                                            _this.setState({
                                                                country_of_dest: value
                                                            });
                                                        }}
                                                        messages={{noselection: 'none selected', nodata: 'no data'}}
                                                        items={(function () {
                                                            return _this.state.country_list.map(country => {
                                                                return {
                                                                    value: country.id,
                                                                    label: '{}'.format(country.code_isoa2)
                                                                };
                                                            });
                                                        }())}/>
                                                    : ''
                                                }
                                                {/*<select className="form-control" onChange={this.onchange_country_of_destination}>*/}
                                                {/*<option>--</option>*/}
                                                {/*{_this.state.country_list.map(country => <option value={country.id}*/}
                                                {/*key={country.id}>{country.code_isoa2}*/}
                                                {/*</option>)}*/}
                                                {/*</select>*/}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer small">
                                {_this.state.portinfo_saved ? <div className="text-success">Save Success</div> : <div className="text-danger">* Data not saved</div>}
                                {_this.state.portinfo_msg.map(msg => <div className="text-success" key={msg}>{msg}</div>)}
                                {_this.state.portinfo_errors.map(msg => <div className="text-danger" key={msg}>{msg}</div>)}
                                {Object.keys(_this.state.portinfo_formerrors).map(key => <div key={key} className="text-danger">
                                    {key}:{_this.state.portinfo_formerrors[key]}</div>)}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12 goods_part">
                        <div className="title goods_partcontain">
                            <b>goods</b>
                            {
                                //<button onClick={this.add_goods_form}><i className="fa fa-plus-circle cursor-pointer" title="add more"></i> add more</button>
                            }
                        </div>
                        <div>
                            {_this.state.goods_form_data.map((formdata, i) => <Goodsinput
                                loopindex={i}
                                key={formdata.id}
                                data={formdata}
                                context={_this}
                            />)}
                        </div>
                    </div>
                    <div className="col-md-12 frt_globalpart">
                        <div className="frt_globalcontain">
                            <div className="card">
                                <div className="card-header">
                                    <strong>Shipping services <Required/></strong>
                                    {_this.state.shipping_service_formerrors.hasOwnProperty('service') ?
                                        <div className="text-danger small">{_this.state.shipping_service_formerrors.service}</div>
                                        : ''}
                                </div>
                                <div className="card-body">
                                    <div className="form-check">
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="express">
                                                <input type="radio" className="form-check-input" id="express" value='Navana Express (NEX - Door - Door only)'
                                                       name='shipping_service_selection'
                                                       onClick={this.onchange_shipping_service_selection}/>
                                                Navana Express (NEX - Door - Door only)
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="nrd">
                                                <input type="radio" className="form-check-input" id="nrd" value='Navana Red (NRD)'
                                                       name='shipping_service_selection'
                                                       onClick={this.onchange_shipping_service_selection}/>
                                                Navana Red (NRD)
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="nbl">
                                                <input type="radio" className="form-check-input" id="nbl" value='Navana Blue (NBL)'
                                                       name='shipping_service_selection'
                                                       onClick={this.onchange_shipping_service_selection}/>
                                                Navana Blue (NBL)
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="ngr">
                                                <input type="radio" className="form-check-input" id="ngr" value='Navana Green (NGR)'
                                                       name='shipping_service_selection'
                                                       onClick={this.onchange_shipping_service_selection}/>
                                                Navana Green (NGR)
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <label className="form-check-label" htmlFor="nsa">
                                                <input type="radio" className="form-check-input" id="nsa" value='Navana Sea/Air'
                                                       name='shipping_service_selection'
                                                       onClick={this.onchange_shipping_service_selection}/>
                                                Navana Sea/Air
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    {_this.state.shipping_service_saved ?
                                        <div className="text-success small">Save Success</div> : <div className="text-danger small">* Data not saved</div>}
                                    {_this.state.shipping_service_msg.map(msg => <div className="text-info small" key={msg}>{msg}</div>)}
                                    {_this.state.shipping_service_errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
                                    {_this.state.shipping_service_formerrors.hasOwnProperty('booking_id') ?
                                        <div className="text-danger small">booking id: {_this.state.shipping_service_formerrors.booking_id}</div>
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 frt_globalpart">
                        <div className="frt_globalcontain">
                            <div className="card">
                                <div className="card-header">
                                    <strong>Stakeholder references</strong>
                                    <button className="btn btn-sm small btn-secondary margin-left-20p"
                                            onClick={_this.onclick_add_stakeholder_ref_form}><i className="fa fa-plus"></i> add more
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="">
                                        {_this.state.stakeholder_refs.map(ref => {
                                            return <div className='card' key={ref.form_id}>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col">
                                                            {ref.formerrors.hasOwnProperty('booking_id') ?
                                                                <div className="text-danger small">booking_id: {ref.formerrors.booking_id}</div>
                                                                : ''}
                                                            <div className="form-group">
                                                                <label className="form-control-label small">Reference Type <Required/></label>
                                                                {ref.formerrors.hasOwnProperty('ref_type_id') ?
                                                                    <div className="text-danger small">{ref.formerrors.ref_type_id}</div>
                                                                    : ''}
                                                                <select className="form-control" onChange={_this.onchange_stakeholder_ref_type(ref.form_id)}>
                                                                    <option>--</option>
                                                                    {_this.state.stakeholder_reference_types.map(reftype => <option value={reftype.id}
                                                                                                                                    key={reftype.id}>{reftype.name}
                                                                    </option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col">
                                                            <div className="form-group">
                                                                <label className="form-control-label small">Reference Number <Required/></label>
                                                                {ref.formerrors.hasOwnProperty('ref_number') ?
                                                                    <div className="text-danger small">{ref.formerrors.ref_number}</div>
                                                                    : ''}
                                                                <input type="text" className="form-control"
                                                                       onChange={_this.onchange_stakeholder_ref_number(ref.form_id)}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {ref.saved ?
                                                        <div className="text-success small">Save Success</div>
                                                        :
                                                        <div className="text-danger small">* Data not saved</div>}
                                                    {ref.msg.map(msg => <div className="text-info small" key={msg}>{msg}</div>)}
                                                    {ref.errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
                                                </div>
                                            </div>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 order_notes">
                        <div className="card">
                            <div className="card-header"><b>order notes</b></div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        {_this.state.order_notes_formerrors.hasOwnProperty('booking_id') ?
                                            <div className="text-danger small">booking_id: {_this.state.order_notes_formerrors.booking_id}</div>
                                            : ''}
                                        <div className="selectonclick">
                                            <div className="subtitle">
                                                <strong>Freight Payment Instructions <Required/></strong>
                                                {_this.state.order_notes_formerrors.hasOwnProperty('payment_ins') ?
                                                    <div className="text-danger small">{_this.state.order_notes_formerrors.payment_ins}</div>
                                                    : ''}
                                            </div>
                                            <div className="instructions_select">
                                                {_this.state.payment_type_list.map(pt => {
                                                    return <div className="custom-control custom-radio" key={pt.id}>
                                                        <input type="radio" className="custom-control-input" name="frt_payment_ins"
                                                               id={'frt_payment_ins_{}'.format(pt.id)}
                                                               onClick={_this.set_freight_payment_ins(pt.id)}/>
                                                        <label className="custom-control-label" htmlFor={'frt_payment_ins_{}'.format(pt.id)}>{pt.name}</label>
                                                    </div>;
                                                })}
                                                {/*<div className="custom-control custom-radio">*/}
                                                {/*<input type="radio" className="custom-control-input" name="frt_payment_ins" id="freight_prepaid"*/}
                                                {/*onClick={_this.set_freight_payment_ins('prepaid')}/>*/}
                                                {/*<label className="custom-control-label" htmlFor="freight_prepaid">Prepaid</label>*/}
                                                {/*</div>*/}
                                                {/*<div className="custom-control custom-radio">*/}
                                                {/*<input type="radio" className="custom-control-input" name="frt_payment_ins" id="freight_collect"*/}
                                                {/*onClick={_this.set_freight_payment_ins('collect')}/>*/}
                                                {/*<label className="custom-control-label" htmlFor="freight_collect">Collect</label>*/}
                                                {/*</div>*/}
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="agreements_select">

                                            <div className="form-group">
                                                <label>available transport agreements <Required/></label>
                                                {_this.state.order_notes_formerrors.hasOwnProperty('transport_agreement_id') ?
                                                    <div className="text-danger small">{_this.state.order_notes_formerrors.transport_agreement_id}</div>
                                                    : ''}
                                                <div className="input-group">
                                                    <select className="form-control" onChange={_this.onchange_freight_transport_agreement}>
                                                        <option value="">--</option>
                                                        {_this.state.transport_agreements.map(ta => <option value={ta.id} key={ta.id}>{ta.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="delivery_instructions">

                                            <div className="form-group">
                                                <label>delivery instructions <Required/></label>
                                                {_this.state.order_notes_formerrors.hasOwnProperty('delivery_instruction') ?
                                                    <div className="text-danger small">{_this.state.order_notes_formerrors.delivery_instruction}</div>
                                                    : ''}
                                                <div className="input-group">
                                                    <textarea className="form-control" defaultValue={''} onChange={_this.onchange_freight_delivery_ins}></textarea>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                {_this.state.order_notes_saved ?
                                    <div className="text-success small">Save Success</div>
                                    :
                                    <div className="text-danger small">* Data not saved</div>}
                                {_this.state.order_notes_msg.map(msg => <div className="text-info small" key={msg}>{msg}</div>)}
                                {_this.state.order_notes_errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12 pickup_notes ">
                        <div className="card">
                            <div className="card-header"><b>pickup notes</b></div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 pickup_datetimeinfo">
                                        {_this.state.pickup_notes_formerrors.hasOwnProperty('booking_id') ?
                                            <div className="text-danger small">booking_id: {_this.state.pickup_notes_formerrors.booking_id}</div>
                                            : ''}
                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">Pick-up Date <Required/></label>
                                            {_this.state.pickup_notes_formerrors.hasOwnProperty('pickup_date') ?
                                                <div className="text-danger small">{_this.state.pickup_notes_formerrors.pickup_date}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <input type="date" className="form-control" ref="pickupdate_input" onChange={_this.onchange_pickup_date}/>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">earliest pick-up time <Required/></label>
                                            {_this.state.pickup_notes_formerrors.hasOwnProperty('pickup_time_early') ?
                                                <div className="text-danger small">{_this.state.pickup_notes_formerrors.pickup_time_early}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <select className="form-control" onChange={_this.onchange_earliest_pickup_time}>
                                                    <option value={''}>--</option>
                                                    {[...Array(24).keys()].map(hr => {
                                                        let expr = '';
                                                        if (hr === 0) {
                                                            expr = '12AM';
                                                        } else if (hr < 12) {
                                                            expr = '{}AM'.format(hr);
                                                        } else if (hr === 12) {
                                                            expr = '{}PM'.format(hr);
                                                        } else if (hr > 12) {
                                                            expr = '{}PM'.format(hr - 12);
                                                        }
                                                        return <option value={hr} key={hr}>{expr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-sm-4 col-xs-12 col-form-label">latest pick-up time <Required/></label>
                                            {_this.state.pickup_notes_formerrors.hasOwnProperty('pickup_time_latest') ?
                                                <div className="text-danger small">{_this.state.pickup_notes_formerrors.pickup_time_latest}</div>
                                                : ''}
                                            <div className="col-sm-8 col-xs-12">
                                                <select className="form-control" onChange={_this.onchange_latest_pickup_time}>
                                                    <option value={''}>--</option>
                                                    {[...Array(24).keys()].map(hr => {
                                                        let expr = '';
                                                        if (hr === 0) {
                                                            expr = '12AM';
                                                        } else if (hr < 12) {
                                                            expr = '{}AM'.format(hr);
                                                        } else if (hr === 12) {
                                                            expr = '{}PM'.format(hr);
                                                        } else if (hr > 12) {
                                                            expr = '{}PM'.format(hr - 12);
                                                        }
                                                        return <option value={hr} key={hr}>{expr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="subtitle">
                                            <strong>Pick-up Instructions <Required/></strong>
                                            {_this.state.pickup_notes_formerrors.hasOwnProperty('pickup_instruction') ?
                                                <div className="text-danger small">{_this.state.pickup_notes_formerrors.pickup_instruction}</div>
                                                : ''}
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <div className="input-group">
                                                    <textarea className="form-control" defaultValue={''} onChange={_this.onchange_pickup_instructions}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                {_this.state.pickup_notes_saved ?
                                    <div className="text-success small">Save Success</div>
                                    :
                                    <div className="text-danger small">* Data not saved</div>}
                                {_this.state.pickup_notes_msg.map(msg => <div className="text-info small" key={msg}>{msg}</div>)}
                                {_this.state.pickup_notes_errors.map(msg => <div className="text-danger small" key={msg}>{msg}</div>)}
                            </div>
                        </div>
                    </div>
                    <div className="pickup_notes_footer">
                        <div className="col">
                            {_this.state.booking_mainentry_msg.map(msg => <div className="text-success" key={msg}>{msg}</div>)}
                            {_this.state.booking_misc_msg.map(msg => <div className="text-success" key={msg}>{msg}</div>)}

                            {_this.state.booking_mainentry_errors.map(msg => <div className="text-danger" key={msg}>{msg}</div>)}
                            {_this.state.booking_misc_errors.map(msg => <div className="text-danger" key={msg}>{msg}</div>)}
                            {Object.keys(_this.state.booking_mainentry_formerrors).map(key => <div key={key} className="text-danger">
                                {key}:{_this.state.booking_mainentry_formerrors[key]}</div>)}
                            {(function () {
                                if (_this.booking_entry_is_running()) {
                                    return <div className="text-info"><i className="fa fa-spin fa-spinner"></i> Processing booking entry</div>;
                                }
                            }())}
                        </div>
                        <div className="col-md-12">
                            <button type="button" className="btn btn-primary" onClick={_this.save_booking(true)}>save</button>
                            <button type="button" className="btn btn-warning" onClick={_this.save_booking(false, true)}>book</button>
                            {/*<button type="button" className="btn">reset</button>*/}
                            {/*<button type="button" className="btn">refresh</button>*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

ReactDOM.render(<BookingForm/>, document.getElementById('page_content'));