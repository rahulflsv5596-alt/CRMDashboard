import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AgencyCRM from "@/components/AgencyCRM";

export default async function Page() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch contacts
  const { data: contactRows, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (contactsError) throw new Error(`Failed to load contacts: ${contactsError.message}`);

  // Fetch linked agencies for all contacts in one query
const { data: agencyLinks } = await supabase
  .from("contact_agencies")
  .select("contact_id, accounts(agency_name, url)");

  // Fetch interaction notes for all contacts
  const { data: interactionRows } = await supabase
    .from("interactions")
    .select("*")
    .order("created_at", { ascending: true });

  // Group agency names by contact_id
// Replace the agencyMap section with this:
const agencyMap = new Map<string, { name: string; url: string | null }[]>();
(agencyLinks ?? []).forEach((link: any) => {
  const cid = link.contact_id;
  if (!agencyMap.has(cid)) agencyMap.set(cid, []);
  if (link.accounts?.agency_name) {
    agencyMap.get(cid)!.push({
      name: link.accounts.agency_name,
      url: link.accounts.url ?? null,
    });
  }
});

  // Group notes by contact_id
  const noteMap = new Map<string, { id: string; date: string; text: string }[]>();
  (interactionRows ?? []).forEach((row: any) => {
    const cid = row.contact_id;
    if (!noteMap.has(cid)) noteMap.set(cid, []);
    noteMap.get(cid)!.push({
      id: row.id,
      date: row.created_at?.slice(0, 10) ?? "",
      text: row.note ?? "",
    });
  });

  // Map to ContactRow shape
  const initialContacts = (contactRows ?? []).map((r: any) => ({
    id: r.id,
    name: r.name ?? "",
    title: r.title ?? "",
    organization: r.organization ?? "",
    state: r.state ?? "",
    influence: r.influence ?? "Medium",
    stage: r.stage ?? "New",
    email: r.email ?? "",
    phone: r.phone ?? "",
    tags: r.tags ?? "",
    notes: r.notes ?? "",
    nextAction: r.next_action ?? "",
    nextActionDate: r.next_action_date ?? "",
    agencies: agencyMap.get(r.id) ?? [],
    noteLog: noteMap.get(r.id) ?? [],
  }));

  return (
    <>
      <AgencyCRM initialContacts={initialContacts} />
      <footer className="py-4 text-center text-xs bg-black" style={{ color: "var(--ink-muted)" }}>
        © {new Date().getFullYear()} Rahul Vishwakarma. All rights reserved.
      </footer>
    </>
  );
}