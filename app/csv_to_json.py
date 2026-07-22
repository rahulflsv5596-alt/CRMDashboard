"""Convert editable CSV files back into the dashboard's JSON format.

USAGE:
    python3 csv_to_json.py

    Reads from ./data_csv/*.csv
    Writes to ./data/dot_data.json

This is the file the dashboard loads. Edit the CSVs, run this script, and the
dashboard will reflect the new data on next page load.
"""
import csv
import json
import os
import sys
from collections import defaultdict

CSV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_csv')
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(OUT_DIR, exist_ok=True)


def read_csv(filename):
    path = os.path.join(CSV_DIR, filename)
    if not os.path.exists(path):
        print(f"  ERROR: {path} not found", file=sys.stderr)
        sys.exit(1)
    with open(path, encoding='utf-8') as f:
        return list(csv.DictReader(f))


def num(v, default=0, as_int=False):
    """Parse a CSV cell as a number, with sensible default for blank/missing."""
    if v is None or v == '':
        return default
    try:
        f = float(v)
        return int(f) if as_int else f
    except (ValueError, TypeError):
        return default


def main():
    print("Loading CSVs...")
    states_rows = read_csv('states.csv')
    leadership_rows = read_csv('leadership.csv')
    agencies_rows = read_csv('agencies.csv')
    history_rows = read_csv('history.csv')
    revenue_rows = read_csv('revenue.csv')
    print(f"  states:     {len(states_rows)} rows")
    print(f"  leadership: {len(leadership_rows)} rows")
    print(f"  agencies:   {len(agencies_rows)} rows")
    print(f"  history:    {len(history_rows)} rows")
    print(f"  revenue:    {len(revenue_rows)} rows")

    # Group child tables by state_abbr
    leadership_by_state = defaultdict(list)
    for r in leadership_rows:
        leadership_by_state[r['state_abbr']].append({
            'name': r['name'],
            'title': r['title'],
            'agency': r['agency'],
        })

    agencies_by_state = defaultdict(list)
    for r in agencies_rows:
        entry = {
            'name': r['name'],
            'type': r['type'],
        }
        if r.get('url'):
            entry['url'] = r['url']
        if r.get('note'):
            entry['note'] = r['note']
        agencies_by_state[r['state_abbr']].append(entry)

    history_by_state = defaultdict(list)
    for r in history_rows:
        history_by_state[r['state_abbr']].append({
            'fy': r['fiscal_year'],
            'total': num(r['total_millions']),
            'type': r['type'] or 'actual',
        })
    # Sort each state's history by year
    for k in history_by_state:
        history_by_state[k].sort(key=lambda h: h['fy'])

    revenue_by_state = {}
    for r in revenue_rows:
        # Only include if the row has actual data (total > 0)
        total = num(r['total'], default=None)
        if total and total > 0:
            revenue_by_state[r['state_abbr']] = {
                'motor_fuel_taxes': num(r['motor_fuel_taxes'], as_int=True),
                'license_registration': num(r['license_registration'], as_int=True),
                'vehicle_sales_use': num(r['vehicle_sales_use'], as_int=True),
                'tolls': num(r['tolls'], as_int=True),
                'other': num(r['other'], as_int=True),
                'total': num(r['total'], as_int=True),
            }
        else:
            revenue_by_state[r['state_abbr']] = None

    # Build the final JSON
    result = {}
    warnings = []
    for r in states_rows:
        abbr = r['abbr']
        # Validate required fields
        if not abbr:
            warnings.append(f"Row missing abbr: {r.get('name','?')}")
            continue

        # Build budget breakdown — only include non-zero categories
        breakdown = {}
        for k in ('construction_capital', 'maintenance_services', 'administration_safety',
                  'grants_to_local_govts', 'debt_service_interest'):
            v = num(r.get(f'exp_{k}'))
            if v > 0:
                breakdown[k] = round(v, 1)

        # Bridges
        bridges_total = num(r['bridges_total'], as_int=True)
        bridges_poor = num(r['bridges_poor'], as_int=True)
        poor_pct = round(bridges_poor / bridges_total * 100, 1) if bridges_total else 0

        state_obj = {
            'abbr': abbr,
            'name': r['name'],
            'capital': r['capital'],
            'population_millions': num(r['population_millions']),
            'totalBudget': num(r['totalBudget_millions']),
            'fiscalYear': r['fiscalYear'] or '2025',
            'budgetSource': r['budgetSource'],
            'budgetUrl': r['budgetUrl'],
            'budgetNote': r.get('budgetNote') or None,
            'agencyName': r['agencyName'],
            'fundingSources': {
                'general_fund': num(r['fund_general_fund'], as_int=True),
                'federal_funds': num(r['fund_federal_funds'], as_int=True),
                'other_state_funds': num(r['fund_other_state_funds'], as_int=True),
                'bonds': num(r['fund_bonds'], as_int=True),
            },
            'yoyGrowth': {
                'fy23_to_fy24': num(r['yoy_fy23_to_fy24']),
                'fy24_to_fy25': num(r['yoy_fy24_to_fy25']),
            },
            'pctOfStateBudget': {
                'fy2023': num(r['pct_state_fy2023']),
                'fy2024': num(r['pct_state_fy2024']),
                'fy2025': num(r['pct_state_fy2025']),
            },
            'budgetBreakdown': breakdown,
            'revenueBreakdown': revenue_by_state.get(abbr),
            'stats': {
                'publicRoadMiles': num(r['publicRoadMiles'], as_int=True),
                'bridges': bridges_total,
                'bridgesGood': num(r['bridges_good'], as_int=True),
                'bridgesFair': num(r['bridges_fair'], as_int=True),
                'bridgesPoor': bridges_poor,
                'bridgesPoorPct': poor_pct,
            },
            'districts': num(r['num_districts'], as_int=True),
            'counties': num(r['num_counties'], as_int=True),
            'headquarters': {
                'address': r['hq_address'],
                'city': r['hq_city'],
                'state': r['hq_state'],
                'zip': r['hq_zip'],
                'phone': r['hq_phone'],
                'website': r['hq_website'],
            },
            'leadership': leadership_by_state.get(abbr, []),
            'agencies': agencies_by_state.get(abbr, []),
            'history': history_by_state.get(abbr, []),
        }

        # Light validation
        if not state_obj['leadership']:
            warnings.append(f"{abbr}: no leadership entries")
        if not state_obj['history']:
            warnings.append(f"{abbr}: no history entries")

        result[abbr] = state_obj

    # Build seed contacts (optional file — CRM seeds)
    contacts_path = os.path.join(CSV_DIR, 'contacts.csv')
    seed_contacts = []
    if os.path.exists(contacts_path):
        for r in read_csv('contacts.csv'):
            seed_contacts.append({
                'id': r['id'],
                'state': r['state_abbr'],
                'name': r['name'],
                'title': r['title'],
                'org': r['org'],
                'category': r['category'] or 'Other',
                'influence': r['influence'] or 'Medium',
                'stage': r['stage'] or 'New',
                'email': r.get('email', ''),
                'phone': r.get('phone', ''),
                'tags': [t.strip() for t in (r.get('tags') or '').split(';') if t.strip()],
                'notes': r.get('notes', ''),
                'nextAction': r.get('next_action', ''),
                'nextActionDate': r.get('next_action_date', ''),
                'interactions': [],
                'seed': True,
            })
        with open(os.path.join(OUT_DIR, 'seed_contacts.json'), 'w', encoding='utf-8') as f:
            json.dump(seed_contacts, f, separators=(',', ':'))
        print(f"✓ Built seed_contacts.json ({len(seed_contacts)} contacts)")

    # Write JSON
    out_path = os.path.join(OUT_DIR, 'dot_data.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        # Pretty version (for git diffs / reading)
        json.dump(result, f, indent=2)

    # Also write a compact version (smaller for embedding)
    compact_path = os.path.join(OUT_DIR, 'dot_data.min.json')
    with open(compact_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, separators=(',', ':'))

    pretty_size = os.path.getsize(out_path)
    compact_size = os.path.getsize(compact_path)

    print(f"\n✓ Built dot_data.json ({pretty_size:,} bytes pretty / {compact_size:,} bytes compact)")
    print(f"  States:     {len(result)}")
    print(f"  Leadership: {sum(len(s['leadership']) for s in result.values())}")
    print(f"  Agencies:   {sum(len(s['agencies']) for s in result.values())}")
    print(f"  History:    {sum(len(s['history']) for s in result.values())}")

    if warnings:
        print(f"\n⚠ {len(warnings)} warning(s):")
        for w in warnings[:15]:
            print(f"   {w}")

    print(f"\nOutput: {out_path}")
    print(f"        {compact_path}")


if __name__ == '__main__':
    main()
