from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from freightman.forms import MawbForm
from django.http import JsonResponse
from freightman.models import Country, City, Airport, Airline, Airwaybill
import json