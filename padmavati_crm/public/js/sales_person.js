frappe.ui.form.on('Sales Person', {
    refresh: function (frm) {
        frm.trigger("sales_target_view");
    },
    sales_target_view: function (frm) {
        // Fetching all Sales Person Target Allocation records
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Sales Person Target Allocation',
                fields: ['name']
            },
            callback: function (response) {
                if (response && response.message) {
                    let target_view_html = `<style>
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(1, minmax(0, 1fr));
                            gap: 15px;
                            max-width: 1000px;
                            margin: auto;
                        }
                        @media (min-width: 768px) {
                            .grid {
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                            }
                        }
                        @media (min-width: 1140px) {
                            .grid {
                                grid-template-columns: repeat(3, minmax(0, 1fr));
                            }
                        }
                        .card {
                            max-width: 300px;
                            background-color: #fff;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            transition: box-shadow 0.3s ease, border 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        }
                        .card:hover {
                            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                            border-color: rgba(0, 0, 0, 0.1);
                        }
                        .card-header {
                            font-size: 0.75rem;
                            margin-bottom: 12px;
                            font-weight: bold;
                            text-align: center;
                        }
                        .card-body {
                            margin-bottom: 12px;
                            text-align: center;
                        }
                        .target-info {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        .target-info p {
                            margin: 4px 0;
                            font-size: 14px;
                            color: #333;
                        }
                        .target-info .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .card-content {
                            position: relative;
                            z-index: 1;
                        }
                        .progress {
                            height: 8px;
                            background-color: #e0e0e0;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-top: 5px;
                            width: 100%;
                        }
                        .progress-bar {
                            height: 100%;
                            transition: width 0.4s ease;
                        }
                        .daily-progress-bar {
                            background-color: #ff9800;
                        }
                        .weekly-progress-bar {
                            background-color: #03a9f4;
                        }
                        .monthly-progress-bar {
                            background-color: #4caf50;
                        }
                    </style>
                    <div class="grid">`;
                    let target_quantity_view_html = `<style>
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(1, minmax(0, 1fr));
                            gap: 15px;
                            max-width: 1000px;
                            margin: auto;
                        }
                        @media (min-width: 768px) {
                            .grid {
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                            }
                        }
                        @media (min-width: 1140px) {
                            .grid {
                                grid-template-columns: repeat(3, minmax(0, 1fr));
                            }
                        }
                        .card {
                            background-color: #fff;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            transition: box-shadow 0.3s ease, border 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        }
                        .card:hover {
                            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                            border-color: rgba(0, 0, 0, 0.1);
                        }
                        .card-header {
                            font-size: 0.75rem;
                            margin-bottom: 12px;
                            font-weight: bold;
                            text-align: center;
                        }
                        .card-body {
                            margin-bottom: 12px;
                            text-align: center;
                        }
                        .target-info {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        .target-info p {
                            margin: 4px 0;
                            font-size: 14px;
                            color: #333;
                        }
                        .target-info .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .card-content {
                            position: relative;
                            z-index: 1;
                        }
                        .progress {
                            height: 8px;
                            background-color: #e0e0e0;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-top: 5px;
                            width: 100%;
                        }
                        .progress-bar {
                            height: 100%;
                            transition: width 0.4s ease;
                        }
                        .daily-progress-bar {
                            background-color: #ff9800;
                        }
                        .weekly-progress-bar {
                            background-color: #03a9f4;
                        }
                        .monthly-progress-bar {
                            background-color: #4caf50;
                        }
                    </style>
                    <div class="grid">`;
                    let target_lead_view_html = `<style>
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(1, minmax(0, 1fr));
                            gap: 15px;
                            max-width: 1000px;
                            margin: auto;
                        }
                        @media (min-width: 768px) {
                            .grid {
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                            }
                        }
                        @media (min-width: 1140px) {
                            .grid {
                                grid-template-columns: repeat(3, minmax(0, 1fr));
                            }
                        }
                        .card {
                            background-color: #fff;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            transition: box-shadow 0.3s ease, border 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        }
                        .card:hover {
                            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                            border-color: rgba(0, 0, 0, 0.1);
                        }
                        .card-header {
                            font-size: 1rem;
                            margin-bottom: 12px;
                            font-weight: bold;
                            text-align: center;
                        }
                        .card-body {
                            margin-bottom: 12px;
                            text-align: center;
                        }
                        .target-info {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        .target-info p {
                            margin: 4px 0;
                            font-size: 14px;
                            color: #333;
                        }
                        .target-info .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .card-content {
                            position: relative;
                            z-index: 1;
                        }
                        .progress {
                            height: 8px;
                            background-color: #e0e0e0;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-top: 5px;
                            width: 100%;
                        }
                        .progress-bar {
                            height: 100%;
                            transition: width 0.4s ease;
                        }
                        .daily-progress-bar {
                            background-color: #ff9800;
                        }
                        .weekly-progress-bar {
                            background-color: #03a9f4;
                        }
                        .monthly-progress-bar {
                            background-color: #4caf50;
                        }
                    </style>
                    <div class="grid">`;

                    response.message.forEach(function (record) {
                        // Fetch the full record, including child tables
                        frappe.call({
                            method: 'frappe.client.get',
                            args: {
                                doctype: 'Sales Person Target Allocation',
                                name: record.name
                            },
                            callback: function (recordDetails) {
                                if (recordDetails && recordDetails.message) {
                                    // Check if the current salesperson is in the sales_person_list
                                    let isTargeted = recordDetails.message.sales_person_list.some(row => row.sales_person_name === frm.doc.name);

                                    if (isTargeted) {
                                        // Filter records for the current salesperson
                                        let today = new Date().toISOString().split('T')[0];
                                        recordDetails.message.target_summary.forEach(function (target) {
                                            // Check if today's date is within the range
                                            if (today >= target.weekstart && today <= target.weekend) {
                                                target_view_html += `
                                                    <div class="card">
                                                        <div class="card-content">
                                                            <div class="card-header">Item Group: ${target.item_group}</div>
                                                            <div class="card-body">
                                                                <div class="target-info">
                                                                    <p><span class="label">Daily Target:</span> 0 / ${target.daily_target}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar daily-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Weekly Target:</span> 0 / ${target.weeklytarget}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar weekly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Monthly Target:</span> 0 / ${target.monthlytarget}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar monthly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>`;
                                            }
                                        });
                                        recordDetails.message.target_quantity_summary.forEach(function (target) {
                                            // Check if today's date is within the range
                                            if (today >= target.week_start && today <= target.week_end) {
                                                // Placeholder values for progress
                                                let dailyProgress = Math.min(100, 40); // 40% daily progress
                                                let weeklyProgress = Math.min(100, 60); // 60% weekly progress
                                                let monthlyProgress = Math.min(100, 80); // 80% monthly progress

                                                target_quantity_view_html += `
                                                    <div class="card">
                                                        <div class="card-content">
                                                            <div class="card-header">Item Group: ${target.item_group}</div>
                                                            <div class="card-body">
                                                                <div class="target-info">
                                                                    <p><span class="label">Daily Target:</span> 0 / ${target.daily_quantity_target} ${target.uom}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar daily-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Weekly Target:</span> 0 / ${target.weekly_quantity_target} ${target.uom}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar weekly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Monthly Target:</span> 0 / ${target.monthly_quantity_target} ${target.uom}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar monthly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>`;
                                            }
                                        });
                                        recordDetails.message.lead_summary.forEach(function (target) {
                                            // Check if today's date is within the range
                                            if (today >= target.week_start && today <= target.week_end) {
                                                // Placeholder values for progress
                                                let dailyProgress = Math.min(100, 40); // 40% daily progress
                                                let weeklyProgress = Math.min(100, 60); // 60% weekly progress
                                                let monthlyProgress = Math.min(100, 80); // 80% monthly progress

                                                target_lead_view_html += `
                                                    <div class="card">
                                                        <div class="card-content">
                                                            <div class="card-header">Lead</div>
                                                            <div class="card-body">
                                                                <div class="target-info">
                                                                    <p><span class="label">Daily Target:</span> 0 / ${target.daily_lead_target}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar daily-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Weekly Target:</span> 0 / ${target.weekly_lead_target}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar weekly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                    <p><span class="label">Monthly Target:</span> 0 / ${target.monthly_lead_target}</p>
                                                                    <div class="progress">
                                                                        <div class="progress-bar monthly-progress-bar" style="width: 0%"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>`;
                                            }
                                        });
                                    }

                                    // Append the grid container
                                    target_view_html += `</div>`;
                                    target_quantity_view_html += `</div>`;
                                    target_lead_view_html += `</div>`;
                                    // Append the target view HTML to a custom field or an HTML field in the form
                                    frm.set_df_property("custom_your_target", "options", target_view_html);
                                    frm.set_df_property("custom_quantity_html", "options", target_quantity_view_html);
                                    frm.set_df_property("custom_lead_html", "options", target_lead_view_html);
                                    // Refresh HTML fields 
                                    frm.refresh_field("custom_your_target");
                                    frm.refresh_field("custom_quantity_html");
                                    frm.refresh_field("custom_lead_html");
                                }
                            }
                        });
                    });
                }
            }
        });
    }
});
