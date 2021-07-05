"use strict";


class SeaExportContainerConsolidationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            consol_list: [],
            pagination: {}
        };
        this.load_data();
        window.react_component = this;
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
            url: window.urlfor_get_container_consol_list,
            data: {page: page},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    _this.setState({
                        consol_list: resp.data.container_consolidation_list,
                        pagination: resp.data.pagination
                    });
                    if (show_loader) {
                        loader.append_html('<div class="text-success">Load Success</div>');
                    }
                } else {
                    if (show_loader) {
                        loader.append_html('<div class="text-danger">Load Error</div>');
                    }
                }
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
        return <div>
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="small">
                            <tr>
                                <th>action</th>
                                <th>Shipment Number</th>
                                <th>Supplier</th>
                                <th>Shipper</th>
                                <th>Consignee</th>
                                <th>Number of Container</th>
                            </tr>
                            </thead>
                            <tbody>
                            {_this.state.consol_list.map((consol, i) => {
                                return <tr key={i}>
                                    <td><a className="btn btn-secondary" href={consol.view_url} target="_blank"><i className="fa fa-external-link-alt small"></i> shipment advice</a>
                                    </td>
                                    <td>{consol.public_id}</td>
                                    <td>{consol.supplier}</td>
                                    <td>{consol.shipper}</td>
                                    <td>{consol.consignee}</td>
                                    <td>{consol.container_info_list.length}</td>
                                </tr>;
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="small my-4">
                        <div>
                            {_this.state.pagination.page == 1 ?
                                <button className="btn btn-sm btn-outline-secondary px-4" disabled={true}><i className="fa fa-caret-left"></i></button>
                                : <button className="btn btn-sm btn-outline-secondary px-4" onClick={_this.previous_page}><i className="fa fa-caret-left"></i></button>}

                            <span className="mx-2">Showing page {_this.state.pagination.page} of {_this.state.pagination.number_of_page}</span>
                            {_this.state.pagination.page == _this.state.pagination.number_of_page ?
                                <button className="btn btn-sm btn-outline-secondary px-4" disabled={true}><i className="fa fa-caret-right"></i></button>
                                : <button className="btn btn-sm btn-outline-secondary px-4" onClick={_this.next_page}><i className="fa fa-caret-right"></i></button>}
                        </div>
                        <div className="mt-2">
                            {_this.state.consol_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
                        </div>
                    </div>
                </div>
                <div className="card-footer"></div>
            </div>
        </div>;
    }
}