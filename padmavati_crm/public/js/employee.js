frappe.ui.form.on('Employee', {
    before_save: function(frm) {
        if (frm.doc.custom_location) {
            let args = {
                custom_location: frm.doc.custom_location,
            };

            frappe.call({
                method: 'padmavati_crm.public.py.employee.generate_unique_code',
                args: args,
                callback: function(response) {
                    if (response.message) {
                        console.log(response.message);
                        frm.set_value('custom_unique_id', response.message);
                    }
                }
            });
        } else {
            frappe.msgprint(__('To generate a unique code for the employee, the location is required.'));
            frappe.validated = false;
        }
    }
});
