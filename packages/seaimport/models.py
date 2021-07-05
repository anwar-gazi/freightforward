from django.core.exceptions import ValidationError
from django.db import models
from .helpers.file_helper import job_documents_path_rename, mbl_documents_path_rename, hbl_documents_path_rename, \
    bank_statement_documents
from seaexport.models import SeaPort, SeaExportPackageType, ContainerType
from freightman.models import City, Country

from django.conf import settings
from .helpers.model_helpers import days_since_today, generate_job_unique_id


class SeaImportCountry(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='Country Name')
    alpha2_code = models.CharField(max_length=2, unique=True, verbose_name='Alpha2 Code')

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'alpha2_code': self.alpha2_code,
        }


class SeaImportState(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country = models.ForeignKey('SeaImportCountry', on_delete=models.CASCADE)

    def __str__(self):
        return '{}, {}'.format(self.name, self.country)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'country': self.country,
        }


class SeaImportCompany(models.Model):
    name = models.CharField(max_length=100)
    logo = models.FileField(upload_to='seaimport/agent/logo', null=True, blank=True)
    icon = models.FileField(upload_to='seaimport/agent/icon', null=True, blank=True)
    is_forwarder = models.BooleanField(default=False, blank=True)
    is_consignor = models.BooleanField(default=False, blank=True, verbose_name='Consignor')
    is_importer = models.BooleanField(default=True, blank=True, verbose_name='Importer')
    is_bank = models.BooleanField(default=False, blank=True, verbose_name='Bank')
    is_foreign_agent = models.BooleanField(default=False, blank=True, verbose_name='Foreign Agent')

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'is_forwarder': self.is_forwarder,
            'is_consignor': self.is_consignor,
            'is_importer': self.is_importer,
            'is_bank': self.is_bank,
            'is_foreign_agent': self.is_foreign_agent,
        }


class SeaImportAgent(models.Model):
    name = models.ForeignKey('SeaImportCompany', on_delete=models.CASCADE, verbose_name='Company')
    branch = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=200)
    postal_code = models.CharField(max_length=100, null=True)
    city = models.ForeignKey(City, null=True, on_delete=models.SET_NULL)
    contact = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    mobile = models.CharField(max_length=30, null=True, blank=True)
    fax = models.CharField(max_length=100, null=True, blank=True)

    def agent_type(self):
        return '{}'.format(self.name.type)

    class Meta:
        unique_together = ('name', 'branch',)

    def __str__(self):
        return '{}, {}'.format(self.name, (self.branch or 'Main Branch'))

    def dict(self):
        return {
            'id': self.id,
            'name': self.name.dict(),
            'branch': self.branch,
            'address': self.address,
            'postal_code': self.postal_code,
            'city': self.city.dict(),
            'contact': self.contact,
            'email': self.email,
            'phone': self.phone,
            'mobile': self.mobile,
            'fax': self.fax,
        }

    def get_name_id(self):
        return {
            'id': self.id,
            'name': self.name.__str__(),
            'branch': self.branch or 'Main Branch',
        }


class SeaImportGoodType(models.Model):
    goods_type_name = models.CharField(max_length=100, verbose_name="Name", unique=True)
    goods_type_description = models.TextField(null=True, blank=True, verbose_name="Description")

    def __str__(self):
        return '{}'.format(self.goods_type_name)

    def dict(self):
        return {
            'id': self.id,
            'type': self.goods_type_name,
            'description': self.goods_type_description,
        }


class SeaImportGood(models.Model):
    type = models.ForeignKey('SeaImportGoodType', on_delete=models.CASCADE, verbose_name="Goods Type")
    description = models.TextField(null=True, blank=True, default="AS PER INVOICE", verbose_name="Description")
    container_seal_number = models.CharField(max_length=50, null=True, verbose_name="Container/Seal Number")
    quantity = models.FloatField(verbose_name="Quantity")
    package_type = models.ForeignKey('seaexport.SeaExportPackageType', null=True, on_delete=models.SET_NULL,
                                     verbose_name='Package Type', related_name='package_type')

    net_weight = models.FloatField(verbose_name="Net Weight")
    gross_weight = models.FloatField(verbose_name="Gross Weight")
    weight_unit = models.CharField(default='KG', max_length=20, blank=True, verbose_name="Container Size and Type")
    container_size_type = models.ForeignKey('seaexport.ContainerType', null=True, on_delete=models.SET_NULL,
                                            verbose_name='Container Type', related_name='container_type')

    mbl = models.ForeignKey('SeaImportMbl', null=True, on_delete=models.CASCADE, blank=True)
    hbl = models.ForeignKey('SeaImportHbl', null=True, on_delete=models.CASCADE, blank=True)

    def __str__(self):
        return '{}'.format(self.type)

    def dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'container_seal_number': self.container_seal_number,
            'quantity': self.quantity,
            'package_type': self.package_type,
            'net_weight': self.net_weight,
            'gross_weight': self.gross_weight,
            'weight_unit': self.weight_unit,
            'mbl': self.mbl,
            'hbl': self.hbl,
        }


class SeaImportFreightType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    freight_certificate = models.BooleanField(default=False, blank=True, verbose_name='Requires Freight Certificate')

    def __str__(self):
        return '{}'.format(self.name)

    def dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'freight_certificate_required': self.freight_certificate,
        }


class SeaImportMbl(models.Model):
    mbl_number = models.CharField(max_length=30, default='', verbose_name='MBL Number')
    mbl_shipper = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="MBLShipper",
                                    verbose_name='CONSIGNOR')
    mbl_consignee = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="MBLConsignee",
                                      verbose_name='CONSIGNEE')
    mbl_notifier = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="MBLNotifier",
                                     verbose_name='NOTIFIER')

    job = models.ForeignKey('SeaImportJob', null=True, on_delete=models.SET_NULL, blank=True)
    freight_type = models.ForeignKey('SeaImportFreightType', null=True, on_delete=models.SET_NULL)
    file = models.FileField(upload_to=mbl_documents_path_rename, verbose_name="ATTACH SCANNED COPY OF MBL DOCUMENT")

    proforma_invoice_no = models.CharField(max_length=100, verbose_name='Proforma Invoice No.', null=True)
    proforma_invoice_date = models.DateField(null=True, blank=False, verbose_name='Proforma Invoice Date')

    port_of_loading = models.ForeignKey('seaexport.SeaPort', null=True, on_delete=models.SET_NULL,
                                        verbose_name='Port of loading.', related_name='Loading_port')
    port_of_discharge = models.ForeignKey('seaexport.SeaPort', null=True, on_delete=models.SET_NULL,
                                          verbose_name='Port of destination.', related_name='Destination_port')

    feeder_vessel = models.CharField(max_length=200, verbose_name='Feeder Vessel.', null=True)
    eta_destination_port = models.DateField(null=True, blank=False,
                                            verbose_name='Estimated Time of Arrival: DEST Port')
    ocean_freight_cost_per_container = models.FloatField(null=True,
                                                         verbose_name='Ocean Freight Charge Per Container (USD)')
    unlocked = models.BooleanField(default=True, blank=True)

    def __str__(self):
        return '{}'.format(self.id)

    def dict(self):
        return {
            'id': self.id,
            'mbl_number': self.mbl_number,
            'mbl_shipper': self.mbl_shipper.get_name_id(),
            'mbl_consignee': self.mbl_consignee.get_name_id(),
            'mbl_notifier': self.mbl_notifier.get_name_id(),
            'freight_type': self.freight_type.name,
            'port_of_loading': self.port_of_loading.__str__(),
            'port_of_discharge': self.port_of_discharge.__str__(),
            'feeder_vessel': self.feeder_vessel,
            'eta_destination_port': self.eta_destination_port,
            'ocean_freight_cost_per_container': self.ocean_freight_cost_per_container,
            'job': self.job.__str__(),

        }

    def day_since_eta(self):
        return days_since_today(self.eta_destination_port)


class SeaImportHbl(models.Model):
    hbl_number = models.CharField(max_length=30, unique=True, default='', verbose_name='HBL Number')
    hbl_consignor = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="HBLConsignor",
                                      verbose_name="CONSIGNOR")
    hbl_bank = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="HBLBank",
                                 verbose_name="BANK")
    hbl_notifier = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE, related_name="HBLNotifier",
                                     verbose_name="NOTIFIER")

    task = models.OneToOneField('SeaImportTask', on_delete=models.CASCADE, blank=True)
    job = models.ForeignKey('SeaImportJob', null=True, on_delete=models.SET_NULL, blank=True)
    file = models.FileField(upload_to=hbl_documents_path_rename, verbose_name="ATTACH SCANNED COPY OF HBL DOCUMENT")
    unlocked = models.BooleanField(default=True, blank=True)

    def __str__(self):
        return '{}'.format(self.id)

    def dict(self):
        return {
            'id': self.id,

            'hbl_number': self.hbl_number,
            'hbl_consignor': self.hbl_consignor.dict(),
            'hbl_bank': self.hbl_bank.dict(),
            'hbl_notifier': self.hbl_notifier.dict(),
            'job': self.job,
            'file': self.file,

        }

    def total_income(self):
        expenses = SeaImportExpense.objects.filter(hbl=self.id)
        return sum([expense.amount for expense in expenses])

    # def total_profit(self):
    #     expenses = SeaImportExpense.objects.filter(hbl=self.id)
    #     return sum([expense.amount for expense in expenses if expense.type.type == '1'])


class SeaImportTask(models.Model):
    # Tracking job Progress
    pre_alert = models.BooleanField(default=True, blank=True)
    forwarding_letter_issued = models.BooleanField(default=False, blank=True)
    hbl_mbl_confirmation = models.BooleanField(default=False, blank=True)
    igm = models.BooleanField(default=False, blank=True)
    bin_number = models.BooleanField(default=False, blank=True)
    invoice = models.BooleanField(default=False, blank=True)
    freight_certificate = models.BooleanField(default=True, blank=True)
    do_issued = models.BooleanField(default=False, blank=True)
    unlocked = models.BooleanField(default=True, blank=True)

    def __str__(self):
        return '{}'.format(self.id)

    def job_progress(self):
        progress = 0
        tasks = 8
        total_percent = 100
        status = ''

        if self.pre_alert:
            progress += total_percent / tasks
            status = 'Pre Alert Received'

        if self.forwarding_letter_issued:
            progress += total_percent / tasks
            status = 'Forwarding Letter Issued'

        if self.hbl_mbl_confirmation:
            progress += total_percent / tasks
            status = 'MBL and HBL Confirmed'

        if self.igm:
            progress += total_percent / tasks
            status = 'IGM Done'

        if self.bin_number:
            progress += total_percent / tasks
            status = 'BIN Number Confirmation'

        if self.invoice:
            progress += total_percent / tasks
            status = 'Invoice Created'

        if self.freight_certificate:
            progress += total_percent / tasks
            status = 'Freight Certificate Issued'

        if self.do_issued:
            progress += total_percent / tasks
            status = 'Job Completed'

        return {
            'progress': int(progress),
            'status': status
        }


class SeaImportJob(models.Model):
    dollar_rate = models.FloatField(default=83, verbose_name="Current Dollar Rate")
    # Tracking job Progress
    task = models.OneToOneField('SeaImportTask', on_delete=models.CASCADE, blank=True)
    job_costing_done = models.BooleanField(default=False, blank=True)

    public_key = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False, verbose_name="JOB ID")
    unlocked = models.BooleanField(default=True, blank=True)

    # Basic Goods Info

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.public_key = generate_job_unique_id(self)
        super().save(*args, **kwargs)

    #
    # def job_unique_id(self):
    #     return generate_job_unique_id(self)

    def __str__(self):
        return '{}'.format(self.id)

    def dict(self):
        return {
            'id': self.id,
            'dollar_rate': self.dollar_rate,
            'port_of_loading': self.port_of_loading,
            'port_of_discharge': self.port_of_discharge,
            'feeder_vessel': self.feeder_vessel,
            'eta_destination_port': self.eta_destination_port,
            'task': self.task,
            'unlocked': self.unlocked,
            'created_at': self.created_at,
            'updated_at': self.updated_at,

        }

    def total_job_cost(self):
        expenses = SeaImportJobCost.objects.filter(job=self.id)
        return sum([expense.total_cost() for expense in expenses])

    def total_hbl_income(self):
        hbls = SeaImportHbl.objects.filter(job=self.id)
        return sum([hbl.total_income() for hbl in hbls])

    def total_profit(self):
        return self.total_hbl_income()- self.total_job_cost()


class SeaImportDocType(models.Model):
    type_name = models.CharField(max_length=20, verbose_name='Name of Document', unique=True)
    type_description = models.CharField(max_length=200, null=True, blank=True, verbose_name='Description')

    def __str__(self):
        return '{}'.format(self.type_name)

    def dict(self):
        return {
            'id': self.id,
            'type_name': self.type_name,
            'type_description': self.type_description,
        }


class SeaImportDoc(models.Model):
    doc_type = models.ForeignKey('SeaImportDocType', null=True, on_delete=models.SET_NULL)
    job = models.ForeignKey('SeaImportJob', on_delete=models.CASCADE, blank=True)
    file = models.FileField(upload_to=job_documents_path_rename)

    def __str__(self):
        return '{}'.format(self.doc_type)

    def dict(self):
        return {
            'id': self.id,
            'doc_type': self.doc_type,
            'job': self.job,
            'file': self.file,
        }


class SeaImportExpense(models.Model):
    hbl = models.ForeignKey('SeaImportHbl', on_delete=models.CASCADE)
    type = models.ForeignKey('SeaImportExpenseType', on_delete=models.CASCADE)
    amount = models.FloatField()

    def __str__(self):
        return '{}'.format(self.type)


class SeaImportExpenseType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    default = models.FloatField(default=0, null=True, blank=True, verbose_name="Default Cost (USD)")
    # expense_type_choices = (
    #     ('-1', 'Expense'),
    #     ('1', 'Income'),
    # )
    # type = models.CharField(max_length=2, choices=expense_type_choices, default='1')

    def __str__(self):
        return '{}'.format(self.name)


class SeaImportAgentBankInfo(models.Model):
    company = models.OneToOneField('SeaImportAgent', on_delete=models.CASCADE)
    account_no = models.CharField(max_length=20, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    swift_code = models.CharField(max_length=20, null=True, blank=True)
    bank_address = models.TextField(null=True, blank=True)

    def __str__(self):
        return '{}'.format(self.bank_name)


class SeaImportDeliveryOrder(models.Model):
    to = models.CharField(max_length=100, verbose_name="To")
    address = models.CharField(max_length=100, verbose_name="Address")
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    cargo_system = models.CharField(max_length=200, verbose_name="Cargo System")
    vessel = models.CharField(max_length=200, verbose_name='Vessel Name/Number')
    line_no = models.CharField(max_length=30, verbose_name='Line No')
    rotation_no = models.CharField(max_length=50, verbose_name='Import Rotation No')

    lc_number = models.CharField(max_length=200, verbose_name='LC Number and Dated')
    applicant_name = models.CharField(max_length=200, verbose_name='Applicants Name')
    applicant_address = models.CharField(max_length=300, verbose_name='Applicants Address')
    lcaf_number = models.CharField(max_length=200, verbose_name='LCAF NO.')
    applicant_irc = models.CharField(max_length=200, verbose_name="Applicant's IRC No")
    tin = models.CharField(max_length=200, verbose_name="Applicant's Tin No")
    bin_no = models.CharField(max_length=200, verbose_name="Applicant's Bin No")
    others = models.TextField(verbose_name="Other Information", null=True, blank=True)
    hbl = models.ForeignKey('SeaImportHbl', on_delete=models.CASCADE, blank=True)

    bank_statement = models.FileField(upload_to=bank_statement_documents, null=True, blank=True,
                                      verbose_name="ATTACH SCANNED COPY OF BANK RELEASE")

    def __str__(self):
        return '{}'.format(self.id)


# class SeaImportFreightCertificate(models.Model):
#     # Extra fields that are not available in other fields
#     proforma_invoice_no = models.CharField(max_length=100, verbose_name='Proforma Invoice No.', null=True)
#     proforma_invoice_date = models.DateField(null=True, blank=False, verbose_name='Proforma Invoice Date')
#
#     port_of_loading = models.ForeignKey('seaexport.SeaPort', null=True, on_delete=models.SET_NULL,
#                                         verbose_name='Port of loading.', related_name='Loading_port')
#     port_of_discharge = models.ForeignKey('seaexport.SeaPort', null=True, on_delete=models.SET_NULL,
#                                           verbose_name='Port of destination.', related_name='Destination_port')
#
#     feeder_vessel = models.CharField(max_length=200, verbose_name='Feeder Vessel.', null=True)
#     eta_destination_port = models.DateField(null=True, blank=False,
#                                             verbose_name='Estimated Time of Arrival: DEST Port')
#     ocean_freight_cost_per_container = models.FloatField(null=True,
#                                                          verbose_name='Ocean Freight Charge Per Container (USD)')
#     # container_type = models.CharField(null=True, max_length=100, verbose_name='Container Size and Type')
#     hbl = models.OneToOneField('SeaImportHbl', null=True, on_delete=models.CASCADE, blank=True)
#     mbl = models.ForeignKey('SeaImportMbl', null=True, on_delete=models.CASCADE, blank=True)
#
#     def __str__(self):
#         return '{}'.format(self.id)
#
#     def day_since_eta(self):
#         return days_since_today(self.eta_destination_port)


class SeaImportSystemSetting(models.Model):
    show_instruction = models.BooleanField(default=True)
    description = models.TextField(null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    instructions = models.ForeignKey('SeaImportFormInstruction', null=True, on_delete=models.SET(1), default=1,
                                     editable=False)


class SeaImportFormInstruction(models.Model):
    mbl_form = models.TextField(
        default="Please fill up the form to create and MBL document and attach the scanned copy of your mbl",
        blank=True)

    goods_form = models.TextField(
        default="To add mode option click the blue + button beside fields. After adding please refresh the page to see the new option",
        blank=True)

    mbl_other_info_form = models.TextField(
        default="To add mode option click the blue + button beside fields. After adding please refresh the page to see the new option",
        blank=True)

    def __str__(self):
        return '{}'.format(self.id)

    def save(self, *args, **kwargs):
        if SeaImportFormInstruction.objects.exists() and not self.pk:
            # if you'll not check for self.pk
            # then error will also raised in update of exists model
            raise ValidationError('There is can be only one SeaImportFormInstruction instance')
        return super(SeaImportFormInstruction, self).save(*args, **kwargs)


class SeaImportJobCostType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    default = models.FloatField(default=0, null=True, blank=True, verbose_name="Default Cost (USD)")
    expense_type_choices = (
        ('-1', 'Expense'),
        ('1', 'Income'),
    )
    type = models.CharField(max_length=2, choices=expense_type_choices, default='-1')

    def __str__(self):
        return '{}'.format(self.name)


class SeaImportJobCost(models.Model):
    job = models.ForeignKey('SeaImportJob', on_delete=models.CASCADE)
    name = models.ForeignKey('SeaImportJobCostType', on_delete=models.CASCADE, verbose_name="Name")
    amount = models.FloatField()
    apply_to_hbls_choice = (
        ('1', "Fixed Cost"),
        ('2', "Per HBLS"),
        ('3', "Per KG (New Weight)"),
        ('4', "On CBM"),
    )
    type = models.CharField(max_length=2, choices=apply_to_hbls_choice, default='1')

    def __str__(self):
        return '{}'.format(self.name)

    def total_cost(self):
        if self.type == '1':
            return self.amount
        elif self.type == '2':
            return len(SeaImportHbl.objects.filter(job=self.job))*self.amount
        elif self.type == '3':
            mbl = SeaImportMbl.objects.filter(job=self.job).first()
            goods = SeaImportGood.objects.filter(mbl=mbl).first()
            return self.amount*goods.net_weight
        elif self.type == '4':
            mbl = SeaImportMbl.objects.filter(job=self.job).first()
            goods = SeaImportGood.objects.filter(mbl=mbl).first()

            return self.amount * goods.container_size_type.capacity_cbm


class SeaImportCreditNoteCosts(models.Model):
    credit_note = models.ForeignKey('SeaImportCreditNote', on_delete=models.CASCADE)
    name = models.ForeignKey('SeaImportJobCostType', on_delete=models.CASCADE, verbose_name="Cost Type")
    amount = models.FloatField()

    def __str__(self):
        return '{}'.format(self.name)


class SeaImportCreditNote(models.Model):
    job = models.ForeignKey('SeaImportJob', on_delete=models.CASCADE)
    agent = models.ForeignKey('SeaImportAgent', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Job - {}".format(self.job)

    def total_credit(self):
        creditCosts = SeaImportCreditNoteCosts.objects.filter(credit_note=self)
        return sum([cost.amount for cost in creditCosts])
