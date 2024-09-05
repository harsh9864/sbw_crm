
// Copyright (c) 2024, Sanskar and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Route Assignment', {
    onload_post_render: function (frm) {
        frm.fields_dict['route_details'].grid.wrapper.on('input', '.grid-row', function (e) {
            let fieldname = $(e.target).attr('data-fieldname');
            if (fieldname === 'from') {
                console.log(e.target.value)
            }
        });
    }
})





