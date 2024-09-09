frappe.pages['target-dashboard'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Target Dashboard',
		single_column: true
	});
	frappe.call({
		method : "frappe.client.get_list",
		args : {
			doctype : "Sales Person Target Allocation",
			limit_page_length : null,
			fields : ["*"]
		},
		callback : (response) => {
			
		}
	})
	$(frappe.render_template("target_dashboard", {})).appendTo(page.body);
}