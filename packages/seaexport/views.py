from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def admin_dashboard(request):
    return render(request, 'intuit/seaexport/others/admin_dashboard.html')


@login_required
def pending_work(request):
    return render(request, 'intuit/seaexport/coming_soon.html')
