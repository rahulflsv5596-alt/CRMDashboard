import AgencyCRM from "@/components/AgencyCRM";

// This file stays a server component (no "use client" needed) — it just
// renders the interactive client component. When you're ready to load real
// data from Supabase, fetch it here (accounts + their account_notes) and
// pass it down: <AgencyCRM initialAccounts={data} />.
export default function Page() {
  return <AgencyCRM />;
}
