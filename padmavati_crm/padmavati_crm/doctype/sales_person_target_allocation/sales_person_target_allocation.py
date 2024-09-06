# Copyright (c) 2024, Sanskar and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
from datetime import datetime, timedelta
from collections import defaultdict


class SalesPersonTargetAllocation(Document):
    pass


# Gives Total Days based on Sundays(Inclusive or Exclusive)
@frappe.whitelist()
def get_total_days(include_sundays, from_date, to_date):
    # Parse the dates
    start_date = datetime.strptime(from_date, "%Y-%m-%d")
    end_date = datetime.strptime(to_date, "%Y-%m-%d")

    # Initialize the list for all dates
    all_dates = []

    # Loop through the date range
    current_date = start_date

    # For including Sundays
    if include_sundays == "1":
        while current_date <= end_date:
            all_dates.append(current_date.strftime("%Y-%m-%d"))
            current_date += timedelta(days=1)
        return {"dates": all_dates}
    # For Excluding Sundays
    if include_sundays == "0":
        while current_date <= end_date:
            if current_date.weekday() != 6:  # Exclude Sundays
                all_dates.append(current_date.strftime("%Y-%m-%d"))
            current_date += timedelta(days=1)
        return {"dates": all_dates}


# Gives the Holiday_List Dates List
@frappe.whitelist()
def filter_holidays(list_of_holidays, from_date, end_date):
    """
    Filters the holidays within the specified date range.

    :param list_of_holidays: List of holidays with `holiday_date`.
    :param from_date: Start date of the range in "YYYY-MM-DD" format.
    :param end_date: End date of the range in "YYYY-MM-DD" format.
    :return: Filtered list of holidays within the specified date range.
    """
    # Convert string dates to datetime objects
    start_date = datetime.strptime(from_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Convert JSON string to list (if passed as JSON string)
    if isinstance(list_of_holidays, str):
        list_of_holidays = frappe.parse_json(list_of_holidays)

    # Filter holidays within the date range
    filtered_holiday_dates = [
        holiday["holiday_date"]
        for holiday in list_of_holidays
        if start_date
        <= datetime.strptime(holiday["holiday_date"], "%Y-%m-%d")
        <= end_date
    ]

    return filtered_holiday_dates


# Fetches the weekdays of the given in the from and to range
@frappe.whitelist()
def get_weeks_with_dates(dates_str):
    # Parse the JSON string to a Python list
    dates = json.loads(dates_str)

    # Convert the list of dates to a set for unique dates
    date_set = set(dates)

    # Helper function to get the start of the week (Monday) for a given date
    def get_monday(date):
        d = datetime.strptime(date, "%Y-%m-%d")
        start = d - timedelta(days=d.weekday())  # Monday
        return start.strftime("%Y-%m-%d")

    # Helper function to get the end of the week (Sunday) for a given date
    def get_sunday(date):
        d = datetime.strptime(date, "%Y-%m-%d")
        end = d + timedelta(days=(6 - d.weekday()))  # Sunday
        return end.strftime("%Y-%m-%d")

    # Initialize week ranges
    week_start = get_monday(dates[0])
    week_end = get_sunday(dates[-1])

    weeks = []

    # Iterate over the week range
    current_week_start = datetime.strptime(week_start, "%Y-%m-%d")
    end_week = datetime.strptime(week_end, "%Y-%m-%d")

    while current_week_start <= end_week:
        week_start_date = current_week_start.strftime("%Y-%m-%d")
        week_end_date = get_sunday(week_start_date)

        # Collect the dates for the current week
        week_dates = [d for d in date_set if week_start_date <= d <= week_end_date]

        if week_dates:
            weeks.append(
                {
                    "weekStart": week_start_date,
                    "weekEnd": week_end_date,
                    "dates": week_dates,
                }
            )

        # Move to the next week
        current_week_start += timedelta(weeks=1)

    return {"weekCount": len(weeks), "weeks": weeks}


@frappe.whitelist()
def calculate_targets(dates_info, current_date, itemGroup, uom, daily_target=0, daily_quantity=0, lead_target=0):
    if isinstance(dates_info, str):
        dates_info = json.loads(dates_info)

    current_date = datetime.strptime(current_date, "%Y-%m-%d").date()

    weekly_targets = []
    monthly_targets = {}

    all_dates = []

    for week in dates_info:
        week_start = datetime.strptime(week["weekStart"], "%Y-%m-%d").date()
        week_end = datetime.strptime(week["weekEnd"], "%Y-%m-%d").date()

        # Filter dates that are after the current date for the current week
        remaining_days = [
            datetime.strptime(date, "%Y-%m-%d").date()
            for date in week["dates"]
            if datetime.strptime(date, "%Y-%m-%d").date() >= current_date
        ]

        # Calculate the weekly target, weekly quantity, and weekly lead target
        weekly_target = len(remaining_days) * int(daily_target)
        weekly_quantity = len(remaining_days) * int(daily_quantity)
        weekly_lead_target = len(remaining_days) * int(lead_target)
        
        weekly_targets.append(
            {
                "weekStart": week["weekStart"],
                "weekEnd": week["weekEnd"],
                "weeklyTarget": weekly_target,
                "weeklyQuantity": weekly_quantity,
                "weeklyLeadTarget": weekly_lead_target
            }
        )

        all_dates.extend(week["dates"])

    date_objs = [datetime.strptime(date_str, "%Y-%m-%d") for date_str in all_dates]
    from_date_obj = min(date_objs)
    to_date_obj = max(date_objs)
    from_date = from_date_obj.strftime("%Y-%m-%d")
    to_date = to_date_obj.strftime("%Y-%m-%d")

    month_days = defaultdict(list)
    for date_str in all_dates:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        if from_date_obj <= date_obj <= to_date_obj:
            month_key = date_obj.strftime("%Y-%m")
            month_days[month_key].append(date_obj)

    for month, dates in month_days.items():
        working_days_count = len(dates)
        monthly_target = working_days_count * int(daily_target)
        monthly_quantity = working_days_count * int(daily_quantity)
        monthly_lead_target = working_days_count * int(lead_target)
        monthly_targets[month] = {
            "monthlyTarget": monthly_target,
            "monthlyQuantity": monthly_quantity,
            "monthlyLeadTarget": monthly_lead_target
        }

    for week in weekly_targets:
        week_start = datetime.strptime(week["weekStart"], "%Y-%m-%d").date()
        week_end = datetime.strptime(week["weekEnd"], "%Y-%m-%d").date()

        # Determine the month for each week
        if current_date >= week_start and current_date <= week_end:
            # Include the month of the week_end for the weekly target
            week_month = week_end.strftime("%Y-%m")
        else:
            # Use the month of the week_start
            week_month = week_start.strftime("%Y-%m")

        week["monthlyTarget"] = monthly_targets.get(week_month, {}).get("monthlyTarget", 0)
        week["monthlyQuantity"] = monthly_targets.get(week_month, {}).get("monthlyQuantity", 0)
        week["monthlyLeadTarget"] = monthly_targets.get(week_month, {}).get("monthlyLeadTarget", 0)
        week["dailyTarget"] = daily_target
        week["dailyQuantity"] = daily_quantity
        week["dailyLeadTarget"] = lead_target
        week["ItemGroup"] = itemGroup
        week["uom"] = uom

    return {
        "weeklyTargets": weekly_targets,
        "monthlyTargets": {
            "fromDate": from_date,
            "toDate": to_date,
            "monthlyTargets": monthly_targets,
        },
    }


