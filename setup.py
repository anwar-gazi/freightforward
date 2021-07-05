#!/usr/bin/env python

import subprocess
import core.settings as settings

info = {'user': settings.DATABASES['default']['USER'], 'pass': settings.DATABASES['default']['PASSWORD'], 'db': settings.DATABASES['default']['NAME']}

sql = r"create database {db};".format(**info)
if info['user'] is not 'root':
    sql += "create user {user} with password '{pass}'; alter role {user} set client_encoding to 'utf8'; alter role {user} set default_transaction_isolation to 'read committed'; alter role {user} set timezone to 'UTC'; grant all privileges on database {db} to {user};".format(
        **info)

print('run these commands in psql shell: ' + sql)
# pg = ['sudo', ' su -u postgres psql -c "{}"'.format(sql)]
# output = subprocess.check_output(pg)
