from ..models import SeaImportHbl, SeaImportMbl, SeaImportJob, SeaImportTask


# A function to update jobs timeline from all the related hbls
def update_task_status_of_job(job):
    hbls = SeaImportHbl.objects.filter(job=job)
    mbl = SeaImportMbl.objects.filter(job=job).first()

    job.task.pre_alert = True
    for hbl in hbls:
        if not hbl.task.pre_alert:
            job.task.pre_alert = False
            break

    job.task.hbl_mbl_confirmation = True
    for hbl in hbls:
        if not hbl.task.hbl_mbl_confirmation:
            job.task.hbl_mbl_confirmation = False
            break

    job.task.igm = True
    for hbl in hbls:
        if not hbl.task.igm:
            job.task.igm = False
            break

    job.task.bin_number = True
    for hbl in hbls:
        if not hbl.task.bin_number:
            job.task.bin_number = False
            break

    job.task.forwarding_letter_issued = True
    for hbl in hbls:
        if not hbl.task.forwarding_letter_issued:
            job.task.forwarding_letter_issued = False
            break

    job.task.freight_certificate = True
    for hbl in hbls:
        if not mbl.freight_type.freight_certificate:
            hbl.task.freight_certificate = True
            hbl.task.save()
        if not hbl.task.freight_certificate:
            job.task.freight_certificate = False
            break

    job.task.invoice = True
    for hbl in hbls:
        if not hbl.task.invoice:
            job.task.invoice = False
            break

    job.task.do_issued = True
    for hbl in hbls:
        if not hbl.task.do_issued:
            job.task.do_issued = False
            break

    if job.task.do_issued:
        lock_job(job)

    job.task.save()


def lock_job(job):
    mbl = SeaImportMbl.objects.get(job=job)
    hbls = SeaImportHbl.objects.filter(job=job)

    job.task.unlocked = False
    job.save()
    mbl.unlocked = False
    mbl.save()
    for hbl in hbls:
        hbl.unlocked = False
        hbl.save()


