(function ($) {

    // Add add and remove button to attach document form
    var docs_form_set = $('.expense_form_multiply');
    docs_form_set.formset({
        addText: "Add Expenses",
        deleteText: "<i class=\"fas fa-times-circle text-danger\" style='font-size: 20px'></i>",
    });
    $('.add-row').addClass('btn btn-primary mb-2');

    // Calculating total bdt and USD
    var calculateTotal = function () {
        var total_bdt = 0;
        var total_usd = 0;

        $('.bdt').map(function () {
            total_bdt += parseFloat($(this).val());
        });

        if (total_bdt)
            $('#total_bdt').html(total_bdt.toFixed(0));
        else
            $('#total_bdt').html(0);

        $('.amount_usd').map(function () {
            total_usd += parseFloat($(this).val());
        });

        if (total_usd)
            $('#total_usd').html(total_usd.toFixed(2));
        else
            $('#total_usd').html(0);

    };


    // Update all bdt fields with conversion on load for exsiting data
    var update_fields = function () {
        $('.amount_usd').map(function () {
            var usd = parseFloat($(this).val());
            // console.log($(this).addClass('bg-dark'))
            var usd_rate = parseFloat($('#id_dollar_rate').val());

            var main_parent = $(this).parent().parent().parent().parent().parent();
            // console.log( $(this).parents('.expense_form_multiply').first())

            var value = Math.round((usd * usd_rate))
            main_parent.find('.bdt').val(value.toString());


        });
    }

    // Updating BDT input on dollar input change
    $('.expense_form').on('keyup', '.amount_usd', function () {
        var usd = parseFloat($(this).val());
        var usd_rate = parseFloat($('#id_dollar_rate').val());

        var main_parent = $(this).parent().parent().parent().parent().parent();

        var value = Math.round((usd * usd_rate))
        main_parent.find('.bdt').val(value);

        calculateTotal();
    });

    // Updating Dollar input on BDT input change
    $('.expense_form').on('keyup', '.bdt', function () {

        var bdt = parseFloat($(this).val());
        var usd_rate = parseFloat($('#id_dollar_rate').val());

        var main_parent = $(this).parent().parent();
        main_parent.find('.amount_usd').val((bdt / usd_rate).toFixed(4));

        calculateTotal();
    });

    // Updating BDT input on Dollar Rate change
    $('#id_dollar_rate').on('keyup', function () {
        update_fields();
        calculateTotal();
    });

    update_fields();
    calculateTotal();


}(jQuery));