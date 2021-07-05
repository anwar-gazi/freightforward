from django.shortcuts import render, reverse
from django.http import HttpResponseRedirect
from django.contrib.auth import logout


def profile_view(request):
    return HttpResponseRedirect(reverse('landing'))


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('login'))
