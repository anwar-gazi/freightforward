def populate_data(apps, schema_editor):
    # # Create countries
    # SeaImportCountry = apps.get_model('seaimport', 'SeaImportCountry')
    # SeaImportCountry.objects.all().delete()
    #
    # bangladesh = SeaImportCountry.objects.create(
    #     name='BANGLADESH',
    #     alpha2_code='BD',
    # )
    #
    # switzerland = SeaImportCountry.objects.create(
    #     name='SWITZERLAND',
    #     alpha2_code='CH',
    # )
    #
    # # Create cities
    # SeaImportCity = apps.get_model('seaimport', 'SeaImportCity')
    # SeaImportCity.objects.all().delete()
    #
    # dhaka = SeaImportCity.objects.create(
    #     name='DHAKA',
    #     country=bangladesh,
    # )
    #
    # greifensee = SeaImportCity.objects.create(
    #     name='GREIFENSEE',
    #     country=switzerland,
    # )

    CityModel = apps.get_model('freightman', 'City')
    London = CityModel.objects.filter(name="London").first()
    Dhaka = CityModel.objects.filter(name="Dhaka").first()

    # Populating Agents data

    # Branches
    SeaImportAgent = apps.get_model('seaimport', 'SeaImportAgent')
    SeaImportAgent.objects.all().delete()

    # Company
    SeaImportCompany = apps.get_model('seaimport', 'SeaImportCompany')
    SeaImportCompany.objects.all().delete()

    hbl_consignor_company = SeaImportCompany.objects.create(
        name='OHAUS EUROPE GMBH',
        is_consignor=True,
    )

    hbl_consignor = SeaImportAgent.objects.create(
        name=hbl_consignor_company,
        branch='',
        address='IM LANGACHER',
        postal_code='CH-8606',
        city=London,
        contact="John Doe",
        email='',
        phone='41 44 944 22 66',
        mobile='41 44 944 22 30',
        fax='',

    )

    hbl_bank_company = SeaImportCompany.objects.create(
        name='SOUTHEASK BANK LIMITED',
        is_bank=True,
    )

    hbl_bank = SeaImportAgent.objects.create(
        name=hbl_bank_company,
        branch='NEW ESKATON BRANCH',
        address='ESKATON FANTASIA (1st Floor), RASHED KHAN MENON SARAK(OLD NEW ESKATON ROAD), RAMNA',
        postal_code='1000',
        city=Dhaka,
        contact="Rashed Khan",
        email='',
        phone='41 44 944 22 66',
        mobile='41 44 944 22 30',
        fax='',

    )

    hbl_notifier_company = SeaImportCompany.objects.create(
        name='SMH ENGINEERING LIMITED',
        is_importer=True,
    )

    hbl_notifier = SeaImportAgent.objects.create(
        name=hbl_notifier_company,
        branch='',
        address='52, NEW ESKATON ROAD, TMC BUILDING(7th FL)',
        postal_code='1000',
        city=Dhaka,
        contact="MR. ENGINEER",
        email='engineer@smh.com',
        phone='',
        mobile='',
        fax='',

    )

    mbl_shipper_company = SeaImportCompany.objects.create(
        name='JORDEX SHIPPING & FORWARDING B.V',
        is_foreign_agent=True,
    )

    mbl_shipper = SeaImportAgent.objects.create(
        name=mbl_shipper_company,
        branch='',
        address='C/O UPS (NETHERLANDS) BV',
        postal_code='6045GH',
        city=London,
        contact="",
        email='john@jordex.com',
        phone='',
        mobile='',
        fax='',
    )

    forwarder_company = SeaImportCompany.objects.create(
        name='NAVANA LOGISTICS LTD',
        is_forwarder=True,
    )

    forwarder = SeaImportAgent.objects.create(
        name=forwarder_company,
        branch='',
        address='A I N # 301080185 GREEN SQUARE (3RD FLOOR), HOUSE # 1/B, ROAD # 08, GULSHAN-1',
        postal_code='1212',
        city=Dhaka,
        contact="",
        email='mrshowkat@nll.bd.com',
        phone='+880-2-58810836',
        mobile='9893507',
        fax='+880-2-58813735',
    )

    # Creating goods type
    SeaImportGoodType = apps.get_model('seaimport', 'SeaImportGoodType')
    SeaImportGoodType.objects.all().delete()

    metals = SeaImportGoodType.objects.create(
        goods_type_name='METAL',
        goods_type_description='These are mainly metallic objects like screw, nuts, etc',
    )

    plastic = SeaImportGoodType.objects.create(
        goods_type_name='PLASTIC',
        goods_type_description='These are mainly plastic objects like toys'
    )

    steel = SeaImportGoodType.objects.create(
        goods_type_name='STEEL',
        goods_type_description='These are mainly steel objects like guns'
    )

    # Creating Expense type
    SeaImportExpenseType = apps.get_model('seaimport', 'SeaImportExpenseType')
    SeaImportExpenseType.objects.all().delete()

    SeaImportExpenseType.objects.create(name='DOC Fee')
    SeaImportExpenseType.objects.create(name='Sea Freight')

    # Creating Freight type
    SeaImportFreightType = apps.get_model('seaimport', 'SeaImportFreightType')
    SeaImportFreightType.objects.all().delete()

    SeaImportFreightType.objects.create(name='Freight Prepaid')
    SeaImportFreightType.objects.create(name='Freight Collect', freight_certificate='True')

    # Creating Document type
    SeaImportDocType = apps.get_model('seaimport', 'SeaImportDocType')
    SeaImportDocType.objects.all().delete()

    SeaImportDocType.objects.create(type_name='Invoice')

    # Creating Container Type
    ContainerType = apps.get_model('seaexport', 'ContainerType')
    ContainerType.objects.create(
        name='20"HQ',
        length_ft=19,
        width_ft=7,
        height_ft=8,
        capacity_cbm=3728
    )
