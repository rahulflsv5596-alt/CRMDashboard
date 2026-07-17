// Shared types for the CRM dashboard. Mirrors the Supabase schema:
// public.accounts and public.account_notes.

export type Priority = "P1" | "P2" | "P3";

export type Status =
  | "Not Contacted"
  | "Demo Scheduled"
  | "Pilot Active"
  | "Proposal Sent"
  | "Won"
  | "Lost";

export type Relationship = "Strong" | "Moderate" | "Limited" | "Unknown";

export type Conflict = "Clear" | "Needs Review" | "Existing Engagement";

export interface Note {
  id: string;
  date: string; // ISO date string, e.g. "2026-07-17"
  text: string;
}

export interface Account {
  id: string;
  agencyName: string;
  priority: Priority;
  status: Status;
  relationship: Relationship;
  conflict: Conflict;
  facts: string;
  notes: Note[];
}

export interface StatusCounts {
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  byRelationship: Record<Relationship, number>;
  total: number;
}

/** Generic style token used for color-coded pills/dropdowns. */
export interface StyleToken {
  bg: string;
  text: string;
  dot?: string;
  hex?: string;
}
