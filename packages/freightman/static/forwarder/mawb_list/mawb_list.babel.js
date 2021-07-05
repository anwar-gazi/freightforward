"use strict";


class MAWBList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            mawb_list: [],
        };
        this.load_data();
    }

    load_data = () => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_mawb_list,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    mawb_list: resp.data.mawb_list,
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
                                    _this.load_data();
                                    loader.append_html('<div class="text-success">Success.</div>');
                                    loader.append_html(resp.msg.map(msg => '<div class="text-success">{}</div>'.format(msg)).join(''));
                                    loader.upon_close = function () {
                                        window.location.href = window.urlfor_confirmed_bookinglist_page;
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

    delete = (delete_url) => {
        const _this = this;
        const $ = jQuery;
        let loader = window.modal_alert();
        loader.hide_ok();
        let tpl = $('<div><p class="mb-4">Deleting this MAWB may have unwanted side effects. Any other data associated with this will be removed.</p>' +
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
        loader.set_header('<div class="py-4 text-center bg-danger"><h4>Delete This MAWB?</h4></div>');
        loader.append_html(tpl);
    };

    render() {
        let _this = this;
        return <div className="card">
            <div className="card-header">
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="small">
                        <tr>
                            <th>Action</th>
                            <th>ID</th>
                            <th>
                                Latest Status
                            </th>
                            <th>
                                Shipper
                            </th>
                            <th>
                                Consignee
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.mawb_list.length ? (function () {
                                return _this.state.mawb_list.map(mawb => {
                                    return <tr key={mawb.public_id}>
                                        <td>
                                            <a className="btn btn-sm btn-outline-secondary" href={mawb.edit_url} title="edit"><i className="fa fa-pencil-alt small"></i></a>
                                            {/*<a className="btn btn-sm btn-outline-secondary" href={mawb.copy_url} title="copy to create another"><i className="fa fa-copy small"></i></a>*/}
                                            <button className="btn btn-sm btn-outline-secondary" title="delete" onClick={() => {
                                                _this.delete(mawb.public_id);
                                            }}><i className="fa fa-trash small"></i></button>
                                        </td>
                                        <td>
                                            {mawb.mawb_number}
                                        </td>
                                        <td>
                                            {mawb.is_consolidated ?
                                                <span className="badge badge-info small">consolidated</span>
                                                : <span className="badge badge-danger small">not consolidated</span>}
                                        </td>
                                        <td>
                                            {mawb.shipper_name}
                                        </td>
                                        <td>
                                            {mawb.consignee_name}
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

ReactDOM.render(<MAWBList/>, document.getElementById('page_content'));