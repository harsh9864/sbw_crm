# Copyright (c) 2024, Sanskar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class GeographicLocation(Document):
	pass


@frappe.whitelist()
def get_children(doctype, parent=None, location=None, is_root=False):
	if parent is None or parent == "All Locations":
		parent = ""

	return frappe.db.sql(
		f"""
		select
			name as value,
			is_group as expandable
		from
			`tabGeographic Location` comp
		where
			ifnull(parent_location, "")={frappe.db.escape(parent)}
		""",
		as_dict=1,
	)


@frappe.whitelist()
def add_node():
	from frappe.desk.treeview import make_tree_args

	args = frappe.form_dict
	args = make_tree_args(**args)

	if args.parent_location == "All Locations":
		args.parent_location = None

	frappe.get_doc(args).insert()
