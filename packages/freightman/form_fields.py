from django.forms import Field


class CommaseparatedIntegerField(Field):
    def __init__(self, *args, **kwargs):
        super(CommaseparatedIntegerField, self).__init__(*args, **kwargs)

    def clean(self, value):
        super(CommaseparatedIntegerField, self).clean(value)
