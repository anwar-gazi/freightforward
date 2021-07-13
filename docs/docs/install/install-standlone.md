---
layout: default 
title:  Standalone
parent: Installation
nav_order: 1 
has_children: false
---

## Standalone Installation(no container)

**Ubuntu-20.04, Python-3.8, Django-3.2.5, PostgreSql-12.7, PIP packages**
<br>

### VENV the python virtual environment

_The .venv naming is just my style. You can name it as your choice. Choosing the `.venv` name has the benefits for
making the directory hidden, as this is excluded from vcs(should be in gitignore). So keeping it hidden makes
convenient._

**Inside project root:** `mkdir .venv`
<br>**Install venv:** `python3 -m venv .venv`
<br>**Activate:** `source .venv/bin/activate`
<br>**Install Django:** `python -m pip install Django`

### Database: Postgresql

```shell
apt update
apt install postgresql postgresql-contrib postgresql-client
```

_To have some basic understanding of postgresql roles, ident login and psql shell usage, check the attached link below._

**Create Role and Database:**
<br>our role and database will be named freightforward(as example)

```shell
sudo -u postgres createuser --interactive
sudo -u postgres createdb freightforward
```

**Now create a linux user with same name for ident based authentication:**

```shell
sudo adduser freightforward
```

When asked for password, we used a sample password `freightforward`

**Test connection to the database with the user:**

```shell
sudo -u freightforward psql
```

### PostgreSQL driver: psycopg2

psycopg2 depends on `python3-dev and libpq-dev`. So install them.
`sentry-sdk` depends on(automatically installed) `certifi and urllib3`

```shell
apt install python3-dev libpq-dev 
pip install psycopg2
```

<sub><sup>
[venv](https://docs.python.org/3/tutorial/venv.html)
[django](https://docs.djangoproject.com/en/3.2/topics/install/#installing-official-release)
[pgsql](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)
[psycopg2](https://www.psycopg.org/docs/install.html)
</sup></sub>
