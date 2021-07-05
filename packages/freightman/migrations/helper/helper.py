from django.contrib.auth import get_user_model


def superuser_droid(apps, schema_editor):
    UserModel = get_user_model()
    Timezone = apps.get_model('freightman', 'TimeZone')
    tz_bd = Timezone.objects.get(tz_name='Asia/Dhaka')
    u_q = UserModel.objects.filter(username='droid')
    if not u_q.exists():
        user = UserModel.objects.create_superuser('droid', 'polarglow06@gmail.com', 'droid273', time_zone_id=tz_bd.id)
        return user
    else:
        return u_q.first()


def basic_timezones_and_default_for_all(apps, schema_editor):
    UserModel = get_user_model()
    Timezone = apps.get_model('freightman', 'TimeZone')
    Timezone.objects.all().delete()
    tz_sg = Timezone.objects.create(tz_name='Asia/Singapore', utc_offset_sign='+', utc_offset_hour=8,
                                    utc_offset_minute=0)
    tz_bd = Timezone.objects.create(tz_name='Asia/Dhaka', utc_offset_sign='+', utc_offset_hour=6, utc_offset_minute=0)
    UserModel.objects.update(time_zone=tz_bd)


def get_any_booking():
    from freightman.models import FreightBooking
    insert_a_booking()
    return FreightBooking.objects.all().first()


def insert_a_booking():
    from freightman.models import FreightBooking, Organization
    from datetime import date
    from django.contrib.auth import get_user_model
    org = Organization.objects.get_or_create(title='Astrotex')
    FreightBooking.objects.create(org=org, edd=date.today(), entry_by=get_user_model(), is_draft=True, entry_complete=True)


def get_any_country():
    from freightman.models import Country
    insert_country_bangladesh_if_not_exists()
    return Country.objects.all().first()


def insert_country_bangladesh_if_not_exists():
    from freightman.models import Country
    if not Country.objects.filter(code_isoa2__icontains='bd').exists():
        Country.objects.create(name='Bangladesh', code_isoa2='BD')


# Deprecated
def add_package_type_carton(apps, schema_editor):
    from freightman.models import PackageType, Organization
    # PackageType = apps.get_model('freightman','PackageType')
    # PackageType = apps.get_model('freightman','PackageType')
    for org in Organization.objects.all():
        # print('\n\n\n\n\n',org.id)
        try:
            PackageType.objects.get_or_create(org=org.id, name='Carton')
        except:
            pass


def remove_dup_package_types(apps, schema_editor):
    PackageType = apps.get_model('freightman', 'PackageType')
    names = []
    for pack in PackageType.objects.all():
        if pack.name in names:
            pack.delete()
        else:
            names.append(pack.name)


def populate_initial_package_types(apps, schema_editor):
    PackageType = apps.get_model('freightman', 'PackageType')
    PackageType.objects.get_or_create(name='Carton')


def populate_airports(apps, schema_editor):
    Airport = apps.get_model('freightman', 'Airport')
    lcy, _lcycreated = Airport.objects.get_or_create(code='LCY')
    lcy.name = 'London City Airport'
    lcy.save()
    dac, _daccreated = Airport.objects.get_or_create(code='DAC')
    dac.name = 'Hazrat Shahjalal Intl Airport Dhaka'
    dac.save()


def populate_country_and_city(apps, schema_editor):
    Country = apps.get_model('freightman', 'Country')
    City = apps.get_model('freightman', 'City')

    bd, _bdcreated = Country.objects.get_or_create(code_isoa2='BD')
    bd.name = 'Bangladesh'
    bd.save()

    uk, _ukcreated = Country.objects.get_or_create(code_isoa2='UK')
    uk.name = 'United Kingdom'
    uk.save()

    london, _londoncreated = City.objects.get_or_create(country=uk, name='London')
    dhaka, _dhakacreated = City.objects.get_or_create(country=bd, name='Dhaka')


def populate_terms_of_delivery(apps, schema_editor):
    TermsofDelivery = apps.get_model('freightman', 'TermsofDelivery')
    TermsofDelivery.objects.get_or_create(code='CIF', title='Cost Insurance and Freight')
    TermsofDelivery.objects.get_or_create(code='CFR', title='Cost And Freight')
    TermsofDelivery.objects.get_or_create(code='FOB', title='Free On Board')
    TermsofDelivery.objects.get_or_create(code='FAS', title='Free Alongside Ship')
    TermsofDelivery.objects.get_or_create(code='DDP', title='Delivered Duty Paid')
    TermsofDelivery.objects.get_or_create(code='DAP', title='Delivered At Place')
    TermsofDelivery.objects.get_or_create(code='DAT', title='Delivered At Terminal')
    TermsofDelivery.objects.get_or_create(code='CIP', title='Carriage and Insurance Paid To')
    TermsofDelivery.objects.get_or_create(code='CPT', title='Carriage Paid To')
    TermsofDelivery.objects.get_or_create(code='FCA', title='Free Carrier')
    TermsofDelivery.objects.get_or_create(code='EXW', title='Ex Works')


def populate_currency(apps, schema_editor):
    Currency = apps.get_model('freightman', 'Currency')
    curr, _cr = Currency.objects.get_or_create(code='USD', currency_name='USD')
    curr.default = True
    curr.save()
    # Currency.objects.get_or_create(code='SEK', currency_name='Swedish Krona')
    # Currency.objects.get_or_create(code='BDT', currency_name='Bangladeshi Taka')


def populate_stakeholder_refs(apps, schema_editor):
    StakeholderReferenceTypes = apps.get_model('freightman', 'StakeholderReferenceTypes')
    StakeholderReferenceTypes.objects.get_or_create(name='HS Code')
    StakeholderReferenceTypes.objects.get_or_create(name='CAT number')
    StakeholderReferenceTypes.objects.get_or_create(name='EXP number')
    StakeholderReferenceTypes.objects.get_or_create(name='LC number')
    StakeholderReferenceTypes.objects.get_or_create(name='Invoice number')


def populate_transport_agreements(apps, schema_editor):
    TransportAgreement = apps.get_model('freightman', 'TransportAgreement')
    TransportAgreement.objects.get_or_create(title='default agreement', details='')


def remove_addressbook_dups(apps, schema_editor):
    AddressBook = apps.get_model('freightman', 'AddressBook')
    # TransportAgreement.objects.get_or_create(title='default agreement', details='')
    # ('organization', 'company_name', 'city', 'state', 'country', 'email')
    ablist = []
    for ab in AddressBook.objects.all():
        key = '{}{}{}{}{}{}'.format(ab.organization, ab.company_name, ab.city, ab.state, ab.country, ab.email)
        if key in ablist:
            ab.delete()
        else:
            ablist.append(key)


def initial_data(apps, schema_editor):
    basic_timezones_and_default_for_all(apps, schema_editor)
    superuser_droid(apps, schema_editor)
    basic_timezones_and_default_for_all(apps, schema_editor)
    populate_payment_types(apps, schema_editor)
    populate_initial_package_types(apps, schema_editor)
    # populate_forwarder_company_navana_and_map_superuser_droid(apps, schema_editor)
    populate_airports(apps, schema_editor)
    populate_country_and_city(apps, schema_editor)
    populate_terms_of_delivery(apps, schema_editor)
    populate_currency(apps, schema_editor)
    populate_stakeholder_refs(apps, schema_editor)
    populate_transport_agreements(apps, schema_editor)


def manage_FreightBookingOrderNote_payment_instruction_field_change(apps, schema_editor):
    FreightBookingOrderNote = apps.get_model('freightman', 'FreightBookingOrderNote')
    PaymentType = apps.get_model('freightman', 'PaymentType')
    pt = PaymentType.objects.all().first()
    FreightBookingOrderNote.objects.all().delete()


def generic_superuser(apps, schema_editor):
    UserModel = get_user_model()
    Timezone = apps.get_model('freightman', 'TimeZone')
    tz_bd, _tzcr = Timezone.objects.get_or_create(tz_name='Asia/Dhaka', utc_offset_sign='+', utc_offset_hour=6, utc_offset_minute=0)
    u_q = UserModel.objects.filter(username='frt')
    if not u_q.exists():
        user = UserModel.objects.create_superuser('frt', 'freightautomat@gmail.com', 'project19', time_zone_id=tz_bd.id)
        return user
    else:
        return u_q.first()


def populate_forwarder_company_navana_and_map_generic_superuser_and_bank(apps, schema_editor):
    Organization = apps.get_model('freightman', 'Organization')
    SystemUser = apps.get_model('freightman', 'SystemUser')
    UserOrganizationMap = apps.get_model('freightman', 'UserOrganizationMap')
    AddressBook = apps.get_model('freightman', 'AddressBook')
    Bank = apps.get_model('freightman', 'Bank')
    BankBranch = apps.get_model('freightman', 'BankBranch')

    Country = apps.get_model('freightman', 'Country')
    City = apps.get_model('freightman', 'City')

    bd = Country.objects.get(code_isoa2='BD')

    dhaka = City.objects.get(country=bd, name='Dhaka')

    generic_superuser(apps, schema_editor)

    org, _created = Organization.objects.get_or_create(title='Navana Logistics Limited', prefix='NLL')
    org.is_forwarder = True
    org.save()
    UserOrganizationMap.objects.get_or_create(organization=org, user_id=SystemUser.objects.get(username='frt').id)

    address = AddressBook.objects.create(
        organization=org, company_name=org.title, address='Green Tower Gulshan 1, Dhaka', postcode='1200', city=dhaka, country=bd, contact='Mr Mostafa', phone='09999',
        mobile='0999',
        email='mostafa@navana.org',
        is_default=True
    )

    dhakabank = Bank.objects.create(bank_name='Dhaka Bank')
    lloydbank = Bank.objects.create(bank_name='Lloyd Bank')
    dhakabank_banbranch = BankBranch.objects.create(bank=dhakabank, branch_name='Banani Branch', branch_address='Banani Dhaka')
    lloydbank_londonbranch = BankBranch.objects.create(bank=lloydbank, branch_name='London Branch', branch_address='London UK')


def populate_factory_astrotex_and_user_and_consignee_hellenic(apps, schema_editor):
    import time
    Organization = apps.get_model('freightman', 'Organization')
    UserOrganizationMap = apps.get_model('freightman', 'UserOrganizationMap')
    AddressBook = apps.get_model('freightman', 'AddressBook')
    City = apps.get_model('freightman', 'City')
    Country = apps.get_model('freightman', 'Country')

    uk, _ukcreated = Country.objects.get_or_create(code_isoa2='UK')

    bd, _bdcr = Country.objects.get_or_create(code_isoa2='BD')
    bd.name = 'Bangladesh'
    bd.save()

    dhaka, _dkcr = City.objects.get_or_create(country=bd, name='Dhaka')

    london, _londoncreated = City.objects.get_or_create(country=uk, name='London')
    dhaka, _dhakacreated = City.objects.get_or_create(country=bd, name='Dhaka')

    org, _orgcreated = Organization.objects.get_or_create(title='Astrotex', prefix='AST')
    org.is_shipper = True
    org.is_factory = True
    org.save()
    address, _addrcreated = AddressBook.objects.get_or_create(
        organization=org,
        company_name='Astrotex',
        address='banani Dhaka',
        postcode='1212',
        city=dhaka,
        state='',
        country=bd,
        contact='Astra khan',
        phone='0777',
        mobile='0777',
        fax='',
        email='khan@astrotex.com'
    )

    address.is_default = True
    address.is_shipper = True
    address.save()

    # consignee hellenic
    consaddress, _addrcreated = AddressBook.objects.get_or_create(
        organization=org,
        company_name='Hellenic Corp UK',
        address='London UK',
        postcode='4000',
        city=london,
        state='',
        country=uk,
        contact='John',
        phone='0777',
        mobile='0777',
        fax='',
        email='john@hellenic.com'
    )
    consaddress.is_consignee = True
    consaddress.save()

    user = get_user_model().objects.create_user(
        username='user_{}'.format(time.time()),
        email='khan@astrotex.com',
        password='project19',
        first_name='Astra',
        last_name='Khan'
    )

    UserOrganizationMap.objects.get_or_create(organization=org, user_id=user.id)


def populate_payment_types(apps, schema_editor):
    PaymentType = apps.get_model('freightman', 'PaymentType')
    PaymentType.objects.get_or_create(name='Freight Prepaid')
    PaymentType.objects.get_or_create(name='Freight Collect')


def populate_airline_awb_and_agent(apps, schema_editor):
    from datetime import date, timedelta
    AWBAgent = apps.get_model('freightman', 'AWBAgent')
    Airwaybill = apps.get_model('freightman', 'Airwaybill')
    Airline = apps.get_model('freightman', 'Airline')

    Country = apps.get_model('freightman', 'Country')
    City = apps.get_model('freightman', 'City')

    bd = Country.objects.get(code_isoa2='BD')

    dhaka = City.objects.get(country=bd, name='Dhaka')

    bb = Airline.objects.create(prefix_number=997, name='Bangladesh Biman')

    agent, _agtnc = AWBAgent.objects.get_or_create(name='EaglesCo', city=dhaka, state='Dhaka', country=bd, iata_code='9878')

    Airwaybill.objects.create(agent=agent, airline=bb, awb_serial='98765432', expire_date=(date.today() + timedelta(days=1000)))


def initial_population(apps, schema_editor):
    populate_terms_of_delivery(apps, schema_editor)
    populate_payment_types(apps, schema_editor)
    populate_country_and_city(apps, schema_editor)
    populate_currency(apps, schema_editor)
    populate_initial_package_types(apps, schema_editor)
    populate_transport_agreements(apps, schema_editor)
    populate_airports(apps, schema_editor)
    populate_airline_awb_and_agent(apps, schema_editor)

    populate_forwarder_company_navana_and_map_generic_superuser_and_bank(apps, schema_editor)
    populate_factory_astrotex_and_user_and_consignee_hellenic(apps, schema_editor)

    populate_stakeholder_refs(apps, schema_editor)


def populate_default_charges_code(apps, schema_editor):
    ChargeType = apps.get_model('freightman', 'ChargeType')
    ChargeType.objects.get_or_create(name='Doc Fee')
    ChargeType.objects.get_or_create(name='ISC Charge')
