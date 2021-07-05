"use strict";
(function ($) {
    $('#mawb_number').val("MAWB");

    $.ajax({
            type: 'GET',
            url: '/ajax/get_mawb/12345678910',
            success: function (data) {
                console.log(data[1]);
            },
            error: function (xhr, status, error) {
            },
            dataType: 'text'
        });

}(jQuery));