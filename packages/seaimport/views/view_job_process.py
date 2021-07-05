from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms import formset_factory
from django.contrib import messages
# helpers
from seaimport.helpers.view_helper import update_task_status_of_job

# models and forms import
from seaimport.models import SeaImportMbl, SeaImportHbl, SeaImportGood, SeaImportAgentBankInfo, \
    SeaImportExpense, SeaImportCreditNote, SeaImportCreditNoteCosts, SeaImportDeliveryOrder, \
    SeaImportJob, SeaImportJobCost

from seaimport.forms import SeaImportJobCostForm, SeaImportJobDollarRateForm, SeaImportCreditNoteCostForm, \
    SeaImportCreditNoteForm, SeaImportExpenseForm, SeaImportDeliveryOrderForm, SeaImportGoodForm


@login_required()
def view_invoice(request, hbl_number):
    hbl = SeaImportHbl.objects.get(pk=hbl_number)
    mbl = SeaImportMbl.objects.filter(job=hbl.job).first()
    good = SeaImportGood.objects.filter(hbl=hbl).first()
    forwarder_bank = SeaImportAgentBankInfo.objects.filter(company=mbl.mbl_notifier).first()
    expenses = SeaImportExpense.objects.filter(hbl=hbl)

    data = {
        'mbl': mbl,
        'hbl': hbl,
        'good': good,
        'forwarder_bank': forwarder_bank,
        'expenses': expenses
    }
    return render(request, 'seaimport/forwarder/deconsole/invoice.html', data)


@login_required()
def view_credit_note(request, credit_note_number):
    credit_note = get_object_or_404(SeaImportCreditNote, pk=credit_note_number)
    mbl = SeaImportMbl.objects.filter(job=credit_note.job).first()
    credit_note_costs = SeaImportCreditNoteCosts.objects.filter(credit_note=credit_note)

    data = {
        'credit_note': credit_note,
        'mbl': mbl,
        'credit_note_costs': credit_note_costs,
    }
    return render(request, 'seaimport/forwarder/deconsole/credit_note.html', data)


@login_required()
@csrf_exempt
def update_creditnote(request, credit_note_number):
    # Forms
    credit_note = get_object_or_404(SeaImportCreditNote, pk=credit_note_number)
    job = get_object_or_404(SeaImportJob, id=credit_note.job.id)
    credit_note_costs = SeaImportCreditNoteCosts.objects.filter(credit_note=credit_note)

    #
    # print(hbl,mbl)
    credit_note_cost_form_set = formset_factory(SeaImportCreditNoteCostForm)
    credit_note_form = SeaImportCreditNoteForm(instance=credit_note)

    if len(credit_note_costs) > 0:
        credit_note_cost_form_set = formset_factory(SeaImportCreditNoteCostForm, extra=0)
        credit_note_cost_form_set_with_data = credit_note_cost_form_set(
            initial=[{'name': expense.name, 'amount': expense.amount} for expense in
                     credit_note_costs])

    if request.method == 'GET':
        # Models
        data = {
            'credit_note_cost_form_set': credit_note_cost_form_set_with_data,
            'credit_note_form': credit_note_form,
            'job': job,
            'credit_note': credit_note,

        }
        return render(request, 'seaimport/forwarder/deconsole/update_credit_note.html', data)

    if request.method == 'POST':
        credit_note_cost_form_set_data = credit_note_cost_form_set(request.POST)
        credit_note_form_data = SeaImportCreditNoteForm(request.POST, instance=credit_note)
        try:

            if credit_note_cost_form_set_data.is_valid() and credit_note_form_data.is_valid():
                # credit_note = credit_note_form_data.save(commit=False)
                # credit_note.job = job
                credit_note = credit_note_form_data.save()

                # Deleting all previous data and creting new with the updated data
                credit_note_costs.delete()

                for cost in credit_note_cost_form_set_data:
                    c = cost.save(commit=False)
                    c.credit_note = credit_note
                    c.save()

                messages.success(request, "Credit Note Updated Successfully")
                return redirect('seaimport:sea_import_update_creditnote', credit_note_number=credit_note.id)
            else:
                messages.error(request, "There was an error updating the credit note")
                data = {
                    'credit_note_cost_form_set': credit_note_cost_form_set_data,
                    'credit_note_form': credit_note_form_data,
                    'job': job,
                    'credit_note': credit_note,

                }
                return render(request, 'seaimport/forwarder/deconsole/update_credit_note.html', data)
        except Exception as e:
            # print(e)
            messages.error(request, "There was an error updating the credit note")
            data = {
                'credit_note_cost_form_set': credit_note_cost_form_set_data,
                'credit_note_form': credit_note_form_data,
                'job': job,
                'credit_note': credit_note,

            }
            return render(request, 'seaimport/forwarder/deconsole/update_credit_note.html', data)


@login_required()
def view_do(request, hbl_number):
    hbl = SeaImportHbl.objects.get(pk=hbl_number)
    mbl = get_object_or_404(SeaImportMbl, job=hbl.job)
    good = SeaImportGood.objects.filter(hbl=hbl).first()
    delivery_order = SeaImportDeliveryOrder.objects.filter(hbl=hbl).first()

    validity_url = "{}?document=HBL{}&issue_date={}".format(
        request.build_absolute_uri(reverse('seaimport:sea_import_documents_validity')), hbl.hbl_number,
        hbl.job.created_at.date())
    # print(validity_url)

    if hbl.task.do_issued or request.user.is_superuser:
        data = {
            'hbl': hbl,
            'mbl': mbl,
            'good': good,
            'delivery_order': delivery_order,
            'validity_url': validity_url,
        }
        return render(request, 'seaimport/forwarder/view_delivery_order.html', data)
    else:
        return HttpResponse("The DO has not been confirmed yet by any authorised persons")


@login_required()
def view_freight_certificate(request, hbl_number):
    hbl = get_object_or_404(SeaImportHbl, pk=hbl_number)
    mbl = get_object_or_404(SeaImportMbl, job=hbl.job)
    good = SeaImportGood.objects.filter(hbl=hbl).first()
    mbl_good = SeaImportGood.objects.filter(mbl=mbl).first()

    data = {
        'hbl': hbl,
        'good': good,
        'mbl': mbl,
        'mbl_good': mbl_good,
    }
    return render(request, 'seaimport/forwarder/view_freight_collect.html', data)


def preview_forwarding_letter(request, hbl_number):
    hbl = get_object_or_404(SeaImportHbl, pk=hbl_number)
    mbl = get_object_or_404(SeaImportMbl, job=hbl.job)
    data = {
        'hbl': hbl,
        'mbl': mbl,
    }

    return render(request, 'seaimport/forwarder/email_body/preview.html', data)


@login_required()
@csrf_exempt
def create_job_costing(request, job_number):
    # Models
    job = get_object_or_404(SeaImportJob, pk=job_number)
    mbl = SeaImportMbl.objects.filter(job=job).first()
    goods = SeaImportGood.objects.filter(mbl=mbl)
    expenses = SeaImportJobCost.objects.filter(job=job)
    had_expenses = len(expenses)

    # if no expenses are previously created get the job type and use the last format used for that type
    if len(expenses) == 0:
        try:
            last_mbl_of_this_type = SeaImportMbl.objects.filter(freight_type=mbl.freight_type, unlocked=False).first()
            # print(last_mbl_of_this_type)

            # get the last expense to among these hbls
            expense_latest = SeaImportJobCost.objects.filter(job=last_mbl_of_this_type.job)

            if len(expense_latest):
                ExpenseForms = formset_factory(SeaImportJobCostForm, extra=0)
            else:
                ExpenseForms = formset_factory(SeaImportJobCostForm, extra=1)

            ExpenseFormWithData = ExpenseForms(
                initial=[{'name': expense.name, 'amount': expense.amount, 'type': expense.type} for expense in
                         expense_latest])
        except Exception as e:
            # print(e)
            ExpenseForms = formset_factory(SeaImportJobCostForm)
            ExpenseFormWithData = ExpenseForms(
                initial=[{'name': expense.name, 'amount': expense.amount, 'type': expense.type} for expense in
                         expenses])
    else:
        ExpenseForms = formset_factory(SeaImportJobCostForm, extra=0)
        ExpenseFormWithData = ExpenseForms(
            initial=[{'name': expense.name, 'amount': expense.amount, 'type': expense.type} for expense in expenses])
    #
    # # Forms
    DollarRateForm = SeaImportJobDollarRateForm
    #
    if request.method == 'POST':
        DollarRate = DollarRateForm(request.POST, instance=job)
        ExpenseFormSet = ExpenseForms(request.POST)

        # print(DollarRate.is_valid(), ExpenseFormSet.is_valid())
        if DollarRate.is_valid() and ExpenseFormSet.is_valid():
            DollarRate.save()

            # Deleting all previous Instances and creating new
            if had_expenses:
                expenses.delete()
                messages.success(request, 'Job Cost Updated')
            else:
                messages.success(request, 'Job Cost Created')

            # print(len(ExpenseFormSet))
            for ExpenseForm in ExpenseFormSet:
                EF = ExpenseForm.save(commit=False)
                EF.job = job
                EF.save()

            job.job_costing_done = True
            job.save()
            update_task_status_of_job(job)

            return redirect('seaimport:sea_import_create_job_costing', job_number=job.id)
        else:

            messages.error(request, 'There are errors in the form please check')
            data = {
                'job': job,
                'goods': goods,
                'mbl': mbl,
                'DollarRateForm': DollarRate,
                'ExpenseForms': ExpenseFormSet,
                'has_expense': had_expenses,
            }
            return render(request, 'seaimport/forwarder/deconsole/create_job_costing.html', data)

    # if job is completed then view this page else return back
    data = {
        'job': job,
        'goods': goods,
        'mbl': mbl,
        'DollarRateForm': DollarRateForm(instance=job),
        'ExpenseForms': ExpenseFormWithData,
        'has_expense': had_expenses,
    }
    return render(request, 'seaimport/forwarder/deconsole/create_job_costing.html', data)


@login_required()
@csrf_exempt
def create_credit_note(request, job_number):
    # Forms
    job = get_object_or_404(SeaImportJob, pk=job_number)
    # hbl = SeaImportHbl.objects.filter(job=job)
    # mbl = SeaImportMbl.objects.filter(job=job).first()
    #
    # print(hbl,mbl)
    credit_note_cost_form_set = formset_factory(SeaImportCreditNoteCostForm)
    credit_note_form = SeaImportCreditNoteForm()

    # credit_note_form.fields['agent'].

    if request.method == 'GET':
        # Models
        data = {
            'credit_note_cost_form_set': credit_note_cost_form_set,
            'credit_note_form': credit_note_form,
            'job': job,

        }
        return render(request, 'seaimport/forwarder/deconsole/create_credit_note.html', data)

    if request.method == 'POST':
        credit_note_cost_form_set_data = credit_note_cost_form_set(request.POST)
        credit_note_form_data = SeaImportCreditNoteForm(request.POST)
        try:

            if credit_note_cost_form_set_data.is_valid() and credit_note_form_data.is_valid():
                credit_note = credit_note_form_data.save(commit=False)
                credit_note.job = job
                credit_note.save()

                for cost in credit_note_cost_form_set_data:
                    c = cost.save(commit=False)
                    c.credit_note = credit_note
                    c.save()

                messages.success(request, "Credit Note Created Successfully")
                return redirect('seaimport:sea_import_update_creditnote', credit_note_number=credit_note.id)
            else:
                messages.error(request, "There was an error creating the credit note")
                data = {
                    'credit_note_cost_form_set': credit_note_cost_form_set_data,
                    'credit_note_form': credit_note_form_data,
                    'job': job,

                }
                return render(request, 'seaimport/forwarder/deconsole/create_credit_note.html', data)
        except Exception as e:
            print(e)
            messages.error(request, "There was an error creating the credit note")
            data = {
                'credit_note_cost_form_set': credit_note_cost_form_set_data,
                'credit_note_form': credit_note_form_data,
                'job': job,

            }
            return render(request, 'seaimport/forwarder/deconsole/create_credit_note.html', data)

@login_required()
@csrf_exempt
def create_invoice(request, hbl_number):
    # Models
    hbl = get_object_or_404(SeaImportHbl, pk=hbl_number)
    mbl = SeaImportMbl.objects.filter(job=hbl.job).first()
    goods = SeaImportGood.objects.filter(hbl=hbl)
    expenses = SeaImportExpense.objects.filter(hbl=hbl)
    had_expenses = len(expenses)

    # if no expenses are previously created get the job type and use the last format used for that type
    if len(expenses) == 0:
        try:
            query_mbsl = SeaImportMbl.objects.filter(freight_type=mbl.freight_type)
            query_jobs = [mbl.job.id for mbl in query_mbsl if mbl.job]

            query_hbls = SeaImportHbl.objects.filter(job__in=query_jobs)

            # get the last expense to among these hbls
            expense_latest = SeaImportExpense.objects.filter(hbl__in=query_hbls).latest('id')
            # Get all the expense for the hbl of the latest_expense to use it as a template
            expenses = SeaImportExpense.objects.filter(hbl=expense_latest.hbl)

            ExpenseForms = formset_factory(SeaImportExpenseForm, extra=0)

            ExpenseFormWithData = ExpenseForms(
                initial=[{'type': expense.type, 'amount': expense.amount} for expense in expenses])
        except Exception as e:
            # print(e)
            ExpenseForms = formset_factory(SeaImportExpenseForm)
            ExpenseFormWithData = ExpenseForms(
                initial=[{'type': expense.type, 'amount': expense.amount} for expense in expenses])
    else:
        ExpenseForms = formset_factory(SeaImportExpenseForm, extra=0)
        ExpenseFormWithData = ExpenseForms(
            initial=[{'type': expense.type, 'amount': expense.amount} for expense in expenses])

    forwarder_bank = SeaImportAgentBankInfo.objects.filter(company=mbl.mbl_notifier).first()

    # Forms
    DollarRateForm = SeaImportJobDollarRateForm

    if request.method == 'POST':
        DollarRate = DollarRateForm(request.POST, instance=hbl.job)
        ExpenseFormSet = ExpenseForms(request.POST)

        # print(DollarRate.is_valid(), ExpenseFormSet.is_valid())
        if DollarRate.is_valid() and ExpenseFormSet.is_valid():
            DollarRate.save()

            # Deleting all previous Instances and creating new
            if had_expenses:
                expenses.delete()
                messages.success(request, 'Invoice Updated')
            else:
                messages.success(request, 'Invoice Created')

            # print(len(ExpenseFormSet))
            for ExpenseForm in ExpenseFormSet:
                EF = ExpenseForm.save(commit=False)
                EF.hbl = hbl
                EF.save()

            task = hbl.task
            task.invoice = True
            task.save()
            update_task_status_of_job(hbl.job)

            return redirect('seaimport:sea_import_create_invoice', hbl_number=hbl.id)
        else:

            messages.error(request, 'There are errors in the form please check')
            data = {
                'hbl': hbl,
                'goods': goods,
                'mbl': mbl,
                'DollarRateForm': DollarRate,
                'ExpenseForms': ExpenseFormSet,
                'forwarder_bank': forwarder_bank,
                'has_expense': had_expenses,
            }
            return render(request, 'seaimport/forwarder/create_invoice.html', data)

    # if job is completed then view this page else return back
    data = {
        'hbl': hbl,
        'goods': goods,
        'mbl': mbl,
        'DollarRateForm': DollarRateForm(instance=hbl.job),
        'ExpenseForms': ExpenseFormWithData,
        'forwarder_bank': forwarder_bank,
        'has_expense': had_expenses,
    }
    return render(request, 'seaimport/forwarder/create_invoice.html', data)


@login_required()
@csrf_exempt
def create_delivery_order(request, hbl_number):
    # Models
    hbl = SeaImportHbl.objects.get(pk=hbl_number)
    freightType = get_object_or_404(SeaImportMbl, job=hbl.job).freight_type
    goods = SeaImportGood.objects.filter(hbl=hbl).first()
    delivery_order = SeaImportDeliveryOrder.objects.filter(hbl=hbl).first()

    if not hbl.task.unlocked:
        return redirect('seaimport:sea_import_view_do', hbl_number=hbl_number)

    # # Forms
    DeliveryOrderForm = SeaImportDeliveryOrderForm
    GoodsForm = SeaImportGoodForm
    # # Goods form with data
    #
    if request.method == 'POST':
        GoodsFormData = GoodsForm(data=request.POST, instance=goods)
        DeliveryOrderFormData = DeliveryOrderForm(request.POST, request.FILES, instance=delivery_order)
        # form = SessionForm(instance=instance, data=request.POST)

        # print(GoodsFormData.is_valid())
        # print('\n\n\n', GoodsFormData.non_field_errors)
        if GoodsFormData.is_valid() and DeliveryOrderFormData.is_valid():
            goods = GoodsFormData.save()

            # Updading or creating
            DO = DeliveryOrderFormData.save(commit=False)
            DO.hbl = hbl
            DO.save()

            goods = goods
            delivery_order = DO

            # Check if updated or newly created
            if delivery_order:
                messages.success(request, 'Delivery Order Updated Successfully')
            else:
                messages.success(request, 'Delivery Order Created Successfully')
        else:

            messages.error(request, 'There are errors in the form please check')
            data = {
                'hbl': hbl,
                'freightType': freightType,
                'delivery_order': delivery_order,
                'DeliveryOrderForm': DeliveryOrderFormData,
                'GoodsForm': GoodsFormData,
            }
            return render(request, 'seaimport/forwarder/create_do.html', data)

    #
    data = {
        'hbl': hbl,
        'freightType': freightType,
        'delivery_order': delivery_order,
        'DeliveryOrderForm': DeliveryOrderForm(instance=delivery_order),
        'GoodsForm': GoodsForm(instance=goods),
    }
    return render(request, 'seaimport/forwarder/create_do.html', data)