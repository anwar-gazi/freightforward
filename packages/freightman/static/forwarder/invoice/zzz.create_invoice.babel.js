"use strict";


class MAWBList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
        };
        // this.load_data();
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

    render() {
        let _this = this;
        return <div>
            <header>
                <h1 style="background: #828385;padding: 10px;margin-bottom: 10px;color: #ffffff;font-weight: 800;font-size: 16px;letter-spacing: 5px;">
                    Invoice</h1>
                <div className="header_info" style="display: flex;padding: 10px;">
                    <span className="logo_part" style="width: 33%;"><img src="/static/img/navana_logistics_logo.jpg" alt="logo" style="width: 150px;"></img></span>
                    <address style="width: 33%;">
                        <p>1/B Green Square</p>
                        <p>3rd Floor, Road No. 08, Gulshan-1</p>
                        <p>DHAKA</p>
                    </address>

                    <aside style="width: 33%;">
                        <p style="width: 100%;display: flex;"><b style="width: 25%;">Phone:</b> <span style="width: 75%;">017-XXX-XXXXX</span>
                        </p>
                        <p style="width: 100%;display: flex;"><b style="width: 25%;">Email:</b> <span style="width: 75%;">sales@navanalogistics.org</span>
                        </p>
                    </aside>

                </div>

            </header>

            <div className="invoice_info" style="display: flex;padding: 10px;">
                <aside style="width: 33%; padding: 0px 5px;">
                    <p style="width: 100%;display: flex;"><b style="width: 20%;">Bill To:</b> <span
                        style="width: 80%;">Astrotex</span></p>

                    <p style="width: 100%;display: flex;"><b style="width: 20%;">Address:</b> <span
                        style="width: 80%;">banani Dhaka, <br/>Dhaka, <br/>United Kingdom (UK) 1212</span>
                    </p>
                </aside>

                <aside style="width: 33%; padding: 0px 5px;">
                    <p style="width: 100%;display: flex;"><b style="width: 20%;">Phone:</b> <span
                        style="width: 80%;">0777</span></p>

                    <p style="width: 100%;display: flex;"><b style="width: 20%;">Mobile:</b> <span
                        style="width: 80%;">0777</span></p>

                    <p style="width: 100%;display: flex;"><b style="width: 20%;">Email:</b> <span
                        style="width: 80%;">khan@astrotex.com</span></p>
                </aside>

                <aside style="width: 33%; padding: 0px 5px;">
                    <p style="width: 100%;display: flex;"><b style="width: 28%;">Invoice #:</b> <span
                        style="width: 72%;">TEC000000071</span></p>
                    <p style="width: 100%;display: flex;"><b style="width: 28%;">Invoice Date:</b> <span
                        style="width: 72%;">Feb. 17, 2019</span></p>
                    <p style="width: 100%;display: flex;"><b style="width: 28%;">Contact:</b> <span
                        style="width: 72%;">Astra khan</span></p>
                    <p style="width: 100%;display: flex;"><b style="width: 28%;">MAWB NO:</b> <span
                        style="width: 72%;">997LCY11776940</span></p>
                    <p style="width: 100%;display: flex;"><b style="width: 28%;">HAWB NO:</b> <span
                        style="width: 72%;">NLL000000071</span></p>
                </aside>

            </div>

            <div className="shipper_info" style="display: flow-root;width: 100%;">
                <aside style="width: 50%;float: right;right: 0px;padding: 5px;">
                    <p style="width: 100%;display: flex;"><b style="width: 20%;">SHIPPER: </b> <span style="width: 80%;">ASTROTEX</span></p>

                </aside>
            </div>

            <aside style="padding: 10px;display: inline-block;width: -webkit-fill-available;">
                <div className="invoice_info" style="width: 66%; display: -webkit-inline-box;padding: 10px;float: right;">

                    <aside style="width: 50%; padding: 0px 5px;">
                        <p style="width: 100%;display: flex;"><b style="width: 33%;">SALES:</b> <span style="width: 67%;"></span>
                        </p>

                    </aside>

                    <aside style="width: 50%; padding: 0px 5px;">
                        <p style="width: 100%;display: flex;"><b style="width: 33%;">ORDER NO:</b> <span style="width: 67%;"></span>
                        </p>

                    </aside>

                </div>

            </aside>

            <aside className="body_table" style="margin-top: 10px;">
                <table style="width:100%; background: #f8f8f8;">
                    <thead>
                    <tr>
                        <th>Due date</th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th>Qty KG</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Total</th>

                    </tr>

                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </aside>

            <aside style="display: flex;">
                <div className="footer_left" style="width: 70%; padding: 10px 0px;">
                    <aside style="padding: 10px;">
                        <p>CURRENCY IN USD</p>
                    </aside>

                    <aside>
                        <table style="width:100%;">

                            <tbody>
                            <tr>
                                <td colSpan="3" style="text-align: right;">USD 1.00</td>
                                <td>BDT</td>
                                <td>82.4</td>

                            </tr>


                            <tr>
                                <td colSpan="3"><b>(SAY 0)</b></td>
                                <td><b>BDT</b></td>
                                <td><b>0</b></td>
                            </tr>

                            </tbody>
                        </table>

                        <p style="padding: 10px 10px;">MAKE ALL CHEQUES PAYABLE TO THE ASTROTEX.</p>
                        <p style="padding: 10px 10px;">TOTAL DUE IN 30 DAYS. OVERDUE ACCOUNTS ARE SUBJECT TO AN INTEREST CHARGE OF
                            2% PER MONTH.</p>

                    </aside>
                </div>
                <div className="footer_right" style="width: 30%; background: #fff; padding: 10px 0px;">
                    <table style="width:100%">
                        <tr>
                            <td><b>Invoice Subtotal</b></td>
                            <td>$0</td>

                        </tr>


                        <tr>
                            <td><b>Total</b></td>
                            <td><span>$0</span></td>
                        </tr>
                    </table>
                </div>
            </aside>
        </div>;
    }
}

ReactDOM.render(<MAWBList/>, document.getElementById('page_content'));