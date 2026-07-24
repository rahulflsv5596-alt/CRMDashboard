import { Priority, Status, Relationship, Conflict, StyleToken } from "./types";

export const PRIORITIES: Priority[] = ["P1", "P2", "P3"];

export const STATUSES: Status[] = [
  "Not Contacted",
  "Demo Scheduled",
  "Pilot Active",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const RELATIONSHIPS: Relationship[] = ["Strong", "Moderate", "Limited", "Unknown"];

export const CONFLICTS: Conflict[] = ["Clear", "Needs Review", "Existing Engagement"];

export const STATUS_STYLE: Record<Status, StyleToken> = {
  "Not Contacted": { bg: "bg-white/5", text: "text-[var(--ink-muted)]", dot: "bg-[var(--ink-muted)]", hex: "#6b7494" },
  "Demo Scheduled": { bg: "bg-[var(--blue)]/15", text: "text-[var(--blue)]", dot: "bg-[var(--blue)]", hex: "#6da3d9" },
  "Pilot Active": { bg: "bg-[var(--green)]/15", text: "text-[var(--green)]", dot: "bg-[var(--green)]", hex: "#5fb78a" },
  "Proposal Sent": { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]", dot: "bg-[var(--accent)]", hex: "#f4b942" },
  Won: { bg: "bg-[#4ade80]/15", text: "text-[#4ade80]", dot: "bg-[#4ade80]", hex: "#4ade80" },
  Lost: { bg: "bg-[var(--red)]/15", text: "text-[var(--red)]", dot: "bg-[var(--red)]", hex: "#c96f7e" },
};

export const PRIORITY_STYLE: Record<Priority, StyleToken> = {
  P1: { bg: "bg-[#e8a23d]/15", text: "text-[#e8a23d]", hex: "#e8a23d" },
  P2: { bg: "bg-[var(--blue)]/15", text: "text-[var(--blue)]", hex: "#6da3d9" },
  P3: { bg: "bg-white/5", text: "text-[var(--ink-muted)]", hex: "#6b7494" },
};
export const REL_STYLE: Record<Relationship, StyleToken> = {
  Strong: { bg: "bg-[#4ade80]/15", text: "text-[#4ade80]", hex: "#4ade80" },
  Moderate: { bg: "bg-[var(--blue)]/15", text: "text-[var(--blue)]", hex: "#6da3d9" },
  Limited: { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]", hex: "#f4b942" },
  Unknown: { bg: "bg-white/5", text: "text-[var(--ink-muted)]", hex: "#6b7494" },
};

export const CONFLICT_STYLE: Record<Conflict, StyleToken> = {
  Clear: { bg: "bg-[#4ade80]/15", text: "text-[#4ade80]" },
  "Needs Review": { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]" },
  "Existing Engagement": { bg: "bg-[#a888d8]/15", text: "text-[#a888d8]" },
};