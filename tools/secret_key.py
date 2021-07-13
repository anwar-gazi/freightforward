from django.core.management.utils import get_random_secret_key

secret_key = get_random_secret_key()
print('set settings.SECRET_KEY=' + secret_key)
