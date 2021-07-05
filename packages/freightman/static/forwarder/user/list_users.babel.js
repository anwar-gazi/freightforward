function Required() {
    return <i className="text-danger small">*</i>;
}

class FactoryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            org: {title: ''},
            user_list: [],
        };

        this.load_data();
    }

    // initial page data
    load_data = (sth) => {
        let _this = this;
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_init_data,
            data: null,
            dataType: 'json',
            success: function (resp) {
                _this.setState({
                    user_list: resp.data.user_list,
                    org: resp.data.org,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
            }
        });
    };

    render() {
        let _this = this;
        return <div className="container">
            <div className="text-center py-4 bg-success">
                <h2 className="">User List for {_this.state.org.title}</h2>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>Auth Level</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>view/edit</th>
                        <th>Password</th>
                    </tr>
                    </thead>
                    <tbody>
                    {_this.state.user_list.map(user => {
                        return <tr key={user.id}>
                            <td>{user.auth_level}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email}</td>
                            <td><a href={user.edit_url}>view/edit</a></td>
                            <td><a href={user.password_reset_url} title="" target="_blank">reset</a></td>
                        </tr>;
                    })}
                    </tbody>
                </table>
            </div>
        </div>;
    }
}

ReactDOM.render(<FactoryForm/>, document.getElementById('page_content'));