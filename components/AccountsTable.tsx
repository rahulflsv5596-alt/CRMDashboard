"use client";

import { RefObject } from "react";
import AccountRow from "./AccountRow";
import { Account } from "@/lib/types";

interface AccountsTableProps {
  accounts: Account[];
  expandedIds: Set<string>;
  pendingDeleteId: string | null;
  nameInputRef: RefObject<HTMLInputElement>;
  onToggleExpand: (id: string) => void;
  onUpdateLocal: (id: string, patch: Partial<Account>) => void;
  onCommitUpdate: (id: string, patch: Partial<Account>) => void;
  onAddNote: (id: string, text: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

/**
 * Table shell (header + body). Receives the already-filtered list of
 * accounts and delegates each row's rendering to AccountRow.
 */
export default function AccountsTable({
  accounts,
  expandedIds,
  pendingDeleteId,
  nameInputRef,
  onToggleExpand,
  onUpdateLocal,
  onCommitUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AccountsTableProps) {
  const firstRowId = accounts[0]?.id;

  return (
    <div className="px-6 pb-10">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
              <th className="w-7 border-b border-slate-200"></th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[220px]">Agency</th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[110px]">Priority</th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[140px]">Status</th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[130px]">Relationship</th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[160px]">
                Conflict / Clearance
              </th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[80px]">Notes</th>
              <th className="text-left px-3 py-2 border-b border-slate-200 min-w-[60px]">Delete</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
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
