"use client";

import { useState, useMemo, useRef,useEffect } from "react";
import { Plus } from "lucide-react";
import SummaryBar from "./SummaryBar";
import FilterBar from "./FilterBar";
import AccountsTable from "./AccountsTable";
import { createClient } from "@/lib/supabase/client";
import { nextId, todayISO } from "@/lib/utils";
import { PRIORITIES, STATUSES, RELATIONSHIPS } from "@/lib/constants";
import { Account, Status, StatusCounts } from "@/lib/types";
import Pagination from "./pagination";
//const PAGE_SIZE=10;
interface AgencyCRMProps {
  /** Accounts fetched server-side from Supabase in app/page.tsx. */
  initialAccounts: Account[];
}

// Maps the UI's camelCase Account fields to Supabase's snake_case columns,
// only including keys that were actually part of the patch.
function toRowPatch(patch: Partial<Account>) {
  const row: Record<string, unknown> = {};
  if ("agencyName" in patch) row.agency_name = patch.agencyName;
  if ("priority" in patch) row.priority = patch.priority;
  if ("status" in patch) row.status = patch.status;
  if ("relationship" in patch) row.relationship_strength = patch.relationship;
  if ("conflict" in patch) row.conflict_status = patch.conflict;
  if ("facts" in patch) row.agency_facts = patch.facts;
  return row;
}

/**
 * Top-level client component that owns all dashboard state and persists
 * every change straight to Supabase. Dropdown edits (priority, status,
 * relationship, conflict) save immediately on change. Free-text fields
 * (agency name, facts) save on blur, so a write isn't fired on every
 * keystroke — the local `accounts` state still updates immediately for a
 * responsive UI either way.
 */
export default function AgencyCRM({ initialAccounts }: AgencyCRMProps) {
  const PAGE_SIZE = 20;
  
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<{
    priority: Set<string>;
    status: Set<string>;
    relationship: Set<string>;
    conflict: Set<string>;
  }>({
    priority: new Set(),
    status: new Set(),
    relationship: new Set(),
    conflict: new Set(),
  });
  // Updates local state only — safe to call on every keystroke.
  const updateAccountLocal = (id: string, patch: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  useEffect(() => {
  setCurrentPage(1);
  }, [statusFilter]);

  // Writes a patch to Supabase. Call for dropdowns immediately, and for
  // text fields only on blur.
  const commitAccountUpdate = async (id: string, patch: Partial<Account>) => {
    const rowPatch = toRowPatch(patch);
    if (Object.keys(rowPatch).length === 0) return;
    const { error } = await supabase.from("accounts").update(rowPatch).eq("id", id);
    if (error) console.error("Failed to save account update:", error.message);
  };

  const addNote = async (id: string, text: string) => {
    const { data, error } = await supabase
      .from("account_notes")
      .insert({ account_id: id, note: text })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to save note:", error?.message);
      return;
    }

    
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, notes: [...a.notes, { id: data.id, date: todayISO(), text }] }
          : a
      )
    );
  };

  const addAccount = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        agency_name: "",
        priority: "P3",
        status: "Not Contacted",
        relationship_strength: "Unknown",
        conflict_status: "Clear",
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create account:", error?.message);
      return;
    }

    const newAccount: Account = {
      id: data.id,
      agencyName: data.agency_name,
      priority: data.priority,
      status: data.status,
      relationship: data.relationship_strength,
      conflict: data.conflict_status,
      facts: data.agency_facts ?? "",
      notes: [],
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setExpandedIds((prev) => new Set(prev).add(newAccount.id));
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const deleteAccount = async (id: string) => {
    // account_notes rows cascade-delete automatically via the FK constraint.
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete account:", error.message);
      return;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPendingDeleteId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // const filteredAccounts = useMemo(() => {
  //   return accounts.filter((a) => {
  //     const matchesQuery =
  //       query.trim() === "" || a.agencyName.toLowerCase().includes(query.toLowerCase());
  //     const matchesStatus = statusFilter === "All" || a.status === statusFilter;
  //     return matchesQuery && matchesStatus;
  //   });
  // }, [accounts, query, statusFilter]);

const filteredAccounts = accounts.filter((a) => {
  const matchesQuery =
    query.trim() === "" || a.agencyName.toLowerCase().includes(query.toLowerCase());
  if (!matchesQuery) return false;
  if (columnFilters.priority.size > 0 && !columnFilters.priority.has(a.priority)) return false;
  if (columnFilters.status.size > 0 && !columnFilters.status.has(a.status)) return false;
  if (columnFilters.relationship.size > 0 && !columnFilters.relationship.has(a.relationship)) return false;
  if (columnFilters.conflict.size > 0 && !columnFilters.conflict.has(a.conflict)) return false;
  return true;
});

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));

  const paginatedAccounts = filteredAccounts.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);
  // Live aggregate counts — recomputed automatically whenever `accounts` changes.
  const counts: StatusCounts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
    const byPriority = Object.fromEntries(PRIORITIES.map((p) => [p, 0])) as StatusCounts["byPriority"];
    const byRelationship = Object.fromEntries(
      RELATIONSHIPS.map((r) => [r, 0])
    ) as StatusCounts["byRelationship"];

    accounts.forEach((a) => {
      byStatus[a.status]++;
      byPriority[a.priority]++;
      byRelationship[a.relationship]++;
    });

    return { byStatus, byPriority, byRelationship, total: accounts.length };
  }, [accounts]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
    <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard CRM</h1>
        {/* <p className="text-xs text-slate-400">State DOTs · Counties · Localities</p> */}
      </div>
      {/* <button
        onClick={addAccount}
        className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 transition-colors text-slate-900 font-semibold text-sm px-3 py-2 rounded"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add account
      </button> */}
    </div>

      <SummaryBar counts={counts} />

      {/* <FilterBar
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        visibleCount={filteredAccounts.length}
        totalCount={accounts.length}
      /> */}
    <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-slate-200 bg-slate-50">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search agency name..."
        className="text-sm border border-slate-200 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      <div className="flex items-center gap-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAccounts.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />

        <button
          onClick={addAccount}
          className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 transition-colors text-slate-900 font-semibold text-sm px-3 py-2 rounded"
        >
          <Plus size={16} strokeWidth={2.5} />
          {/* Add account */}
        </button>
      </div>
    </div>
     <AccountsTable
      accounts={paginatedAccounts}
      expandedIds={expandedIds}
      pendingDeleteId={pendingDeleteId}
      nameInputRef={nameInputRef}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      onToggleExpand={toggleExpand}
      onUpdateLocal={updateAccountLocal}
      onCommitUpdate={commitAccountUpdate}
      onAddNote={addNote}
      onRequestDelete={setPendingDeleteId}
      onCancelDelete={() => setPendingDeleteId(null)}
      onConfirmDelete={deleteAccount}
    />

    
    </div>
  );
}
