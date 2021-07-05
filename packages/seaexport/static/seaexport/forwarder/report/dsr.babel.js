"use strict";


class DSR extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            report_date: '',
            dsr_data: [],
            pagination: {},

            search_needle: ''
        };
        this.load_data();

        window.consoljobcostinglist_context = this;
    }

    load_data = (page, needle) => {
        let _this = this;
        let loader = '';
        let spinner = '';
        spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_dsr_page_init_data,
            data: {page: page, needle: needle, report_date: _this.state.report_date},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    report_date: resp.data.report_date,
                    dsr_data: resp.data.listing,
                    pagination: resp.data.pagination,
                });
                loader.close();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                loader.append_html('<div>Load Complete</div>');
                spinner.remove();
            }
        });
    };

    onchange_date = (event) => {
        const _this = this;
        _this.setState({
            report_date: event.target.value
        }, function () {
            _this.load_data();
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
        return <div>
            <div className="bg-success py-4">
                <h2 className="text-center">Daily Status Report {_this.state.report_date ? moment(_this.state.report_date).format('D MMM YYYY') : '(No date selected)'}</h2>
            </div>
            <div className="card">
                <div className="card-header">
                    <button className="btn btn-sm btn-secondary float-right" onClick={() => {
                        jQuery('#page_content').printThis();
                    }}><i className="fa fa-print"></i></button>
                    <div className="clearfix"></div>
                </div>
                <div className="card-body">
                    <div>
                        <input className="float-right" type="date" value={_this.state.report_date} onChange={_this.onchange_date}/>
                        <div className="clearfix"></div>
                    </div>
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
                                    _this.load_data(null, _this.state.search_needle);
                                }}>search
                                </button>
                            </div>
                        </div>
                        <table className="table table-bordered table-striped">
                            <thead className="small">
                            <tr>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Job</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Supplier</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Consignee</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>PO Number</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Weight(KG)</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Volume(CBM)</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Destination</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Status</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Edtimated date</th>
                                <th className="text-center" style={{verticalAlign: 'top', fontSize: '1.2em'}}>Actual Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.dsr_data.length ? (function () {
                                    return _this.state.dsr_data.map(row => {
                                        return <tr key={row.job_id}>
                                            <td className="whitespace-nr">{row.job_id}</td>
                                            <td className="whitespace-nr">{row.supplier}</td>
                                            <td className="whitespace-nr">{row.consignee}</td>
                                            <td className="whitespace-nr">{row.po_number}</td>
                                            <td className="whitespace-nr">{row.weight}</td>
                                            <td className="whitespace-nr">{row.volume_cbm}</td>
                                            <td className="whitespace-nr">{row.destination}</td>
                                            <td className="whitespace-nr">{row.status}</td>
                                            <td className="whitespace-nr">{row.estimated_receive_date}</td>
                                            <td className="whitespace-nr">{row.actual_receive_date}</td>
                                        </tr>;
                                    });
                                }())
                                : <tr>
                                    <td colSpan={10} className="text-center">No data</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="small">
                            {_this.state.dsr_data.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
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
        </div>;
    }
}

