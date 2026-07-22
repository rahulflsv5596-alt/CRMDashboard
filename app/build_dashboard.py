"""Build the dashboard HTML from external data files.

USAGE:
    python3 build_dashboard.py

INPUTS:
    ./data/dot_data.json           Main dataset (built by csv_to_json.py)
    ./data/states_topo.json        US states TopoJSON geography
    ./data/counties_topo.json      US counties TopoJSON geography
    ./data/d3.min.js               d3 v7 minified library
    ./data/topojson.min.js         topojson-client minified library
    ./templates/dashboard.html     HTML template with __PLACEHOLDERS__

OUTPUT:
    ./dot_budget_atlas.html        The final dashboard

WORKFLOW:
    1. Edit data_csv/*.csv in Excel/Sheets
    2. Run: python3 csv_to_json.py        # Rebuilds data/dot_data.json
    3. Run: python3 build_dashboard.py    # Rebuilds dot_budget_atlas.html
    4. Refresh dot_budget_atlas.html in your browser

Or run both in one go with: python3 build_all.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, 'data')
TEMPLATE_PATH = os.path.join(HERE, 'templates', 'dashboard.html')
OUTPUT_PATH = os.path.join(HERE, 'dot_budget_atlas.html')


def load_text(path):
    if not os.path.exists(path):
        print(f"  ERROR: {path} not found", file=sys.stderr)
        sys.exit(1)
    with open(path, encoding='utf-8') as f:
        return f.read()


def main():
    print(f"Reading template: {TEMPLATE_PATH}")
    html = load_text(TEMPLATE_PATH)

    print(f"Reading data: {DATA_DIR}/")
    # Use the compact JSON (already minified)
    dot_data = load_text(os.path.join(DATA_DIR, 'dot_data.min.json'))
    seed_contacts_path = os.path.join(DATA_DIR, 'seed_contacts.json')
    seed_contacts = load_text(seed_contacts_path) if os.path.exists(seed_contacts_path) else '[]'
    states_topo = load_text(os.path.join(DATA_DIR, 'states_topo.json'))
    counties_topo = load_text(os.path.join(DATA_DIR, 'counties_topo.json'))
    d3_min = load_text(os.path.join(DATA_DIR, 'd3.min.js'))
    topojson_min = load_text(os.path.join(DATA_DIR, 'topojson.min.js'))

    # Inject (using string replace once, with placeholders that won't collide)
    placeholders = {
        '__D3_INLINE__': d3_min,
        '__TOPOJSON_INLINE__': topojson_min,
        '__STATES_TOPO__': states_topo,
        '__COUNTIES_TOPO__': counties_topo,
        '__DOT_DATA__': dot_data,
        '__SEED_CONTACTS__': seed_contacts,
    }
    for placeholder, content in placeholders.items():
        if placeholder not in html:
            print(f"  WARNING: template missing placeholder {placeholder}")
            continue
        html = html.replace(placeholder, content, 1)

    print(f"Writing: {OUTPUT_PATH}")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(html)

    size = os.path.getsize(OUTPUT_PATH)
    print(f"\n✓ Built dashboard ({size:,} bytes, {size/1024:.0f} KB)")
    print(f"  Open {OUTPUT_PATH} in any browser.")


if __name__ == '__main__':
    main()
