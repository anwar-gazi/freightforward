from seaimport.models import SeaImportDoc, SeaImportJob, SeaImportAgent, SeaImportHbl, SeaImportMbl
from django.core.mail import EmailMultiAlternatives
from django.shortcuts import render


def pre_alert_email_body(request, hbl:SeaImportHbl):

    data = {
        'hbl': hbl,
        'mbl': SeaImportMbl.objects.get(job=hbl.job),
    }
    return render(request, 'seaimport/forwarder/email_body/pre_alert.html', data)


# obey settings
def send_sea_import_forwarding_letter_mail(request, hbl: SeaImportHbl):
    notify_emails = {
        hbl.hbl_notifier.email,
    }
    #
    # document = SeaImportDoc.objects.filter(job=job, doc_type=1).first()
    hbl_document = hbl.file.read()
    #
    subject = 'Shipment From - {}'.format(hbl.hbl_consignor)
    body = '<email has html body>'
    html_content = pre_alert_email_body(request, hbl).content.decode('utf-8')
    # print(html_content)
    #
    msg = EmailMultiAlternatives(subject, body, from_email='freightautomat@gmail.com', to=notify_emails)
    msg.attach_alternative(html_content, "text/html")
    msg.attach('HBL-{}'.format(hbl.hbl_number), hbl_document, 'image/jpeg')
    msg.send()
    #
    # return notify_emails
