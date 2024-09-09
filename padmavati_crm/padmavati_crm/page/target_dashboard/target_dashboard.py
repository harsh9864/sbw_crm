import frappe
from frappe import _

@frappe.whitelist()
def get_sales_person_target_allocations():
    try:
        # Fetching the list of Sales Person Target Allocations
        allocations = frappe.get_all(
            'Sales Person Target Allocation', 
            fields=['name'],
        )
        
        valid_allocations = []
        
        for allocation in allocations:
            # Checking if the user has permission to read
            if frappe.has_permission('Sales Person Target Allocation', doc=allocation.name):
                allocation_data = frappe.get_doc('Sales Person Target Allocation', allocation.name)
                
                if frappe.has_permission('Employee', doc=allocation.employee):
                    valid_allocations.append(allocation_data)
                else:
                    frappe.msgprint(_("You don't have permission to access Employee: {0}").format(allocation.employee))
        
        return valid_allocations
    except frappe.PermissionError:
        frappe.throw(_("You don't have permission to access some of the linked records."))
