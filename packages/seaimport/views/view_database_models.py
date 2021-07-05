from django.shortcuts import render, reverse
from django.http import HttpResponseRedirect
from seaimport.forms import SeaImportAgentForm, SeaImportCompanyForm, SeaImportCityForm, \
    SeaImportCountryForm, SeaImportExpenseTypeForm, SeaImportFreightTypeForm, SeaImportGoodsTypeForm, \
    SeaImportDocTypeForm, SeaImportPortForm, SeaImportPackageTypeForm, SeaImportContainerTypeForm, \
    SeaImportAgentBankInfoForm, SeaImportJobCostTypeForm

from django.contrib import messages
from django.contrib.auth.decorators import login_required


@login_required()
def create_agent(request):
    agent_form = SeaImportAgentForm()
    data = {
        'agent_form': agent_form,
    }

    if request.method == 'POST':
        agentForm = SeaImportAgentForm(request.POST)
        if agentForm.is_valid():
            agentForm.save()
            messages.success(request, 'New Agent Created Successfully')
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_agent"))
        else:
            messages.error(request, 'There was an error creating the Agent')
            data = {
                'form': agentForm,
            }
    return render(request, 'seaimport/forwarder/others/create_agents.html', data)


@login_required()
def create_company(request):
    if request.method == 'GET':
        form = SeaImportCompanyForm()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = SeaImportCompanyForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'New Company Added Successfully')
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_company"))
        else:
            messages.error(request, 'There was an error adding the Company')
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_city(request):
    if request.method == 'GET':
        form = SeaImportCityForm()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = SeaImportCityForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'New City Added Successfully')
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_city"))
        else:
            messages.error(request, 'There was an error adding the City')
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_country(request):
    Form = SeaImportCountryForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_country"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_expense_type(request):
    Form = SeaImportExpenseTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_expensetype"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_freight_type(request):
    Form = SeaImportFreightTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_freighttype"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_goods_type(request):
    Form = SeaImportGoodsTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_goodstype"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_doc_type(request):
    Form = SeaImportDocTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_doctype"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_port(request):
    Form = SeaImportPortForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_seaport"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_package_type(request):
    Form = SeaImportPackageTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_package_type"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_container_type(request):
    Form = SeaImportContainerTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_container_type"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_agent_bank(request):
    Form = SeaImportAgentBankInfoForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_container_type"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)


@login_required()
def create_job_costing_expense_type(request):
    Form = SeaImportJobCostTypeForm
    if request.method == 'GET':
        form = Form()
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_create_job_costing_expense_type"))
        else:
            messages.error(request, form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_form.html', data)