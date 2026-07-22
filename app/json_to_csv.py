"""Convert the dashboard's JSON data into editable CSV files.
Run this once to generate the CSVs from the current JSON.
"""
import json
import csv
import os

# Load the current JSON data
with open('/home/claude/dot/real/real_dot_data_v2.json') as f:
    data = json.load(f)

OUT_DIR = '/home/claude/dot/backend/data_csv'
os.makedirs(OUT_DIR, exist_ok=True)

# ============================================================
# 1. states.csv - one row per state, all flat scalar fields
# ============================================================
states_rows = []
for abbr, s in data.items():
    states_rows.append({
        'abbr': abbr,
        'name': s['name'],
        'capital': s['capital'],
        'population_millions': s['population_millions'],
        'agencyName': s['agencyName'],
        'fiscalYear': s['fiscalYear'],
        # Budget
        'totalBudget_millions': s['totalBudget'],
        'budgetSource': s['budgetSource'],
        'budgetUrl': s['budgetUrl'],
        'budgetNote': s.get('budgetNote') or '',
        # NASBO funding sources
        'fund_general_fund': s['fundingSources']['general_fund'],
        'fund_federal_funds': s['fundingSources']['federal_funds'],
        'fund_other_state_funds': s['fundingSources']['other_state_funds'],
        'fund_bonds': s['fundingSources']['bonds'],
        # YoY growth
        'yoy_fy23_to_fy24': s['yoyGrowth']['fy23_to_fy24'],
        'yoy_fy24_to_fy25': s['yoyGrowth']['fy24_to_fy25'],
        # % of state budget
        'pct_state_fy2023': s['pctOfStateBudget']['fy2023'],
        'pct_state_fy2024': s['pctOfStateBudget']['fy2024'],
        'pct_state_fy2025': s['pctOfStateBudget']['fy2025'],
        # Expenditure breakdown (FHWA categories scaled)
        'exp_construction_capital': s['budgetBreakdown'].get('construction_capital', 0),
        'exp_maintenance_services': s['budgetBreakdown'].get('maintenance_services', 0),
        'exp_administration_safety': s['budgetBreakdown'].get('administration_safety', 0),
        'exp_grants_to_local_govts': s['budgetBreakdown'].get('grants_to_local_govts', 0),
        'exp_debt_service_interest': s['budgetBreakdown'].get('debt_service_interest', 0),
        # Infrastructure
        'publicRoadMiles': s['stats']['publicRoadMiles'],
        'bridges_total': s['stats']['bridges'],
        'bridges_good': s['stats']['bridgesGood'],
        'bridges_fair': s['stats']['bridgesFair'],
        'bridges_poor': s['stats']['bridgesPoor'],
        # Org
        'num_districts': s['districts'],
        'num_counties': s['counties'],
        # HQ
        'hq_address': s['headquarters']['address'],
        'hq_city': s['headquarters']['city'],
        'hq_state': s['headquarters']['state'],
        'hq_zip': s['headquarters']['zip'],
        'hq_phone': s['headquarters']['phone'],
        'hq_website': s['headquarters']['website'],
    })

with open(f'{OUT_DIR}/states.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=states_rows[0].keys())
    writer.writeheader()
    writer.writerows(states_rows)
print(f"✓ states.csv — {len(states_rows)} rows, {len(states_rows[0])} columns")

# ============================================================
# 2. leadership.csv - one row per leader (state may have 1+)
# ============================================================
leadership_rows = []
for abbr, s in data.items():
    for leader in s['leadership']:
        leadership_rows.append({
            'state_abbr': abbr,
            'name': leader['name'],
            'title': leader['title'],
            'agency': leader['agency'],
        })

with open(f'{OUT_DIR}/leadership.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=leadership_rows[0].keys())
    writer.writeheader()
    writer.writerows(leadership_rows)
print(f"✓ leadership.csv — {len(leadership_rows)} rows")

# ============================================================
# 3. agencies.csv - one row per partner agency
# ============================================================
agencies_rows = []
for abbr, s in data.items():
    for agency in s['agencies']:
        agencies_rows.append({
            'state_abbr': abbr,
            'name': agency['name'],
            'type': agency['type'],
            'url': agency.get('url', ''),
            'note': agency.get('note', ''),
        })

with open(f'{OUT_DIR}/agencies.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=agencies_rows[0].keys())
    writer.writeheader()
    writer.writerows(agencies_rows)
print(f"✓ agencies.csv — {len(agencies_rows)} rows")

# ============================================================
# 4. history.csv - one row per state per fiscal year
# ============================================================
history_rows = []
for abbr, s in data.items():
    for h in s['history']:
        history_rows.append({
            'state_abbr': abbr,
            'fiscal_year': h['fy'],
            'total_millions': h['total'],
            'type': h['type'],  # 'actual' or 'estimated'
        })

with open(f'{OUT_DIR}/history.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=history_rows[0].keys())
    writer.writeheader()
    writer.writerows(history_rows)
print(f"✓ history.csv — {len(history_rows)} rows")

# ============================================================
# 5. revenue.csv - one row per state's revenue sources (FY2025)
# ============================================================
revenue_rows = []
for abbr, s in data.items():
    rb = s.get('revenueBreakdown')
    if rb:
        revenue_rows.append({
            'state_abbr': abbr,
            'fiscal_year': '2025',
            'motor_fuel_taxes': rb['motor_fuel_taxes'],
            'license_registration': rb['license_registration'],
            'vehicle_sales_use': rb['vehicle_sales_use'],
            'tolls': rb['tolls'],
            'other': rb['other'],
            'total': rb['total'],
        })
    else:
        # State didn't report; include row with zeros so it's easy to add data later
        revenue_rows.append({
            'state_abbr': abbr,
            'fiscal_year': '2025',
            'motor_fuel_taxes': '',
            'license_registration': '',
            'vehicle_sales_use': '',
            'tolls': '',
            'other': '',
            'total': '',
        })

with open(f'{OUT_DIR}/revenue.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=revenue_rows[0].keys())
    writer.writeheader()
    writer.writerows(revenue_rows)
print(f"✓ revenue.csv — {len(revenue_rows)} rows")

print(f"\nAll CSVs written to: {OUT_DIR}")
print("\nSample states.csv first 3 columns of first row:")
print(f"  abbr={states_rows[0]['abbr']}, name={states_rows[0]['name']}, totalBudget=${states_rows[0]['totalBudget_millions']}M")
