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
  onUpdate: (patch: Partial<Account>) => void;
  onAddNote: (text: string) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

/**
 * One agency's row in the table, plus its expandable detail section
 * (Agency Facts + Notes log). All state lives in the parent (AgencyCRM);
 * this component just receives values and callbacks as props.
 */
export default function AccountRow({
  account,
  isOpen,
  isDeletePending,
  isFirstRow,
  nameInputRef,
  onToggleExpand,
  onUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AccountRowProps) {
  const a = account;

  return (
    <>
      <tr className="hover:bg-slate-50/70 border-b border-slate-100">
        <td className="text-center align-middle">
          <button onClick={onToggleExpand} className="text-slate-400 hover:text-slate-600">
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </td>

        <td className="px-3 py-2">
          <input
            ref={isFirstRow ? nameInputRef : undefined}
            value={a.agencyName}
            onChange={(e) => onUpdate({ agencyName: e.target.value })}
            placeholder="Agency name..."
            className="text-sm font-medium bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-slate-400 outline-none px-1 py-0.5 rounded-sm w-full"
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.priority}
            options={PRIORITIES}
            onChange={(v) => onUpdate({ priority: v })}
            styleMap={PRIORITY_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.status}
            options={STATUSES}
            onChange={(v) => onUpdate({ status: v })}
            styleMap={STATUS_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.relationship}
            options={RELATIONSHIPS}
            onChange={(v) => onUpdate({ relationship: v })}
            styleMap={REL_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <Select
            value={a.conflict}
            options={CONFLICTS}
            onChange={(v) => onUpdate({ conflict: v })}
            styleMap={CONFLICT_STYLE}
          />
        </td>

        <td className="px-3 py-2">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 whitespace-nowrap"
          >
            <StickyNote size={13} />
            {a.notes.length}
          </button>
        </td>

        <td className="px-3 py-2 relative">
          <button
            onClick={onRequestDelete}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
            title="Delete account"
          >
            <Trash2 size={14} />
          </button>

          {isDeletePending && (
            <div className="absolute right-2 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-3 w-56">
              <p className="text-xs text-slate-600 mb-2">
                Delete <span className="font-semibold">{a.agencyName || "this account"}</span>? This
                can&apos;t be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancelDelete}
                  className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDelete}
                  className="text-xs px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>

      {isOpen && (
        <tr className="border-b border-slate-200">
          <td colSpan={8} className="p-0">
            <div className="px-6 pt-3 pb-1 bg-slate-50">
              <div className="flex items-start gap-2 max-w-2xl">
                <ShieldCheck size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
                    Agency facts
                  </div>
                  <textarea
                    value={a.facts}
                    onChange={(e) => onUpdate({ facts: e.target.value })}
                    placeholder="Aggregated facts from public sources — budget, initiatives, funding cycles..."
                    rows={2}
                    className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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
