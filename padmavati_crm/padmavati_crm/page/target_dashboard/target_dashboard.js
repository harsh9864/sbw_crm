const today = new Date().toISOString().split('T')[0];
var Sales_Person_Target_Response_Records;
var Sales_Person_Quantity_Records;
var Sales_Person_Lead_Records;
var Todays_Quantity_Record = [];
var Todays_Item_Target = [];
var This_weeks_Item_Target = [];
var This_months_Item_Target = [];
var This_years_Item_Target = [];
var Todays_Lead_Target = [];
var This_weeks_Lead_Target = [];
var This_months_Lead_Target = [];
var This_years_Lead_Target = [];

// // fetching the Lead Docfields
// fetch("/api/method/frappe.desk.form.load.getdoctype?doctype=Lead")
// 	.then(response => response.json())
// 	.then(data => console.log(data.docs[0].fields));

// Function to calculate the yearly target for each item group
function calculateYearlyTargetByGroup(data) {
	const totalsByGroup = {};

	data.forEach(entry => {
		const monthlyTarget = parseInt(entry.monthly_quantity_target, 10);

		if (!totalsByGroup[entry.item_group]) {
			totalsByGroup[entry.item_group] = {
				targets: new Set(),
				uom: entry.uom
			};
		}

		totalsByGroup[entry.item_group].targets.add(monthlyTarget);
	});

	const result = Object.keys(totalsByGroup).map(itemGroup => ({
		item_group: itemGroup,
		yearly_amount: Array.from(totalsByGroup[itemGroup].targets).reduce((sum, target) => sum + target, 0),
		uom: totalsByGroup[itemGroup].uom
	}));

	return result;
}

function calculateYearlyLead(data) {
	// Create an object to store unique monthly lead targets by group
	const totalsByGroup = {};

	data.forEach(entry => {
		const monthlyTarget = parseInt(entry.monthly_lead_target, 10);

		// Initialize the item group in the object if it does not exist
		if (!totalsByGroup[entry.parent]) {
			totalsByGroup[entry.parent] = {
				targets: new Set()
			};
		}

		// Add the monthly target to the set for the item group
		totalsByGroup[entry.parent].targets.add(monthlyTarget);
	});

	// Convert the set to a total sum for each item group
	const result = Object.keys(totalsByGroup).map(itemGroup => ({
		item_group: itemGroup,
		yearly_amount: Array.from(totalsByGroup[itemGroup].targets).reduce((sum, target) => sum + target, 0)
	}));

	return result;
}

function appendTodaysTarget() {
	const todaytargetDiv = document.querySelector('.today_target');
	const weektargetDiv = document.querySelector('.weekly_target');
	const monthtargetDiv = document.querySelector('.monthly_target');
	const quartertargetDiv = document.querySelector('.quarterly_target');
	const yeartargetDiv = document.querySelector('.yearly_target');

	// Append item and lead targets for today
	Todays_Item_Target.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.classList.add('target-item');
		itemDiv.innerHTML = `<h5>${item.item_group}: 0/${item.item_group_target} ${item.item_group_uom}</h5>`;
		todaytargetDiv.appendChild(itemDiv);
	});
	Todays_Lead_Target.forEach(lead => {
		const leadDiv = document.createElement('div');
		leadDiv.classList.add('target-lead');
		leadDiv.innerHTML = `<h5>Leads: 0/${lead.today_lead_target}</h5>`;
		todaytargetDiv.appendChild(leadDiv);
	});

	// Append item and lead targets for the week
	This_weeks_Item_Target.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.classList.add('target-item');
		itemDiv.innerHTML = `<h5>${item.item_group}: 0/${item.item_group_target} ${item.item_group_uom}</h5>`;
		weektargetDiv.appendChild(itemDiv);
	});
	This_weeks_Lead_Target.forEach(lead => {
		const leadDiv = document.createElement('div');
		leadDiv.classList.add('target-lead');
		leadDiv.innerHTML = `<h5>Leads: 0/${lead.weekly_lead_target}</h5>`;
		weektargetDiv.appendChild(leadDiv);
	});

	// Append item and lead targets for the month
	This_months_Item_Target.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.classList.add('target-item');
		itemDiv.innerHTML = `<h5>${item.item_group}: 0/${item.item_group_target} ${item.item_group_uom}</h5>`;
		monthtargetDiv.appendChild(itemDiv);
	});
	This_months_Lead_Target.forEach(lead => {
		const leadDiv = document.createElement('div');
		leadDiv.classList.add('target-lead');
		leadDiv.innerHTML = `<h5>Leads: 0/${lead.monthly_lead_target}</h5>`;
		monthtargetDiv.appendChild(leadDiv);
	});

	// Append item and lead targets for the quarter
	This_years_Item_Target.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.classList.add('target-item');
		itemDiv.innerHTML = `<h5>${item.item_group}: 0/${item.yearly_amount} ${item.uom}</h5>`;
		quartertargetDiv.appendChild(itemDiv);
	});
	This_years_Lead_Target.forEach(lead => {
		const leadDiv = document.createElement('div');
		leadDiv.classList.add('target-lead');
		leadDiv.innerHTML = `<h5>Leads: 0/${lead.yearly_amount}</h5>`;
		quartertargetDiv.appendChild(leadDiv);
	});

	// Append item and lead targets for the year
	This_years_Item_Target.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.classList.add('target-item');
		itemDiv.innerHTML = `<h5>${item.item_group}: 0/${item.yearly_amount} ${item.uom}</h5>`;
		yeartargetDiv.appendChild(itemDiv);
	});
	This_years_Lead_Target.forEach(lead => {
		const leadDiv = document.createElement('div');
		leadDiv.classList.add('target-lead');
		leadDiv.innerHTML = `<h5>Leads: 0/${lead.yearly_amount}</h5>`;
		yeartargetDiv.appendChild(leadDiv);
	});
}

function filterData(filter) {
	console.log("filter");
}


frappe.pages['target-dashboard'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Target Dashboard',
		single_column: true
	});

	// Fetching sales person target allocations
	frappe.call({
		method: "padmavati_crm.padmavati_crm.page.target_dashboard.target_dashboard.get_sales_person_target_allocations",
		callback: (Sales_Person_Target_Response) => {
			Sales_Person_Target_Response_Records = Sales_Person_Target_Response.message;

			// Extracting quantity records
			Sales_Person_Quantity_Records = Sales_Person_Target_Response_Records[0].target_quantity_summary;

			// Extracting lead records
			Sales_Person_Lead_Records = Sales_Person_Target_Response_Records[0].lead_summary;

			// Calculating the yearly amount for quantity targets
			This_years_Item_Target = calculateYearlyTargetByGroup(Sales_Person_Quantity_Records);

			// Calculating the yearly lead
			This_years_Lead_Target = calculateYearlyLead(Sales_Person_Lead_Records)

			// Loop through the quantity records and check for today's target
			Sales_Person_Quantity_Records.forEach(function (target) {
				if (today >= target.week_start && today <= target.week_end) {
					Todays_Quantity_Record.push(target);

					Todays_Item_Target.push({
						item_group: target.item_group,
						item_group_target: target.daily_quantity_target,
						item_group_uom: target.uom
					});

					This_weeks_Item_Target.push({
						item_group: target.item_group,
						item_group_target: target.weekly_quantity_target,
						item_group_uom: target.uom
					});

					This_months_Item_Target.push({
						item_group: target.item_group,
						item_group_target: target.monthly_quantity_target,
						item_group_uom: target.uom
					});
				}
			});

			// Loop through the lead records and check for today's target
			Sales_Person_Lead_Records.forEach(function (target) {
				if (today >= target.week_start && today <= target.week_end) {
					Todays_Lead_Target.push({
						today_lead_target: target.daily_lead_target
					});

					This_weeks_Lead_Target.push({
						weekly_lead_target: target.weekly_lead_target
					});

					This_months_Lead_Target.push({
						monthly_lead_target: target.monthly_lead_target
					});
				}
			});

			// Append the records to the HTML
			appendTodaysTarget();

		}
	});

	// Setting page title padding
	document.getElementsByClassName('page-title')[0].style.padding = "0px";

	// Rendering the HTML File and passing the data in props
	$(frappe.render_template("target_dashboard", {})).appendTo(page.body);
}
