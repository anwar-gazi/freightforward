"use strict";
(function ($) {

    // This function sets date the val of an ID or class to today's date
    var set_current_date_to_inputs = function (id_class) {
        // Call the function like - set_current_date_to_inputs('#id')
        var date = new Date();
        // ("0"+d.getHours()).slice(-2);
        var formated_date = ('0' + date.getFullYear()).slice(-4) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
        $(id_class).val(formated_date);
        // console.log(formated_date);
    };

    function set_executed_on_date_today() {
        set_current_date_to_inputs('#others_ex_date');
    }

    // a functions to calculate total charge from weight and rate of goods
    function calculateTotalCost(weight, rate) {
        var total = weight * rate;
        $('#goods_total').val(total.toFixed(2));
        return total.toFixed(2);
    }

    // this functions calculates the total prepaid from several prepaid costs
    function calculateTotalPrepaid(weight_charge, valuation, tax, cda, cdc) {
        var total_prepaid = weight_charge + valuation + tax + cda + cdc;
        $('#others_total_prepaid').val(total_prepaid);
    }

    function calculateTotalCollect(weight_charge, valuation, tax, cda, cdc) {
        var total = weight_charge + valuation + tax + cda + cdc;
        $('#others_total_collect').val(total);
    }


    var formdata = {
        operation: 'create',
        hawb_reference_number: null,
        booking_globalid: ''
    };
    var ids = [];
    $(document).ready(function () {
        $('#page_content_spinner').remove();

        $('#all_inputs :input').each(function () {
            ids.push($(this).attr('id'));
        });
    });

    function booking_not_applicable() {
        $('#booking_not_applicable').prop('checked', true);
        $('#freight_booking_selection').hide();
        $('#house_selection').show();
    }

    function booking_applicable() {
        $('#booking_not_applicable').prop('checked', false);
        $('#freight_booking_selection').show();
        $('#house_selection').hide();
    }

    function selectize() {
        $('.available_confirmed_booking_selection').select2();
        $('.confirmed_booking_selection').select2();
        $('.city_select').select2();
        $('.country_select').select2();
        // $('.awb_select').selectize();
        $('.awb_agent_select').select2();
        $('.airport_select').select2();
        $('.airline_select').select2();


        // Since the 'Form-Control' class is changeing the input style, we are removing it after stilize is applied to the inputs

        // $('.selectize-control').toggleClass('form-control');
    }

    function clear_hawb_form() {
        formdata.hawb_reference_number = '';
        formdata.booking_globalid = '';
        $('#all_inputs input').val('');
        $('#all_inputs select').val('');
        $('#all_inputs textarea').val('');
    }

    function populate_hawb_form(hawb_data) {
        formdata.hawb_reference_number = hawb_data.hawb_reference_number;
        formdata.booking_globalid = hawb_data.booking_reference_number;//TODO this is not working, ie. not autofilling
        set_hawb_ref_num(hawb_data.hawb_reference_number, hawb_data.print_preview_url);
        Object.keys(hawb_data).map(function (key) {
            $('#{}'.format(key)).val(hawb_data[key]);
        });
        $('#shipper_city').change();
        $('#shipper_country').change();
        $('#consignee_city').change();
        $('#consignee_country').change();

        $('.airport_select').each(function (elem) {
            $(elem).change();
        });
        $('.airline_select').each(function (elem) {
            $(elem).change();
        });

        if (!formdata.hawb_reference_number) {//for a fresh creation
            $('#others_ex_loc').val($('#shipper_city').val());
            $('#others_ex_loc').change();
        }

        selectize();
    }

    function set_hawb_ref_num(hawb_reference_num, preview_url) {
        $('#hawb_reference_num').text(hawb_reference_num);
        if (preview_url) {
            $('#print_preview_anchor').attr('href', preview_url);
        }
    }

    function populate_forwarder_address_in_default_carrier(forwarder_address) {
        // console.dir(forwarder_address);
        $('#carrier_agent_name').val(forwarder_address.company_name);
        $('#carrier_agent_city').val(forwarder_address.city.id);
        $('#carrier_agent_country').val(forwarder_address.country.id);

        $('#carrier_agent_state').val(forwarder_address.state);
        $('#carrier_agent_ffl').val(forwarder_address.ffl_number);
        $('#carrier_agent_date').val(forwarder_address.ffl_exp_date);
        $('#carrier_agent_iata_code').val(forwarder_address.iata_code);

        window.modal_alert({content_html: '<div class="text-success">Forwarder Info Applied: {}</div>'.format(forwarder_address.company_name)});
    }

    function populate_agent_info_in_default_carrier(agent_info) {
        console.dir(agent_info);
        $('#carrier_agent_name').val(agent_info.name);
        $('#carrier_agent_city').val(agent_info.hasOwnProperty('city') ? agent_info.city.id : '');
        $('#carrier_agent_city').change();
        $('#carrier_agent_country').val(agent_info.hasOwnProperty('country') ? agent_info.country.id : '');
        $('#carrier_agent_country').change();

        $('#carrier_agent_state').val(agent_info.state);
        $('#carrier_agent_ffl').val(agent_info.ffl_number);
        $('#carrier_agent_date').val(agent_info.ffl_exp_date);
        $('#carrier_agent_iata_code').val(agent_info.iata_code);

        if (agent_info.name) {
            window.modal_alert({content_html: '<div class="text-success">Agent Info Applied: {}</div>'.format(agent_info.name)});
        } else {
            window.modal_alert({content_html: '<div class="text-warning">Agent Info Reset</div>'});
        }
    }

    // load init data
    $.ajax({
        type: 'get',
        url: window.urlfor_hawb_page_init_data,
        data: null,
        dataType: 'json',
        success: function (resp) {
            var supplier_options = resp.data.supplier_list.map(function (sup) {
                return '<option value="{}">{}</option>'.format(sup.id, sup.company_name);
            });
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
                return '<option value="{}">{} <i class="small">agent:{} - airline:{}</i></option>'.format(awb.id, awb.awb_serial, awb.agent.name, awb.airline.name);
            });
            var currency_options = resp.data.currency_list.map(function (cur) {
                return '<option value="{}">{}</option>'.format(cur.id, cur.code);
            });
            var payment_type_options = resp.data.payment_type_list.map(function (p) {
                return '<option value="{}">{}</option>'.format(p.id, p.name);
            });
            var confirmed_booking_options = resp.data.confirmed_booking_list.map(function (booking) {
                return '<option value="{}">{} From:{} confirmed at:{} {}</option>'.format(booking.public_id, booking.public_id, booking.org.title, booking.confirmed_at, booking.hawb_public_id ? 'hawb#' + booking.hawb_public_id : '');
            });
            var available_confirmed_booking_options = resp.data.available_confirmed_booking_list.map(function (booking) {
                return '<option value="{}">{} From:{} confirmed at:{}</option>'.format(booking.public_id, booking.public_id, booking.org.title, booking.confirmed_at);
            });
            var awb_agent_options = resp.data.awb_agent_list.map(function (agent) {
                return '<option value="{}">{} IATA code:{} city:{} country:{}</option>'.format(agent.id, agent.name, agent.iata_code, agent.city.name, agent.country.code_isoa2);
            });

            $('.supplier_selection').each(function () {
                $(this).html('<option value="">select supplier</option>' + supplier_options.join(''));
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
            $('.currency_select').each(function () {
                $(this).html('<option value="">select currency</option>' + currency_options.join(''));
            });
            $('.payment_type_select').each(function () {
                $(this).html('<option value="">select</option>' + payment_type_options.join(''));
            });
            $('.confirmed_booking_selection').each(function () {
                $(this).html('<option value="">select</option>' + confirmed_booking_options.join(''));
            });
            $('.available_confirmed_booking_selection').each(function () {
                $(this).html('<option value="">select</option>' + available_confirmed_booking_options.join(''));
            });
            $('.awb_agent_select').each(function () {
                $(this).html('<option value="">select</option>' + awb_agent_options.join(''));
            });

            $('#booking_not_applicable').click(function (event) {
                if ($(event.target).is(':checked')) {
                    booking_not_applicable();
                } else {
                    booking_applicable();
                }
            });

            // event listeners
            $('#apply_forwarder_info_in_issuing_carrier_info').on('click', function (event) {
                populate_forwarder_address_in_default_carrier(resp.data.forwarder.default_address);
            });
            $('.awb_agent_select').on('change', function (event) {
                let agent_id = $(event.target).val();
                let agent_info = {};
                if (agent_id) {
                    agent_info = resp.data.awb_agent_list.filter(agent => agent.id == agent_id)[0];
                } else {
                    agent_info = {};
                }
                populate_agent_info_in_default_carrier(agent_info);
            });

            $('#payment_type').change(function (event) {
                const id = $(event.target).val();
                if (id) {
                    $('#wt').val(id);
                    $('#other_wt').val(id);
                    $('#wt').change();
                    $('#other_wt').change();
                }
            });

            if (resp.data.default_currency) {
                $('.currency_select').val(resp.data.default_currency.id);
                $('.currency_select').change();
            }

            $('#departure_airport').change(function (event) {
                const dep_ap = $(event.target).val();
                const dest_ap = $('#dest_airport').val();
                if (dep_ap && dest_ap && dep_ap == dest_ap) {
                    window.modal_alert({content_html: '<div class="text-danger">Departure airport and destination airport cannot be same</div>'});
                    $(event.target).val('');
                    $(event.target).change();
                }
            });

            $('#dest_airport').change(function (event) {
                const dest_ap = $(event.target).val();
                const dep_ap = $('#departure_airport').val();
                if (dep_ap && dest_ap && dep_ap == dest_ap) {
                    window.modal_alert({content_html: '<div class="text-danger">Departure airport and destination airport cannot be same</div>'});
                    $(event.target).val('');
                    $(event.target).change();
                    return false;
                }
            });

            $('#destination_to_3_airport').change(function (event) {
                const ap = $(event.target).val();

                const dep_ap = $('#departure_airport').val();
                if (dep_ap && ap && dep_ap == ap) {
                    window.modal_alert({content_html: '<div class="text-danger">Departure airport and destination airport cannot be same</div>'});
                    $(event.target).val('');
                    $(event.target).change();
                    return false;
                }
                if (ap) {
                    $('#dest_airport').val(ap);
                    $('#dest_airport').change();
                    window.modal_alert({content_html: '<div class="text-success">Destination airport selected</div>'});
                }
            });

            $('#destination_to_2_airport').change(function (event) {
                const ap = $(event.target).val();

                const dep_ap = $('#departure_airport').val();
                if (dep_ap && ap && dep_ap == ap) {
                    window.modal_alert({content_html: '<div class="text-danger">Departure airport and destination airport cannot be same</div>'});
                    $(event.target).val('');
                    $(event.target).change();
                    return false;
                }

                if (ap && !$('#destination_to_3_airport').val()) {
                    $('#dest_airport').val(ap);
                    $('#dest_airport').change();
                    window.modal_alert({content_html: '<div class="text-success">Destination airport selected</div>'});
                }
            });

            $('#destination_to_1_airport').change(function (event) {
                const ap = $(event.target).val();

                const dep_ap = $('#departure_airport').val();
                if (dep_ap && ap && dep_ap == ap) {
                    window.modal_alert({content_html: '<div class="text-danger">Departure airport and destination airport cannot be same</div>'});
                    $(event.target).val('');
                    $(event.target).change();
                    return false;
                }

                if (ap && !$('#destination_to_3_airport').val() && !$('#destination_to_2_airport').val()) {
                    $('#dest_airport').val(ap);
                    $('#dest_airport').change();
                    window.modal_alert({content_html: '<div class="text-success">Destination airport selected</div>'});
                }
            });

            $('#exec_date_today').click(function () {
                $('#others_ex_date').val(window.today_date_for_dateinput());
            });

            selectize();

            //load HAWB info for edit page
            if (window.hawb_public_id) {
                let loading_modal = window.modal_alert({content_html: '<p class="text-warning">Loading ...</p>'});
                $.ajax({
                    type: 'GET',
                    url: window.urlfor_hawb_info_load,
                    data: {public_id: window.hawb_public_id},
                    dataType: 'json',
                    success: function (resp) {
                        if (!resp.success) {
                            loading_modal.append_html('<p class="text-danger">Error: {}</p>'.format(resp.errors.join(',')));
                            return false;
                        } else {
                            populate_hawb_form(resp.data.hawb_info);
                            if (resp.data.hawb_info.booking_reference_number) {
                                booking_applicable();
                                $('#booking_not_applicable_check').hide();
                            } else {
                                booking_not_applicable();
                            }
                            if (window.copy_hawb) {
                                formdata.hawb_reference_number = '';
                            }
                            loading_modal.close();
                        }
                    },
                    error: function (jqHXR, textStatus, errorThrown) {
                        let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                        $('#feedback_errors').empty().append('<div class="text-danger temp_error_msg">retrieve error for booking #{} : {}</div>'.format(booking_globalid, err));
                    },
                    complete: function (jqHXR, textStatus) {
                    }
                });
            }

            // upon booking selection, get its data and upopulate in form
            $('.available_confirmed_booking_selection,.confirmed_booking_selection').change(function (event) {
                const booking_globalid = $(event.target).val();
                if (!booking_globalid) {
                    window.modal_alert({content_html: '<p class="text-danger">Please input booking reference number</p>'});
                    clear_hawb_form();
                    return false;
                } else {
                    //now get info about this booking
                    let loading_modal = window.modal_alert({content_html: '<p class="text-warning">Loading ...</p>'});
                    $.ajax({
                        type: 'GET',
                        url: window.urlfor_booking_info_load,
                        data: {booking_globalid: booking_globalid},
                        dataType: 'json',
                        success: function (resp) {
                            if (!resp.success) {
                                loading_modal.append_html('<p class="text-danger">Error: {}</p>'.format(resp.errors.join(',')));
                                return false;
                            } else {
                                if (resp.data.has_hawb) {
                                    loading_modal.append_html('<p>This booking already have a house bill {}. loading it instead</p>'.format(resp.data.hawb_info.hawb_reference_number));
                                    populate_hawb_form(resp.data.hawb_info);
                                } else { // just load booking data
                                    loading_modal.append_html('<p class="text-success">Booking info load success</p>');
                                    populate_hawb_form(resp.data.booking_info);
                                }
                                // loading_modal.append_html('<p class="text-success">Load success</p>');
                            }
                        },
                        error: function (jqHXR, textStatus, errorThrown) {
                            let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                            $('#feedback_errors').empty().append('<div class="text-danger temp_error_msg">retrieve error for booking #{} : {}</div>'.format(booking_globalid, err));
                        },
                        complete: function (jqHXR, textStatus) {
                            // This piece of code changes the execution date to today by default. User can change it manually later on

                            // set chargable weight and rate to 0 initially
                            // $('#goods_chargeable_weight').val('0');
                            // $('#goods_rate').val('0');
                            // $('#goods_total').val('0');
                        }
                    });
                }

            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            let err = '{}: an error occurred on page init data load! {}'.format(textStatus, errorThrown);
            $('#feedback_errors').append('<div class="text-danger">{}</div>'.format(err));
        }
    });

    (function () {
        set_current_date_to_inputs('#others_ex_date');
    }());


    $('#submit_button').click(function () {
        let loader = window.modal_alert({content_html: '<p class="text-info">Saving ...</p>'});
        $('#feedback_msg').empty();
        $('#feedback_errors').empty();
        ids.forEach(function (item) {
            formdata[item] = $('#' + item).val();
        });
        formdata.booking_not_applicable = $('#booking_not_applicable').is(':checked') ? 1 : 0;

        $('.temp_error_msg').map(function () {
            this.remove();
        });

        $.ajax({
            type: 'POST',
            url: window.urlfor_hawb_save,
            data: (function (data_to_submit) {
                if (data_to_submit.hawb_reference_number) {
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
                    formdata.hawb_reference_number = resp.data.hawb_reference_number;
                    $('#feedback_msg').prepend('<div class="text-success">{}</div>'.format('Success'));
                    set_hawb_ref_num(formdata.hawb_reference_number);
                    loader.append_html('<p class="text-success">Save Success. Bill ID {}</p>'.format(resp.data.hawb_reference_number));
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


    // upon value input calculate total
    $('#goods_rate, #goods_chargeable_weight').on('change', function () {
        var weight = parseFloat($('#goods_chargeable_weight').val()) || 0;
        var rate = parseFloat($('#goods_rate').val()) || 0;
        calculateTotalCost(weight, rate);
    });

    // Calculate total prepaid(others_total_prepaid) from weightcharge_prepaid others_valuation_prepaid others_tax_prepaid others_cda_prepaid others_cdc_prepaid
    $('#weightcharge_prepaid, #others_valuation_prepaid, #others_tax_prepaid, #others_cda_prepaid, #others_cdc_prepaid').on('change', function () {
        var weight_charge = parseFloat($('#weightcharge_prepaid').val()) || 0;
        var valuation = parseFloat($('#others_valuation_prepaid').val()) || 0;
        var tax = parseFloat($('#others_tax_prepaid').val()) || 0;
        var cda = parseFloat($('#others_cda_prepaid').val()) || 0;
        var cdc = parseFloat($('#others_cdc_prepaid').val()) || 0;

        calculateTotalPrepaid(weight_charge, valuation, tax, cda, cdc);
    });

    $('#weightcharge_collect, #others_valuation_collect, #others_tax_collect, #others_cda_collect, #others_cdc_collect, #others_cad').on('change', function () {
        var weight_charge = parseFloat($('#weightcharge_collect').val()) || 0;
        var valuation = parseFloat($('#others_valuation_collect').val()) || 0;
        var tax = parseFloat($('#others_tax_collect').val()) || 0;
        var cda = parseFloat($('#others_cda_collect').val()) || 0;
        var cdc = parseFloat($('#others_cdc_collect').val()) || 0;

        calculateTotalCollect(weight_charge, valuation, tax, cda, cdc);

        var cad = parseFloat($('#others_cad').val()) || 0;

        $('#others_tcc').val(weight_charge + valuation + tax + cda + cdc + cad);
    });


}(jQuery));