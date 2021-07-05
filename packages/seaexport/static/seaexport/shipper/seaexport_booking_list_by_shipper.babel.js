"use strict";


class SeaExportBookingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            booking_list: [],
            pagination: {}
        };
        this.load_data();
    }

    load_data = (page, show_loader) => {
        let _this = this;

        let loader = '';
        let spinner = '';
        if (show_loader) {
            spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
            loader = window.modal_alert({content_html: ''});
            loader.append_html(spinner);
        }
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_bookinglist,
            data: {page: page},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    booking_list: resp.data.booking_list,
                    pagination: resp.data.pagination,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
                if (show_loader) {
                    loader.append_html('<div class="text-danger">{}</div>'.format(err));
                }
            },
            complete: function (jqXHR, textStatus) {
                if (show_loader) {
                    loader.append_html('<div>Load Complete</div>');
                    spinner.remove();
                }
            }
        });
    };

    previous_page = () => {
        this.load_data(this.state.pagination.page - 1, true);
    };
    next_page = () => {
        this.load_data(this.state.pagination.page + 1, true);
    };

    mark_goods_received = (booking_public_id) => {
        const _this = this;
        let loader = window.modal_alert();
        let spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');

        loader.append_html(spinner);

        jQuery.ajax({
            type: 'post',
            url: window.urlfor_mark_goods_received,
            data: {
                booking_public_id: booking_public_id
            },
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    loader.append_html('<div class="text-success">Success.</div>');
                    loader.append_html('<div class="text-success">' + resp.msg.join('. ') + '</div>');
                    _this.load_data(_this.state.pagination.page, false);
                } else {
                    let form_errors = Object.keys(resp.form_errors).map(key => '{} {}'.format(key, resp.form_errors[key]));
                    loader.append_html(resp.errors.map(msg => '<div class="text-danger">{}</div>'.format(msg)).join(''));
                    loader.append_html('<div class="text-danger">Error</div>' + resp.errors.concat(form_errors).join(''));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    onbook = (booking_public_id) => (event) => {
        let _this = this;
        window.modal_prompt({
            input_label: 'EDD',
            input_type: 'date',
            on_confirm: function (edd) {
                if (!edd) {
                    alert('No EDD given. Booking not confirmed.');
                    return false;
                } else {
                    let loader = window.modal_alert({content_html: '<div class="text-info">Processing ...</div>'});
                    jQuery.ajax({
                        type: 'post',
                        url: window.urlfor_booking_confirm,
                        data: {
                            booking_public_id: booking_public_id,
                            edd: edd
                        },
                        dataType: 'json',
                        success: function (resp) {
                            if (resp.success) {
                                loader.append_html('<div class="text-success">Success.</div>');
                                loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                                loader.upon_close = function () {
                                    window.location.reload();
                                };
                            } else {
                                let form_errors = Object.keys(resp.form_errors).map(key => '{} {}'.format(key, resp.form_errors[key]));
                                loader.append_html(resp.errors.map(msg => '<div class="text-danger">{}</div>'.format(msg)).join(''));
                                loader.append_html('<div class="text-danger">Error</div>' + resp.errors.concat(form_errors).join(''));
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                            loader.append_html('<div class="text-danger">{}</div>'.format(err));
                        }
                    });
                }
            }
        });
    };

    delete = (delete_url) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        loader.hide_ok();
        let tpl = $('<div><p class="mb-4">Deleting this Booking may have unwanted side effects. Any other data associated with this will be removed.</p>' +
            '<div class=""><button class="btn btn-danger mr-4" id="confirm">Confirm Delete</button><button class="btn btn-success" id="cancel">Cancel</button></div>' +
            '</div>');
        tpl.find('#confirm').click(function () {
            jQuery.ajax({
                type: 'get',
                url: delete_url,
                data: {},
                dataType: 'json',
                success: function (resp) {
                    loader.close();
                    reload_page();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                    _this.setState({
                        errors: [err]
                    });
                },
                complete: function (jqXHR, textStatus) {
                }
            });
        });
        tpl.find('#cancel').click(function () {
            loader.close();
        });
        loader.set_header('<div class="py-4 text-center bg-danger"><h4>Delete This Booking?</h4></div>');
        loader.append_html(tpl);
    };

    render() {
        let _this = this;
        return <div className="container">
            <div className="py-4 bg-success">
                <h2 className="text-center">Sea Export Freight Booking List</h2>
            </div>
            <div className="card">
                <div className="card-header">
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="small">
                            <tr>
                                <th style={{verticalAlign: 'top'}}>
                                    operation
                                </th>
                                <th style={{verticalAlign: 'top'}}>
                                    action
                                </th>
                                <th style={{verticalAlign: 'top'}}>Latest Status</th>
                                <th>
                                    From<br/>
                                    City<br/>
                                    Pickup<br/>
                                </th>
                                <th>
                                    To<br/>
                                    City<br/>
                                    <span className="whitespace-nr">Estimated Delivery Date</span><br/>
                                </th>
                                <th>
                                    <span className="whitespace-nr">No of package</span><br/>
                                    <span className="whitespace-nr">Total Weight</span><br/>
                                    <span className="whitespace-nr">CBM</span>
                                </th>
                                <th>
                                    <span className="whitespace-nr">Transport service</span><br/>
                                    <span className="whitespace-nr">Booking ID</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.booking_list.length ? (function () {
                                    return _this.state.booking_list.map(booking => {
                                        let status = '';
                                        if (booking.is_booking_confirmed) {
                                            status = <div><span className="badge badge-warning small">booking confirmed</span></div>;
                                        } else {
                                            status = <div><span className="badge badge-secondary small">booking registered</span></div>;
                                        }
                                        if (booking.goods_received) {
                                            status = <div><span className="badge badge-info small">goods received</span></div>;
                                        }
                                        return <tr key={booking.public_id}>
                                            <td>
                                                <div className="whitespace-nr">
                                                    <a className="btn btn-sm btn-outline-secondary" href={booking.edit_url} title="edit"><i className="fa fa-pencil-alt small"></i></a>
                                                    <a className="btn btn-sm btn-outline-secondary" href={booking.copy_url} title="copy and create another">
                                                        <i className="fa fa-copy small"></i></a>
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                                                        _this.delete(booking.delete_url);
                                                    }} title="delete"><i className="fa fa-trash small"></i></button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="">
                                                    <div className="mt-2">
                                                        {booking.is_booking_confirmed ? '' : (function () {
                                                            return <button type="button" className="btn btn-sm btn-secondary" onClick={_this.onbook(booking.public_id)}>Book</button>;
                                                        }())}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {status}
                                            </td>
                                            <td>
                                                <span className="whitespace-nr">{booking.from}</span><br/>
                                                <span className="whitespace-nr">{booking.from_city}</span><br/>
                                                <span className="whitespace-nr">{booking.pickup}</span>
                                            </td>
                                            <td>
                                                <span className="whitespace-nr">{booking.to}</span><br/>
                                                <span className="whitespace-nr">{booking.to_city}</span><br/>
                                                <span className="whitespace-nr">{booking.delivery}</span>
                                            </td>
                                            <td>
                                                {booking.no_of_packages}<br/>
                                                {booking.total_weight} {booking.weight_unit}<br/>
                                                <span className="whitespace-nr">{booking.cbm} CBM</span>
                                            </td>
                                            <td>
                                                <span className="whitespace-nr">{booking.transport_service}</span><br/>
                                                {booking.sli}
                                            </td>
                                        </tr>;
                                    });
                                }())
                                : <tr>
                                    <td colSpan={8}>No data</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="small">
                            {_this.state.booking_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
                        </div>
                        <div>
                            {_this.state.pagination.page == 1 ? <button className="btn btn-sm btn-outline-secondary" disabled={true}>prev</button>
                                : <button className="btn btn-sm btn-outline-secondary" onClick={_this.previous_page}>prev</button>}

                            Showing page {_this.state.pagination.page} of {_this.state.pagination.number_of_page}
                            {_this.state.pagination.page == _this.state.pagination.number_of_page ?
                                <button className="btn btn-sm btn-outline-secondary" disabled={true}>next</button>
                                : <button className="btn btn-sm btn-outline-secondary" onClick={_this.next_page}>next</button>}
                        </div>
                    </div>
                </div>
                <div className="card-footer"></div>
            </div>
        </div>
            ;
    }
}

ReactDOM.render(
    <SeaExportBookingList/>
    , document.getElementById('page_content'));