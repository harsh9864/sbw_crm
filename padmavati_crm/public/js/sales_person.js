// frappe.ui.form.on('Sales Person', {
//     refresh: function (frm) {
//         frm.trigger("sales_target_view")
//     },
//     sales_target_view: function (frm) {
//         // Fetch all Sales Person Target Allocation records
//         frappe.call({
//             method: 'frappe.client.get_list',
//             args: {
//                 doctype: 'Sales Person Target Allocation',
//                 fields: ['name']
//             },
//             callback: function (response) {
//                 if (response && response.message) {
//                     let target_view_html = `<style>
//                         .grid {
//                             display: grid;
//                             grid-template-columns: repeat(1, minmax(0, 1fr));
//                             gap: 13px;
//                             max-width: 360px;
//                             margin-left: auto;
//                             margin-right: auto;
//                         }                      
//                         @media (min-width: 768px) {
//                             .grid {
//                                 max-width: none;
//                                 grid-template-columns: repeat(2, minmax(0, 1fr));
//                             }
//                         }
//                         @media (min-width: 1140px) {
//                             .grid {
//                                 grid-template-columns: repeat(3, minmax(0, 1fr));
//                             }
//                         }
//                         .card {
//                             background-color: #fff;
//                             border-radius: 12px;
//                             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//                             padding: 8px;
//                             transition: box-shadow 0.3s ease;
//                         }
//                         .card:hover {
//                             box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
//                         }
//                         .card-header h2 {
//                             font-size: 1.5rem;
//                             margin-bottom: 8px;
//                         }
//                         .card-body {
//                             display: flex;
//                             align-items: center;
//                             margin-top: 16px;
//                         }
//                         .progress-container {
//                             display: flex;
//                             align-items: center;
//                         }
//                         .circular-progress {
//                             width: 80px;
//                             height: 80px;
//                             border-radius: 50%;
//                             background: conic-gradient(#4caf50 50%, #d2d2d2 0);
//                             display: flex;
//                             align-items: center;
//                             justify-content: center;
//                             margin-right: 16px;
//                         }
//                         .progress-value {
//                             font-size: 1.2rem;
//                             color: #000;
//                             font-weight: bold;
//                         }
//                         .progress-info p {
//                             margin: 0;
//                             font-size: 14px;
//                         }
//                         .card-footer {
//                             margin-top: 16px;
//                             font-size: 0.9rem;
//                             color: #666;
//                         }
//                         .card-footer p {
//                             margin: 4px 0;
//                         }
//                     </style>
//                     <div class="grid">`;

//                     response.message.forEach(function (record) {
//                         // Fetch the full record, including child tables
//                         frappe.call({
//                             method: 'frappe.client.get',
//                             args: {
//                                 doctype: 'Sales Person Target Allocation',
//                                 name: record.name
//                             },
//                             callback: function (recordDetails) {
//                                 if (recordDetails && recordDetails.message) {
//                                     console.log(recordDetails.message.target_summary)
//                                     // Filter through the sales_person_list child table
//                                     recordDetails.message.sales_person_list.forEach(function (row) {
//                                         if (row.sales_person_name === frm.doc.name) {
//                                             // Generate HTML for the card view
//                                             recordDetails.message.item_target_table.forEach(function (item) {
//                                                 let progress = 0;
//                                                 target_view_html += `
//                                                 <div class="card">
//                                                     <div class="card-header">
//                                                         <h2>Item Group: ${item.item_group}</h2>
//                                                     </div>
//                                                     <div class="card-body">
//                                                         <div class="progress-container">
//                                                             <div class="circular-progress" style="background: conic-gradient(#4caf50 ${progress}%, #d2d2d2 0);">
//                                                                 <span class="progress-value">${progress.toFixed(0)}%</span>
//                                                             </div>
//                                                             <div class="progress-info">
//                                                                 <p>Target Quantity: ${item.quantity}</p>
//                                                                 <p>Target Amount: ${item.amount}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div class="card-footer">
//                                                         <p>From: ${recordDetails.message.from}</p>
//                                                         <p>To: ${recordDetails.message.to}</p>
//                                                     </div>
//                                                 </div>`;
//                                             });

//                                             // Append to the grid container
//                                             target_view_html += `</div>`;
//                                             // Append the target view HTML to a custom field or an HTML field in the form
//                                             frm.set_df_property(
//                                                 "custom_your_target",
//                                                 "options",
//                                                 target_view_html
//                                             );
//                                             frm.refresh_field("custom_your_target");
//                                         }
//                                     });
//                                 }
//                             }
//                         });
//                     });
//                 }
//             }
//         });
//     }
// });

frappe.ui.form.on('Sales Person', {
    refresh: function (frm) {
        frm.trigger("sales_target_view");
    },
    sales_target_view: function (frm) {
        // Fetch all Sales Person Target Allocation records
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
                            background-color: #fff;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            padding: 16px;
                            transition: box-shadow 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        }
                        .card:hover {
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                        }
                        .card-header {
                            font-size: 1.25rem;
                            margin-bottom: 12px;
                            font-weight: bold;
                        }
                        .card-body {
                            margin-bottom: 12px;
                        }
                        .target-info {
                            display: flex;
                            flex-direction: column;
                        }
                        .target-info p {
                            margin: 4px 0;
                            font-size: 14px;
                            color: #333;
                        }
                        .target-info .label {
                            font-weight: bold;
                        }
                        .progress-border {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            border: 2px solid transparent;
                            border-radius: 8px;
                            box-sizing: border-box;
                            background: conic-gradient(
                                #4caf50 var(--progress),
                                #d2d2d2 0
                            );
                            z-index: 0;
                        }
                        .card-content {
                            position: relative;
                            z-index: 1;
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
                                                // Calculate progress percentages (replace 0 with actual progress)
                                                let dailyProgress = Math.min(100, 0); // Placeholder value
                                                let weeklyProgress = Math.min(100, 0); // Placeholder value

                                                target_view_html += `
                                                    <div class="card">
                                                        <div class="progress-border" style="--progress: ${dailyProgress}%"></div>
                                                        <div class="card-content">
                                                            <div class="card-header">Item Group: ${target.item_group}</div>
                                                            <div class="card-body">
                                                                <div class="target-info">
                                                                    <p><span class="label">Daily Target:</span> 0 / ${target.daily_target}</p>
                                                                    <p><span class="label">Weekly Target:</span> 0 / ${target.weeklytarget}</p>
                                                                    <p><span class="label">Monthly Target:</span> ${target.monthlytarget}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>`;
                                            }
                                        });
                                    }

                                    // Append to the grid container
                                    target_view_html += `</div>`;
                                    // Append the target view HTML to a custom field or an HTML field in the form
                                    frm.set_df_property(
                                        "custom_your_target",
                                        "options",
                                        target_view_html
                                    );
                                    frm.refresh_field("custom_your_target");
                                }
                            }
                        });
                    });
                }
            }
        });
    }
});



