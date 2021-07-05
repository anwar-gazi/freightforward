"use strict";
(function ($) {
    $('#goods_rate, #goods_chargeable_weight').on('keyup', function () {
       var weight = parseFloat($('#goods_chargeable_weight').val());
       var rate = parseFloat($('#goods_rate').val());
       $('#goods_total').val((weight*rate).toFixed(2));
    });
}(jQuery));