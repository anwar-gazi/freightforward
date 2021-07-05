"""
Django settings for freightman project.

Generated by 'django-admin startproject' using Django 2.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os, dj_database_url, sentry_sdk
from django.contrib.messages import constants as messages

sentry_sdk.init("")

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ''

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'freightman',
    'airexport',
    'seaexport',
    'seaimport',
    'crispy_forms',
    'django.contrib.humanize',
    'django_addanother',
    'qr_code',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'freightman.context_processors.user_authlevel_permission',
                'seaimport.context_processors.attach_settings_model'
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

# to facilitate on dokku environment | by resgef
if os.environ.get('DATABASE_URL', ''):
    DATABASES = {
        'default': dj_database_url.config()
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'freightman',
            'USER': 'freightman',
            'PASSWORD': 'common',
            'HOST': 'localhost',
            'PORT': '',
        }
    }

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

FRONTEND_DATETIME_FORMAT = '%d-%m-%Y, %H:%M %p'  # python format string
FRONTEND_DATETIME_FORMAT_HUMAN = '%d %b %Y, %H:%M %p'  # python format string
FRONTEND_DATE_FORMAT = '%d-%m-%Y'  # python format string
FRONTEND_DATE_FORMAT_2 = '%Y-%m-%d'  # python format string
ID_DATE_FORMAT = '%y%m%d'  # python format string
FRONTEND_DATE_FORMAT_HUMAN = '%d %b %Y'  # python format string
FRONTEND_DATE_FORMAT_HUMAN_WITH_TZ = '%d %b %Y (%Z)'  # python format string
FRONTEND_JS_DATE_FORMAT = 'dd-mm-yyyy'  # javascript date format string
HTML_DATEFIELD_FORMAT_PY = '%Y-%m-%d'

USE_I18N = True

USE_L10N = True

USE_TZ = True

AUTH_USER_MODEL = 'freightman.SystemUser'
LOGIN_URL = 'login'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = 'static/'

# to use gmail smtp, enable less secure app access: https://myaccount.google.com/lesssecureapps?utm_source=google-account&utm_medium=web
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = ''

# test purpose settings
SAVE_FORM_PROFILES = True

# Media Folder settings
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

CRISPY_TEMPLATE_PACK = 'bootstrap4'

# This is added to the a common model can be passed to all the
# templates for seaimport. The common model is a settings model individual for all user
# TEMPLATE_CONTEXT_PROCESSORS += ("seaimport.context_processors.attach_settings_model", )


MESSAGE_TAGS = {
    messages.ERROR: 'alert alert-danger',
}
