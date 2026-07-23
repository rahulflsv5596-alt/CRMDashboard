"use client";

import { RefObject } from "react";
import AccountRow from "./AccountRow";
import { Account } from "@/lib/types";
import ColumnFilterDropdown from "./ColumnFilterDropdown";
import { PRIORITIES, STATUSES, RELATIONSHIPS, CONFLICTS } from "@/lib/constants";

interface ColumnFilters {
  priority: Set<string>;
  status: Set<string>;
  relationship: Set<string>;
  conflict: Set<string>;
}

interface AccountsTableProps {
  accounts: Account[];
  expandedIds: Set<string>;
  pendingDeleteId: string | null;
  nameInputRef: RefObject<HTMLInputElement>;
  columnFilters: ColumnFilters;
  onColumnFiltersChange: (filters: ColumnFilters) => void;
  onToggleExpand: (id: string) => void;
  onUpdateLocal: (id: string, patch: Partial<Account>) => void;
  onCommitUpdate: (id: string, patch: Partial<Account>) => void;
  onAddNote: (id: string, text: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export default function AccountsTable({
  accounts,
  expandedIds,
  pendingDeleteId,
  nameInputRef,
  columnFilters,
  onColumnFiltersChange,
  onToggleExpand,
  onUpdateLocal,
  onCommitUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AccountsTableProps) {
  const firstRowId = accounts[0]?.id;
  const headerStyle = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div className="px-10 py-6">
      <div className="bg-[var(--panel)] rounded-lg border border-[var(--line)] overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr
              className="bg-[var(--bg-2)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)] font-medium"
              style={headerStyle}
            >
              <th className="w-7 border-b border-[var(--line)]"></th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[220px] text-[var(--ink-dim)]">
                Agency
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[110px]">
                <ColumnFilterDropdown
                  label="Priority"
                  options={PRIORITIES}
                  selected={columnFilters.priority}
                  onChange={(s) => onColumnFiltersChange({ ...columnFilters, priority: s })}
                />
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[130px]">
                <ColumnFilterDropdown
                  label="Status"
                  options={STATUSES}
                  selected={columnFilters.status}
                  onChange={(s) => onColumnFiltersChange({ ...columnFilters, status: s })}
                />
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[130px]">
                <ColumnFilterDropdown
                  label="Relationship"
                  options={RELATIONSHIPS}
                  selected={columnFilters.relationship}
                  onChange={(s) => onColumnFiltersChange({ ...columnFilters, relationship: s })}
                />
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[150px]">
                <ColumnFilterDropdown
                  label="Conflict / Clearance"
                  options={CONFLICTS}
                  selected={columnFilters.conflict}
                  onChange={(s) => onColumnFiltersChange({ ...columnFilters, conflict: s })}
                />
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[80px] text-[var(--ink-dim)]">
                Notes
              </th>
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[60px] text-[var(--ink-dim)]">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
                  No accounts match your search. Try clearing filters or add a new account.
                </td>
              </tr>
            )}

            {accounts.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                isOpen={expandedIds.has(a.id)}
                isDeletePending={pendingDeleteId === a.id}
                isFirstRow={a.id === firstRowId}
                nameInputRef={nameInputRef}
                onToggleExpand={() => onToggleExpand(a.id)}
                onUpdateLocal={(patch) => onUpdateLocal(a.id, patch)}
                onCommitUpdate={(patch) => onCommitUpdate(a.id, patch)}
                onAddNote={(text) => onAddNote(a.id, text)}
                onRequestDelete={() => onRequestDelete(a.id)}
                onCancelDelete={onCancelDelete}
                onConfirmDelete={() => onConfirmDelete(a.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}