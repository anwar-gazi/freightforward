from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from seaimport.models import SeaImportAgent, SeaImportJob, SeaImportTask, SeaImportHbl
from seaimport.helpers.mail_sender import send_sea_import_forwarding_letter_mail
from seaimport.helpers.view_helper import update_task_status_of_job
from django.contrib import messages
from django.contrib.auth.decorators import login_required


@login_required()
def dashboard_main(request):
    return render(request, 'seaimport/forwarder/dashboard.html')

@csrf_exempt
def register(request):
    for key in request.POST:
        # print(key)
        value = request.POST[key]
        print("{}:{}".format(key, value))
    return HttpResponse(status=200)

@login_required()
def admin_dashboard(request):
    data = {
        'system_owner': SeaImportAgent.objects.filter(name__is_forwarder=True).first()
    }
    return render(request, 'seaimport/forwarder/admin_dashboard.html', data)


@login_required()
def user_settings(request):
    data = {
    }
    return render(request, 'seaimport/forwarder/settings.html', data)


@login_required()
@csrf_exempt
def job_update_progress(request, task_number):
    # print(task_number)
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'field': ''
    }
    # print('Task Number', task_number, request.user)
    if request.method == 'POST' and request.user.is_authenticated:
        task = get_object_or_404(SeaImportTask, pk=task_number)
        field = request.POST.get('field')

        # print(task.unlocked, field)
        # time.sleep(3)

        if task.unlocked:
            if field == 'pre_alert':
                if not task.pre_alert:
                    task.pre_alert = True
                    resp['success'] = True

            elif field == 'forwarding_letter_issued' and task.pre_alert:
                hbl = get_object_or_404(SeaImportHbl, task=task)
                try:
                    send_sea_import_forwarding_letter_mail(request, hbl)
                    if not task.forwarding_letter_issued:
                        messages.success(request, "Forwarding Letter Sent")
                        task.forwarding_letter_issued = True
                        resp['success'] = True
                    else:
                        messages.success(request, "Forwarding Letter Re Sent")
                except Exception:
                    # print(Exception)
                    messages.error(request, "There was an error sending the Forwarding Letter, Please try again")

            elif field == 'hbl_mbl_confirmation' and task.forwarding_letter_issued:
                task.hbl_mbl_confirmation = not task.hbl_mbl_confirmation
                resp['success'] = True

            elif field == 'igm' and task.hbl_mbl_confirmation:
                task.igm = not task.igm
                resp['success'] = True

            elif field == 'bin_number' and task.igm:
                task.bin_number = not task.bin_number
                resp['success'] = True

            elif field == 'invoice' and task.bin_number:
                task.invoice = not task.invoice
                resp['success'] = True

            elif field == 'freight_certificate' and task.bin_number:
                task.freight_certificate = not task.freight_certificate
                resp['success'] = True

            elif field == 'do_issued' and task.freight_certificate:
                task.do_issued = not task.do_issued
                task.unlocked = not task.do_issued
                resp['success'] = True

        task.save()

    resp['field'] = field

    hbl = SeaImportHbl.objects.filter(task=task).first()
    update_task_status_of_job(hbl.job)

    return JsonResponse(resp)


def documents_validity(request):
    document_number = request.GET.get('document')
    issue_date = request.GET.get('issue_date')
    try:
        if document_number[:3] == "HBL":
            hbl = get_object_or_404(SeaImportHbl, hbl_number=document_number[3:])
            if not hbl.unlocked and (str(hbl.job.created_at.date()) == issue_date):
                messages.success(request,
                                 'The HBL Document is valid and was issued to {}'.format(hbl.hbl_notifier.name))
            else:
                messages.error(request,
                               'Document not valid. If you think this is a system error, please contact NAVANA LOGISTICS LIMITED')
        else:
            messages.error(request,
                           'Document not valid. If you think this is a system error, please contact NAVANA LOGISTICS LIMITED')
    except:
        messages.error(request,
                       'Document not valid. If you think this is a system error, please contact NAVANA LOGISTICS LIMITED')
        messages.info(request, 'Enter a document number and issue date to check validity')

    data = {
        'document_number': document_number,
        'issue_date': issue_date,
    }
    return render(request, 'seaimport/forwarder/others/document_validity.html', data)


def gp_listing(request):
    jobs = SeaImportJob.objects.all().order_by('created_at')
    # hbls = sorted(hbls, key=lambda hbl: hbl.total_profit(), reverse=False)
    data = {
        'jobs': jobs
    }
    return render(request, 'seaimport/forwarder/report/gp_listing.html', data)