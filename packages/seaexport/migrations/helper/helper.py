def populate_sea_ports(apps, schema_editor):
    SeaPort = apps.get_model('seaexport', 'SeaPort')
    SeaPort.objects.get_or_create(name='Chittagong Port, Bangladesh')
    SeaPort.objects.get_or_create(name='Mongla Port Port, Bangladesh')
    SeaPort.objects.get_or_create(name='Port of Bilbao, Spain')


def populate_sea_package_types(apps, schema_editor):
    PackageType = apps.get_model('seaexport', 'PackageType')
    PackageType.objects.get_or_create(name='container')


def populate_sea_terms_of_delivery(apps, schema_editor):
    TermsofDelivery = apps.get_model('seaexport', 'TermsofDelivery')
    TermsofDelivery.objects.get_or_create(code='FOB', title='Freight On Board')


def populate_sea_transport_agreements(apps, schema_editor):
    TransportAgreement = apps.get_model('seaexport', 'TransportAgreement')
    TransportAgreement.objects.get_or_create(title='Default Agreement', details='Default Agreement')


def populate_initial_data(apps, schema_editor):
    populate_sea_ports(apps, schema_editor)
    populate_sea_package_types(apps, schema_editor)
    populate_sea_terms_of_delivery(apps, schema_editor)
    populate_sea_transport_agreements(apps, schema_editor)
