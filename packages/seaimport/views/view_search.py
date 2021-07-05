from django.shortcuts import render
from seaimport.models import SeaImportJob, SeaImportHbl, SeaImportMbl
from seaimport import filters
from django.contrib.auth.decorators import login_required


@login_required()
def search_jobs(request):
    jobs = SeaImportJob.objects.all()
    job_filters = filters.JobFilter(request.GET, queryset=jobs)
    data = {
        'job_filters': job_filters,
    }
    return render(request, 'seaimport/forwarder/search/search_jobs.html', data)


@login_required()
def search_mbls(request):
    mbls = SeaImportMbl.objects.all()
    mbl_filters = filters.MblFilter(request.GET, queryset=mbls)
    data = {
        'mbl_filters': mbl_filters,
    }
    return render(request, 'seaimport/forwarder/search/search_mbls.html', data)


@login_required()
def search_hbls(request):
    hbls = SeaImportHbl.objects.all()
    hbl_filters = filters.HblFilter(request.GET, queryset=hbls)
    data = {
        'hbl_filters': hbl_filters,
    }
    return render(request, 'seaimport/forwarder/search/search_hbls.html', data)


@login_required()
def search_do_pending_hbls(request):
    hbls = SeaImportHbl.objects.filter(job__isnull=False).order_by('-unlocked', '-task__invoice')

    data = {
        'hbls': hbls
    }
    return render(request, 'seaimport/forwarder/hbl/pending_do.html', data)