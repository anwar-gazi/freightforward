/*
 * jquery.datepicker, a futuristic datepicker for web
 *
 * https://github.com/rohanrhu/jquery.datepicker
 * http://oguzhaneroglu.com/projects/jquery.datepicker/
 *
 * Copyright (C) 2014, Oğuzhan Eroğlu <rohanrhu2@gmail.com>
 * Licensed under MIT
 * 
 * version: 1.2.3
 * build: 2017.10.16.00.00.00
 */

var jQueryDatepicker = function (parameters) {
    var t_jQueryDatepicker = this;

    t_jQueryDatepicker.$element = parameters.$element;
    t_jQueryDatepicker.parameters = parameters;

    t_jQueryDatepicker.initialize = function () {
        t_jQueryDatepicker.$element.each(function () {
            var $datepicker = $(this);

            var data = {};
            $datepicker.data('jQueryDatepicker', data);

            var date_now;
            var date_selected;

            var current_date = new Date();
            var current_year = current_date.getFullYear();
            var current_month = current_date.getMonth()+1;
            var current_day = current_date.getDate();

            var calendar_year;
            var calendar_month;
            var calendar_day;
            var calendar_weekday;

            var selected_start_year;
            var selected_start_month;
            var selected_start_day;
            var selected_start_weekday;

            var selected_date;
            var selected_year;
            var selected_month;
            var selected_day;
            var selected_dayofweek;

            var is_date_selected = false;
            var is_start_date_selected = false;

            data.date = false;
            data.start_date = false;

            data.mode = jQueryDatepicker.MODE_DATE;
            data.is_disabled = false;

            var $label_year = $datepicker.find('.jQueryDatepicker_label_year');
            var $label_month = $datepicker.find('.jQueryDatepicker_label_month');

            var $calendar = $datepicker.find('.jQueryDatepicker_calendar');
            var $months = $datepicker.find('.jQueryDatepicker_calendar_months');
            var $month_proto = $datepicker.find('.jQueryDatepicker_calendar_months_month.jQueryDatepicker__proto');
            var $weekday_proto = $datepicker.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday.jQueryDatepicker__proto');

            var $current_month;
            var $current_day;
            var $current_start_day;

            var $rotationButton__left = $datepicker.find('.jQueryDatepicker_rotationButton__left');
            var $rotationButton__right = $datepicker.find('.jQueryDatepicker_rotationButton__right');
            var $rotationButton__left_iconImg = $rotationButton__left.find('.jQueryDatepicker_rotationButton_iconImg');
            var $rotationButton__right_iconImg = $rotationButton__right.find('.jQueryDatepicker_rotationButton_iconImg');

            var $disabledLayer = $datepicker.find('.jQueryDatepicker_disabledLayer');

            var color = $datepicker.find('.jQueryDatepicker_header_sidebutton').css('color');
            var left_svg = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path transform="rotate(-180 12,11.996270179748535)" d="m4.5873,21.16343l9.16716,-9.16716l-9.16716,-9.16716l2.82912,-2.82912l11.99628,11.99628l-11.99628,11.99628l-2.82912,-2.82912z" fill="'+color+'"/></svg>';
            var right_svg = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="'+color+'" d="m4.5873,21.16343l9.16716,-9.16716l-9.16716,-9.16716l2.82912,-2.82912l11.99628,11.99628l-11.99628,11.99628l-2.82912,-2.82912z"/></svg>';

            $rotationButton__left_iconImg.attr('src', 'data:image/svg+xml;base64,'+window.btoa(left_svg))
            $rotationButton__right_iconImg.attr('src', 'data:image/svg+xml;base64,'+window.btoa(right_svg))

            data.initialize = function () {
                calendar_year = current_year;
                calendar_month = current_month;
                calendar_day = 0;

                $datepicker.trigger('jQueryDatepicker_select_year', {year: calendar_year});
                $datepicker.trigger('jQueryDatepicker_select_month', {month: calendar_month});
            };

            data.asda = function () {
                return calendar_month;
            };

            $datepicker.on('jQueryDatepicker_select_year.jQueryDatepicker', function (event, params) {
                params.year = parseInt(params.year);

                calendar_year = params.year;

                $datepicker.find('.jQueryDatepicker_calendar_months_month').not('.jQueryDatepicker__proto').remove();

                var $_month;
                for (var _month=1; _month <= 12; _month++) {
                    $_month = $month_proto.clone(true);
                    $_month.removeClass('jQueryDatepicker__proto');
                    var $_month_weekdays = $_month.find('.jQueryDatepicker_calendar_months_month_weekdays');
                    var $_month_weekday;

                    var _month_date = new Date(calendar_year, _month);

                    var _day_count = new Date(calendar_year, _month, 0).getDate();

                    var _weekday_days = {};
                    for (var _weekday=1; _weekday <= 7; _weekday++) {
                        _weekday_days[_weekday] = {
                            days: [],
                            indicator: 0
                        };
                    }

                    var indicator = 0;

                    for (var _day=1; _day <= _day_count; _day++) {
                        var _day_date = new Date(calendar_year, _month-1, _day-1);
                        var _day_weekday = _day_date.getDay()+1;
                        var _weekdays = _weekday_days[_day_weekday];

                        _weekdays.indicator = indicator;

                        _weekdays.days[_weekdays.indicator++] = _day;

                        if (_day_weekday == 7) {
                            indicator++;
                        }
                    }

                    for (_weekday=1; _weekday <= 7; _weekday++) {
                        $_month_weekday = $weekday_proto.clone(true);
                        $_month_weekday.removeClass('jQueryDatepicker__proto');
                        var $_month_weekday_title = $_month_weekday.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_title');
                        var $_month_weekday_days = $_month_weekday.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days');
                        var $_day_proto = $_month_weekday_days.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day.jQueryDatepicker__proto');
                        var $_day;

                        var _day_name = jQueryDatepicker.day_names_short[_weekday];
                        
                        $_month_weekday_title.html(_day_name);

                        var _days = _weekday_days[_weekday];
                        var _day;
                        for (var i=0; i < _days.days.length; i++) {
                            _day = _days.days[i];
                            $_day = $_day_proto.clone(true);
                            $_day.removeClass('jQueryDatepicker__proto');

                            $_day.attr({
                                day: _day
                            });

                            $_day.addClass('jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+_day);

                            if (
                                (calendar_year == selected_year) &&
                                (_month == selected_month) &&
                                (_day == selected_day)
                            ) {
                                $_day.addClass('jQueryDatepicker__current');
                            }

                            if (_day == undefined) {
                                $_day.addClass('jQueryDatepicker__previous_month');
                            } else {
                                $_day.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day_number').html(_day);
                            }

                            $_day.appendTo($_month_weekday_days);
                        }

                        $_month_weekday.appendTo($_month_weekdays);
                    }

                    $_month.addClass('jQueryDatepicker_calendar_months_month-month-'+_month);
                    $_month.appendTo($months);
                }

                $label_year.html(calendar_year);

                process_start_date();
            });

            $datepicker.on('jQueryDatepicker_select_month.jQueryDatepicker', function (event, params) {  
                params.month = parseInt(params.month);

                calendar_month = params.month;

                $current_month = $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+params.month);
                $label_month.html(jQueryDatepicker.month_names[calendar_month]);
                $datepicker.find('.jQueryDatepicker_calendar_months_month').not('.jQueryDatepicker__proto').not($current_month).hide().removeClass('jQueryDatepicker__current');
                $current_month.show().addClass('jQueryDatepicker__current');

                process_start_date();
            });

            $datepicker.on('jQueryDatepicker_change_month.jQueryDatepicker', function (event, params) {
                var new_month;
                var new_year;

                if (params.rotation == 'next') {
                    new_month = calendar_month + 1;
                    if (new_month > 12) {
                        new_year = calendar_year + 1;
                        new_month = 1;
                    } else {
                        new_year = calendar_year;
                    }
                } else if (params.rotation = 'previous') {
                    new_month = calendar_month - 1;
                    if (new_month < 1) {
                        new_year = calendar_year - 1;
                        new_month = 12;
                    } else {
                        new_year = calendar_year;
                    }
                }

                if (calendar_year != new_year) {
                    $datepicker.trigger('jQueryDatepicker_select_year', {year: new_year});
                }

                $datepicker.trigger('jQueryDatepicker_select_month', {month: new_month});
            });

            var process_start_date = function () {
                $datepicker.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day')
                           .removeClass('jQueryDatepicker__current_other')
                           .removeClass('jQueryDatepicker__current_other_diff');

                if (
                    calendar_year == selected_start_year &&
                    calendar_month == selected_start_month
                ) {
                    var $_month = $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+selected_start_month);
                    $_month.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+selected_start_day)[is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other');
                }

                if ((selected_year == calendar_year) || (selected_start_year == calendar_year)) {
                    if (selected_year == selected_start_year) {
                        if (selected_month == selected_start_month) {
                            for (var i=selected_start_day+1; i < calendar_day; i++) {
                                $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+selected_month)
                                           .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+i)
                                           [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                            }
                        } else if (selected_month > selected_start_month) {
                            for (var _month=selected_start_month; _month <= selected_month; _month++) {
                                if (_month != selected_month) {
                                    if (_month == selected_start_month) {
                                        for (var i=selected_start_day+1; i < 32; i++) {
                                            $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+_month)
                                                       .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+i)
                                                       [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                                        }
                                    } else {
                                        for (var i=1; i < 32; i++) {
                                            $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+_month)
                                                       .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+i)
                                                       [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                                        }
                                    }
                                } else {
                                    for (var i=1; i < selected_day; i++) {
                                        $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+_month)
                                                   .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+i)
                                                   [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                                    }
                                }
                            }
                        }
                    } else if (selected_year > selected_start_year) {
                        if (selected_year == calendar_year) {
                            for (var m=1; m < selected_month; m++) {
                                $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+m)
                                           .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day')
                                           [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                            }

                            for (var d=1; d < selected_day; d++) {
                                $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+selected_month)
                                           .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+d)
                                           [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                            }
                        } else if (calendar_year == selected_start_year) {
                            if (calendar_month == selected_start_month) {
                                for (var d=selected_start_day+1; d < 32; d++) {
                                    $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+calendar_month)
                                               .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+d)
                                               [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                                }
                            } else if (calendar_month > selected_start_month) {
                                $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+calendar_month)
                                           .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day')
                                           [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                            }
                        } else if (selected_year > calendar_year) {
                            for (var m=1; m <= 12; m++) {
                                $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+m)
                                           .find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day')
                                           [is_start_date_selected ? 'addClass': 'removeClass']('jQueryDatepicker__current_other_diff');
                            }
                        }
                    }
                }
            };

            data.selectDay = function (params) {
                if (!params.hasOwnProperty('month')) {
                    params.month = calendar_month;
                }

                calendar_day = parseInt(params.day);
                data.date = new Date(calendar_year, calendar_month-1, calendar_day);
                calendar_weekday = data.date.getDay() == 0 ? 7: data.date.getDay();

                selected_year = calendar_year;
                selected_month = calendar_month;
                selected_day = calendar_day;
                selected_dayofweek = calendar_weekday;

                var $_month = $datepicker.find('.jQueryDatepicker_calendar_months_month-month-'+params.month);
                console.log('asda:', $_month.length, $_month, '-', params);
                $current_day = $_month.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+calendar_day);
                $datepicker.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day').not($current_day).removeClass('jQueryDatepicker__current');
                $current_day.addClass('jQueryDatepicker__current');

                $datepicker.trigger('jQueryDatepicker_date_selected', {
                    mode: 'date',
                    details: {
                        year: selected_year,
                        month: selected_month,
                        day: selected_day,
                        dayofweek: selected_dayofweek
                    },
                    date: data.date,
                    start_date: data.isStartDateSelected() && {
                        details: {
                            year: selected_start_year,
                            month: selected_start_month,
                            day: selected_start_day,
                            dayofweek: selected_start_weekday
                        },
                        date: data.start_date,
                    },
                    from_user: params['from_user'] ? true: false
                });
                
                is_date_selected = true;

                process_start_date();
            };

            data.setMode = function (mode) {
                data.mode = (mode == 'date') ? jQueryDatepicker.MODE_DATE: jQueryDatepicker.MODE_START_DATE;
            };

            data.toggleMode = function (mode) {
                if (data.mode == jQueryDatepicker.MODE_DATE) {
                    data.mode = jQueryDatepicker.MODE_START_DATE;
                } else {
                    data.mode = jQueryDatepicker.MODE_DATE;
                }
            };

            data.getMode = function () {
                return (data.mode == jQueryDatepicker.MODE_DATE) ? 'date': 'start_date';
            };

            data.setDate = function (params) {
                calendar_year = parseInt(params.year);
                calendar_month = parseInt(params.month);
                
                $datepicker.trigger('jQueryDatepicker_select_year', {year: calendar_year});
                $datepicker.trigger('jQueryDatepicker_select_month', {month: calendar_month});

                data.selectDay({
                    month: params.month,
                    day: params.day
                });
            };

            data.clearDate = function () {
                is_date_selected = false;

                selected_date = false;
                selected_year = false;
                selected_month = false;
                selected_day = false;
                selected_dayofweek = false;

                $current_day = $current_month.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-'+calendar_day);
                $datepicker.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day').not($current_day).removeClass('jQueryDatepicker__current');
                $current_day.removeClass('jQueryDatepicker__current');

                process_start_date();
            };

            data.isDateSelected = function () {
                 return is_date_selected;
            };

            data.clearStartDate = function () {
                is_start_date_selected = false;
                process_start_date();
            };

            data.isStartDateSelected = function () {
                 return is_start_date_selected;
            };

            data.getDate = function () {
                return data.isDateSelected() && {
                    details: {
                        year: selected_year,
                        month: selected_month,
                        day: selected_day,
                        dayofweek: selected_dayofweek
                    },
                    date: data.date,
                    start_date: data.isStartDateSelected() && {
                        details: {
                            year: selected_start_year,
                            month: selected_start_month,
                            day: selected_start_day,
                            dayofweek: selected_start_weekday
                        },
                        date: data.start_date,
                    }
                };
            };

            data.getStartDate = function () {
                return data.isStartDateSelected() && {
                    details: {
                        year: selected_start_year,
                        month: selected_start_month,
                        day: selected_start_day,
                        dayofweek: selected_start_weekday
                    },
                    date: data.start_date,
                };
            };

            data.setStartDate = function (params) {
                selected_start_year = parseInt(params.year);
                selected_start_month = parseInt(params.month);
                selected_start_day = parseInt(params.day);

                $datepicker.trigger('jQueryDatepicker_select_year', {year: selected_start_year});
                $datepicker.trigger('jQueryDatepicker_select_month', {month: selected_start_month});

                data.start_date = new Date(selected_start_year, selected_start_month-1, selected_start_day);

                is_start_date_selected = true;

                $datepicker.trigger('jQueryDatepicker_date_selected', {
                     mode: 'start_date',       
                     details: {        
                         year: selected_year,      
                         month: selected_month,        
                         day: selected_day,        
                         dayofweek: selected_dayofweek     
                     },        
                     date: data.date,      
                     start_date: {     
                         details: {        
                             year: selected_start_year,        
                             month: selected_start_month,      
                             day: selected_start_day,      
                             dayofweek: selected_start_weekday     
                         },        
                         date: data.start_date,        
                     },        
                     from_user: params['from_user'] ? true: false      
                 });

                process_start_date();
            };

            data.setDisabled = function (is_disabled) {
                if (data.is_disabled = is_disabled) {
                    $disabledLayer.show();
                } else {
                    $disabledLayer.hide();
                }
            };

            $datepicker.find('.jQueryDatepicker_rotationButton').on('click.jQueryDatepicker', function (event) {
                var $button = $(this);
                $datepicker.trigger('jQueryDatepicker_change_month', {rotation: $button.attr('rotation')});
            });

            $datepicker.find('.jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day').on('click.jQueryDatepicker', function (event) {
                var $day = $(this);

                if ($day.hasClass('jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day-day-undefined')) {
                    return;
                }

                var clicked_day = parseInt($day.attr('day'));

                if (data.mode == jQueryDatepicker.MODE_DATE) {
                    if ($day.hasClass('jQueryDatepicker__current_other') || $day.hasClass('jQueryDatepicker__previous_month')) {
                        return;
                    }

                    $current_day = $day;

                    data.selectDay({
                        day: clicked_day,
                        from_user: true
                    });
                } else if (data.mode == jQueryDatepicker.MODE_START_DATE) {
                    $current_start_day = $day;

                    data.setStartDate({
                        year: calendar_year,
                        month: calendar_month,
                        day: clicked_day,
                        from_user: true
                    });
                }
            });

            data.initialize();
        });
    };
};

jQueryDatepicker.MODE_DATE = 1;
jQueryDatepicker.MODE_START_DATE = 2;

jQueryDatepicker.day_names_short = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun'
};

jQueryDatepicker.day_names = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
};

jQueryDatepicker.month_names = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'Apri',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
};

jQueryDatepicker.event = function (name) {
    return 'jQueryDatepicker_'+name;
};

jQueryDatepicker.data = function ($datepicker) {
    return $datepicker.data('jQueryDatepicker');
};

(function($){
    var html_proto = '' +
    '<div class="jQueryDatepicker_datePicker">' +
        '<div class="jQueryDatepicker_header">' +
            '<div class="jQueryDatepicker_header_bG">' +
            '</div>' +
            '<div class="jQueryDatepicker_table">' +
                '<div class="jQueryDatepicker_table_td">' +
                    '<span class="jQueryDatepicker_label_month"></span>&nbsp;' +
                    '<span class="jQueryDatepicker_label_year"></span>' +
                '</div>' +
            '</div>' +
            '<div class="jQueryDatepicker_rotationButton jQueryDatepicker_rotationButton__left jQueryDatepicker_header_sidebutton jQueryDatepicker_header_sidebutton__left jQueryDatepicker_header_sidebutton__left" rotation="previous">' +
                '<div class="jQueryDatepicker_table">' +
                    '<div class="jQueryDatepicker_table_td">' +
                        '<div class="jQueryDatepicker_header_sidebutton_content">' +
                            '<img class="jQueryDatepicker_rotationButton_iconImg" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAuklEQVRIS+3SOw6CQBSF4Z9Ol6OtFQVqY1yIbkfWgZZsBCtrl6CNmpsMCVp4H2E6qEgmOR/nDAWZnyJzPhOgLhydaA68gYcmRAAJPydgryFeoA+vgDuwAm7/WniA3/ASuI41UShccEuDcLgVuAA74AksgE6bZXhuaSAXKsgMqIHD2IDkhRFLg/6D1+n/dzXxAAJtgCbNdQKO2lxeYIjI+1K79AggwVvgBbQ5GmiZX+fRBmZkAtSpsk/0AQZDIBnr6Sz2AAAAAElFTkSuQmCC" alt="Previous Month" />' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="jQueryDatepicker_rotationButton jQueryDatepicker_rotationButton__right jQueryDatepicker_header_sidebutton jQueryDatepicker_header_sidebutton__right jQueryDatepicker_header_sidebutton__right" rotation="next">' +
                '<div class="jQueryDatepicker_table">' +
                    '<div class="jQueryDatepicker_table_td">' +
                        '<div class="jQueryDatepicker_header_sidebutton_content">' +
                        '<img class="jQueryDatepicker_rotationButton_iconImg" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE3LjE3IDMyLjkybDkuMTctOS4xNy05LjE3LTkuMTcgMi44My0yLjgzIDEyIDEyLTEyIDEyeiIvPjxwYXRoIGQ9Ik0wLS4yNWg0OHY0OGgtNDh6IiBmaWxsPSJub25lIi8+PC9zdmc+" alt="Next Month" /></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="jQueryDatepicker_body">' +
            '<div class="jQueryDatepicker_calendar">' +
                '<div class="jQueryDatepicker_calendar_months">' +
                    '<div class="jQueryDatepicker_calendar_months_month jQueryDatepicker__proto">' +
                        '<div class="jQueryDatepicker_calendar_months_month_weekdays">' +
                            '<div class="jQueryDatepicker_calendar_months_month_weekdays_weekday jQueryDatepicker__proto">' +
                                '<div class="jQueryDatepicker_calendar_months_month_weekdays_weekday_title">' +
                                '</div>' +
                                '<div class="jQueryDatepicker_calendar_months_month_weekdays_weekday_days">' +
                                    '<div class="jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day jQueryDatepicker__proto">' +
                                        '<div class="jQueryDatepicker_table">' +
                                            '<div class="jQueryDatepicker_table_td">' +
                                                '<div class="jQueryDatepicker_calendar_months_month_weekdays_weekday_days_day_number"></div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="jQueryDatepicker_disabledLayer">' +
        '</div>' +
    '</div>' +
    '';
    
    var $html_proto = $(html_proto);
    
    var methods = {
        init: function(parameters) {
            t_init = this;
            var $elements = $(this);

            if (typeof parameters == 'undefined') {
                parameters = {};
            }

            t_init.parameters = parameters;

            $elements.each(function () {
                var $element = $(this);
                
                $element.html(html_proto).addClass('jQueryDatepicker');

                if (t_init.parameters.hasOwnProperty('next_button')) {
                    $element
                    .find('.jQueryDatepicker_header_sidebutton__right .jQueryDatepicker_header_sidebutton_content')
                    .html(t_init.parameters.next_button);
                }
                if (t_init.parameters.hasOwnProperty('prev_button')) {
                    $element
                    .find('.jQueryDatepicker_header_sidebutton__left .jQueryDatepicker_header_sidebutton_content')
                    .html(t_init.parameters.prev_button);
                }

                var datepicker = new jQueryDatepicker({
                    $element: $element
                });

                datepicker.initialize();
            });
        }
    };

    $.fn.datepicker = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.datepicker');
        }
    };
})(jQuery);