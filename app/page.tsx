import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rowToAccount, rowToNote, AccountRow, AccountNoteRow } from "@/lib/mappers";
import AgencyCRM from "@/components/AgencyCRM";

export default async function Page() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: accountRows, error: accountsError }, { data: noteRows, error: notesError }] =
    await Promise.all([
      supabase.from("accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("account_notes").select("*").order("created_at", { ascending: true }),
    ]);

  if (accountsError) throw new Error(`Failed to load accounts: ${accountsError.message}`);
  if (notesError) throw new Error(`Failed to load account notes: ${notesError.message}`);

  const notesByAccount = new Map<string, ReturnType<typeof rowToNote>[]>();
  (noteRows as AccountNoteRow[] | null)?.forEach((row) => {
    const note = rowToNote(row);
    const existing = notesByAccount.get(row.account_id) ?? [];
    existing.push(note);
    notesByAccount.set(row.account_id, existing);
  });

  const accounts = (accountRows as AccountRow[] | null)?.map((row) =>
    rowToAccount(row, notesByAccount.get(row.id) ?? [])
  ) ?? [];

  return (
    <>
      <AgencyCRM initialAccounts={accounts} />
      <footer className="py-4 text-center text-xs text-slate-400 bg-black mt-8">
        © {new Date().getFullYear()} Rahul Vishwakarma. All rights reserved.
      </footer>
    </>
  );
}