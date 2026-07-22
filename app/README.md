# State DOT Budget Atlas — Data Backend

This folder contains the **data source files** and **build scripts** for the
dashboard. Edit the data in CSV files using Excel/Google Sheets, then run one
command to regenerate the dashboard.

## Folder Layout

```
backend/
├── data_csv/                Editable CSV files (your "source of truth")
│   ├── states.csv             50 states: budgets, funding, infrastructure, HQ
│   ├── leadership.csv         50+ rows: DOT chiefs by state
│   ├── agencies.csv           129+ rows: partner transportation agencies
│   ├── history.csv            150+ rows: 3-year budget history per state
│   ├── revenue.csv            50 rows: revenue source breakdown (NASBO Table 24)
│   └── contacts.csv           CRM seed contacts (50 AASHTO chiefs to start)
│
├── data/                    Compiled data files (auto-generated; don't edit)
│   ├── dot_data.json          Pretty-printed dataset (readable, git-friendly)
│   ├── dot_data.min.json      Compact dataset (what the dashboard reads)
│   ├── states_topo.json       US states geometry (Census TIGER via us-atlas)
│   ├── counties_topo.json     US counties geometry (Census TIGER via us-atlas)
│   ├── d3.min.js              d3 v7 library
│   └── topojson.min.js        topojson-client library
│
├── templates/
│   └── dashboard.html         HTML template with __PLACEHOLDER__ slots
│
├── csv_to_json.py           Reads CSVs → writes data/dot_data.json
├── json_to_csv.py           Reverse: reads dot_data.json → writes CSVs (rarely needed)
├── build_dashboard.py       Reads template + data/ → writes dashboard HTML
├── build_all.py             Convenience: runs csv_to_json + build_dashboard
└── dot_budget_atlas.html    The final dashboard (open this in any browser)
```

## Quick Start

### To update the data

1. Open `data_csv/states.csv` (or any other CSV) in Excel, Google Sheets,
   Numbers, or any text editor.
2. Edit the values. Each file has a clear column header row.
3. Save the CSV.
4. Run:
   ```bash
   python3 build_all.py
   ```
5. Refresh `dot_budget_atlas.html` in your browser. Done.

### To open the dashboard

Just double-click `dot_budget_atlas.html` — it works in any modern browser
with no server, no internet, no setup.

## CSV File Reference

### `states.csv` (1 row per state)

The main file. Every state has one row with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `abbr` | Two-letter postal abbreviation (PRIMARY KEY) | `CA` |
| `name` | Full state name | `California` |
| `capital` | Capital city | `Sacramento` |
| `population_millions` | Population in millions | `39.43` |
| `agencyName` | Full DOT agency name | `California DOT (Caltrans)` |
| `fiscalYear` | Fiscal year label shown in dashboard | `2025` |
| `totalBudget_millions` | FY total transportation expenditures, in $M | `32982` |
| `budgetSource` | Citation for the source | `NASBO 2025 State Expenditure Report` |
| `budgetUrl` | URL the dashboard links to | `https://...` |
| `budgetNote` | Optional clarifying note | `(may be blank)` |
| `fund_general_fund` | General Fund share, in $M | `3855` |
| `fund_federal_funds` | Federal funds, in $M | `6667` |
| `fund_other_state_funds` | Other state funds (dedicated transportation), $M | `22356` |
| `fund_bonds` | Bond proceeds, in $M | `104` |
| `yoy_fy23_to_fy24` | Year-over-year growth %, FY23→FY24 | `29.4` |
| `yoy_fy24_to_fy25` | Year-over-year growth %, FY24→FY25 | `26.1` |
| `pct_state_fy2023` | Transportation as % of total state spending, FY23 | `4.9` |
| `pct_state_fy2024` | Same, FY24 | `5.8` |
| `pct_state_fy2025` | Same, FY25 | `6.5` |
| `exp_construction_capital` | Capital outlay (construction), $M | `9244.2` |
| `exp_maintenance_services` | Maintenance & highway services, $M | `4548.4` |
| `exp_administration_safety` | Admin, police & safety, $M | `6091.7` |
| `exp_grants_to_local_govts` | Grants-in-aid to local govts, $M | `10629.5` |
| `exp_debt_service_interest` | Debt service & interest, $M | `2468.2` |
| `publicRoadMiles` | Total public road miles (FHWA HM-20) | `177334` |
| `bridges_total` | Total bridges in state (FHWA NBI) | `25848` |
| `bridges_good` | Bridges in good condition | `11798` |
| `bridges_fair` | Bridges in fair condition | `12523` |
| `bridges_poor` | Bridges in poor condition | `1527` |
| `num_districts` | DOT engineering districts | `12` |
| `num_counties` | Counties in state | `58` |
| `hq_address` | HQ street address | `1120 N Street` |
| `hq_city` | HQ city | `Sacramento` |
| `hq_state` | HQ state code | `CA` |
| `hq_zip` | HQ ZIP code | `95814` |
| `hq_phone` | Main phone (formatted) | `(916) 654-2852` |
| `hq_website` | Official website URL | `https://dot.ca.gov` |

### `leadership.csv` (1+ rows per state)

| Column | Description | Example |
|--------|-------------|---------|
| `state_abbr` | Foreign key to `states.csv` | `CA` |
| `name` | Person's name | `Dina El-Tawansy` |
| `title` | Role/title | `Director` |
| `agency` | Agency they lead | `California DOT (Caltrans)` |

Add additional rows to include multiple leaders per state (e.g., Secretary +
Deputy + Chief Engineer). The dashboard will render one card per row.

### `agencies.csv` (multiple rows per state)

| Column | Description | Example |
|--------|-------------|---------|
| `state_abbr` | Foreign key | `CA` |
| `name` | Agency name | `Bay Area Rapid Transit (BART)` |
| `type` | Short category label | `Transit Authority` |
| `url` | Official website (optional) | `https://www.bart.gov` |
| `note` | Optional descriptive note | `(may be blank)` |

### `history.csv` (3+ rows per state)

| Column | Description | Example |
|--------|-------------|---------|
| `state_abbr` | Foreign key | `CA` |
| `fiscal_year` | Year label | `2025` |
| `total_millions` | Total expenditure that year, $M | `32982` |
| `type` | `actual` for past years, `estimated` for projections | `estimated` |

Used to draw the 3-year trend bars in the dashboard. Add more rows to extend
the history.

### `revenue.csv` (1 row per state)

| Column | Description |
|--------|-------------|
| `state_abbr` | Foreign key |
| `fiscal_year` | Year of the revenue data |
| `motor_fuel_taxes` | Motor fuel tax revenue, $M |
| `license_registration` | License & registration fees, $M |
| `vehicle_sales_use` | Vehicle sales & use taxes, $M |
| `tolls` | Toll revenue, $M |
| `other` | Other dedicated transportation revenue, $M |
| `total` | Sum of the above |

States that didn't report revenue separately (Alaska, Mississippi, Wyoming)
have empty cells — that's fine, the dashboard handles missing data.

## Workflow

```
┌─────────────────┐    csv_to_json.py    ┌────────────────────┐
│  data_csv/*.csv │ ───────────────────> │ data/dot_data.json │
│   (you edit)    │                      │  (auto-generated)  │
└─────────────────┘                      └─────────┬──────────┘
                                                   │
                                  build_dashboard.py
                                                   │
                                                   v
                                       ┌────────────────────────┐
                                       │ dot_budget_atlas.html  │
                                       │     (final output)     │
                                       └────────────────────────┘
```

## Why CSV + JSON instead of CSV-only or database?

- **CSV is great for editing** — Excel, Google Sheets, every text editor reads
  it. Non-developers can update data without learning anything new.
- **CSV is bad for nested data** — a state has many leaders, many agencies,
  many history years. Forcing this into one giant denormalized CSV would
  duplicate state-level info on every row and become a maintenance nightmare.
- **JSON handles nesting natively** and **the browser reads it for free** with
  no parsing library.
- **Splitting into 5 CSV files** keeps each one small (≤300 rows) and focused
  on one concept, mirroring how a relational database would model this.
- **A real database (SQLite, Postgres) is overkill** for 50 states of data
  that change a few times a year.

## Why isn't this loaded by the browser via fetch()?

Two reasons:
1. When opening the HTML directly from disk (`file://`), browsers block
   `fetch()` of local files for security. Users would need to run a local web
   server.
2. Embedding the data makes the dashboard a true single-file artifact you can
   email, host anywhere, or open offline.

The `build_dashboard.py` script inlines the JSON into the HTML at build time.
If you'd prefer to host the data separately (e.g. on a CDN) and fetch it at
runtime, that's a small change — replace the inline `const DOT_DATA = ...`
with `fetch('/data/dot_data.json').then(r => r.json()).then(d => { ... })`.

## CRM: contacts & relationship tracking

The dashboard doubles as a territory CRM. How the two data layers relate:

- **Seed contacts** live in `data_csv/contacts.csv` and are baked into the
  HTML at build time. Use this file for contacts your whole team should start
  with (the 50 verified AASHTO DOT chiefs ship by default). Columns:
  `id, state_abbr, name, title, org, category, influence, stage, email,
  phone, tags (semicolon-separated), notes, next_action, next_action_date`.
  Give every row a **unique, stable `id`** — that's how the app avoids
  duplicating seeds into a user's existing data.
- **Working data** (edits, new contacts, interaction logs, stage changes)
  lives in each user's browser localStorage — private to their machine,
  never uploaded anywhere. Seeds merge in on first load; user edits to a
  seed persist and won't be overwritten by rebuilds with the same seed `id`.
- **Backup / Restore / Export** buttons in the CRM panel produce portable
  JSON backups (restorable on any machine, merged by contact `id`) and a
  flat CSV export for spreadsheets or import into another CRM.

CRM concepts:
- **Stages**: New → Contacted → Engaged → Champion, plus Dormant.
- **Influence**: High / Medium / Low (red / amber / grey dot).
- **Categories**: DOT Leadership & Staff, District Engineer, County/Local
  Official, Elected Official, MPO/Transit, Contractor, Consultant,
  Industry Association, Media/Analyst, Other.
- **Follow-ups**: contacts with a `next_action_date` on or before today are
  flagged in red and surfaced on the CRM home panel and header counter.
- **Contact Coverage** map mode colors states by number of contacts, showing
  territory white space at a glance.

## Adding a new state, leader, or agency

1. Add a new row to the appropriate CSV.
2. Run `python3 build_all.py`.
3. Refresh the dashboard.

Validation: `csv_to_json.py` prints warnings if a state is missing leadership
or history entries.
