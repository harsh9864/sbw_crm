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



@frappe.whitelist()
def create_user(lead_name):
    # Fetch the Lead document
    lead = frappe.get_doc("Lead", lead_name)

    # Get the email and first name from the Lead
    email = lead.email_id
    full_name = lead.first_name

    # Check if a User with this email already exists
    if not frappe.db.exists("User", email):
        # Create a new User document
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name,
            "enabled": 1,
            "send_welcome_email": 1
        })
        user.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"message": "User created successfully!"}
    else:
        return {"message": "User already exists with this email."}
