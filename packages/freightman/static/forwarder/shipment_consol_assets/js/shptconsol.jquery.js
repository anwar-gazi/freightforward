"use strict";
(function ($) {
    $(document).ready(function () {
        $('#page_content_spinner').remove();
    });

    function set_consolidation_job_number_input(job_number) {
        $('#job_no').val(job_number);
    }

    var consol_data = {
        consolidation_job_number: '',
        mawb_public_id: null,
        hawb_public_id_list: [],
        airline_info_list: []
    };

    function selectize() {
        $('.city_select').select2();
        $('.country_select').select2();
        $('.airport_select').select2();
        $('.airline_select').select2();
        $('.awb_select').select2();
        $('.awb_agent_select').select2();
        // $('.hawb_select').selectize();
        // $('.mawb_select').selectize();
    }

    function show_errors(error_list) {
        $('#feedback_errors').append(error_list.map(err => '<div class="text-danger">{}</div>'.format(err)).join(''));
    }

    function show_hawb_selection_errors(error_list) {
        $('.hawb_selection_feedback').append(error_list.map(err => '<div class="text-danger">{}</div>'.format(err)).join(''));
    }

    function show_mawb_selection_errors(error_list) {
        $('.mawb_selection_feedback').append(error_list.map(err => '<div class="text-danger">{}</div>'.format(err)).join(''));
    }

    function show_flightinfo_errors(uniqid, error_dict) {
        if (error_dict.hasOwnProperty('airline')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.airline_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.airline));
        }
        if (error_dict.hasOwnProperty('co_loader')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.co_loader_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.co_loader));
        }
        if (error_dict.hasOwnProperty('awb')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.airway_number').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.awb));
        }
        if (error_dict.hasOwnProperty('flight_number')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.flight_number').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.flight_number));
        }
        if (error_dict.hasOwnProperty('flight_date')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.flight_date').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.flight_date));
        }
        if (error_dict.hasOwnProperty('departure_country')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.dept_country_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.departure_country));
        }
        if (error_dict.hasOwnProperty('departure_airport')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.dept_airport_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.departure_airport));
        }
        if (error_dict.hasOwnProperty('departure_date')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.dept_date').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.departure_date));
        }
        if (error_dict.hasOwnProperty('arrival_country')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.arrival_country_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.arrival_country));
        }
        if (error_dict.hasOwnProperty('arrival_airport')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.arrival_airport_id').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.arrival_airport));
        }
        if (error_dict.hasOwnProperty('arrival_date')) {
            $('[data-uniqid="{}"]'.format(uniqid)).find('.arrival_date').closest('td').find('.flight_info_feedback')
                .append('<div class="text-danger">{}</div>'.format(error_dict.arrival_date));
        }
    }

    // load init data
    $.ajax({
        type: 'get',
        url: window.urlfor_page_load_data,
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
            var awb_agent_options = resp.data.awb_agent_list.map(function (awb_agent) {
                return '<option value="{}">{}</option>'.format(awb_agent.id, awb_agent.name);
            });
            var awb_list_options = resp.data.awb_list.map(function (awb) {
                return '<option value="{}">{}</option>'.format(awb.id, awb.awb_serial);
            });
            var hawb_option = resp.data.non_consolidated_hawbs.map(function (hawb) {
                return '<option value="{}">{} shipper:{} consignee:{}</option>'.format(
                    hawb.public_id, hawb.public_id, hawb.shipper_company_name, hawb.consignee_company_name);
            });
            var mawb_options = resp.data.non_consolidated_mawbs.map(function (mawb) {
                return '<option value="{}">{} shipper:{} consignee:{}</option>'.format(
                    mawb.public_id, mawb.public_id, mawb.shipper_company_name, mawb.consignee_company_name);
            });


            $('.country_select').each(function () {
                $(this).html('<option value="">select</option>' + country_options.join(''));
            });
            $('.airport_select').each(function () {
                $(this).html('<option value="">select</option>' + airport_options.join(''));
            });
            $('.city_select').each(function () {
                $(this).html('<option value="">select</option>' + city_options.join(''));
            });
            $('.airline_select').each(function () {
                $(this).html('<option value="">select</option>' + airline_options.join(''));
            });
            $('.awb_agent_select').each(function () {
                $(this).html('<option value="">select</option>' + awb_agent_options.join(''));
            });
            $('.awb_select').each(function () {
                $(this).html('<option value="">select</option>' + awb_list_options.join(''));
            });
            $('.hawb_select').each(function () {
                $(this).html('<option value="">select</option>' + hawb_option.join(''));
            });
            $('.mawb_select').each(function () {
                $(this).html('<option value="">select</option>' + mawb_options.join(''));
            });

            (function () {
                $('#page_content').on('change', '.hawb_select', function (event) {
                    const public_id = $(event.target).val();
                    if (public_id) {
                        const hawb = resp.data.non_consolidated_hawbs.filter(hawb => hawb.public_id == public_id)[0];
                        $(event.target).closest('tr').find('.shipper_company_name').val(hawb.shipper_company_name);
                        $(event.target).closest('tr').find('.consignee_company_name').val(hawb.consignee_company_name);
                    }
                });
                $('.mawb_select').on('change', function (event) {
                    const public_id = $(event.target).val();
                    if (public_id) {
                        const mawb = resp.data.non_consolidated_mawbs.filter(mawb => mawb.public_id == public_id)[0];
                        $(event.target).closest('tr').find('.shipper_company_name').val(mawb.shipper_company_name);
                        $(event.target).closest('tr').find('.consignee_company_name').val(mawb.consignee_company_name);
                    }
                });
            }());

            (function () {
                let hawb_add_tpl = '<tr>{}</tr>'.format($('.hawb_info').html());

                $('#add_hawb').click(function () {
                    $('.hawb_info').after(hawb_add_tpl);
                });

                // $('.flight_info').attr('data-uniqid', window.timestamp_ms());
                // let flight_add_tr_tpl = $('.flight_info').get(0).outerHTML;
                // $('#add_flight').click(function () {
                //     $('.flight_info').after(function () {
                //         let tr = $(flight_add_tr_tpl);
                //         tr.find('select').select2();
                //         tr.attr('data-uniqid', window.timestamp_ms());
                //         return tr;
                //     });
                // });
            }());

            // important: selectize must be at the end
            selectize();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
            window.modal_alert({content_html: '<div class="text-danger">{}</div>'.format(err)});
        }
    });


    $('#submit_console_button').click(function () {
        let spinner = $('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');

        let loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);

        $('#feedback_msg').empty();
        $('#feedback_errors').empty();
        $('.hawb_selection_feedback').empty();
        $('.mawb_selection_feedback').empty();
        $('.flight_info_feedback').empty();

        consol_data.mawb_public_id = $('#mawb_public_id').val();
        consol_data.hawb_public_id_list = (function () {
            let list = [];
            $('select.hawb_public_id').each((i, hawbselectobj) => list.push($(hawbselectobj).val()));
            return list.filter(val => val);
        }());
        consol_data.airline_info_list = (function () {
            let list = [];
            $('.flight_info').each((i, flddomobj) => {
                list.push(
                    {
                        'uniqid': $(flddomobj).attr('data-uniqid'),
                        'airline': $(flddomobj).find('select.airline_id').val(),
                        'co_loader': $(flddomobj).find('select.co_loader_id').val(),
                        'awb': $(flddomobj).find('select.airway_number').val(),
                        'flight_number': $(flddomobj).find('.flight_number').val(),
                        'flight_date': $(flddomobj).find('.flight_date').val(),
                        'departure_country': $(flddomobj).find('select.dept_country_id').val(),
                        'departure_airport': $(flddomobj).find('select.dept_airport_id').val(),
                        'departure_date': $(flddomobj).find('.dept_date').val(),
                        'arrival_country': $(flddomobj).find('select.arrival_country_id').val(),
                        'arrival_airport': $(flddomobj).find('select.arrival_airport_id').val(),
                        'arrival_date': $(flddomobj).find('.arrival_date').val(),
                    }
                );
            });
            return list;
        }());

        $.ajax({
            type: 'POST',
            url: window.urlfor_consol_input_save,
            data: {
                consolidation_job_number: consol_data.consolidation_job_number,
                mawb_public_id: consol_data.mawb_public_id,
                hawb_public_id_comma_separated: consol_data.hawb_public_id_list.join(','),
                flight_info_list_json: JSON.stringify(consol_data.airline_info_list)
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    consol_data.consolidation_job_number = resp.data.consolidation_job_number;
                    set_consolidation_job_number_input(consol_data.consolidation_job_number);
                    loader.append_html('<div class="text-success">Consolidation Success</div>');
                } else {
                    loader.append_html('<div class="text-danger">Please check for errors</div>');
                }

                (function () {
                    show_errors(resp.consol_errors);
                    show_errors(resp.flight_errors);
                    if (resp.consol_form_errors.hasOwnProperty('mawb_public_id')) {
                        show_mawb_selection_errors([resp.consol_form_errors.mawb_public_id]);
                    }
                    if (resp.consol_form_errors.hasOwnProperty('hawb_public_id_comma_separated')) {
                        show_hawb_selection_errors([resp.consol_form_errors.hawb_public_id_comma_separated]);
                    }
                    Object.keys(resp.flight_form_errors_dict).map(uniqid => {
                        show_flightinfo_errors(uniqid, resp.flight_form_errors_dict[uniqid]);
                    });
                }());
            },
            error: function (jqHXR, textStatus, errorThrown) {
                let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                err = '<div class="text-danger">{}</div>'.format(err);
                $('#feedback_errors').append(err);

                loader.append_html(err);
            },
            complete: function (jqHXR, textStatus) {
                spinner.remove();
            }
        });

    });
}(jQuery));