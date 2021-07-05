from django.shortcuts import render, get_object_or_404, reverse
from django.http import HttpResponseRedirect
from seaimport.forms import SeaImportAgentForm, SeaImportCompanyForm, SeaImportCompany, SeaImportAgent
from django.contrib import messages
from django.contrib.auth.decorators import login_required


@login_required()
def edit_company(request, id):
    company = get_object_or_404(SeaImportCompany, pk=id)
    Form = SeaImportCompanyForm
    Form.form_name = 'Edit Company Information'
    Form.success_message = 'Company info Updated Successfully'
    Form.error_message = 'There was an error updating the Company info'

    if request.method == 'GET':
        form = Form(instance=company)
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST, instance=company)
        if form.is_valid():
            form.save()
            messages.success(request, Form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_list_company"))
        else:
            messages.error(request, Form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_update_form.html', data)


@login_required()
def edit_agent(request, id):
    instance = get_object_or_404(SeaImportAgent, pk=id)
    Form = SeaImportAgentForm
    Form.form_name = 'Edit Agent Information'
    Form.success_message = 'Agent info Updated Successfully'
    Form.error_message = 'There was an error updating the Agent info'

    if request.method == 'GET':
        form = Form(instance=instance)
        data = {
            'form': form,
        }

    if request.method == 'POST':
        form = Form(request.POST, instance=instance)
        if form.is_valid():
            form.save()
            messages.success(request, Form.success_message)
            return HttpResponseRedirect(reverse("seaimport:sea_import_list_agent"))
        else:
            messages.error(request, Form.error_message)
            data = {
                'form': form,
            }

    return render(request, 'seaimport/forwarder/others/general_update_form.html', data)