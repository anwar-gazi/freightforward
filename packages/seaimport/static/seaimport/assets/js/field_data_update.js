String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

$(document).ready(function () {
    var sea_import_absolute_uri = window.absoluteurl_api_seaimport;

    // mbl shipper list update
    $("select[name='mbl_shipper']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/mbl_shippers",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                });

            }
        });
    });

    // HBL Consignor list update
    $("select[name='hbl_consignor']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/hbl_consignor",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                });

            }
        });
    });

    // HBL Bank list update
    $("select[name='hbl_bank']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/hbl_bank",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                });

            }
        });
    });

    // HBL Importer list update
    $("select[name='hbl_notifier']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/hbl_notifier",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+", "+d.branch+"</option>"));
                });

            }
        });
    });


    // Goods Type list update
    $("select[id='id_goods_type']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/goods_type",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.type+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.type+"</option>"));
                });

            }
        });
    });


    // Package Type list update
    $("select[id='id_package_type']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/package_type",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+"</option>"));
                });

            }
        });
    });


    // Container Type list update
    $("select[id='id_container_size_type']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/container_size_type",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+"</option>"));
                });

            }
        });
    });


    // Port of Loading list update
    $("select[id='id_port_of_loading']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/port_of_loading",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+"</option>"));
                    else
                        field.append($("<option value='{}'>{} ({} - {})</option>".format(d.id,d.name, d.city, d.country)));
                });


            }
        });
    });


    // Port of Discharge list update
    $("select[id='id_port_of_discharge']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/port_of_discharge",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+"</option>"));
                    else
                        field.append($("<option value='{}'>{} ({} - {})</option>".format(d.id,d.name, d.city, d.country)));
                });

            }
        });
    });


    // Freight of Type list update
    $("select[id='id_freight_type']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/freight_type",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='{}'>{}</option>".format(d.id,d.name)));
                    else
                        field.append($("<option value='{}'>{}</option>".format(d.id,d.name)));
                });

            }
        });
    });


    // Company Name list update
    $("select[id='id_company_name']").on('mousedown', function () {
        var field = $(this);
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/companies",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    field.append($("<option value='"+d.id+"'>"+d.name+"</option>"));
                });

            }
        });
    });


    // Company Name list update
    $("select[id='id_city']").on('mousedown', function () {
        var field = $(this);
        var selected = $(this).children("option:selected").val();
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/cities",
            success:function (data) {
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    if (d.id == selected)
                        field.append($("<option selected value='"+d.id+"'>"+d.name+"("+d.country+")"+"</option>"));
                    else
                        field.append($("<option value='"+d.id+"'>"+d.name+"("+d.country+")"+"</option>"));
                });

            }
        });
    });

    // Company Name list update
    $("select[id='id_country']").on('mousedown', function () {
        var field = $(this);
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/countries",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\" selected=\"\">---------</option>"));
                data.forEach(function (d) {
                    field.append($("<option value='"+d.id+"'>"+d.name+"</option>"));
                });

            }
        });
    });


    // Non Consoled MBL list update
    $("select[id='id_non_consoled_mbl']").on('mousedown', function () {
        var field = $(this);
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/mbls/non_consoled",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\">---------------------</option>"));
                data.forEach(function (d) {
                    field.append($("<option value='"+d.id+"'>"+d.mbl_number+" - "+d.mbl_shipper.name+" to "+d.mbl_notifier.name+"</option>"));
                });

            }
        });
    });


    // Doc Type list update
    $("select.doc_type").on('mousedown', function () {
        var field = $(this);
        $.ajax({
            type:"GET",
            url: sea_import_absolute_uri+"/doc_types",
            success:function (data) {
                // console.log(data);
                field.empty();
                field.append($("<option value=\"\">---------------------</option>"));
                data.forEach(function (d) {
                    field.append($("<option value='"+d.id+"'>"+d.type_name+"</option>"));
                });

            }
        });
    });

});