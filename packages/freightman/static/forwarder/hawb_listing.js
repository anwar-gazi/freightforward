"use strict";


class HAWBList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            hawb_list: [],
            type: '',
            pagination: {},

            search_needle: ''
        };
        this.load_data();

        window.hawblist_context = this;
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
            url: window.urlfor_hawb_list,
            data: {page: page, needle: needle},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    hawb_list: resp.data.hawb_list,
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

    delete = (delete_url) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        loader.hide_ok();
        let tpl = $('<div><p class="mb-4">Deleting this HAWB may have unwanted side effects. Any other data associated with this will be removed.</p>' +
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
        loader.set_header('<div class="py-4 text-center bg-danger"><h4>Delete This HAWB?</h4></div>');
        loader.append_html(tpl);
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
                            <th className="text-center" style={{verticalAlign: 'top'}}>
                                HAWB ID
                            </th>
                            <th className="text-center">
                                Shipper<br/>
                                Consignee
                            </th>
                            <th className="text-center" style={{verticalAlign: 'top'}}>Consolidation status</th>
                            <th>
                                entry date<br/>
                                execute date
                            </th>
                            <th className="text-center" style={{verticalAlign: 'top'}}>
                                action
                            </th>
                            <th className="text-center" style={{verticalAlign: 'top'}}>
                                operation
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.hawb_list.length ? (function () {
                                return _this.state.hawb_list.map(hawb => {
                                    return <tr key={hawb.public_id}>
                                        <td className="whitespace-nr">{hawb.public_id}</td>
                                        <td>
                                            <span className="whitespace-nr">{hawb.shipper_name}</span><br/>
                                            <span className="whitespace-nr">{hawb.consignee_name}</span>
                                        </td>
                                        <td>
                                            {hawb.is_consolidated ? <span className="badge badge-success">consolidated</span> :
                                                <span className="badge badge-danger">not consolidated</span>}
                                        </td>
                                        <td>
                                            <span className="whitespace-nr">{hawb.entry_at}</span><br/>
                                            <span className="whitespace-nr">{hawb.executed_on}</span>
                                        </td>
                                        <td className="whitespace-nr">
                                            <a className="btn btn-warning mr-2" href={hawb.edit_url}><i className="fa fa-edit small"></i> edit</a>
                                            <a className="btn btn-warning mr-2" href={hawb.copy_url}><i className="fa fa-copy small"></i> copy</a>
                                            <button className="btn btn-warning mr-2" onClick={() => {
                                                _this.delete(hawb.delete_url);
                                            }}><i className="fa fa-trash small"></i> delete
                                            </button>
                                        </td>
                                        <td className="whitespace-nr">
                                            <button className="btn btn-warning mr-2" onClick={() => {
                                                _this.job_dates_popup(hawb.public_id);
                                            }}><i className="fa fa-calendar-check small"></i> dates
                                            </button>
                                            <a className="btn btn-secondary mr-2" href={hawb.dummy_print_url} target="_blank"><i
                                                className="fa fa-external-link-alt small"></i> dummy</a>
                                            <a className="btn btn-success" href={hawb.main_print_url} target="_blank"><i className="fa fa-external-link-alt small"></i> print</a>
                                        </td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={2}>No data</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                </div>
                <div>
                    <div className="small">
                        {_this.state.hawb_list.length} entries in this page, total {_this.state.pagination.total_entry} entries available.
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

