from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.forms import formset_factory
from django.contrib import messages

# helpers
from seaimport.helpers.view_helper import update_task_status_of_job

# models and forms import
from seaimport.models import SeaImportMbl, SeaImportHbl, SeaImportTask, SeaImportJob, SeaImportGood, \
    SeaImportDoc, SeaImportCreditNote

from seaimport.forms import SeaImportJobForm, SeaImportDocForm


# This fucntion creates a new job from the form. Here job means deconsolidation of HAWB and MAWB
@login_required()
@csrf_exempt
def create_new_job(request):
    # creating the forms
    jobform = SeaImportJobForm()
    mbls = SeaImportMbl.objects.filter(job=None)
    hbls = SeaImportHbl.objects.filter(job=None)
    doc_form_set = formset_factory(SeaImportDocForm)
    if request.method == 'GET':
        data = {
            'mbls': mbls,
            'hbls': hbls,
            'job_form': jobform,
            'doc_forms': doc_form_set(prefix='documents')
        }

        return render(request, 'seaimport/forwarder/deconsole/create.html', data)

    if request.method == 'POST':
        jobform = SeaImportJobForm(request.POST)
        doc_forms = doc_form_set(request.POST, request.FILES, prefix='documents')

        if jobform.is_valid() and doc_forms.is_valid():
            try:
                # Accessing the non form validation fields first, so that for any errors alert is thrown without creating a job
                data = request.POST.copy()
                mbl = SeaImportMbl.objects.get(pk=data.get('non_consoled_mbl'))
                hbl_numbers = list(map(int, request.POST.getlist('non_consoled_hbls[]')))
                hbls = SeaImportHbl.objects.filter(pk__in=hbl_numbers)

                if not hbls or not mbl:
                    raise Exception

                job = jobform.save(commit=False)
                task = SeaImportTask()
                task.save()
                job.task = task
                job.save()

                for docs in doc_forms:
                    doc = docs.save(commit=False)
                    doc.job = job
                    doc.save()

                mbl.job = job
                mbl.save()

                for hbl in hbls:
                    hbl.job = job
                    hbl.save()

                messages.success(request, 'New Job Created Successfully')
                return redirect('seaimport:sea_import_job_details', job_number=job.id)

            except Exception as e:
                messages.error(request, 'There are errors in the form please check')
                data = {
                    'mbls': mbls,
                    'hbls': hbls,
                    'job_form': jobform,
                    'doc_forms': doc_form_set(prefix='documents')
                }

                return render(request, 'seaimport/forwarder/deconsole/create.html', data)
        else:
            messages.error(request, 'There are errors in the form please check')
            data = {
                'mbls': mbls,
                'hbls': hbls,
                'job_form': jobform,
                'doc_forms': doc_form_set(prefix='documents')
            }

            return render(request, 'seaimport/forwarder/deconsole/create.html', data)


@login_required()
def job_details(request, job_number):
    job = SeaImportJob.objects.get(pk=job_number)
    hbls = SeaImportHbl.objects.filter(job=job)
    mbl = SeaImportMbl.objects.filter(job=job).first()
    goods = SeaImportGood.objects.filter(mbl=mbl)
    documents = SeaImportDoc.objects.filter(job=job)
    credit_notes = SeaImportCreditNote.objects.filter(job=job)

    update_task_status_of_job(job)

    data = {
        'job': job,
        'hbls': hbls,
        'mbl': mbl,
        'goods': goods,
        'documents': documents,
        'credit_notes': credit_notes,
    }
    return render(request, 'seaimport/forwarder/deconsole/single_job.html', data)


@login_required()
def job_list_all(request):
    jobs = SeaImportJob.objects.all().order_by('unlocked')
    mbls = SeaImportMbl.objects.filter(job__isnull=False).order_by('-job')

    data = {
        'jobs': jobs,
        'mbls': mbls,
    }
    return render(request, 'seaimport/forwarder/deconsole/deconsole_list.html', data)