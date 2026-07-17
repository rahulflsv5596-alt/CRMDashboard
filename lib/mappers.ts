import { Account, Note, Priority, Status, Relationship, Conflict } from "./types";

// Shape of a row exactly as it comes back from Supabase.

export interface AccountRow {
  id: string;
  agency_name: string;
  priority: Priority | null;
  status: Status | null;
  relationship_strength: Relationship | null;
  conflict_status: Conflict | null;
  agency_facts: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountNoteRow {
  id: string;
  account_id: string;
  note: string;
  created_at: string;
}

/** Converts one Supabase account_notes row into the UI's Note shape. */
export function rowToNote(row: AccountNoteRow): Note {
  return {
    id: row.id,
    date: row.created_at.slice(0, 10), // "2026-07-17T..." -> "2026-07-17"
    text: row.note,
  };
}

/**
 * Converts a Supabase accounts row (+ its already-fetched notes) into the
 * UI's Account shape. Falls back to sensible defaults for any nullable
 * column so the dropdowns always have a valid value to display.
 */
export function rowToAccount(row: AccountRow, notes: Note[]): Account {
  return {
    id: row.id,
    agencyName: row.agency_name,
    priority: row.priority ?? "P3",
    status: row.status ?? "Not Contacted",
    relationship: row.relationship_strength ?? "Unknown",
    conflict: row.conflict_status ?? "Clear",
    facts: row.agency_facts ?? "",
    notes,
  };
}
