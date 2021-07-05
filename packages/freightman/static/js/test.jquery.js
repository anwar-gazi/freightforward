(function ($) {
    window.load_hawb_test_profile = function () {
        $.ajax({
            type: 'get',
            url: window.test_handler_url,
            data: {action: 'getlist_hawb_form_profile'},
            dataType: 'json',
            success: function (resp) {
                let options = Object.keys(resp.data.hawb_form_profiles).map(function (name) {
                    return '<option value="{}">{}</option>'.format(name, name);
                });
                $('#test_profile').html('<select id="formfillprofile_selection"><option value="">select test profile</option>' + options.join('') + '</select>');

                $(document).on('change', '#formfillprofile_selection', function (event) {
                    let profilename = $(event.target).val();
                    let profile = resp.data.hawb_form_profiles[profilename];
                    Object.keys(profile).map(function (key) {
                        $('#{}'.format(key)).val(profile[key]);
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred on page init data load! {}'.format(textStatus, errorThrown);
                //$('#feedback_errors').append('<div class="text-danger">{}</div>'.format(err));
            }
        });
    };
    window.load_mawb_test_profile = function () {
        $.ajax({
            type: 'get',
            url: window.test_handler_url,
            data: {action: 'getlist_mawb_form_profile'},
            dataType: 'json',
            success: function (resp) {
                let options = Object.keys(resp.data.mawb_form_profiles).map(function (name) {
                    return '<option value="{}">{}</option>'.format(name, name);
                });
                $('#test_profile').html('<select id="formfillprofile_selection"><option value="">select test profile</option>' + options.join('') + '</select>');

                $(document).on('change', '#formfillprofile_selection', function (event) {
                    let profilename = $(event.target).val();
                    let profile = resp.data.mawb_form_profiles[profilename];
                    Object.keys(profile).map(function (key) {
                        $('#{}'.format(key)).val(profile[key]);
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let err = '{}: an error occurred on page init data load! {}'.format(textStatus, errorThrown);
                //$('#feedback_errors').append('<div class="text-danger">{}</div>'.format(err));
            }
        });
    };
    console.info('hawb form fill test: use window.load_hawb_test_profile');
    console.info('mawb form fill test: use window.load_mawb_test_profile');
}(jQuery));