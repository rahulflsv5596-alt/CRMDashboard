"use client";

import { RefObject } from "react";
import { ChevronDown, ChevronRight, StickyNote, ShieldCheck, Trash2 } from "lucide-react";
import Select from "./Select";
import NotesPanel from "./NotesPanel";
import {
  PRIORITIES,
  STATUSES,
  RELATIONSHIPS,
  CONFLICTS,
  PRIORITY_STYLE,
  STATUS_STYLE,
  REL_STYLE,
  CONFLICT_STYLE,
} from "@/lib/constants";
import { Account } from "@/lib/types";

interface AccountRowProps {
  account: Account;
  isOpen: boolean;
  isDeletePending: boolean;
  isFirstRow: boolean;
  nameInputRef: RefObject<HTMLInputElement>;
  onToggleExpand: () => void;
  onUpdateLocal: (patch: Partial<Account>) => void;
  onCommitUpdate: (patch: Partial<Account>) => void;
  onAddNote: (text: string) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export default function AccountRow({
  account,
  isOpen,
  isDeletePending,
  isFirstRow,
  nameInputRef,
  onToggleExpand,
  onUpdateLocal,
  onCommitUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AccountRowProps) {
  const a = account;

  return (
    <>
      <tr className="hover:bg-[var(--panel-2)]/60 border-b border-[var(--line)] transition-colors">
        <td className="text-center align-middle">
          <button onClick={onToggleExpand} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </td>

        <td className="px-3 py-2">
          <input
            ref={isFirstRow ? nameInputRef : undefined}
            value={a.agencyName}
            onChange={(e) => onUpdateLocal({ agencyName: e.target.value })}
            onBlur={() => onCommitUpdate({ agencyName: a.agencyName })}
            placeholder="Agency name..."
            className="text-sm font-medium bg-transparent text-[var(--ink)] placeholder-[var(--ink-muted)] border-0 border-b border-transparent hover:border-[var(--line-strong)] focus:border-[var(--accent)] outline-none px-1 py-0.5 rounded-sm w-full"
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.priority}
            options={PRIORITIES}
            onChange={(v) => {
              onUpdateLocal({ priority: v });
              onCommitUpdate({ priority: v });
            }}
            styleMap={PRIORITY_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.status}
            options={STATUSES}
            onChange={(v) => {
              onUpdateLocal({ status: v });
              onCommitUpdate({ status: v });
            }}
            styleMap={STATUS_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.relationship}
            options={RELATIONSHIPS}
            onChange={(v) => {
              onUpdateLocal({ relationship: v });
              onCommitUpdate({ relationship: v });
            }}
            styleMap={REL_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.conflict}
            options={CONFLICTS}
            onChange={(v) => {
              onUpdateLocal({ conflict: v });
              onCommitUpdate({ conflict: v });
            }}
            styleMap={CONFLICT_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded hover:bg-[var(--panel-2)] whitespace-nowrap transition-colors"
          >
            <StickyNote size={13} />
            {a.notes.length}
          </button>
        </td>

        <td className="px-3 py-2 relative">
          <button
            onClick={onRequestDelete}
            className="text-[var(--ink-muted)] hover:text-[var(--red)] p-1.5 rounded hover:bg-[var(--red)]/10 transition-colors"
            title="Delete account"
          >
            <Trash2 size={14} />
          </button>

          {isDeletePending && (
            <div className="absolute right-2 top-full mt-1 z-10 bg-[var(--panel-2)] border border-[var(--line-strong)] rounded-lg shadow-lg p-3 w-56">
              <p className="text-xs text-[var(--ink-dim)] mb-2">
                Delete <span className="font-semibold text-[var(--ink)]">{a.agencyName || "this account"}</span>?
                This can&apos;t be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancelDelete}
                  className="text-xs px-2 py-1 rounded text-[var(--ink-muted)] hover:bg-[var(--panel)]"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDelete}
                  className="text-xs px-2 py-1 rounded bg-[var(--red)] text-white hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>

      {isOpen && (
        <tr className="border-b border-[var(--line)]">
          <td colSpan={8} className="p-0">
            <div className="px-6 pt-3 pb-1 bg-[var(--bg-2)]">
              <div className="flex items-start gap-2 max-w-2xl">
                <ShieldCheck size={14} className="text-[var(--ink-muted)] mt-0.5 shrink-0" />
                <div className="w-full">
                  <div
                    className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Agency facts
                  </div>
                  <textarea
                    value={a.facts}
                    onChange={(e) => onUpdateLocal({ facts: e.target.value })}
                    onBlur={() => onCommitUpdate({ facts: a.facts })}
                    placeholder="Aggregated facts from public sources — budget, initiatives, funding cycles..."
                    rows={2}
                    className="w-full text-sm text-[var(--ink-dim)] bg-[var(--panel)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--accent)] resize-none placeholder-[var(--ink-muted)]"
                  />
                </div>
              </div>
            </div>
            <NotesPanel notes={a.notes} onAdd={onAddNote} />
          </td>
        </tr>
      )}
    </>
  );
}