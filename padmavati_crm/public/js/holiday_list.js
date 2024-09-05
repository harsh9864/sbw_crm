frappe.ui.form.on("Holiday List", {
    subdivision(frm) {
        if (frm.doc.subdivision.length > 0) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Geographic Location",
                    filters: {
                        location_type: "State",
                        location_abbr: frm.doc.subdivision
                    },
                    fields: ["*"]
                },
                callback: (r) => {
                    let response = r.message[0].name;
                    frm.set_value("custom_geographic_state", response);
                    frm.refresh_field("custom_geographic_state")
                }
            })
        }
    }
})