# Generated by Django 2.1.3 on 2019-04-28 12:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('seaexport', '0004_auto_20190428_1208'),
    ]

    operations = [
        migrations.RenameField(
            model_name='seaexportcontainerconsolshipment',
            old_name='voyage_number',
            new_name='feeder_vessel_voyage_number',
        ),
    ]