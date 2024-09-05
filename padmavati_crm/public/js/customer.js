frappe.ui.form.on('Customer', {
    before_save: function (frm) {
        if (frm.doc.custom_location) {
            let args = {
                custom_location: frm.doc.custom_location,
            };

            frappe.call({
                method: 'padmavati_crm.public.py.customer.generate_unique_code',
                args: args,
                callback: function (response) {
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
    },
    refresh: function(frm) {
        console.log(frm.doc.lead_name);
        // Add custom button "Create User"
        frm.add_custom_button(__('Create User'), function() {
            // Call the server-side method to create the user
            frappe.call({
                method: 'padmavati_crm.public.py.customer.create_user',
                args: {
                    lead_name: frm.doc.lead_name  // Pass the lead name as argument
                },
                callback: function(response) {
                    console.log(response);
                    if (response.message === "User created successfully!") {
                        frappe.msgprint(__('User created successfully!'));
                    } else {
                        frappe.msgprint(__('User already exists with this email.'));
                    }   
                }
            });
        });
    }

});
