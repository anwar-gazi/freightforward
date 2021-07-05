from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Project, Task, TimeLog
from datetime import datetime
from django.conf import settings


@login_required
def timesheet(request):
    pass


@login_required
def view_user_timesheet(request, user_id):
    user = get_user_model().objects.get(id=user_id)
    data = {
        'user': user
    }
    return render(request, 'default/pm/timesheet.html', data)


@login_required
def ajax_get_user_timesheet_data(request, user_id, from_date, to_date):
    user = get_user_model().objects.get(id=user_id)
    from_datetime = datetime.strptime('{} 00:00'.format(from_date), settings.FRONTEND_JS_DATE_FORMAT)
    to_datetime = datetime.strptime('{} 29:59'.format(to_date), settings.FRONTEND_JS_DATE_FORMAT)
    data = {
        'user': user
    }
    TimeLog.objects.filter(started_at__range=[])
