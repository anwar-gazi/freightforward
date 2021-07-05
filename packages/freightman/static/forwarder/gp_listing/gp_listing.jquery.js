"use strict";
(function ($) {
    // html renderer methods
    let add_to_page_errors = function (err) {
        $('#page_errors').append('<div class="text-danger">{}</div>'.format(err));
    };
    let add_to_page_msg = function (msg) {
        $('#page_msgs').append('<div class="text-success">{}</div>'.format(msg));
    };
    let render_gp_listing_table = function (gp_list_by_factory) {
        let table_html = '<div class="table-responsive">' +
            '    <table class="table table-striped table-bordered">' +
            '        <thead>' +
            '        <tr>' +
            '            <th>Customer</th>' +
            '            <th>Shpts</th>' +
            '            <th>Revenue</th>' +
            '            <th>Cost</th>' +
            '            <th>Gross Profit</th>' +
            '        </tr>' +
            '        </thead>' +
            '        <tbody>' +
            gp_list_by_factory.map(info => '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>'
                .format(info.factory_name, info.number_of_shipments, info.revenue + ' ' + info.currency.code, info.cost + ' '
                    + info.currency.code, info.gross_profit + ' ' + info.currency.code)
            ).join('') +
            '        </tbody>' +
            '    </table>' +
            '</div>';
        $('#gp_listing').html(table_html);
    };

    // page init
    (function () {
        let spinner = $('<div class=""><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        // let loader = window.modal_alert();
        // loader.append_html(spinner);
        $.ajax({
            type: 'GET',
            url: window.urlfor_gp_listing_page_init_data,
            data: null,
            dataType: 'json',
            success: function (resp) {
                render_gp_listing_table(resp.data.gp_list_by_factory);
            },
            error: function (jqHXR, textStatus, errorThrown) {
                let err = '{} : an error occurred! {}'.format(textStatus, errorThrown);
                add_to_page_errors(err);
            },
            complete: function (jqHXR, textStatus) {
                spinner.remove();
            }
        });
    }());
}(jQuery));