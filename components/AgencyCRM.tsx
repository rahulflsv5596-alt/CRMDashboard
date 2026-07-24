"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, LogOut } from "lucide-react";
import SummaryBar from "./SummaryBar";
import AccountsTable from "./AccountsTable";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/utils";
import { PRIORITIES, STATUSES, RELATIONSHIPS } from "@/lib/constants";
import { Account, Status, StatusCounts } from "@/lib/types";
import Pagination from "./pagination";
import { useRouter } from "next/navigation";

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
 * every change straight to Supabase. Visual theme matches the Atlas
 * (dark navy background, gold accent, Fraunces/JetBrains Mono type).
 */
export default function AgencyCRM({ initialAccounts }: AgencyCRMProps) {
  const PAGE_SIZE = 20;
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [query, setQuery] = useState("");
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

  // Applies the atlas dark-theme background to <body> only while this
  // dashboard is mounted, so other pages (e.g. /login) stay unaffected.
  useEffect(() => {
    document.body.classList.add("atlas-theme");
    return () => document.body.classList.remove("atlas-theme");
  }, []);

  // Updates local state only — safe to call on every keystroke.
  const updateAccountLocal = (id: string, patch: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, query]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Masthead — matches Atlas header styling */}
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
            Dashboard <em className="italic font-normal text-[var(--accent)]">CRM</em>
          </h1>
        </div>

        <div className="flex items-end gap-4">
          <div
            className="flex items-end gap-7 text-[11px] text-[var(--ink-muted)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.15em]">Accounts</span>
              <span
                className="text-[var(--ink)] text-xl"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
              >
                {counts.total}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--ink-muted)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.borderColor = 'var(--line-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink-muted)';
              e.currentTarget.style.borderColor = 'var(--line)';
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      <SummaryBar counts={counts} />

      {/* Search + pagination + add row */}
      <div className="flex items-center justify-between gap-4 px-10 py-3 border-b border-[var(--line)] bg-[var(--bg-2)]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agency name..."
          className="text-sm bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink-muted)] rounded px-3 py-1.5 w-64 focus:outline-none focus:border-[var(--accent)]"
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
            className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-2)] transition-colors text-[#1a1200] font-semibold text-sm px-3 py-2 rounded"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add account
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
