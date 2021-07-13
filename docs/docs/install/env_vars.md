---
layout: default 
title:  Environment Variables 
parent: Installation 
nav_order: 4 
has_children: false
---

# Environment Variables

OS environment variables used for consistency between updates through vcs and security.

**How to set environment variables permanently in Ubuntu-20.04?**

<span class="text-red-300">_Do not edit `/etc/environment` or `/etc/profile` or `/etc/bash.bashrc`._</span>

Create a file named `freightapp.sh` in `/etc/profile.d`. There put the values as:

```shell
# inside /etc/profile.d/freightapp.sh 
export ENVVARS=value
```
Beware of sudo caveat.

Check details at [Ubuntu doc page][ubuntu_systemwide_env_var]{:target="_blank"}

### FREIGHTAPP_SECRET_KEY

it is the value for settings.SECRET_KEY. Which currently looks
like: `SECRET_KEY = os.environ.get('FREIGHTAPP_SECRET_KEY')`

Generate your secret key with `ROOT/tools/secret_key.py`

```shell
# execute in the project root
python tools/secret_key.py
# output: set settings.SECRET_KEY=<secret_key>
```

Now set the environment variable with the generated secret key.
```shell
#inside /etc/profile.d/freightapp.sh 
export FREIGHTAPP_SECRET_KEY=<secret_key>
#remove the curly braces
```

### FREIGHTAPP_SENTRY_DSN
Check sentry integration page to get your dsn. Then follow as above.

### FREIGHTAPP_DATABASE_URL

Database url(dsn) for DOKKU deployment. Check related page.

## Database related

### FREIGHTAPP_DB_NAME
### FREIGHTAPP_DB_USER
### FREIGHTAPP_DB_PASS
### FREIGHTAPP_DB_HOST
### FREIGHTAPP_DB_PORT

## Email/SMTP related

### FREIGHTAPP_EMAIL_HOST
### FREIGHTAPP_EMAIL_HOST_USER
### FREIGHTAPP_EMAIL_HOST_PASSWORD
### FREIGHTAPP_EMAIL_PORT
### FREIGHTAPP_EMAIL_USE_TLS
### FREIGHTAPP_DEFAULT_FROM_EMAIL


[ubuntu_systemwide_env_var]: https://help.ubuntu.com/community/EnvironmentVariables#System-wide_environment_variables