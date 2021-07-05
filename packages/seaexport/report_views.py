from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from freightman.decorators import forwarder_required
from seaexport.models import SeaExportHBL
from django.http import JsonResponse
from django.conf import settings


@login_required
@forwarder_required
def dsr_report_page(request):
    data = {}
    return render(request, 'intuit/seaexport/forwarder/dsr.html', data)


@login_required
@forwarder_required
def get_dsr_data(request):
    import math
    from seaexport.forms import DailyReportPaginationForm
    from seaexport.dictbuilder.dsr import dsr_dict

    paginationform = DailyReportPaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    report_date = paginationform.cleaned_data['report_date']

    if report_date:
        query = SeaExportHBL.objects.filter(entry_at__year=report_date.year, entry_at__month=report_date.month, entry_at__day=report_date.day).order_by('-id')
    else:
        latest_hbl = SeaExportHBL.objects.all().order_by('-entry_at').first()
        if latest_hbl:
            report_date = latest_hbl.entry_at
            query = SeaExportHBL.objects.filter(entry_at__year=latest_hbl.entry_at.year, entry_at__month=latest_hbl.entry_at.month, entry_at__day=latest_hbl.entry_at.day) \
                .order_by('-id')
        else:
            report_date = ''
            query = SeaExportHBL.objects.filter(entry_at=None).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for hbl in query[entry_start:entry_end]:
        listing.append(dsr_dict(hbl))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'report_date': report_date.strftime(settings.HTML_DATEFIELD_FORMAT_PY) if report_date else '',
            'listing': listing,
        }
    })
