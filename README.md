# Agency Partnerships CRM — Next.js + Supabase

## File layout

```
app/
  page.tsx                Server component — fetches accounts + notes from Supabase, renders <AgencyCRM>
components/
  AgencyCRM.tsx           Owns all state; every edit persists to Supabase. Top-level client component.
  SummaryBar.tsx          Pie chart + priority/relationship counts (presentational)
  StatusPieChart.tsx      The status donut chart, used by SummaryBar
  FilterBar.tsx           Search box + status filter dropdown
  AccountsTable.tsx       Table shell (<table>/<thead>), maps over rows
  AccountRow.tsx          One <tr> + its expandable Facts/Notes detail row
  NotesPanel.tsx          Dated notes log + "add entry" input, used inside AccountRow
  Select.tsx              Shared color-coded, generic <select> used for all 4 dropdown fields
lib/
  supabase/client.ts      Browser Supabase client (used inside AgencyCRM for writes)
  supabase/server.ts      Server Supabase client (used inside app/page.tsx for the initial read)
  mappers.ts              Converts between Supabase's snake_case rows and the UI's Account/Note types
  types.ts                Account/Note/Priority/Status/etc. types — mirrors your Supabase schema
  constants.ts            Dropdown options + color/style tokens (single source of truth)
  utils.ts                nextId(), todayISO(), fmtDate()
.env.local.example        Template for your Supabase URL + anon key
```

## Setup

1. Copy everything into your existing Next.js (TypeScript) project, matching
   your `@/*` path alias (check `tsconfig.json`).
2. Install dependencies:
   ```
   npm install lucide-react recharts @supabase/supabase-js @supabase/ssr
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your project's
   Supabase URL and anon key (Supabase dashboard → Settings → API).
   **`.env.local` must be in your `.gitignore`** — never commit real keys.
4. Make sure Row Level Security (RLS) on `accounts` and `account_notes`
   either allows the operations this dashboard needs (select/insert/
   update/delete) for the anon role, or that you're calling this from an
   authenticated context. For a quick internal-tool setup, a permissive
   policy like the one below is common — tighten it for anything
   production-facing or public:
   ```sql
   alter table public.accounts enable row level security;
   alter table public.account_notes enable row level security;

   create policy "Allow all for anon" on public.accounts
     for all using (true) with check (true);
   create policy "Allow all for anon" on public.account_notes
     for all using (true) with check (true);
   ```

## How data flows

- **Initial load**: `app/page.tsx` is an async server component. It fetches
  every row from `accounts` and `account_notes`, groups notes by
  `account_id`, maps each pair into the UI's `Account` shape (via
  `lib/mappers.ts`), and passes the result to `<AgencyCRM initialAccounts={...} />`.
- **Editing a dropdown** (priority/status/relationship/conflict): saves to
  Supabase immediately on change.
- **Editing text** (agency name, agency facts): updates the UI instantly as
  you type, but only writes to Supabase `onBlur` — so moving to another
  field or clicking away is what triggers the save, not every keystroke.
- **Adding a note**: inserts into `account_notes`, then adds it to local
  state using the real id Supabase returns.
- **Adding an account**: inserts a blank row into `accounts` (empty name,
  default dropdown values), then adds the returned row — with its real
  UUID — to the top of the local list and auto-focuses the name field.
- **Deleting an account**: deletes from `accounts`; its `account_notes` rows
  cascade-delete automatically via the foreign key constraint.

## Column name mapping (Supabase ↔ UI)

| Supabase column           | UI field       |
|----------------------------|----------------|
| `agency_name`              | `agencyName`   |
| `priority`                 | `priority`     |
| `status`                   | `status`       |
| `relationship_strength`    | `relationship` |
| `conflict_status`          | `conflict`     |
| `agency_facts`             | `facts`        |
| `account_notes.note`       | `note.text`    |
| `account_notes.created_at` | `note.date`    |

All of this mapping lives in `lib/mappers.ts` — if you add a new column,
that's the only file you need to touch besides `lib/types.ts`.
