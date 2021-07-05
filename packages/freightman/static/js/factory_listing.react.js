"use strict";

class FactoryListing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shipper_list: []
        };
        this.load_shippers();
    }

    load_shippers = (sth) => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_shipper_list,
            data: null,
            dataType: 'json',
            success: function (resp) {
                _this.setState({shipper_list: resp.data.shipper_list});
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occured! {}'.format(textStatus, errorThrown);

            }
        });
    };

    view_users = (user_list) => {
        console.dir(user_list);
        let loader = window.modal_alert();
        let user_selection = jQuery(user_list.map(user => '<div class="text-secondary"><a href="' + user.view_edit_url + '" target="_blank">(' + user.auth_level_name + ')' + user.firstname + ' ' + user.lastname + ' (' + user.email + ')</a></div>').join(''));
        loader.append_html(user_selection);
    };

    render() {
        let _this = this;
        return <div className="container">
            <div className="text-center py-4 bg-success">
                <h2 className="">Supplier List</h2>
            </div>
            <div className="card">
                <div className="card-body">
                    {_this.state.shipper_list.length ?
                        <table id="bootstrap-data-table" className="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Users</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {(function () {
                                return _this.state.shipper_list.map((shipper) => {
                                        return <tr key={shipper.id}>
                                            <td className=""><a href={shipper.view_url}>{shipper.title}</a></td>
                                            <td className="cursor-pointer" onClick={() => {
                                                if (shipper.user_list.length) {
                                                    _this.view_users(shipper.user_list);
                                                } else {
                                                    window.modal_alert({content_html: '<div class="text-danger">No users found</div>'});
                                                }
                                            }}>{shipper.user_count}
                                            </td>
                                            <td className="cursor-pointer"><a href={shipper.add_user_url}>add user</a></td>
                                        </tr>;
                                    }
                                );
                            }())}
                            </tbody>
                        </table>
                        :
                        <div>No Shipper found in database</div>
                    }
                </div>
            </div>
        </div>;
    }
}

