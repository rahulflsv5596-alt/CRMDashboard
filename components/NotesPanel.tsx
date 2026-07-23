"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/utils";
import { Note } from "@/lib/types";

interface NotesPanelProps {
  notes: Note[];
  onAdd: (text: string) => void;
}

/**
 * Dated log of notes for one account, plus an input to add a new
 * entry (auto-stamped with today's date by the parent's onAdd handler).
 */
export default function NotesPanel({ notes, onAdd }: NotesPanelProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };

  return (
    // NotesPanel.tsx — only the wrapper/input classNames change
<div className="bg-[var(--bg-2)] px-6 py-4">
  <div className="max-w-2xl">
    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
      {notes.length === 0 && (
        <p className="text-xs text-[var(--ink-muted)] italic">No notes yet — add the first update below.</p>
      )}
      {[...notes].sort((a, b) => (a.date < b.date ? 1 : -1)).map((n) => (
        <div key={n.id} className="flex gap-3 text-sm">
          <span
            className="text-[11px] text-[var(--ink-muted)] pt-0.5 whitespace-nowrap w-20 shrink-0"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {fmtDate(n.date)}
          </span>
          <span className="text-[var(--ink-dim)]">{n.text}</span>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Log an update — e.g. call notes, next steps..."
        className="flex-1 text-sm px-3 py-1.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
      />
      <button
        onClick={submit}
        className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--accent)] text-[#1a1200] hover:bg-[var(--accent-2)] transition-colors"
      >
        Add entry
      </button>
    </div>
  </div>
</div>
  );
}
