"use strict";


class ConsolShipmentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            consol_list: [],
            type: '',
            pagination: {},

            search_needle: ''
        };
        this.load_data();

        window.consollist_context = this;
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
            url: window.urlfor_shipment_list,
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
                        data: {hawb_public_id: hawb_public_id, received_estimated: received_estimated, received_actual: received_actual},
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
        return <div className="card">
            <div className="card-header">

            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <div className="float-right">
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
                            <th style={{verticalAlign: 'top'}}>action</th>
                            <th>Date</th>
                            <th>MAWB</th>
                            <th>HAWB</th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.consol_list.length ? (function () {
                                return _this.state.consol_list.map(consol => {
                                    return <tr key={consol.public_id}>
                                        <td>
                                            <a className="btn btn-sm btn-outline-secondary" href=""><i className="fa fa-pencil-alt small"></i></a>
                                            <button className="btn btn-sm btn-outline-secondary "><i className="fa fa-trash small"></i></button>
                                        </td>
                                        <td>{consol.created_at}</td>
                                        <td>{consol.mawb_number}</td>
                                        <td>{consol.hawb_public_id_list.join(',')}</td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={2}>listing empty</td>
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