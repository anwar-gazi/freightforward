# Generated by Django 2.1.3 on 2019-04-28 12:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('seaexport', '0005_auto_20190428_1210'),
    ]

    operations = [
        migrations.RenameField(
            model_name='seaexportcontainerconsolshipment',
            old_name='feeder_arrival_port_id',
            new_name='feeder_arrival_port',
        ),
        migrations.RenameField(
            model_name='seaexportcontainerconsolshipment',
            old_name='mother_arrival_port_id',
            new_name='mother_arrival_port',
        ),
        migrations.RenameField(
            model_name='seaexportcontainerconsolshipment',
            old_name='mother_departure_port_id',
            new_name='mother_departure_port',
        ),
    ]