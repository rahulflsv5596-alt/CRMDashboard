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
  "Not Contacted": { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", hex: "#94A3B8" },
  "Demo Scheduled": { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500", hex: "#0EA5E9" },
  "Pilot Active": { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500", hex: "#14B8A6" },
  "Proposal Sent": { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", hex: "#F59E0B" },
  Won: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", hex: "#22C55E" },
  Lost: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500", hex: "#F43F5E" },
};

export const PRIORITY_STYLE: Record<Priority, StyleToken> = {
  P1: { bg: "bg-rose-100", text: "text-rose-700", hex: "#F43F5E" },
  P2: { bg: "bg-amber-100", text: "text-amber-700", hex: "#F59E0B" },
  P3: { bg: "bg-slate-100", text: "text-slate-600", hex: "#94A3B8" },
};

export const REL_STYLE: Record<Relationship, StyleToken> = {
  Strong: { bg: "bg-emerald-100", text: "text-emerald-700", hex: "#22C55E" },
  Moderate: { bg: "bg-sky-100", text: "text-sky-700", hex: "#0EA5E9" },
  Limited: { bg: "bg-amber-100", text: "text-amber-700", hex: "#F59E0B" },
  Unknown: { bg: "bg-slate-100", text: "text-slate-500", hex: "#94A3B8" },
};

export const CONFLICT_STYLE: Record<Conflict, StyleToken> = {
  Clear: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Needs Review": { bg: "bg-amber-100", text: "text-amber-700" },
  "Existing Engagement": { bg: "bg-indigo-100", text: "text-indigo-700" },
};
