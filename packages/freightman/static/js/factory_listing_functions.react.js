function ShipperDetail(props) {
    let factory = props.factory;
    return <div className="animated fadeIn">
        <div className="row">
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <strong className="card-title">{factory.title}</strong>
                    </div>
                    <div className="card-body">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <a href="#"> <i className="fa fa-envelope-o"></i> Mail Inbox <span className="badge badge-primary pull-right">10</span></a>
                            </li>
                            <li className="list-group-item">
                                <a href="#"> <i className="fa fa-tasks"></i> Recent Activity <span className="badge badge-danger pull-right">15</span></a>
                            </li>
                            <li className="list-group-item">
                                <a href="#"> <i className="fa fa-bell-o"></i> Notification <span className="badge badge-success pull-right">11</span></a>
                            </li>
                            <li className="list-group-item">
                                <a href="#"> <i className="fa fa-comments-o"></i> Message <span className="badge badge-warning pull-right r-activity">03</span></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}