(function ($) {
    $('.ddmenu').not('.ddmenu-active').children('a.ddmenu-title').click(function (event) {
            $(event.target).closest('.ddmenu').addClass('ddmenu-active');
            $(event.target).closest('.ddmenu').find('.ddmenu-title-icon').removeClass('fa-plus-square').addClass('fa-minus-square');
            //$(event.target).closest('.ddmenu').find('.ddmenu-submenu').show();
        }
    );
}(jQuery));