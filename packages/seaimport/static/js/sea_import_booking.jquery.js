(function ($) {
    // remove the page loading gif after document is loaded
    $('.page-loading').remove();

    ////////////////////////////////////////////////////////////////////////
    //All the functions for temporary address are here
    ////////////////////////////////////////////////////////////////////////

    // This function takes parent(class or id), child(class) and Class of element where to write the serial number. This is used to add serial to all the child in a parent
    var rearrange_serial_in_temp_address_form = function(parent_div, child_div, serial_num_class){
        var childs = $(parent_div).find(child_div);

        childs.each(function (index) {
            $(this).find(serial_num_class).html(index);
        });

        return childs.length;

    }

    // This  function add more form on clicking add button and delete form on clicking delete button
    var add_more_temp_address = function (add_button_id, parent_div, body_div, serial_num_class, delete_button_class) {
        $(add_button_id).on('click', function () {
            var parent = $(parent_div);
            var body = parent.find(body_div).last();
            var new_form = parent.append(body[0].outerHTML);
            new_form.find(body_div).last().css('display','block');
            var total_childs = rearrange_serial_in_temp_address_form(parent_div,body_div,serial_num_class);

            if (total_childs==2){
                $(this).html('Add More Listener');
            }

        });

        $(parent_div).on('click',delete_button_class, function () {
            $(this).parent().remove();
            var total_childs = rearrange_serial_in_temp_address_form(parent_div,body_div,serial_num_class);

            if (total_childs==1){
                $(add_button_id).html('Add Listener');
            }
        });
    }

    // this function extracts the input from from the temporary address form
    // var temp_address_input_names = [];
    var temp_address_data = [];
    var get_temp_address_data = function(parent_id, child_class){

        // getting the names of the input
        // var prev_name = ''
        // $(parent_id).find(child_class).first().find(':input').map(function () {
        //     if($(this).attr('name')!=prev_name)
        //         temp_address_input_names.push($(this).attr('name'));
        //     prev_name = $(this).attr('name');
        // });

        // getting the values from each child
        var temporary_address_data = [];
        var childs = $(parent_id).find(child_class).not(':first-child').map(function () {
            var temp_single_child_data = [];
            $(this).find(':input').not('button').map(function () {
                if( $(this).attr('type') == 'radio'){
                    if ($(this).is(':checked')){
                        var k = $(this).attr('name');
                        var v = $(this).val();
                        temp_single_child_data[k] = v;
                    }
                }else{
                    var key = $(this).attr('name');
                    var value = $(this).val();
                    temp_single_child_data[key] = value;
                }
            });
            temporary_address_data.push(temp_single_child_data);
        });
        console.log(temporary_address_data);
    }

        // Clone temp address on button click or delete on delete button
    add_more_temp_address('#add_more_temp_address_button','.temp_address_body_parent', '.temp_address_body_for_clone', '.number','.delete-temp-address');
    // get_temp_address_data('#temp_address','.temp_address_body_for_clone');

    ////////////////////////////////////////////////////////////////////////
    //All the functions for temporary address ends here
    ////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////
    //All the functions for Goods Info are here
    ////////////////////////////////////////////////////////////////////////

    // This function takes parent(class or id), child(class) and Class of element where to write the serial number. This is used to add serial to all the child in a parent
    var rearrange_serial_in_goods_info_form = function(parent_div, child_div, serial_num_class,disable_button){
        var childs = $(parent_div).find(child_div);

        childs.each(function (index) {
            if(childs.length==1){
                $(this).find(disable_button).css('display','none');
            }else {
                $(this).find(disable_button).css('display','block');
            }
            $(this).find(serial_num_class).html(index+1);
        });

        return childs.length;

    }

    // This  function add more form on clicking add button and delete form on clicking delete button
    var add_delete_more_goods_info = function (add_button_id, parent_div, body_div, serial_num_class, delete_button_class) {
        $(add_button_id).on('click', function () {
            var parent = $(parent_div);
            var body = parent.find(body_div).last();
            var new_form = parent.append(body[0].outerHTML);
            new_form.find(body_div).last().css('display','block');
            rearrange_serial_in_goods_info_form(parent_div,body_div,serial_num_class,delete_button_class);

        });

        $(parent_div).on('click',delete_button_class, function () {
            $(this).parent().remove();
            rearrange_serial_in_goods_info_form(parent_div,body_div,serial_num_class,delete_button_class);
        });
    }

    //This function is called initially to give serial number to the divs and to remove the delete button
    rearrange_serial_in_goods_info_form('#goods_info','.goods_info_input_fields','.number','.delete_goods_info');
    add_delete_more_goods_info('#add_more_goods_info','#goods_info','.goods_info_input_fields','.number','.delete_goods_info');

    ////////////////////////////////////////////////////////////////////////
    //All the functions for Goods info ends here
    ////////////////////////////////////////////////////////////////////////




}(jQuery));