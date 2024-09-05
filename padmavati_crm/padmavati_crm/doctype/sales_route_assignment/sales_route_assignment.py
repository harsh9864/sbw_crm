# Copyright (c) 2024, Sanskar and contributors
# For license information, please see license.txt

import requests
import frappe
from frappe.model.document import Document


class SalesRouteAssignment(Document):
	pass

@frappe.whitelist(allow_guest=True)
def call_ola_maps_api(query):
    # OLA Maps API URL
    url = f"https://api.olamaps.io/places/v1/autocomplete?input={query}&api_key=dCTUhl5XhWrN4qSNA24vwJpuXLQutlQs0BFR73kQ"

    # Call the OLA Maps API
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        frappe.throw("Failed to fetch data from OLA Maps")
