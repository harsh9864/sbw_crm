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
                            let holidays = r.message.holidays;
                            frappe.call({
                                method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.filter_holidays",
                                args: {
                                    list_of_holidays: holidays,
                                    from_date: frm.doc.from,
                                    end_date: frm.doc.to
                                },
                                callback: (r) => {
                                    let Total_Holiday_dates = r.message;
                                    let Total_days = Total_Days_with_or_without_sundays.filter(date => !Total_Holiday_dates.includes(date));

                                    processWeeksAndTargets(frm, Total_days);
                                }
                            });
                        }
                    });
                } else {
                    let Total_days = Total_Days_with_or_without_sundays;
                    processWeeksAndTargets(frm, Total_days);
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
        // Checking if Target_summary has value
        if (Target_summary && Array.isArray(Target_summary)) {
            // Clear existing rows in the child tables
            frm.clear_table('target_summary');
            frm.clear_table('target_quantity_summary');
            frm.clear_table('lead_summary');

            // Process the Target_summary array to add valid rows
            Target_summary.forEach(target => {
                const key = target.weekStart + '|' + target.weekEnd;

                // Only add a row to target_summary if dailyTarget, weeklyTarget, or monthlyTarget is not zero
                if (parseInt(target.dailyTarget) !== 0) {
                    const newRow = frm.add_child('target_summary');
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weekstart', target.weekStart);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weekend', target.weekEnd);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'daily_target', target.dailyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'weeklytarget', target.weeklyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'monthlytarget', target.monthlyTarget);
                    frappe.model.set_value(newRow.doctype, newRow.name, 'item_group', target.ItemGroup);
                }

                // Only add a row to target_quantity_summary if dailyQuantity, weeklyQuantity, or monthlyQuantity is not zero
                if (target.weeklyQuantity !== 0) {
                    const amountRow = frm.add_child('target_quantity_summary');
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'item_group', target.ItemGroup);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'week_start', target.weekStart);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'week_end', target.weekEnd);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'daily_quantity_target', target.dailyQuantity);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'weekly_quantity_target', target.weeklyQuantity);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'monthly_quantity_target', target.monthlyQuantity);
                    frappe.model.set_value(amountRow.doctype, amountRow.name, 'uom', target.uom);
                }

                // Only add a row to lead_summary if dailyLeadTarget, weeklyLeadTarget, or monthlyLeadTarget is not zero
                if (parseInt(target.dailyLeadTarget) !== 0) {
                    // Check if there is an existing row with the same week_start and week_end
                    const isDuplicate = frm.doc.lead_summary.some(row => {
                        return row.week_start === target.weekStart && row.week_end === target.weekEnd;
                    });

                    // If no duplicate row is found and dailyLeadTarget is not zero, add a new row
                    if (!isDuplicate) {
                        const leadRow = frm.add_child('lead_summary');
                        frappe.model.set_value(leadRow.doctype, leadRow.name, 'week_start', target.weekStart);
                        frappe.model.set_value(leadRow.doctype, leadRow.name, 'week_end', target.weekEnd);
                        frappe.model.set_value(leadRow.doctype, leadRow.name, 'daily_lead_target', target.dailyLeadTarget);
                        frappe.model.set_value(leadRow.doctype, leadRow.name, 'weekly_lead_target', target.weeklyLeadTarget);
                        frappe.model.set_value(leadRow.doctype, leadRow.name, 'monthly_lead_target', target.monthlyLeadTarget);
                    }
                }
            });

            // Refresh the child table fields to show the updated rows
            frm.refresh_field('target_summary');
            frm.refresh_field('target_quantity_summary');
            frm.refresh_field('lead_summary');
        }
    }
});

function processWeeksAndTargets(frm, Total_days) {
    // Call to fetch weeks and dates
    frappe.call({
        method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.get_weeks_with_dates",
        args: {
            dates_str: Total_days
        },
        callback: (r) => {
            let Weeks_based_on_from_to = r.message.weeks;
            let targetPromises = [];

            // Check if item_target_table is empty
            if (!frm.doc.item_target_table || frm.doc.item_target_table.length === 0) {
                // Create promise for empty item_target_table case
                let promise = new Promise((resolve, reject) => {
                    frappe.call({
                        method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.calculate_targets",
                        args: {
                            dates_info: JSON.stringify(Weeks_based_on_from_to),
                            daily_target: 0,
                            daily_quantity: 0,
                            current_date: frm.doc.from,
                            lead_target: frm.doc.lead_target || 0,
                            itemGroup: '',
                            uom: ''
                        },
                        callback: (r) => {
                            resolve(r.message.weeklyTargets); // Resolve the promise with weeklyTargets
                        },
                        error: (err) => reject(err)
                    });
                });
                targetPromises.push(promise);
            } else {
                // Loop through item_target_table and create promises for each row
                frm.doc.item_target_table.forEach(row => {
                    let promise = new Promise((resolve, reject) => {
                        frappe.call({
                            method: "padmavati_crm.padmavati_crm.doctype.sales_person_target_allocation.sales_person_target_allocation.calculate_targets",
                            args: {
                                dates_info: JSON.stringify(Weeks_based_on_from_to),
                                daily_target: row.amount || 0,
                                daily_quantity: row.quantity || 0,
                                current_date: frm.doc.from,
                                uom: row.uom,
                                lead_target: frm.doc.lead_target || 0,
                                itemGroup: row.item_group || ''
                            },
                            callback: (r) => {
                                resolve(r.message.weeklyTargets); // Resolve the promise with weeklyTargets
                            },
                            error: (err) => reject(err)
                        });
                    });
                    targetPromises.push(promise);
                });
            }

            // Use Promise.all to wait for all promises to resolve
            Promise.all(targetPromises).then(results => {
                // Concatenate all weeklyTargets from resolved promises into Target_summary
                results.forEach(weeklyTargets => {
                    Target_summary = Target_summary.concat(weeklyTargets);
                });

                // Print Target_summary once all promises have been resolved
            }).catch(err => {
                console.error("Error in processing targets:", err);
            });
        }
    });
}
