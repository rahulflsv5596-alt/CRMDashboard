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

export type Influence = "High" | "Medium" | "Low";

export type Stage =
  | "New"
  | "Contacted"
  | "Engaged"
  | "Champion"
  | "Dormant";

export interface StyleToken {
  bg: string;
  text: string;
  dot?: string;
  hex?: string;
}

export interface Note {
  id: string;
  date: string;
  text: string;
}

// Legacy — kept for any remaining references
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

// New primary entity for the CRM dashboard table
export interface Contact {
  id: string;
  name: string;
  title: string;
  organization: string;
  state: string;
  influence: Influence;
  stage: Stage;
  email: string;
  phone: string;
  tags: string;
  notes: string;
  nextAction: string;
  nextActionDate: string;
  agencies: { name: string; url: string | null }[];
  noteLog: Note[];    // interaction log entries
}

export interface StatusCounts {
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  byRelationship: Record<Relationship, number>;
  total: number;
}

export interface ContactCounts {
  byStageCounts: Record<Stage, number>;
  byInfluence: Record<Influence, number>;
  total: number;
}