# jQuery-Calendar
simple calendar plugin for jQuery & HTML5

## Getting Started
Download the developer or the minified version of jquery.calendar.js 
and jquery.calendar.css and paste it info your assets directory.

Include both files in your related HTML(5) file. Next you need to create a 
simple container (for e.g. a div) which will contain the calendar widget.

For creating a simple calendar view, your code should look like this
```
<div id="pnlCalendar"></div>
<script>
$(function () {
	$('#pnlCalendar').calendar();
});
</script>
```

## Customizing
You can customize the displayed calendar widget with different
configuration settings. Apply these settings when you're initializing
the jQuery plugin on your object.

Following options are currently available:
* color: specify the design color as hexadecimal integer. The plugin calculates different shades itself. Default is #308B22
* months: an array of month names. Change them for e.g. to ['Jan', 'Feb', ...] or whatever you want. Must be exactly 12 items!
* days: an array of day names. Change them for e.g. to ['Mon', 'Tue', ...] or whatever you want. Must be exactly 7 items!

## Listening To Select Events
When a user clicks on a date to select it as current date, the plugin is firing
the onSelect-Event. You can react to this event by specifying the onSelect property
in the options when you're initializing the plugin on your object.

The code should look like this
```
<div id="pnlCalendar"></div>
<script>
$(function () {
	$('#pnlCalendar').calendar({
		onSelect: function (event) {
			// ok, come on, let's go!
		}
	});
});
</script>
```

The event function expects a parameter - here called 'event' - which contains
some data from the selected date of the calendar. You can use this object for 
your special requirements.
```
{
	date: [Date-Object],
	label: [24.12.2018]
}
```

## License
This little project is licensed under the MIT license