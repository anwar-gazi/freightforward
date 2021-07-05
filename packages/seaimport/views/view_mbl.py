from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages

# models and forms import
from seaimport.models import SeaImportMbl, SeaImportGood

from seaimport.forms import SeaImportMblForm, SeaImportGoodForm


@login_required()
@csrf_exempt
def create_new_mbl(request):
    # creating the forms
    # print(SeaImportAgent.objects.filter(name__is_forwarder=True))
    MblForm = SeaImportMblForm()
    GoodsForm = SeaImportGoodForm()

    if request.method == "GET":
        data = {
            'MblForm': MblForm,
            'GoodsForm': GoodsForm,
            # 'system_settings': SeaImportSystemSetting.objects.filter(user=request.user).first(),
        }

        return render(request, 'seaimport/forwarder/mbl/create_mbl.html', data)

    if request.method == "POST":
        MblForm = SeaImportMblForm(request.POST, request.FILES)
        GoodsForm = SeaImportGoodForm(request.POST, request.FILES)

        if MblForm.is_valid() and GoodsForm.is_valid():
            mbl = MblForm.save()

            goods = GoodsForm.save(commit=False)
            goods.mbl = mbl
            goods.save()

            messages.success(request, 'MBL Created Successfully')

            return redirect('seaimport:sea_import_view_mbl', mbl_number=mbl.id)
        else:
            data = {
                'MblForm': MblForm,
                'GoodsForm': GoodsForm,
            }
            messages.error(request, 'There are errors in the form please check')
            return render(request, 'seaimport/forwarder/mbl/create_mbl.html', data)


@login_required()
@csrf_exempt
def update_mbl(request, mbl_number):
    # creating the forms
    mbl = get_object_or_404(SeaImportMbl, pk=mbl_number)
    goods = SeaImportGood.objects.filter(mbl=mbl).first()

    if not mbl.unlocked:
        return redirect('seaimport:sea_import_view_mbl', mbl_number=mbl.id)

    MblForm = SeaImportMblForm(instance=mbl)

    GoodsForm = SeaImportGoodForm(instance=goods)

    if request.method == "GET":
        data = {
            'MblForm': MblForm,
            'GoodsForm': GoodsForm,
            'mbl': mbl,
        }

        return render(request, 'seaimport/forwarder/mbl/update_mbl.html', data)

    if request.method == "POST":
        MblForm = SeaImportMblForm(request.POST, request.FILES, instance=mbl)
        GoodsForm = SeaImportGoodForm(request.POST, request.FILES, instance=goods)

        if MblForm.is_valid() and GoodsForm.is_valid():
            mbl = MblForm.save()
            GoodsForm.save()

            messages.success(request, 'MBL Updated Successfully')

            return redirect('seaimport:sea_import_view_mbl', mbl_number=mbl.id)
        else:
            messages.error(request, 'There are errors in the form please check')
            return redirect('seaimport:sea_import_update_mbl', mbl_number=mbl.id)


@login_required()
def mbl_list_all(request):
    mbls = SeaImportMbl.objects.all()
    data = {
        'mbls': mbls
    }
    return render(request, 'seaimport/forwarder/mbl/mbl_list.html', data)


@login_required()
def view_single_mbl(request, mbl_number):
    mbl = get_object_or_404(SeaImportMbl, pk=mbl_number)
    goods = SeaImportGood.objects.filter(mbl=mbl).first()

    data = {
        'mbl': mbl,
        'good': goods,
    }
    return render(request, 'seaimport/forwarder/mbl/view_single.html', data)