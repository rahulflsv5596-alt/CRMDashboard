"""Generate data_csv/contacts.csv seeded from the verified AASHTO leadership roster."""
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, 'data', 'dot_data.json')) as f:
    data = json.load(f)

rows = []
for abbr, s in sorted(data.items()):
    for leader in s['leadership']:
        rows.append({
            'id': f'seed-{abbr.lower()}-chief',
            'state_abbr': abbr,
            'name': leader['name'],
            'title': leader['title'],
            'org': leader['agency'],
            'category': 'State DOT Leadership',
            'influence': 'High',
            'stage': 'New',
            'email': '',
            'phone': s['headquarters']['phone'],
            'tags': 'agency-chief;aashto-verified',
            'notes': f"Verified via AASHTO Board of Directors roster. Route contact through agency main line or {s['headquarters']['website']}.",
            'next_action': '',
            'next_action_date': '',
        })

out = os.path.join(HERE, 'data_csv', 'contacts.csv')
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)
print(f"✓ contacts.csv — {len(rows)} seed contacts")
