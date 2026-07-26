"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AccountsTable from "./AccountsTable";
import SummaryBar from "./SummaryBar";
import Pagination from "./pagination";

export type Influence = "High" | "Medium" | "Low";
export type Stage = "New" | "Contacted" | "Engaged" | "Champion" | "Dormant";

export interface ContactNote {
  id: string;
  date: string;
  text: string;
}

export interface ContactRow {
  id: string;
  name: string;
  title: string;
  organization: string;
  state: string;
  influence: Influence;
  stage: Stage;
  email: string;
  phone: string;
  tags: string;
  notes: string;
  nextAction: string;
  nextActionDate: string;
 agencies: { name: string; url: string | null }[];
  noteLog: ContactNote[];
}

interface ColumnFilters {
  influence: Set<string>;
  stage: Set<string>;
  state: Set<string>;
}

interface AgencyCRMProps {
  initialContacts: ContactRow[];
}

export default function AgencyCRM({ initialContacts }: AgencyCRMProps) {
  const PAGE_SIZE = 20;
  const router = useRouter();
  const supabase = createClient();

  const [contacts, setContacts] = useState<ContactRow[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    influence: new Set(),
    stage: new Set(),
    state: new Set(),
  });

  useEffect(() => {
    document.body.classList.add("atlas-theme");
    return () => document.body.classList.remove("atlas-theme");
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, query]);

  const updateLocal = (id: string, patch: Partial<ContactRow>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const commitUpdate = async (id: string, patch: Partial<ContactRow>) => {
    const row: Record<string, unknown> = {};
    if ("name" in patch) row.name = patch.name;
    if ("title" in patch) row.title = patch.title;
    if ("organization" in patch) row.organization = patch.organization;
    if ("state" in patch) row.state = patch.state;
    if ("influence" in patch) row.influence = patch.influence;
    if ("stage" in patch) row.stage = patch.stage;
    if ("email" in patch) row.email = patch.email;
    if ("phone" in patch) row.phone = patch.phone;
    if ("tags" in patch) row.tags = patch.tags;
    if ("notes" in patch) row.notes = patch.notes;
    if ("nextAction" in patch) row.next_action = patch.nextAction;
    if ("nextActionDate" in patch) row.next_action_date = patch.nextActionDate;
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from("contacts").update(row).eq("id", id);
    if (error) console.error("Failed to update contact:", error.message);
  };

  const addNote = async (id: string, text: string) => {
    const { data, error } = await supabase
      .from("interactions")
      .insert({ contact_id: id, type: "Note", note: text })
      .select()
      .single();
    if (error || !data) { console.error("Failed to add note:", error?.message); return; }
    const newNote: ContactNote = {
      id: data.id,
      date: data.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      text,
    };
    setContacts((prev) =>
      prev.map((c) => c.id === id ? { ...c, noteLog: [...c.noteLog, newNote] } : c)
    );
  };

  const addContact = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        name: "",
        influence: "Medium",
        stage: "New",
        title: "",
        organization: "",
        state: "",
        email: "",
        phone: "",
        tags: "",
        notes: "",
      })
      .select()
      .single();
    if (error || !data) { console.error("Failed to create contact:", error?.message); return; }
    const newContact: ContactRow = {
      id: data.id,
      name: data.name ?? "",
      title: data.title ?? "",
      organization: data.organization ?? "",
      state: data.state ?? "",
      influence: data.influence ?? "Medium",
      stage: data.stage ?? "New",
      email: data.email ?? "",
      phone: data.phone ?? "",
      tags: data.tags ?? "",
      notes: data.notes ?? "",
      nextAction: data.next_action ?? "",
      nextActionDate: data.next_action_date ?? "",
      agencies: [],
      noteLog: [],
    };
    setContacts((prev) => [newContact, ...prev]);
    setExpandedIds((prev) => new Set(prev).add(newContact.id));
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { console.error("Failed to delete contact:", error.message); return; }
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setExpandedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setPendingDeleteId(null);
  };

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const filtered = contacts.filter((c) => {
    const q = query.trim().toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) &&
        !c.title.toLowerCase().includes(q) &&
        !c.organization.toLowerCase().includes(q)) return false;
    if (columnFilters.influence.size > 0 && !columnFilters.influence.has(c.influence)) return false;
    if (columnFilters.stage.size > 0 && !columnFilters.stage.has(c.stage)) return false;
    if (columnFilters.state.size > 0 && !columnFilters.state.has(c.state)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Masthead */}
      <div
        className="border-b border-[var(--line)] px-10 py-5 flex items-end justify-between gap-8"
        style={{ background: "linear-gradient(180deg, rgba(244,185,66,0.03) 0%, transparent 100%)" }}
      >
        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="inline-block w-6 h-px bg-[var(--accent)]" />
            Agency Partnerships CRM
          </div>
          <h1
            className="text-[28px] leading-tight tracking-tight text-[var(--ink)]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Contacts <em className="italic font-normal text-[var(--accent)]">Dashboard</em>
          </h1>
        </div>

        <div className="flex items-end gap-4">
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--ink-muted)]">Contacts</span>
            <span className="text-[var(--ink)] text-xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              {contacts.length}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--line)", borderRadius: "6px",
              padding: "6px 10px", cursor: "pointer",
              color: "var(--ink-muted)", fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderColor = "var(--line-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-muted)"; e.currentTarget.style.borderColor = "var(--line)"; }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      <SummaryBar contacts={contacts} />

      {/* Search + pagination + add */}
      <div className="flex items-center justify-between gap-4 px-10 py-3 border-b border-[var(--line)] bg-[var(--bg-2)]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, title, organization..."
          className="text-sm bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink-muted)] rounded px-3 py-1.5 w-72 focus:outline-none focus:border-[var(--accent)]"
        />
        <div className="flex items-center gap-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
          <button
            onClick={addContact}
            className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-2)] transition-colors text-[#1a1200] font-semibold text-sm px-3 py-2 rounded"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add contact
          </button>
        </div>
      </div>

      <AccountsTable
        contacts={paginated}
        expandedIds={expandedIds}
        pendingDeleteId={pendingDeleteId}
        nameInputRef={nameInputRef}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        onToggleExpand={toggleExpand}
        onUpdateLocal={updateLocal}
        onCommitUpdate={commitUpdate}
        onAddNote={addNote}
        onRequestDelete={setPendingDeleteId}
        onCancelDelete={() => setPendingDeleteId(null)}
        onConfirmDelete={deleteContact}
      />
    </div>
  );
}