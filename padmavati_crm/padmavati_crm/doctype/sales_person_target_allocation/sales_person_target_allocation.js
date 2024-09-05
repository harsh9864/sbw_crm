// Copyright (c) 2024, Sanskar and contributors
// For license information, please see license.txt

var Total_Days_with_or_without_sundays;
var Total_days;
var Weeks_based_on_from_to;
var Target_summary = [];
frappe.ui.form.on('Sales Person Target Allocation', {
    onload(frm) {
        frm.set_query("country", function () {
            return {
                "filters": {
                    "location_type": "Country"
                }
            }
        })
        frm.set_query("state", function () {
            return {
                "filters": {
                    "location_type": "State"
                }
            }
        })
        frm.set_query("city", function () {
            return {
                "filters": {
                    "location_type": "City"
                }
            }
        })
        frm.set_query("districtarea", function () {
            return {
                "filters": {
                    "location_type": "District"
                }
            }
        })
        frm.set_query("street", function () {
            return {
                "filters": {
                    "location_type": "Street"
                }
            }
        })
    },
    consider_holiday_list(frm) {
        if (frm.doc.state.length > 0) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Holiday List",
                    filters: {
                        custom_geographic_state: frm.doc.state
                    },
                    fields: ["name"]
                },
                callback: (r) => {
                    let response = r.message[0].name;
                    frm.set_value("holiday_list", response);
                    frm.refresh_field("holiday_list")
                }
            })
        } else {
            frm.set_value("holiday_list", '');
            frm.refresh_field("holiday_list");
        }
    },
    to(frm) {
        frappe.call({
            method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.get_total_days",
            args: {
                from_date: frm.doc.from,
                to_date: frm.doc.to,
                include_sundays: frm.doc.include_sundays
            },
            callback: (response) => {
                let Total_Days_with_or_without_sundays_response = response.message;
                let Total_Days_with_or_without_sundays = Total_Days_with_or_without_sundays_response.dates;

                if (frm.doc.consider_holiday_list) {
                    frappe.call({
                        method: "frappe.client.get",
                        args: {
                            doctype: "Holiday List",
                            name: frm.doc.holiday_list
                        },
                        callback: (r) => {
                            let response = r.message.holidays;
                            frappe.call({
                                method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.filter_holidays",
                                args: {
                                    list_of_holidays: response,
                                    from_date: frm.doc.from,
                                    end_date: frm.doc.to
                                },
                                callback: (r) => {
                                    let Total_Holiday_dates = r.message;
                                    let Total_days = Total_Days_with_or_without_sundays.filter(dates => !Total_Holiday_dates.includes(dates));
                                    frappe.call({
                                        method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.get_weeks_with_dates",
                                        args: {
                                            dates_str: Total_days,
                                        },
                                        callback: (r) => {
                                            let Weeks_based_on_from_to = r.message.weeks;
                                            // Fetch the item_target_table data
                                            frm.doc.item_target_table.forEach(row => {
                                                frappe.call({
                                                    method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.calculate_targets",
                                                    args: {
                                                        dates_info: JSON.stringify(Weeks_based_on_from_to),
                                                        daily_target: row.amount,
                                                        current_date: frm.doc.from,
                                                        itemGroup: row.item_group
                                                    },
                                                    callback: (r) => {
                                                        // Add to Target_summary array
                                                        Target_summary = Target_summary.concat(r.message.weeklyTargets);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    let Total_days = Total_Days_with_or_without_sundays;
                    frappe.call({
                        method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.get_weeks_with_dates",
                        args: {
                            dates_str: Total_days,
                        },
                        callback: (r) => {
                            let Weeks_based_on_from_to = r.message.weeks;
                            // Fetch the item_target_table data
                            frm.doc.item_target_table.forEach(row => {
                                frappe.call({
                                    method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.calculate_targets",
                                    args: {
                                        dates_info: JSON.stringify(Weeks_based_on_from_to),
                                        daily_target: row.amount,
                                        current_date: frm.doc.from,
                                        itemGroup: row.item_group
                                    },
                                    callback: (r) => {
                                        // Add to Target_summary array
                                        Target_summary = Target_summary.concat(r.message.weeklyTargets);
                                    }
                                });
                            });
                        }
                    });
                }
            }
        });
    },
    designation(frm) {
        if (frm.doc.designation && frm.doc.designation.length > 0) {
            frm.add_custom_button(__("Fetch Sales Person"), () => {
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Employee",
                        filters: {
                            "custom_location": frm.doc.street,
                            "designation": frm.doc.designation
                        },
                        fields: ["*"]
                    },
                    callback: function (r) {
                        if (r.message) {
                            const response = r.message;

                            response.forEach(data => {
                                // Fetch Sales Person record using the employee record name
                                frappe.call({
                                    method: "frappe.client.get_list",
                                    args: {
                                        doctype: "Sales Person",
                                        filters: {
                                            "employee": data.name
                                        },
                                        fields: ["name"]
                                    },
                                    callback: function (salesPersonResponse) {
                                        if (salesPersonResponse.message && salesPersonResponse.message.length > 0) {
                                            const salesPersonData = salesPersonResponse.message[0];

                                            // Add new entry to the sales_person_list
                                            var child = frm.add_child('sales_person_list');
                                            frappe.model.set_value(child.doctype, child.name, 'employee_id', data.name);
                                            frappe.model.set_value(child.doctype, child.name, 'sales_person_name', salesPersonData.name);
                                            frm.refresh_field('sales_person_list');
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
            });
        } else {
            frm.remove_custom_button(__("Fetch Sales Person"));
        }
    },
    validate(frm) {
        // Check if Target_summary is populated
        if (Target_summary && Array.isArray(Target_summary)) {
            // Create a map to track existing rows by weekStart and weekEnd
            const existingRowsMap = new Map();
            frm.doc.target_summary.forEach(row => {
                existingRowsMap.set(row.weekStart + '|' + row.weekEnd, row);
            });

            // Clear existing rows in the child table
            frm.clear_table('target_summary');

            // Loop through the Target_summary and append rows
            Target_summary.forEach(target => {
                // Check if the row already exists based on unique identifier (e.g., weekStart, weekEnd)
                const key = target.weekStart + '|' + target.weekEnd;
                let existingRow = existingRowsMap.get(key);

                if (existingRow) {
                    // Update the existing row
                    frappe.model.set_value(existingRow.doctype, existingRow.name, 'daily_target', target.dailyTarget);
                    frappe.model.set_value(existingRow.doctype, existingRow.name, 'weeklytarget', target.weeklyTarget);
                    frappe.model.set_value(existingRow.doctype, existingRow.name, 'monthlytarget', target.monthlyTarget);
                    frappe.model.set_value(existingRow.doctype, existingRow.name, 'item_group', target.ItemGroup);
                } else {
                    // Add new row to the child table
                    const newRow = frm.add_child('target_summary');
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weekstart', target.weekStart);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weekend', target.weekEnd);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'daily_target', target.dailyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weeklytarget', target.weeklyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'monthlytarget', target.monthlyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'item_group', target.ItemGroup);
                }
            });

            // Refresh the child table field to show the updated rows
            frm.refresh_field('target_summary');
        }
    }
});


