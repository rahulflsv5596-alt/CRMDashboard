"use client";

import { RefObject } from "react";
import { ColumnKey } from "./ColumnToggle";
import { ChevronDown, ChevronRight, StickyNote, Trash2, Building2 } from "lucide-react";
import Select from "./Select";
import NotesPanel from "./NotesPanel";
import {
  INFLUENCES,
  STAGES,
  INFLUENCE_STYLE,
  STAGE_STYLE,
} from "@/lib/constants";

export interface Agency {
  name: string;
  url: string | null;
}

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
  influence: "High" | "Medium" | "Low";
  stage: "New" | "Contacted" | "Engaged" | "Champion" | "Dormant";
  email: string;
  phone: string;
  tags: string;
  notes: string;
  nextAction: string;
  nextActionDate: string;
  agencies: Agency[];
  noteLog: ContactNote[];
}

interface AccountRowProps {
  contact: ContactRow;
  isOpen: boolean;
  isDeletePending: boolean;
  isFirstRow: boolean;
  nameInputRef: RefObject<HTMLInputElement| null>;
  visibleColumns: Record<ColumnKey, boolean>;
  onToggleExpand: () => void;
  onUpdateLocal: (patch: Partial<ContactRow>) => void;
  onCommitUpdate: (patch: Partial<ContactRow>) => void;
  onAddNote: (text: string) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export default function AccountRow({
  contact,
  isOpen,
  isDeletePending,
  isFirstRow,
  nameInputRef,
  visibleColumns,
  onToggleExpand,
  onUpdateLocal,
  onCommitUpdate,
  onAddNote,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AccountRowProps) {
  const c = contact;

  return (
    <>
      <tr className="hover:bg-[var(--panel-2)]/60 border-b border-[var(--line)] transition-colors">
        {/* Expand toggle */}
        <td className="text-center align-middle">
          <button
            onClick={onToggleExpand}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </td>

        {/* Name — primary field */}
        <td className="px-3 py-2">
          <input
            ref={isFirstRow ? nameInputRef : undefined}
            value={c.name}
            onChange={(e) => onUpdateLocal({ name: e.target.value })}
            onBlur={() => onCommitUpdate({ name: c.name })}
            placeholder="Contact name..."
            className="text-sm font-medium bg-transparent text-[var(--ink)] placeholder-[var(--ink-muted)] border-0 border-b border-transparent hover:border-[var(--line-strong)] focus:border-[var(--accent)] outline-none px-1 py-0.5 rounded-sm w-full"
          />
          {c.title && (
            <div className="text-[11px] text-[var(--ink-muted)] px-1 mt-0.5 truncate">
              {c.title}{c.organization ? ` · ${c.organization}` : ""}
            </div>
          )}
        </td>

        {/* Influence */}
        {visibleColumns.influence && (
          <td className="px-3 py-2">
            <Select
              value={c.influence}
              options={INFLUENCES}
              onChange={(v) => {
                onUpdateLocal({ influence: v });
                onCommitUpdate({ influence: v });
              }}
              styleMap={INFLUENCE_STYLE}
            />
          </td>
        )}

        {/* Stage */}
        {visibleColumns.stage && (
          <td className="px-3 py-2">
            <Select
              value={c.stage}
              options={STAGES}
              onChange={(v) => {
                onUpdateLocal({ stage: v });
                onCommitUpdate({ stage: v });
              }}
              styleMap={STAGE_STYLE}
            />
          </td>
        )}

        {/* State — always visible (used for filtering) */}
        <td className="px-3 py-2">
          <input
            value={c.state}
            onChange={(e) => onUpdateLocal({ state: e.target.value })}
            onBlur={() => onCommitUpdate({ state: c.state })}
            placeholder="State..."
            className="text-xs bg-transparent text-[var(--ink-dim)] placeholder-[var(--ink-muted)] border-0 border-b border-transparent hover:border-[var(--line-strong)] focus:border-[var(--accent)] outline-none px-1 py-0.5 w-full"
          />
        </td>

        {/* Agencies count */}
        {visibleColumns.agencies && (
          <td className="px-3 py-2">
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded hover:bg-[var(--panel-2)] whitespace-nowrap transition-colors"
            >
              <Building2 size={13} />
              {c.agencies.length > 0 ? c.agencies.length : "—"}
            </button>
          </td>
        )}

        {/* Notes count */}
        {visibleColumns.notes && (
          <td className="px-3 py-2">
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded hover:bg-[var(--panel-2)] whitespace-nowrap transition-colors"
            >
              <StickyNote size={13} />
              {c.noteLog.length}
            </button>
          </td>
        )}

        {/* Delete */}
        {visibleColumns.delete && (
        <td className="px-3 py-2 relative">
          <button
            onClick={onRequestDelete}
            className="text-[var(--ink-muted)] hover:text-[var(--red)] p-1.5 rounded hover:bg-[var(--red)]/10 transition-colors"
            title="Delete contact"
          >
            <Trash2 size={14} />
          </button>

          {isDeletePending && (
            <div className="absolute right-2 top-full mt-1 z-10 bg-[var(--panel-2)] border border-[var(--line-strong)] rounded-lg shadow-lg p-3 w-56">
              <p className="text-xs text-[var(--ink-dim)] mb-2">
                Delete{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {c.name || "this contact"}
                </span>
                ? This can&apos;t be undone.
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
        )}
      </tr>

      {/* Expanded detail row */}
      {isOpen && (
        <tr className="border-b border-[var(--line)]">
          <td colSpan={3 + Object.values(visibleColumns).filter(Boolean).length} className="p-0">
            <div className="px-6 pt-4 pb-2 bg-[var(--bg-2)]">
              <div className="grid grid-cols-2 gap-4 max-w-3xl">

                {/* Left — contact details */}
                <div className="space-y-3">
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Email
                    </div>
                    <input
                      value={c.email}
                      onChange={(e) => onUpdateLocal({ email: e.target.value })}
                      onBlur={() => onCommitUpdate({ email: c.email })}
                      placeholder="email@example.com"
                      type="email"
                      className="w-full text-sm text-[var(--ink-dim)] bg-[var(--panel)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--accent)] placeholder-[var(--ink-muted)]"
                    />
                  </div>

                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Phone
                    </div>
                    <input
                      value={c.phone}
                      onChange={(e) => onUpdateLocal({ phone: e.target.value })}
                      onBlur={() => onCommitUpdate({ phone: c.phone })}
                      placeholder="(555) 123-4567"
                      className="w-full text-sm text-[var(--ink-dim)] bg-[var(--panel)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--accent)] placeholder-[var(--ink-muted)]"
                    />
                  </div>

                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Next Action
                    </div>
                    <input
                      value={c.nextAction}
                      onChange={(e) => onUpdateLocal({ nextAction: e.target.value })}
                      onBlur={() => onCommitUpdate({ nextAction: c.nextAction })}
                      placeholder="Send capabilities deck..."
                      className="w-full text-sm text-[var(--ink-dim)] bg-[var(--panel)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--accent)] placeholder-[var(--ink-muted)]"
                    />
                  </div>
                </div>

                {/* Right — linked agencies (clickable if URL exists) */}
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Linked Agencies
                  </div>
                  {c.agencies.length === 0 ? (
                    <p className="text-xs text-[var(--ink-muted)] italic">
                      No agencies linked — edit this contact to add some.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {c.agencies.map((ag, i) =>
                        ag.url ? (
                          <a
                            key={i}
                            href={ag.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              background: "rgba(244,185,66,0.1)",
                              border: "1px solid rgba(244,185,66,0.25)",
                              color: "var(--accent)",
                              textDecoration: "none",
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "background 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(244,185,66,0.2)";
                              e.currentTarget.style.borderColor = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(244,185,66,0.1)";
                              e.currentTarget.style.borderColor = "rgba(244,185,66,0.25)";
                            }}
                          >
                            ↗ {ag.name}
                          </a>
                        ) : (
                          <span
                            key={i}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              background: "rgba(244,185,66,0.1)",
                              border: "1px solid rgba(244,185,66,0.2)",
                              color: "var(--accent)",
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {ag.name}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes log */}
            <NotesPanel notes={c.noteLog} onAdd={onAddNote} />
          </td>
        </tr>
      )}
    </>
  );
}