frappe.treeview_settings["Geographic Location"] = {
	ignore_fields: ["parent_location"],
	get_tree_nodes: "padmavati_crm.padmavati_crm.doctype.geographic_location.geographic_location.get_children",
	add_tree_node: "padmavati_crm.padmavati_crm.doctype.geographic_location.geographic_location.add_node",

    fields: [
        {
            fieldtype: 'Check', fieldname: 'is_group', label: __('Group Node'),
            description: __("Further nodes can be only created under 'Group' type nodes")
        },
        {
            fieldtype: 'Data', fieldname: 'location_name', label: __
                ('Location Name'),
            reqd: true
        },
        {
            fieldtype: 'Link', fieldname: 'custom_location_type', label: __('Location Type'),
            options: "Location Type", 
        },
        {
            fieldtype: 'Int', fieldname: 'custom_location_code', label: __('Location Code')
        }
    ],
    
	filters: [
		{
			fieldname: "location",
			fieldtype: "Link",
			options: "Geographic Location",
			label: __("Location"),
			get_query: function () {
				return {
					filters: [["Geographic Location", "is_group", "=", 1]],
				};
			},
		},
	],
	breadcrumb: "Assets",
	root_label: "All Locations",
	get_tree_root: false,
	menu_items: [
		{
			label: __("New Location"),
			action: function () {
				frappe.new_doc("Geographic Location", true);
			},
			condition: 'frappe.boot.user.can_create.indexOf("Geographic Location") !== -1',
		},
	],
	onload: function (treeview) {
		treeview.make_tree();
	},
};