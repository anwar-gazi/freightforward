"use strict";


class CreditNoteList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            creditnote_list: [],
        };
        this.load_data();
    }

    load_data = () => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_creditnote_list,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    creditnote_list: resp.data.creditnote_list,
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
                            <th></th>
                            <th>MAWB</th>
                            <th>
                                Invoice ID
                            </th>
                            <th>Type</th>
                            <th>
                                To
                            </th>
                            <th>
                                Date
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {_this.state.creditnote_list.length ? (function () {
                                return _this.state.creditnote_list.map(creditnote => {
                                    return <tr key={creditnote.public_id}>
                                        <td><a href={creditnote.view_url}>view/edit</a></td>
                                        <td>{creditnote.mawb.public_id}</td>
                                        <td>{creditnote.public_id}</td>
                                        <td>{creditnote.to_who} {creditnote.hawb.hasOwnProperty('public_id') ? <span>HAWB #{creditnote.hawb.public_id}</span> : ''}</td>
                                        <td>{creditnote.to_address_dict.company_name}</td>
                                        <td>{creditnote.date}</td>
                                    </tr>;
                                });
                            }())
                            : <tr>
                                <td colSpan={6}>
                                    <div className="text-center red">No data</div>
                                </td>
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