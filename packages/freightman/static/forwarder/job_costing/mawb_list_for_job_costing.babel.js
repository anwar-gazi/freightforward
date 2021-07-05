"use strict";


class MAWBJobCostingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            consol_list: [],
            pagination: {},

            search_needle: ''
        };
        this.load_data();

        window.consoljobcostinglist_context = this;
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
            url: window.urlfor_consol_list,
            data: {page: page, needle: needle},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    consol_list: resp.data.consol_list,
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
                            <th className="text-center" style={{verticalAlign: 'top'}}>Master</th>
                            <th className="text-center" style={{verticalAlign: 'top'}}>Has Job Costing</th>
                            <th className="text-center" style={{verticalAlign: 'top'}}>action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.consol_list.length ? (function () {
                                return _this.state.consol_list.map(consol => {
                                    return <tr key={consol.public_id}>
                                        <td className="whitespace-nr text-center">{consol.public_id}</td>
                                        <td className="whitespace-nr text-center">{consol.has_job_costing ? <i className="fa fa-check text-success"></i> :
                                            <i className="fa fa-times text-danger"></i>}
                                        </td>
                                        <td><a href={consol.load_url} className="btn btn-sm btn-warning">load</a></td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={4}>No data</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                </div>
                <div>
                    <div className="small">
                        {_this.state.consol_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
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

