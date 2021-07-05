"use strict";


class RegisteredBookingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            booking_list: [],
            type: '',
            pagination: {},

            search_needle: ''
        };
        this.load_data();

        window.bookinglist_context = this;
    }

    load_data = (page, show_loader, needle) => {
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
            url: window.urlfor_booking_list,
            data: {page: page, needle: needle},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    booking_list: resp.data.booking_list,
                    type: resp.data.type,
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

    onbook = (booking_id) => (event) => {
        let _this = this;
        if (confirm('proceed to confirm booking?')) {
            window.modal_prompt({
                input_label: 'EDD',
                input_type: 'date',
                on_confirm: function (edd) {
                    if (!edd) {
                        alert('Select EDD');
                        return false;
                    } else {
                        let loader = window.modal_alert({content_html: '<div class="text-info">Processing ...</div>'});
                        jQuery.ajax({
                            type: 'post',
                            url: window.urlfor_mark_as_booked,
                            data: {
                                id: booking_id,
                                edd: edd
                            },
                            dataType: 'json',
                            success: function (resp) {
                                if (resp.success) {
                                    // _this.load_data();
                                    loader.append_html('<div class="text-success">Success.</div>');
                                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                                    loader.upon_close = function () {
                                        reload_page();
                                    };
                                } else {
                                    let form_errors = Object.keys(resp.form_errors).map(key => '{} {}'.format(key, resp.form_errors[key]));
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
        }
    };

    invoice_selection = (invoice_list) => {
        const _this = this;
        let loader = window.modal_alert();
        let select = jQuery('<div class="form-group"><label>Select a invoice</label><select class="form-control"><option value=""></option>'
            + invoice_list.map(dict => '<option value="' + dict.public_id + '" data-url="' + dict.url + '">#' + dict.public_id + ' For ' + dict.to_company + '</option>').join('')
            + '</select></div>');
        loader.append_html(select);
        loader.upon_ok = function () {
            const invoice_public_id = select.find('select').val();
            const invoice_url = select.find('select option:selected').attr('data-url');
            if (invoice_public_id) {
                window.open(invoice_url, '_blank');
            }
        };
    };

    render() {
        let _this = this;
        return <div className="card">
            <div className="card-header">

            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <div className="float-right d-none">
                        <div className="input-group">
                            <input className="" type="text" onChange={(event) => {
                                _this.setState({
                                    search_needle: event.target.value
                                });
                            }}/>
                            <button type="button" onClick={(event) => {
                                const needle = event.target.value.trim();
                                _this.load_data(null, true, _this.state.search_needle);
                            }}>search
                            </button>
                        </div>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead className="small">
                        <tr>
                            <th style={{verticalAlign: 'top'}}>
                                action
                            </th>
                            <th>
                                <span className="whitespace-nr">Latest Status</span><br/>
                                Owner<br/>
                                Booking number
                            </th>
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
                                <span className="whitespace-nr">Chargable Weight</span><br/>
                                Unit<br/>
                            </th>
                            <th>
                                <span className="whitespace-nr">Transport service</span><br/>
                                <span className="whitespace-nr">SLI no</span>
                            </th>
                            <th>Progress</th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.booking_list.length ? (function () {
                                return _this.state.booking_list.map(booking => {
                                    let progresslist = [
                                        {
                                            label: 'confirmed',
                                            done: booking.is_booking_confirmed
                                        },
                                        {
                                            label: 'HAWB',
                                            done: booking.hawb_generated
                                        },
                                        {
                                            label: 'MAWB/Consol',
                                            done: booking.mawb_generated
                                        }
                                    ];
                                    return <tr key={booking.id}>
                                        <td>

                                        </td>
                                        <td>
                                            <span className="badge badge-info small">{booking.latest_status}</span><br/>
                                            <span className="whitespace-nr">{booking.owner}</span><br/>
                                            {booking.sli}
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
                                            {booking.chargable_weight}<br/>
                                            <span className="whitespace-nr">{booking.cbm} {booking.weight_unit}</span>
                                        </td>
                                        <td>
                                            <span className="whitespace-nr">{booking.transport_service}</span><br/>
                                        </td>
                                        <td>
                                            {(function () {
                                                if (!booking.is_booking_confirmed) {
                                                    return <div className="btn-group">
                                                        <div>
                                                            <a className="btn btn-sm btn-secondary"
                                                               href={booking.url_for_booking_notification_email_body_view} target="_blank">
                                                                <i className="fa fa-external-link-alt small"></i> view</a>
                                                            <button className="btn btn-sm btn-outline-info" type="button"
                                                                    onClick={_this.onbook(booking.id)}>book
                                                            </button>
                                                        </div>
                                                    </div>;
                                                } else {
                                                    return <div className="btn-group">
                                                        <div>
                                                            <a className="btn btn-sm btn-secondary"
                                                               href={booking.url_for_booking_notification_email_body_view} target="_blank">
                                                                <i className="fa fa-external-link-alt small"></i> view</a>
                                                        </div>
                                                    </div>;
                                                }
                                            }())}
                                            {progress_list_jsx(progresslist)}
                                        </td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={7} className="text-center">No data</td>
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
        </div>;
    }
}

ReactDOM.render(<RegisteredBookingList/>, document.getElementById('page_content'));