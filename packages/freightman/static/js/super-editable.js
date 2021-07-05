// requirements: jquery, font-awesome
(function (__system__, $) {
    $.fn.super_editable = function (updater) {
        let supereditable_parent = $(this);

        let input = supereditable_parent.find('.super-editable-input');

        let edit_button = $('<i class="fa fa-edit small cursor-pointer super-editable-edit" title="edit"></i>');
        let update_button = $('<i class="fa small cursor-pointer super-editable-update" title="update"> update</i>');

        let spinner = $('<i class="fa fa-spin fa-spinner super-editable-working"></i>');
        let succ_msg = $('<span>success</span>');

        let button_box = $('<div></div>');

        input.after(button_box);

        input.prop('readonly', true);

        button_box.append(edit_button);

        $(document).on('click', '.super-editable-edit', function (event) {
            edit_button.remove();
            button_box.append(update_button);
            input.prop('readonly', false);
        });

        $(document).on('click', '.super-editable-update', function (event) {
            $(event.target).remove();

            button_box.before(spinner);

            let model = input.attr('data-super-editable-model');
            let id = input.attr('data-super-editable-id');
            let field = input.attr('data-super-editable-field');
            let value = input.val();

            //console.log('data: {} {} {} {}'.format(model, id, field, value));

            updater(model, id, field, value, function (errors) {
                spinner.remove();
                button_box.before(succ_msg);
                setTimeout(function () {
                    succ_msg.remove();
                    input.prop('readonly', true);
                    button_box.append(edit_button);
                }, 1000);
            });
        });
    };
}(window.__system__, jQuery));