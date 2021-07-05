"use strict";
(function ($) {
    let formdata = {
        operation: 'create',
        mawb_public_id: ''
    };
    var ids = [];
    $(document).ready(function () {
        $('#page_content_spinner').remove();

        $('#all_inputs :input').each(function () {
            ids.push($(this).attr('id'));
        });
    });

    function populate_mawb_form(mawb_dict) {
        Object.keys(mawb_dict).forEach(key => $('#' + key).val(mawb_dict[key]));
        formdata.mawb_public_id = mawb_dict.public_id;
    }

    function reset_mawb_id() {
        formdata.mawb_public_id = '';
    }

    function mawb_pretty_format(mawb_ref_num) {
        let awb_serial = mawb_ref_num.substr(-8);
        let awb_serial_first_part = awb_serial.substr(-8, 4);
        let awb_serial_second_part = mawb_ref_num.substr(-4);
        let airport_code = mawb_ref_num.substr(-11, 3);
        let airline_code = mawb_ref_num.substr(0, 3);
        return '{}-{}-{} {}'.format(airline_code, airport_code, awb_serial_first_part, awb_serial_second_part);
    }

    function show_mawb_ref_num(mawb_ref_num) {
        $('.mawb_ref_num').text(mawb_pretty_format(mawb_ref_num));
    }

    function make_shipper_fields_readonly() {
        $('#shipper_name').prop('readonly', true);
        $('#shipper_address').prop('readonly', true);
        $('#shipper_po_code').prop('readonly', true);
        $('#shipper_city').prop('readonly', true);
        $('#shipper_city').change();
        $('#shipper_state').prop('readonly', true);
        $('#shipper_country').prop('readonly', true);
        $('#shipper_country').change();
        $('#shipper_contact').prop('readonly', true);
        $('#shipper_tel_number').prop('readonly', true);
        $('#shipper_mob_num').prop('readonly', true);
        $('#shipper_fax_num').prop('readonly', true);
        $('#shipper_email').prop('readonly', true);
    }

    function propagate_shipper(addressbook) {
        $('#shipper_name').val(addressbook.company_name);
        $('#shipper_address').val(addressbook.address);
        $('#shipper_po_code').val(addressbook.postcode);
        $('#shipper_city').val(addressbook.city.id);
        $('#shipper_city').change();
        $('#shipper_state').val(addressbook.state);
        $('#shipper_country').val(addressbook.country.id);
        $('#shipper_country').change();
        $('#shipper_contact').val(addressbook.contact);
        $('#shipper_tel_number').val(addressbook.phone);
        $('#shipper_mob_num').val(addressbook.mobile);
        $('#shipper_fax_num').val(addressbook.fax);
        $('#shipper_email').val(addressbook.email);

        $('#others_ex_loc').val(addressbook.city.id);
    }

    function propagate_consignee(addressbook) {
        $('#consignee_name').val(addressbook.company_name);
        $('#consignee_address').val(addressbook.address);
        $('#consignee_po_code').val(addressbook.postcode);
        $('#consignee_city').val(addressbook.city.id);
        $('#consignee_city').change();
        $('#consignee_state').val(addressbook.state);
        $('#consignee_country').val(addressbook.country.id);
        $('#consignee_country').change();
        $('#consignee_contact').val(addressbook.contact);
        $('#consignee_tel_number').val(addressbook.phone);
        $('#consignee_mob_num').val(addressbook.mobile);
        $('#consignee_fax_num').val(addressbook.fax);
        $('#consignee_email').val(addressbook.email);
    }

    function propagate_awb_selection(awb) {
        propagate_agent_selection(awb.agent);
        propagate_consignee(awb.agent.addressbook);
    }

    function propagate_agent_selection(agent) {
        $('#carrier_agent_name').val(agent.name);
        $('#carrier_agent_city').val(agent.city.id);
        $('#carrier_agent_city').change();
        $('#carrier_agent_state').val(agent.state);
        $('#carrier_agent_country').val(agent.country.id);
        $('#carrier_agent_country').change();

        $('#carrier_agent_iata_code').val(agent.iata_code);
        $('#carrier_agent_ffl').val(agent.ffl_number);
        $('#carrier_agent_date').val(agent.ffl_exp_date);
    }

    function propagate_mawb_selection(mawb) {
        $('#mawb_title_action_msg').text('You can update the MAWB {}'.format(mawb_pretty_format(mawb.mawb_number)));
        Object.keys(mawb).map(key => $('#{}'.format(key)).val(mawb[key]));
        show_mawb_ref_num(mawb.mawb_number);
    }

    function selectize() {
        $('.city_select').select2();
        $('.country_select').select2();
        $('.awb_select').select2();
        $('.awb_agent_select').select2();
        $('.airport_select').select2();
        $('.airline_select').select2();
    }

    // load init data
    $.ajax({
        type: 'get',
        url: window.urlfor_mawb_page_init_data,
        data: null,
        dataType: 'json',
        success: function (resp) {
            var country_options = resp.data.country_list.map(function (country) {
                return '<option value="{}">{}</option>'.format(country.id, country.code_isoa2);
            });
            var airport_options = resp.data.airport_list.map(function (ap) {
                return '<option value="{}">{}: {}</option>'.format(ap.id, ap.code, ap.name);
            });
            var city_options = resp.data.city_list.map(function (city) {
                return '<option value="{}">{}</option>'.format(city.id, city.name);
            });
            var airline_options = resp.data.airline_list.map(function (airline) {
                return '<option value="{}">{} {}</option>'.format(airline.id, airline.prefix_number, airline.name);
            });
            var awb_options = resp.data.awb_list.map(function (awb) {
                return '<option value="{}">{} expires:{} agent:{} airline:{}</option>'
                    .format(awb.id, awb.awb_serial, awb.expire_date, awb.agent.name, awb.airline.name);
            });
            var currency_options = resp.data.currency_list.map(function (cur) {
                return '<option value="{}">{}</option>'.format(cur.id, cur.code);
            });
            var payment_type_options = resp.data.payment_type_list.map(function (p) {
                return '<option value="{}">{}</option>'.format(p.id, p.name);
            });
            var mawb_options = resp.data.mawb_list.map(function (mawb) {
                return '<option value="{}">{}</option>'.format(mawb.mawb_public_id, mawb_pretty_format(mawb.mawb_number));
            });
            var agent_options = resp.data.agent_list.map(function (agent) {
                return '<option value="{}">{}</option>'.format(agent.id, agent.name);
            });
            $('.country_select').each(function () {
                $(this).html('<option value="">select country</option>' + country_options.join(''));
            });
            $('.airport_select').each(function () {
                $(this).html('<option value="">select airport</option>' + airport_options.join(''));
            });
            $('.city_select').each(function () {
                $(this).html('<option value="">select city</option>' + city_options.join(''));
            });
            $('.airline_select').each(function () {
                $(this).html('<option value="">select airline</option>' + airline_options.join(''));
            });
            $('.awb_select').each(function () {
                $(this).html('<option value="">select AWB</option>' + awb_options.join(''));
            });
            $('.agent_select').each(function () {
                $(this).html('<option value="">select agent</option>' + agent_options.join(''));
            });

            $('.awb_select').change(function (event) {
                const awb_bill_id = $(event.target).val();
                if (awb_bill_id) {
                    const awb = resp.data.awb_list.filter(awb => awb.id == awb_bill_id)[0];
                    propagate_awb_selection(awb);
                }
            });
            $('.currency_select').each(function () {
                $(this).html('<option value="">select currency</option>' + currency_options.join(''));
            });
            $('.payment_type_select').each(function () {
                $(this).html('<option value="">select</option>' + payment_type_options.join(''));
            });
            $('.mawb_select').each(function () {
                $(this).html('<option value="">select MAWB</option>' + mawb_options.join(''));
            });
            $('.mawb_select').change(function (event) {
                const mawb_public_id = $(event.target).val();
                if (mawb_public_id) {
                    const mawb = resp.data.mawb_list.filter(mawb => mawb.mawb_public_id == mawb_ref_num)[0];
                    formdata.mawb_public_id = mawb.mawb_public_id;
                    propagate_mawb_selection(mawb);
                }
            });

            $('.agent_select').change(function (event) {
                const agent_id = $(event.target).val();
                if (agent_id) {
                    const agent = resp.data.agent_list.filter(agent => agent.id == agent_id)[0];
                    propagate_agent_selection(agent);
                }
            });

            propagate_shipper(resp.data.forwarder_default_address);
            $('#shipper_msg').html('<div class="text-success">Forwarder default address applied</div>');

            selectize();

            $('#set_exec_date_today').click(function (event) {
                $('#others_ex_date').val(window.today_date_for_dateinput());
            });

            $('#weightcharge_prepaid,#others_valuation_prepaid,#others_tax_prepaid,#others_cda_prepaid,#others_cdc_prepaid').change(function () {
                $('#others_total_prepaid').val(
                    parseFloat($('#weightcharge_prepaid').val() || 0) + parseFloat($('#others_valuation_prepaid').val() || 0)
                    + parseFloat($('#others_tax_prepaid').val() || 0)
                    + parseFloat($('#others_cda_prepaid').val() || 0) + parseFloat($('#others_cdc_prepaid').val() || 0)
                );
            });
            $('#weightcharge_collect,#others_valuation_collect,#others_tax_collect,#others_cda_collect,#others_cdc_collect, #others_cad').change(function () {
                let subtotal = parseFloat($('#weightcharge_collect').val() || 0) + parseFloat($('#others_valuation_collect').val() || 0)
                    + parseFloat($('#others_tax_collect').val() || 0)
                    + parseFloat($('#others_cda_collect').val() || 0) + parseFloat($('#others_cdc_collect').val() || 0);
                $('#others_total_collect').val(subtotal);
                // $('#others_tcc').val(subtotal + parseFloat($('#others_cad') || 0));
            });

            // load mawb for edit/copy page
            if (window.mawb_public_id) {
                let spinner = $('<div>Loading <i class="fa fa-spinner fa-spin"></i></div>');
                let loader = window.modal_alert();
                loader.append_html(spinner);
                $.ajax({
                    type: 'GET',
                    url: window.urlfor_mawb_load,
                    data: {public_id: mawb_public_id},
                    dataType: 'json',
                    success: function (resp) {
                        populate_mawb_form(resp.data.mawb_info);
                        loader.close();
                    },
                    error: function (jqHXR, textStatus, errorThrown) {
                        let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                        loader.append_html('<div class="text-danger temp_error_msg">{}</div>'.format(err));
                    },
                    complete: function (jqHXR, textStatus) {
                        spinner.remove();
                    }
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            let err = '{}: an error occurred on page init data load! {}'.format(textStatus, errorThrown);
            $('#feedback_errors').append('<div class="text-danger">{}</div>'.format(err));
        }
    });

    $('#submit_button').click(function () {
        let loader = window.modal_alert({content_html: '<p class="text-info">Saving ...</p>'});
        $('#feedback_msg').empty();
        $('#feedback_errors').empty();
        ids.forEach(function (item) {
            formdata[item] = $('#' + item).val();
        });

        $('.temp_error_msg').map(function () {
            this.remove();
        });

        $.ajax({
            type: 'POST',
            url: window.urlfor_mawb_save,
            data: (function (data_to_submit) {
                if (data_to_submit.mawb_public_id) {
                    data_to_submit.operation = 'update';
                } else {
                    data_to_submit.operation = 'create';
                }
                return data_to_submit;
            }(formdata)),
            dataType: 'json',
            success: function (resp) {
                //console.log(resp);
                if (resp.errors.length || Object.keys(resp.form_errors).length) {
                    $('#feedback_errors').append('<div class="text-danger">{}</div>'.format('Error: '));
                    loader.append_html('<p class="text-danger">Error: </p>');
                }
                resp.errors.map(function (errmsg) {
                    $('#feedback_errors').append('<div class="text-danger">{}</div>'.format(errmsg));
                    loader.append_html('<p class="text-danger">{}</p>'.format(errmsg));
                });

                resp.msg.map(function (msg) {
                    $('#feedback_msg').append('<div class="text-success">{}</div>'.format(msg));
                    loader.append_html('<p class="text-success">{}</p>'.format(msg));
                });

                Object.keys(resp.form_errors).map(function (key) {
                    var errmsg = resp.form_errors[key];
                    $('#{}'.format(key)).after(function () {
                        return '<span class="form-feedback-error text-danger small temp_error_msg">{}</span>'.format(errmsg);
                    });
                });
                if (resp.success) {
                    formdata.mawb_public_id = resp.data.mawb_public_id;
                    show_mawb_ref_num(resp.data.mawb_number);
                    $('#feedback_msg').prepend('<div class="text-success">{}</div>'.format('Success'));
                    loader.append_html('<p class="text-success">Save Success. Bill ID {}, internal identifier {}</p>'.format(resp.data.mawb_number, resp.data.mawb_public_id));
                } else {
                    loader.append_html('<p class="text-danger">{}</p>'.format('Save Failed!'));
                }
            },
            error: function (jqHXR, textStatus, errorThrown) {
                let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                $('#feedback_errors').empty().append('<div class="text-danger temp_error_msg">{}</div>'.format(err));
            },
        });

    });
}(jQuery));