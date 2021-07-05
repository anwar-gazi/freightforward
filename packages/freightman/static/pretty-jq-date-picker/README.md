# jquery.datepicker
a futuristic datepicker for web

[![GitHub release](https://img.shields.io/github/release/rohanrhu/jquery.datepicker.svg?style=flat-square)](https://github.com/rohanrhu/jquery.datepicker/releases)
[![GitHub nightly build](https://img.shields.io/badge/build-2017.09.15.00.00.00-green.svg?style=flat-square)](https://github.com/rohanrhu/jquery.datepicker)

![jquery.datepicker](http://oguzhaneroglu.com/static/images/jquery.datepicker.png "jquery.datepicker")

Visit [project page](http://oguzhaneroglu.com/projects/jquery.datepicker/) for example and [api reference](https://github.com/rohanrhu/jquery.datepicker/wiki/API-Reference) for documentation.

### Init

#### Javascript

```javascript
$(document).ready(function () {
    var $selected = $('.selected');
    var $start = $('.start');
    var $toggleMode = $('.toggleMode');

    var $some_datepicker = $('.some_datepicker');
    $some_datepicker.datepicker();
    var datepicker = jQueryDatepicker.data($some_datepicker);

    var date = new Date();

    $some_datepicker.on(jQueryDatepicker.event('date_selected'), function (event, date) {
        if (date.mode == 'date') {
            console.log('date selected:', date);
        } else if (date.mode == 'start_date') {
            console.log('start date selected:', date);
        }

        if (datepicker.isStartDateSelected()) {
            $start.show().html('<b>start date:</b> '+date.start_date.date.toString());
        }
        
        $selected.show().html('<b>date:</b> '+date.date.toString());
    });

    // If you need a date range
    datepicker.setStartDate({
        year: 2017,
        month: date.getMonth()+1,
        day: 4
    });

    datepicker.setDate({
        year: 2017,
        // jquery.datepicker accepts first month as 1
        // (built-in Date() class accepts first month as 0)
        month: date.getMonth()+1,
        day: 21
    });

    $toggleMode.on('click', function (event) {
        datepicker.toggleMode();

        if (datepicker.getMode() == 'date') {
            $toggleMode.html('toggle start date selection mode');
        } else {
            $toggleMode.html('toggle date selection mode');
        }
    });
});
```

#### HTML

```html
<div style="width: 300px; font-family: 'Arial'; margin: auto;">
    <div class="some_datepicker">
    </div>
</div>

<div class="toggleMode btn" style="margin: auto; margin-top: 15px;">
    toggle start date selection mode
</div>

<div class="start" style="margin: auto; margin-top: 15px;">
</div>

<div class="selected" style="margin: auto;margin-top: 10px;">
</div>
```

#### CSS

```css
.btn {
    display: inline-block;
    cursor: pointer;
    border: 1px solid #c1c1c1;
    border-bottom: 2px solid #c1c1c1;
    padding: 5px; border-radius: 2px;
    transition: all 250ms;
    font-size: 14px;
}

.selected,
.start {
    font-size: 14px;
}

.btn:hover {
    background: #f1f1f1;
}
```

### I18N

```javascript
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
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'Agust',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
};
```

## License
MIT
