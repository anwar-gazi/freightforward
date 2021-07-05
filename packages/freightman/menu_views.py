from django.shortcuts import render


def grid_menu_home(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/menu/main_apps.html', data)


def supplier_management_menu(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/menu/supplier_menu.html', data)


def user_management_menu(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/menu/user_menu.html', data)


def airexport_apps_menu(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/menu/airexport_apps.html', data)


def seaexport_apps_menu(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/menu/seaexport_apps.html', data)
