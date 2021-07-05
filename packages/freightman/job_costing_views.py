from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .decorators import forwarder_required


@login_required
@forwarder_required
def job_costing_page(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/job_costing_listing.html', data)


@login_required
@forwarder_required
def load_job_costing(request, consol_public_id: str):
    data = {
        'consol_public_id': consol_public_id
    }
    return render(request, 'intuit/fm/forwarder/job_costing.html', data)
