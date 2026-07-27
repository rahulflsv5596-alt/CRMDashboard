"use client";

import { RefObject } from "react";
import AccountRow from "./AccountRow";
import { Contact } from "@/lib/types";
import ColumnFilterDropdown from "./ColumnFilterDropdown";
import { INFLUENCES, STAGES } from "@/lib/constants";
import { ColumnKey } from "./ColumnToggle";

interface ColumnFilters {
  influence: Set<string>;
  stage: Set<string>;
  state: Set<string>;
}

interface ContactsTableProps {
  contacts: Contact[];
  expandedIds: Set<string>;
  pendingDeleteId: string | null;
  nameInputRef: RefObject<HTMLInputElement>;
  columnFilters: ColumnFilters;
  onColumnFiltersChange: (filters: ColumnFilters) => void;
  visibleColumns: Record<ColumnKey, boolean>;
  onToggleExpand: (id: string) => void;
  onUpdateLocal: (id: string, patch: Partial<Contact>) => void;
  onCommitUpdate: (id: string, patch: Partial<Contact>) => void;
  onAddNote: (id: string, text: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export default function ContactsTable({
  contacts,
  expandedIds,
  pendingDeleteId,
  nameInputRef,
  columnFilters,
  onColumnFiltersChange,
  visibleColumns,
  onToggleExpand,
  onUpdateLocal,
  onCommitUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: ContactsTableProps) {
  const firstRowId = contacts[0]?.id;
  const headerStyle = { fontFamily: "'JetBrains Mono', monospace" };

  // Collect unique states for the state filter
  const uniqueStates = Array.from(
    new Set(contacts.map((c) => c.state).filter(Boolean))
  ).sort() as string[];

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
                Name
              </th>
              {visibleColumns.influence && (
                <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[110px]">
                  <ColumnFilterDropdown
                    label="Influence"
                    options={INFLUENCES}
                    selected={columnFilters.influence}
                    onChange={(s) => onColumnFiltersChange({ ...columnFilters, influence: s })}
                  />
                </th>
              )}
              {visibleColumns.stage && (
                <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[130px]">
                  <ColumnFilterDropdown
                    label="Stage"
                    options={STAGES}
                    selected={columnFilters.stage}
                    onChange={(s) => onColumnFiltersChange({ ...columnFilters, stage: s })}
                  />
                </th>
              )}
              <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[120px]">
                <ColumnFilterDropdown
                  label="State"
                  options={uniqueStates}
                  selected={columnFilters.state}
                  onChange={(s) => onColumnFiltersChange({ ...columnFilters, state: s })}
                />
              </th>
              {visibleColumns.agencies && (
                <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[80px] text-[var(--ink-dim)]">
                  Agencies
                </th>
              )}
              {visibleColumns.notes && (
                <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[80px] text-[var(--ink-dim)]">
                  Notes
                </th>
              )}
              {visibleColumns.delete && (
                <th className="text-left px-3 py-2.5 border-b border-[var(--line)] min-w-[60px] text-[var(--ink-dim)]">
                  Delete
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={3 + Object.values(visibleColumns).filter(Boolean).length} className="px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
                  No contacts match your search. Try clearing filters or add a new contact.
                </td>
              </tr>
            )}

            {contacts.map((c) => (
              <AccountRow
                key={c.id}
                contact={c}
                isOpen={expandedIds.has(c.id)}
                isDeletePending={pendingDeleteId === c.id}
                isFirstRow={c.id === firstRowId}
                nameInputRef={nameInputRef}
                visibleColumns={visibleColumns}
                onToggleExpand={() => onToggleExpand(c.id)}
                onUpdateLocal={(patch) => onUpdateLocal(c.id, patch)}
                onCommitUpdate={(patch) => onCommitUpdate(c.id, patch)}
                onAddNote={(text) => onAddNote(c.id, text)}
                onRequestDelete={() => onRequestDelete(c.id)}
                onCancelDelete={onCancelDelete}
                onConfirmDelete={() => onConfirmDelete(c.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}