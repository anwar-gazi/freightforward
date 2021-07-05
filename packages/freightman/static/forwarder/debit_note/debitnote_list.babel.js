"use strict";


class DebitNoteList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            debitnote_list: [],
        };
        this.load_data();
    }

    load_data = () => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_debitnote_list,
            data: {},
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    debitnote_list: resp.data.debitnote_list,
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
                        {_this.state.debitnote_list.length ? (function () {
                                return _this.state.debitnote_list.map(debitnote => {
                                    return <tr key={debitnote.public_id}>
                                        <td><a href={debitnote.view_url}>view/edit</a></td>
                                        <td>{debitnote.mawb.public_id}</td>
                                        <td>{debitnote.public_id}</td>
                                        <td>{debitnote.to_who} {debitnote.hawb.hasOwnProperty('public_id') ? <span>HAWB #{debitnote.hawb.public_id}</span> : ''}</td>
                                        <td>{debitnote.to_address_dict.company_name}</td>
                                        <td>{debitnote.date}</td>
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