from django.shortcuts import render
from seaimport.models import SeaImportAgent, SeaImportCompany
from django.contrib.auth.decorators import login_required


@login_required()
def list_company(request):
    company = SeaImportCompany.objects.all().order_by('id')
    data = {
        'data': company,
        'url_name': 'seaimport:sea_import_update_company',
    }
    return render(request, 'seaimport/forwarder/others/list_template1.html', data)


@login_required()
def list_agent(request):
    agent = SeaImportAgent.objects.all().order_by('id')
    data = {
        'data': agent,
        'url_name': 'seaimport:sea_import_update_agent',
    }
    return render(request, 'seaimport/forwarder/others/list_template1.html', data)