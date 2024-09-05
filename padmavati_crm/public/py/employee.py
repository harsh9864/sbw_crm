import frappe

@frappe.whitelist()
def generate_unique_code(custom_location):

    location = custom_location
    code_parts = []

    # Traverse the location hierarchy to build the code
    while location:
        loc_doc = frappe.get_doc('Geographic Location', location)
        code_parts.insert(0, str(loc_doc.location_code))  # Convert the integer to a string
        if not loc_doc.parent_location:
            break  # Break if the top node is reached
        location = loc_doc.parent_location

    print("\n\n\n\nCode parts:", code_parts)

    # Combine the parts to form the unique employee code
    employee_code = ''.join(code_parts)
    # employee_code += "- EMP"
    # employee_code += "-{:03d}".format(1)  # Assuming a default or initial value of 1

    print("\n\n\n\nEmployee Code:", employee_code)
    return employee_code
