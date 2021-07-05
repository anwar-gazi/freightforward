(function ($) {
    $('#hbl_info').on('click',':button',function () {
        var button = $(this);
        button.attr('disabled','true');
        var url = window.sea_import_update_task_url.replace('123',button.parent().attr('task_id'));


        $.ajax({
            type: 'POST',
            url: url,
            data: {
                'field': button.attr('prefix')
            },
            success: function (data) {
                // button.html(button_text);
                button.removeAttr("disabled");
                var resp = JSON.parse(data);
                if (resp.success){
                 button.toggleClass("btn-primary btn-warning");
                 console.log(button.attr('prefix'));
                 if (button.attr('prefix') === 'do_issued'){
                    location.reload();
                 }
                // button.children('.far').toggleClass("fa-check-circle fa-times-circle");
                }
                if (button.attr('prefix') === 'forwarding_letter_issued'){
                    location.reload();
                }
            },
            error: function (xhr, status, error) {
                // button.html(button_text);
                button.removeAttr("disabled");
                // alert(2);
                // console.log(button.attr('prefix'));
                // console.log(xhr);
                // console.log(status);
                // console.log(error);
            },
            dataType: 'text'
        });
    });
}(jQuery));