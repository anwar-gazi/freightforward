"use strict";


class ShipperBookingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            booking_list: [],
            type: '',
        };
        this.load_data();
    }

    load_data = () => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_shipper_booking_list,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    booking_list: resp.data.booking_list,
                    type: resp.data.type
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
            }
        });
    };

    onbook = (booking_id) => (event) => {
        let _this = this;
        if (confirm('proceed to confirm booking?')) {
            window.modal_prompt({
                input_label: 'EDD',
                input_type: 'date',
                on_confirm: function (edd) {
                    if (!edd) {
                        window.modal_alert({content_html: '<p class="text-danger">Please select a valid EDD</p>'});
                        return false;
                    } else {
                        let spinner = jQuery('<div><i class="fa fa-spin fa-spinner"></i> Processing</div>');
                        let loader = window.modal_alert({content_html: ''});
                        loader.append_html(spinner);
                        jQuery.ajax({
                            type: 'post',
                            url: window.urlfor_shipper_mark_as_booked,
                            data: {
                                id: booking_id,
                                edd: edd
                            },
                            dataType: 'json',
                            success: function (resp) {
                                if (resp.success) {
                                    _this.load_data();
                                    loader.append_html('<div class="text-success">Success {}</div>'.format(resp.msg.join(',')));
                                    loader.upon_close = function () {
                                        window.location.href = window.urlfor_shipper_registered_bookinglist_page;
                                    };
                                } else {
                                    let form_errors = Object.keys(resp.form_errors).map(key => '{} {}'.format(key, resp.form_errors[key]));
                                    loader.append_html('<div class="text-danger">Error: {}</div>'.format(resp.errors.concat(form_errors).join(',')));
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                                loader.append_html('<div class="text-danger">Error: {}</div>'.format(err));
                            },
                            complete: function (jqXHR, textStatus) {
                                spinner.remove();
                            }
                        });
                    }
                }
            });
        }
    };

    render() {
        let _this = this;
        return <div className="card">
            <div className="card-header">
                Booking list ({_this.state.booking_list.length})
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="small">
                        <tr>
                            <th style={{verticalAlign: 'top'}}>
                                action
                            </th>
                            <th>
                                Latest Status<br/>
                                Owner<br/>
                                Shippers Ref <br/>
                            </th>
                            <th>
                                From<br/>
                                City<br/>
                                Pickup<br/>
                            </th>
                            <th>
                                To<br/>
                                City<br/>
                                Estimated Delivery date<br/>
                            </th>
                            <th>
                                No of package<br/>
                                Weight<br/>
                                Unit<br/>
                            </th>
                            <th>
                                Transport service<br/>
                                SLI no
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.booking_list.length ? (function () {
                                return _this.state.booking_list.map(booking => {
                                    return <tr key={booking.id}>
                                        <td>
                                            {(function () {
                                                if (_this.state.type == 'registered') {
                                                    return <div className="btn-group">
                                                        <div>
                                                            <button className="btn btn-outline-info" type="button" onClick={_this.onbook(booking.id)}>book</button>
                                                        </div>
                                                        {/*<div>*/}
                                                        {/*<button className="btn btn-outline-info" type="button" onClick={() => {*/}
                                                        {/*window.modal_alert({content_html: '<p class="text-warning">Feature for phase 2</p>'});*/}
                                                        {/*}}>amend*/}
                                                        {/*</button>*/}
                                                        {/*</div>*/}
                                                    </div>;
                                                } else if (_this.state.type == 'confirmed') {
                                                    return <div className="btn-group">
                                                        {/*<div>*/}
                                                        {/*{*/}
                                                        {/*booking.hawb_generated ?*/}
                                                        {/*<button className="btn btn-sm btn-outline-success small">Dummy AWB</button>*/}
                                                        {/*:*/}
                                                        {/*<button className="btn btn-sm btn-outline-secondary small" onClick={() => {*/}
                                                        {/*window.modal_alert({content_html: '<p class="text-danger">HAWB not generated</p>'});*/}
                                                        {/*}}>Dummy AWB</button>*/}
                                                        {/*}*/}
                                                        {/*</div>*/}
                                                        <div>
                                                            {booking.hawb_generated ? <a className="btn btn-sm btn-outline-success small" target="_blank"
                                                                                         href={booking.hawb_view_url_by_factory}>HAWB</a>
                                                                : <button className="btn btn-sm btn-outline-secondary small" onClick={() => {
                                                                    window.modal_alert({content_html: '<p class="text-danger">HAWB not generated</p>'});
                                                                }}>HAWB</button>}
                                                        </div>
                                                        {/*<div>*/}
                                                        {/*{booking.mawb_generated ?*/}
                                                        {/*<button className="btn btn-sm btn-outline-success small">MAWB</button>*/}
                                                        {/*: <button className="btn btn-sm btn-outline-secondary small" onClick={() => {*/}
                                                        {/*window.modal_alert({content_html: '<p class="text-danger">MAWB not generated</p>'});*/}
                                                        {/*}}>MAWB</button>*/}
                                                        {/*}*/}
                                                        {/*</div>*/}
                                                    </div>;
                                                }
                                            }())}
                                        </td>
                                        <td>
                                            <span className="badge badge-info small">{booking.latest_status}</span><br/>
                                            {booking.owner}<br/>
                                            {booking.shippers_ref}
                                        </td>
                                        <td>
                                            {booking.from}<br/>
                                            {booking.from_city}<br/>
                                            {booking.pickup}
                                        </td>
                                        <td>
                                            {booking.to}<br/>
                                            {booking.to_city}<br/>
                                            {booking.delivery}
                                        </td>
                                        <td>
                                            {booking.no_of_packages}<br/>
                                            {booking.total_weight}<br/>
                                            {booking.weight_unit}
                                        </td>
                                        <td>
                                            {booking.transport_service}<br/>
                                            {booking.sli}
                                        </td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={6}>No data</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer"></div>
        </div>;
    }
}

ReactDOM.render(<ShipperBookingList/>, document.getElementById('page_content'));