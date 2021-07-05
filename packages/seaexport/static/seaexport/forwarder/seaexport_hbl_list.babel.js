"use strict";


class SeaExportHBLList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            hbl_list: [],
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
            url: window.urlfor_hbl_list,
            data: {page: page},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    hbl_list: resp.data.hbl_list,
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

    delete_job = (hbl_public_id) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        loader.hide_ok();
        let tpl = $('<div><p class="mb-4">Deleting this HBL may have unwanted side effects. Any other data associated with this HBL will be removed.</p>' +
            '<div class=""><button class="btn btn-danger mr-4" id="confirm">Confirm Delete</button><button class="btn btn-success" id="cancel">Cancel</button></div>' +
            '</div>');
        tpl.find('#confirm').click(function () {
            jQuery.ajax({
                type: 'get',
                url: window.urlfor_delete_job,
                data: {public_id: hbl_public_id},
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
        loader.set_header('<div class="py-4 text-center bg-danger"><h4>Delete This HBL?</h4></div>');
        loader.append_html(tpl);
    };

    job_dates_popup = (hawb_public_id) => {
        const _this = this;
        const $ = jQuery;
        let tpl = $($('#job_dates_tpl').html());
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_job_dates,
            data: {public_id: hawb_public_id},
            dataType: 'json',
            success: function (resp) {
                tpl.find('#received_estimated').val(resp.data.received_at_estimated);
                tpl.find('#received_actual').val(resp.data.received_at_actual);

                let loader = window.modal_alert();
                loader.set_header('<div class="text-center py-4 bg-success"><h4>' + hawb_public_id + ' Dates</h4></div>');
                loader.append_html(tpl);
                loader.upon_ok = function (dom) {
                    const received_estimated = dom.find('#received_estimated').val();
                    const received_actual = dom.find('#received_actual').val();
                    jQuery.ajax({
                        type: 'get',
                        url: window.urlfor_date_update,
                        data: {hbl_public_id: hawb_public_id, received_estimated: received_estimated, received_actual: received_actual},
                        dataType: 'json',
                        success: function (resp) {
                            loader.close();
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
                };
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
    };

    previous_page = () => {
        this.load_data(this.state.pagination.page - 1, true);
    };
    next_page = () => {
        this.load_data(this.state.pagination.page + 1, true);
    };

    render() {
        let _this = this;
        return <div className="container">
            <div className="text-center py-4 bg-success">
                <h2 className="">HBL Listing</h2>
            </div>
            <div className="card">
                <div className="card-header">
                    {_this.state.hbl_list.length} HBL
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="small">
                            <tr>
                                <th style={{verticalAlign: 'top'}}>
                                    action
                                </th>
                                <th>Latest Status</th>
                                <th>
                                    <span className="whitespace-nr">B/L number</span>
                                </th>
                                <th>
                                    <span className="whitespace-nr">Booking ID</span>
                                </th>
                                <th>
                                    Shipper<br/>
                                    Consignee
                                </th>
                                <th>
                                    <span className="whitespace-nr">No of containers</span><br/>
                                    <span className="whitespace-nr">Total Weight</span><br/>
                                    <span className="whitespace-nr">CBM</span>
                                </th>
                                <th>Entry at</th>
                                <th>Progress bar</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.hbl_list.length ? (function () {
                                    return _this.state.hbl_list.map(hbl => {
                                        let status = '';
                                        if (hbl.is_consolidated) {
                                            status = <div><span className="badge badge-success small">consolidated</span></div>;
                                        } else {
                                            status = <div><span className="badge badge-danger small">not consolidated</span></div>;
                                        }
                                        let progresslist = [
                                            {
                                                label: 'consolidated',
                                                done: hbl.is_consolidated
                                            },
                                            {
                                                label: 'invoice',
                                                done: hbl.has_invoice
                                            },
                                            {
                                                label: 'job costing',
                                                done: hbl.has_job_costing
                                            },
                                            {
                                                label: 'shipment sent',
                                                done: hbl.shipment_sent
                                            },
                                            {
                                                label: 'shipment complete',
                                                done: hbl.shipment_received_by_buyer
                                            },
                                        ];
                                        return <tr key={hbl.public_id}>
                                            <td className="whitespace-nr">
                                                <button className="btn btn-outline-secondary btn-sm mr-2" onClick={() => {
                                                    _this.job_dates_popup(hbl.public_id);
                                                }} title="edit milestone dates"><i className="fa fa-calendar-check small"></i>
                                                </button>

                                                {hbl.is_consolidated ? <button className="btn btn-outline-danger mr-2 bg-secondary" onClick={() => {
                                                        window.modal_alert().append_html('<div class="text-danger">Cannot edit now. The HBL is consolidated</div>');
                                                    }}><i className="fa fa-pencil-alt small"></i></button>
                                                    :
                                                    <a className="btn btn-outline-secondary btn-sm mr-2" href={hbl.hbl_edit_url} title="edit"><i className="fa fa-pencil-alt small"></i></a>}
                                                <a className=" btn btn-outline-secondary btn-sm mr-2" href={hbl.hbl_copy_url} title="copy"><i className="fa fa-copy small"></i></a>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                                                    _this.delete_job(hbl.public_id);
                                                }} title="Delete"><i className="fa fa-trash small"></i>
                                                </button>
                                            </td>
                                            <td>
                                                {status}
                                            </td>
                                            <td><span className="whitespace-nr">{hbl.public_id}</span></td>
                                            <td><span className="whitespace-nr">{hbl.booking_public_id}</span></td>
                                            <td>
                                                <span className="whitespace-nr">{hbl.shipper.company_name}</span><br/>
                                                <span className="whitespace-nr">{hbl.consignee.company_name}</span><br/>
                                            </td>
                                            <td>
                                                {hbl.container_list.length}<br/>
                                                {hbl.goods_gross_weight_kg} KG<br/>
                                                <span className="whitespace-nr">{hbl.goods_cbm}</span>
                                            </td>
                                            <td><span className="whitespace-nr">{hbl.entry_at}</span></td>
                                            <td>
                                                {progress_list_jsx(progresslist)}
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
                    <div>
                        <div className="small">
                            {_this.state.hbl_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
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