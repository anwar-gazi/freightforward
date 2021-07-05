(function ($) {

    // Add add and remove button to attach document form
    var docs_form_set = $('.docs_form_set');
    docs_form_set.formset({
        addText: "Add More Documents",
        deleteText: "<i class=\"fas fa-times-circle text-danger\" style='font-size: 20px'></i>",
        prefix:'documents'
    });
    $('.add-row').addClass('btn btn-primary mb-2');


    $(document).on('click', '.add-form-row', function (e) {
        e.preventDefault();
        var prefix = $(this).attr('prefix');
        cloneMoreHblForm('.form-row:last', prefix);
        return false;
    });
    $(document).on('click', '.remove-form-row', function (e) {
        e.preventDefault();
        var prefix = $(this).attr('prefix');
        deleteHblForm(prefix, $(this));
        return false;
    });
}(jQuery));
//
// function updateElementIndex(el, prefix, ndx) {
//     var id_regex = new RegExp('(' + prefix + '-\\d+)');
//     var replacement = prefix + '-' + ndx;
//     if ($(el).attr("for")) $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
//     if (el.id) el.id = el.id.replace(id_regex, replacement);
//     if (el.name) el.name = el.name.replace(id_regex, replacement);
// }
//
// function cloneMoreHblForm(selector, prefix) {
//     var newElement = $(selector).clone(true);
//     var total = $('#id_' + prefix + '-TOTAL_FORMS').val();
//
//     newElement.find(':input:not(:button)').each(function () {
//         var name = $(this).attr('name').replace('-' + (total - 1) + '-', '-' + total + '-');
//         var id = 'id_' + name;
//         // console.log($(this).attr('id'));
//         $(this).attr({'name': name, 'id': id}).val('').removeAttr('checked');
//
//     });
//     $(selector).find('.hbl_sl_number').html(total);
//     newElement.find('.hbl_sl_number').html(parseInt(total)+1);
//
//     total++;
//     $('#id_' + prefix + '-TOTAL_FORMS').val(total);
//     $(selector).after(newElement);
//     var conditionRow = $('.form-row:not(:last)');
//     conditionRow.find('.btn.add-form-row')
//         .removeClass('btn-success').addClass('btn-danger')
//         .removeClass('add-form-row').addClass('remove-form-row btn-sm').attr('prefix',prefix)
//         .html('Delete');
//     return false;
// }
//
// function deleteHblForm(prefix, btn) {
//     var total = parseInt($('#id_' + prefix + '-TOTAL_FORMS').val());
//     if (total > 1) {
//         btn.closest('.form-row').remove();
//         var forms = $('.form-row');
//         $('#id_' + prefix + '-TOTAL_FORMS').val(forms.length);
//         for (var i = 0, formCount = forms.length; i < formCount; i++) {
//             $(forms.get(i)).find(':input').each(function () {
//                 updateElementIndex(this, prefix, i);
//             });
//
//             $(forms.get(i)).find('.hbl_sl_number').html(i+1);
//         }
//
//     }
//     return false;
// }

