"use client";

import { useState, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import SummaryBar from "./SummaryBar";
import FilterBar from "./FilterBar";
import AccountsTable from "./AccountsTable";
import { SEED_ACCOUNTS } from "@/lib/seedData";
import { nextId, todayISO } from "@/lib/utils";
import { PRIORITIES, STATUSES, RELATIONSHIPS } from "@/lib/constants";
import { Account, Status, StatusCounts } from "@/lib/types";

interface AgencyCRMProps {
  /** Optional initial accounts (e.g. fetched server-side from Supabase). Falls back to sample data. */
  initialAccounts?: Account[];
}

/**
 * Top-level client component that owns all dashboard state:
 * accounts, filters, and which rows are expanded/pending delete.
 * Everything below (SummaryBar, FilterBar, AccountsTable) is a
 * "dumb" presentational component driven by props from here.
 *
 * To wire up Supabase: fetch accounts (+ their account_notes) in
 * app/page.tsx (a server component) and pass them in as
 * `initialAccounts`, then swap the handlers below (updateAccount,
 * addNote, addAccount, deleteAccount) to call your Supabase client
 * or Server Actions instead of local setState.
 */
export default function AgencyCRM({ initialAccounts }: AgencyCRMProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts ?? SEED_ACCOUNTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const updateAccount = (id: string, patch: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const addNote = (id: string, text: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, notes: [...a.notes, { id: nextId(), date: todayISO(), text }] }
          : a
      )
    );
  };

  const addAccount = () => {
    const id = nextId();
    setAccounts((prev) => [
      {
        id,
        agencyName: "",
        priority: "P3",
        status: "Not Contacted",
        relationship: "Unknown",
        conflict: "Clear",
        facts: "",
        notes: [],
      },
      ...prev,
    ]);
    setExpandedIds((prev) => new Set(prev).add(id));
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const deleteAccount = (id: string) => {
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

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const matchesQuery =
        query.trim() === "" || a.agencyName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [accounts, query, statusFilter]);

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
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Agency Partnerships</h1>
          <p className="text-xs text-slate-400">State DOTs · Counties · Localities</p>
        </div>
        <button
          onClick={addAccount}
          className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 transition-colors text-slate-900 font-semibold text-sm px-3 py-2 rounded"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add account
        </button>
      </div>

      <SummaryBar counts={counts} />

      <FilterBar
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        visibleCount={filteredAccounts.length}
        totalCount={accounts.length}
      />

      <AccountsTable
        accounts={filteredAccounts}
        expandedIds={expandedIds}
        pendingDeleteId={pendingDeleteId}
        nameInputRef={nameInputRef}
        onToggleExpand={toggleExpand}
        onUpdateAccount={updateAccount}
        onAddNote={addNote}
        onRequestDelete={setPendingDeleteId}
        onCancelDelete={() => setPendingDeleteId(null)}
        onConfirmDelete={deleteAccount}
      />
    </div>
  );
}
