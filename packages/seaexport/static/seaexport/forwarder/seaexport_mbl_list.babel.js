"use strict";


class SeaExportMBLList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            mbl_list: [],
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
            url: window.urlfor_mbl_list,
            data: {page: page},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    mbl_list: resp.data.mbl_list,
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

    delete_job = (mbl_public_id) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        loader.hide_ok();
        let tpl = $('<div><p class="mb-4">Deleting this MBL may have unwanted side effects. Any other data associated with this mbl will be removed.</p>' +
            '<div class=""><button class="btn btn-danger mr-4" id="confirm">Confirm Delete</button><button class="btn btn-success" id="cancel">Cancel</button></div>' +
            '</div>');
        tpl.find('#confirm').click(function () {
            jQuery.ajax({
                type: 'get',
                url: window.urlfor_delete_job,
                data: {public_id: mbl_public_id},
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
        loader.set_header('<div class="py-4 text-center bg-danger"><h4>Delete This mbl?</h4></div>');
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
                        data: {mbl_public_id: hawb_public_id, received_estimated: received_estimated, received_actual: received_actual},
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
                <h2 className="">MBL Listing</h2>
            </div>
            <div className="card">
                <div className="card-header">
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="small">
                            <tr>
                                <th style={{verticalAlign: 'top'}}>action</th>
                                <th>Latest Status</th>
                                <th><span className="whitespace-nr">B/L number</span></th>
                                <th>Shipper</th>
                                <th>Consignee</th>
                                <th>
                                    <span className="whitespace-nr">No of HBL</span><br/>
                                    <span className="whitespace-nr">Total Weight</span><br/>
                                    <span className="whitespace-nr">CBM</span>
                                </th>
                                <th>Milestone Completion</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.mbl_list.length ? (function () {
                                    return _this.state.mbl_list.map(mbl => {
                                        let status = '';
                                        if (mbl.is_consolidated) {
                                            status = <div><span className="badge badge-success small">consolidated</span></div>;
                                        } else {
                                            status = <div><span className="badge badge-danger small">not consolidated</span></div>;
                                        }
                                        let progresslist = [
                                            {
                                                label: 'consolidated',
                                                done: mbl.is_consolidated
                                            },
                                            {
                                                label: 'invoice',
                                                done: mbl.has_invoice
                                            },
                                            {
                                                label: 'job costing',
                                                done: mbl.has_job_costing
                                            },
                                            {
                                                label: 'shipment sent',
                                                done: mbl.shipment_sent
                                            },
                                            {
                                                label: 'shipment complete',
                                                done: mbl.shipment_received_by_buyer
                                            },
                                        ];
                                        return <tr key={mbl.public_id}>
                                            <td className="whitespace-nr">
                                                <button className="btn btn-outline-secondary btn-sm mr-2" onClick={() => {
                                                    _this.job_dates_popup(mbl.public_id);
                                                }} title="edit milestone dates"><i className="fa fa-calendar-check small"></i>
                                                </button>

                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                                                    _this.delete_job(mbl.public_id);
                                                }} title="Delete"><i className="fa fa-trash small"></i>
                                                </button>
                                            </td>
                                            <td>
                                                {status}
                                            </td>
                                            <td><span className="whitespace-nr">{mbl.mbl_number}</span></td>
                                            <td><span className="whitespace-nr">{mbl.shipper.company_name}</span></td>
                                            <td><span className="whitespace-nr">{mbl.consignee.company_name}</span></td>
                                            <td>
                                                {mbl.hbl_list.length}<br/>
                                                {mbl.goods_gross_weight_kg} KG<br/>
                                                <span className="whitespace-nr">{mbl.goods_cbm}</span>
                                            </td>
                                            <td>
                                                {progress_list_jsx(progresslist)}
                                            </td>
                                        </tr>;
                                    });
                                }())
                                : <tr>
                                    <td colSpan={7} className="text-center text-danger">No data available</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="small">
                            {_this.state.mbl_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
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