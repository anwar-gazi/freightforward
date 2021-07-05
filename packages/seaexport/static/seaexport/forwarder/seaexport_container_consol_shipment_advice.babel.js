"use strict";


class SeaExportContainerConsolidationShipmentAdvice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            container_consol_shipment_info_dict: {},
        };
        this.load_data(props.container_consol_public_id);
        window.react_component = this;
    }

    load_data = (container_consol_public_id) => {
        let _this = this;

        let loader = '';
        let spinner = '';
        spinner = jQuery('<div><i class="fa fa-spinner fa-spin"></i> Processing</div>');
        loader = window.modal_alert({content_html: ''});
        loader.append_html(spinner);
        jQuery.ajax({
            type: 'get',
            url: window.urlfor_get_container_consol_shipment_advice_info,
            data: {public_id: container_consol_public_id},
            dataType: 'json',
            success: function (resp) {
                if (resp.success) {
                    _this.setState({
                        container_consol_shipment_info_dict: resp.data.container_consol_shipment_info_dict
                    });
                    loader.append_html('<div class="text-success">Load Success</div>');
                    loader.close();
                } else {
                    _this.setState({
                        errors: resp.errors
                    });
                    loader.append_html('<div class="text-danger">Load Error</div>');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                _this.setState({
                    errors: [err]
                });
                loader.append_html('<div class="text-danger">{}</div>'.format(err));
            },
            complete: function (jqXHR, textStatus) {
                spinner.remove();
            }
        });
    };

    correct_width = () => {
        const $ = jQuery;
        $('th.po_number').width($('div.po_number').outerWidth());
        $('th.lot_count').width($('div.lot_count').outerWidth());
        $('th.ctn_count').width($('div.ctn_count').outerWidth());
        $('th.pallet_count').width($('div.pallet_count').outerWidth());
        $('th.cbm_count').width($('div.cbm').outerWidth());
        $('th.hbl_id').width($('div.hbl_id').outerWidth());
    };

    render() {
        let _this = this;
        return <div className="">
            <button className="cursor-pointer btn btn-sm btn-outline-secondary"
                    onClick={() => {
                        _this.setState({print_preview: true}, function () {
                            window.open_print_preview(jQuery('#shipment_advice'));
                        });
                    }}>
                <i className="fa fa-print"></i>
            </button>
            <a className="btn btn-sm btn-outline-secondary" href={window.urlfor_shipment_advice_csv} target="_blank" title="download csv"><i className="fa fa-download"></i></a>

            <div id="shipment_advice">
                <h4 className="text-center my-4 text-uppercase">Loading Details for {_this.state.container_consol_shipment_info_dict.consignee} Dest
                    to {_this.state.container_consol_shipment_info_dict.mother_arrival_city}</h4>
                <table className="my-2">
                    <tbody className="table-bordered">
                    <tr>
                        <td className="bg-lightgrey" style={{'width': '150px'}}></td>
                        <td className="padding-5p text-center px-4">{moment().format("MMM D YYYY")}</td>
                    </tr>
                    <tr>
                        <td className="whitespace-nr padding-5p"><h4>Shipment Details</h4></td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
                <div className="row">
                    <div className="col-12">
                        <table className="table table-bordered">
                            <thead className="small">
                            <tr className="" style={{'fontSize': '1.3em'}}>
                                <th className="min-width-200px whitespace-nr text-center bg-lightergrey" >Container Number</th>
                                <th className="min-width-200px whitespace-nr text-center bg-lightergrey">Size</th>
                                <th className="min-width-200px whitespace-nr text-center bg-lightergrey">Seal No</th>
                                <th className="min-width-200px whitespace-nr text-center bg-lightergrey">Shipper</th>
                                <th className="min-width-200px whitespace-nr text-center bg-lightergrey">Consignee</th>
                                <th className="min-width-200px po_number whitespace-nr text-center bg-lightergrey">PO NO</th>
                                <th className="min-width-200px lot_count whitespace-nr text-center bg-lightergrey">LOT</th>
                                <th className="min-width-200px ctn_count whitespace-nr text-center bg-lightergrey">CTNS</th>
                                <th className="min-width-200px pallet_count whitespace-nr text-center bg-lightergrey">Pallet</th>
                                <th className="min-width-200px cbm_count whitespace-nr text-center bg-lightergrey">cbm</th>
                                <th className="min-width-300px hbl_id whitespace-nr text-center bg-lightergrey">HBL No</th>
                            </tr>
                            </thead>
                            {_this.state.container_consol_shipment_info_dict.hasOwnProperty('container_info_list') ?
                                <tbody>
                                {
                                    _this.state.container_consol_shipment_info_dict.container_info_list.map((container, i) => {
                                        return <tr key={i}>
                                            <td className="whitespace-nr text-center" style={{verticalAlign: 'middle'}}>{container.container_no}</td>
                                            <td className="whitespace-nr text-center" style={{verticalAlign: 'middle'}}>{container.size}</td>
                                            <td style={{verticalAlign: 'middle'}}>{container.seal_no}</td>
                                            <td className="whitespace-nr text-center" style={{verticalAlign: 'middle'}}>{container.shipper}</td>
                                            <td className="whitespace-nr text-center" style={{verticalAlign: 'middle'}}>{container.consignee}</td>
                                            <td colSpan={6}>
                                                {container.hbl_list.map((hbl, hbl_i) => {
                                                    let midindex = 0;
                                                    if (container.hbl_list.length > 2) {
                                                        midindex = Math.floor(container.hbl_list.length / 2);
                                                    }
                                                    return <div className="row" key={hbl_i} style={{border: '1px solid'}}>
                                                        <div className="col-10">
                                                            {hbl.goods_info_list.map((gi, gi_i) => {
                                                                return <div className="row" key={gi_i}>
                                                                    <div className="col text-center po_number"
                                                                         style={{border: '0 1px solid'}}>{gi.po_number_list.join(',')}</div>
                                                                    <div className="col text-center lot_count"
                                                                         style={{border: '0 1px solid'}}>{hbl_i === midindex ? hbl.lot_number : ''}</div>
                                                                    <div className="col text-center ctn_count"
                                                                         style={{border: '0 1px solid'}}>{gi.no_of_ctns}</div>
                                                                    <div className="col text-center pallet_count"
                                                                         style={{border: '0 1px solid'}}>{hbl_i === midindex ? hbl.no_of_pallet : ''}</div>
                                                                    <div className="col text-center cbm"
                                                                         style={{border: '0 1px solid'}}>{gi.cbm}</div>
                                                                </div>;
                                                            })}
                                                        </div>
                                                        <div className="col-2 whitespace-nr text-center hbl_id" style={{border: '0 1px solid'}}>{hbl.public_id}</div>
                                                    </div>;
                                                })}
                                            </td>
                                        </tr>;
                                    })
                                }
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="text-center">{_this.state.container_consol_shipment_info_dict.carton_total}</td>
                                    <td className="text-center">{_this.state.container_consol_shipment_info_dict.pallet_total}</td>
                                    <td className="text-center">{_this.state.container_consol_shipment_info_dict.cbm_total}</td>
                                    <td></td>
                                </tr>
                                </tbody>
                                : <tbody>
                                <tr>
                                    <td colSpan={11}></td>
                                </tr>
                                </tbody>
                            }
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <table className="table table-bordered" style={{'width': '600px'}}>
                            <tbody>
                            <tr>
                                <th style={{'width': '250px'}} className="bg-lightgrey">F. VSL/VOY</th>
                                <td>{_this.state.container_consol_shipment_info_dict.feeder_vessel_name} {_this.state.container_consol_shipment_info_dict.feeder_vessel_voyage_number}</td>
                            </tr>
                            <tr>
                                <th className="bg-lightgrey">ETD {_this.state.container_consol_shipment_info_dict.feeder_departure_city}</th>
                                <td>{_this.state.container_consol_shipment_info_dict.feeder_etd}</td>
                            </tr>
                            <tr>
                                <th className="bg-lightgrey">ETA {_this.state.container_consol_shipment_info_dict.feeder_arrival_city}</th>
                                <td>{_this.state.container_consol_shipment_info_dict.feeder_eta}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col">
                        <table className="table table-bordered" style={{'width': '600px'}}>
                            <tbody>
                            <tr>
                                <th style={{'width': '250px'}} className="bg-lightgrey">M. VSL/VOY</th>
                                <td>{_this.state.container_consol_shipment_info_dict.mother_vessel_name} {_this.state.container_consol_shipment_info_dict.mother_vessel_voyage_number}</td>
                            </tr>
                            <tr>
                                <th className="bg-lightgrey">ETD {_this.state.container_consol_shipment_info_dict.mother_departure_city}</th>
                                <td>{_this.state.container_consol_shipment_info_dict.mother_etd}</td>
                            </tr>
                            <tr>
                                <th className="bg-lightgrey">ETA {_this.state.container_consol_shipment_info_dict.mother_arrival_city}</th>
                                <td>{_this.state.container_consol_shipment_info_dict.mother_eta}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }
}