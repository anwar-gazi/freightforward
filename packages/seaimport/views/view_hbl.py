from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages

# models and forms import
from seaimport.models import SeaImportHbl, SeaImportGood, SeaImportMbl, SeaImportTask

from seaimport.forms import SeaImportGoodForm, SeaImportHblForm


@login_required()
@csrf_exempt
def create_new_hbl(request):
    # creating the forms
    HblForm = SeaImportHblForm()

    GoodsForm = SeaImportGoodForm()

    if request.method == "GET":
        data = {
            'HblForm': HblForm,
            'GoodsForm': GoodsForm,
        }

        return render(request, 'seaimport/forwarder/hbl/create_hbl.html', data)

    if request.method == "POST":
        HblForm = SeaImportHblForm(request.POST, request.FILES)
        GoodsForm = SeaImportGoodForm(request.POST, request.FILES)

        # print(MblForm.is_valid(), GoodsForm.is_valid())

        if HblForm.is_valid() and GoodsForm.is_valid():
            task = SeaImportTask()
            task.save()

            hbl = HblForm.save(commit=False)
            hbl.task = task
            hbl.save()

            goods = GoodsForm.save(commit=False)
            goods.hbl = hbl
            goods.save()

            messages.success(request, 'HBL Created Successfully')
            return redirect('seaimport:sea_import_view_hbl', hbl_number=hbl)

        else:
            messages.error(request, 'There are errors in the form please check')
            data = {
                'HblForm': HblForm,
                'GoodsForm': GoodsForm,
            }
            return render(request, 'seaimport/forwarder/hbl/create_hbl.html', data)


@login_required()
@csrf_exempt
def update_hbl(request, hbl_number):
    hbl = get_object_or_404(SeaImportHbl, pk=hbl_number)
    goods = SeaImportGood.objects.filter(hbl=hbl).first()

    if not hbl.unlocked:
        return redirect('seaimport:sea_import_view_hbl', hbl_number=hbl.id)

    # creating the forms
    HblForm = SeaImportHblForm(instance=hbl)

    GoodsForm = SeaImportGoodForm(instance=goods)

    if request.method == "GET":
        data = {
            'HblForm': HblForm,
            'GoodsForm': GoodsForm,
            'hbl': hbl,
        }

        return render(request, 'seaimport/forwarder/hbl/update_hbl.html', data)

    if request.method == "POST":
        HblForm = SeaImportHblForm(request.POST, request.FILES, instance=hbl)
        GoodsForm = SeaImportGoodForm(request.POST, request.FILES, instance=goods)

        print(HblForm.is_valid(), GoodsForm.is_valid())

        if HblForm.is_valid() and GoodsForm.is_valid():
            HblForm.save()
            GoodsForm.save()

            messages.success(request, 'HBL Updated Successfully')
            return redirect('seaimport:sea_import_view_hbl', hbl_number=hbl)

        else:
            messages.error(request, 'There are errors in the form please check')
            return redirect('seaimport:sea_import_view_hbl', hbl_number=hbl)


@login_required()
def hbl_list_all(request):
    hbls = SeaImportHbl.objects.all()
    data = {
        'hbls': hbls
    }
    return render(request, 'seaimport/forwarder/hbl/hbl_list.html', data)


@login_required()
def view_single_hbl(request, hbl_number):
    hbl = get_object_or_404(SeaImportHbl, pk=hbl_number)
    goods = SeaImportGood.objects.filter(hbl=hbl).first()
    mbl = SeaImportMbl.objects.filter(job=hbl.job).first()

    data = {
        'hbl': hbl,
        'good': goods,
        'mbl': mbl,
    }
    return render(request, 'seaimport/forwarder/hbl/view_single.html', data)