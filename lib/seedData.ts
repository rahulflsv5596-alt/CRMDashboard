import { Account, Note } from "./types";
import { nextId } from "./utils";

const seedNotes = (entries: [string, string][]): Note[] =>
  entries.map(([date, text]) => ({ id: nextId(), date, text }));

/**
 * Sample starting accounts so the dashboard isn't empty on first load.
 * Replace this with a real fetch from Supabase in production — e.g. an
 * initial server-side load in app/page.tsx, passed down as a prop.
 */
export const SEED_ACCOUNTS: Account[] = (
  [
    {
      agencyName: "Ohio Department of Transportation",
      priority: "P1",
      status: "Pilot Active",
      relationship: "Strong",
      conflict: "Clear",
      facts:
        "Manages ~50,000 lane-miles; publicly committed to a statewide ITS modernization program through 2027.",
      notes: seedNotes([
        ["2026-05-02", "Kickoff call with district engineers, positive reception."],
        ["2026-06-14", "Pilot scoped for District 6 corridor sensors."],
      ]),
    },
    {
      agencyName: "Maricopa County DOT",
      priority: "P1",
      status: "Proposal Sent",
      relationship: "Moderate",
      conflict: "Clear",
      facts:
        "One of the fastest-growing counties in the US; active RFPs for traffic signal optimization.",
      notes: seedNotes([
        ["2026-04-20", "Sent proposal after two discovery calls."],
        ["2026-06-01", "Following up on procurement timeline."],
      ]),
    },
    {
      agencyName: "City of Austin Transportation Dept.",
      priority: "P2",
      status: "Demo Scheduled",
      relationship: "Unknown",
      conflict: "Needs Review",
      facts: "Vision Zero commitments driving interest in real-time incident detection tools.",
      notes: seedNotes([["2026-06-20", "Demo confirmed for July 22."]]),
    },
    {
      agencyName: "Washington State DOT",
      priority: "P1",
      status: "Won",
      relationship: "Strong",
      conflict: "Clear",
      facts: "Statewide rollout signed; multi-year contract covering I-5 corridor.",
      notes: seedNotes([
        ["2026-03-11", "Contract signed."],
        ["2026-03-15", "Kickoff scheduled with implementation team."],
      ]),
    },
    {
      agencyName: "Cook County Highway Dept.",
      priority: "P3",
      status: "Not Contacted",
      relationship: "Unknown",
      conflict: "Clear",
      facts: "Large urban county highway network; budget cycle begins in October.",
      notes: [],
    },
    {
      agencyName: "Georgia DOT",
      priority: "P2",
      status: "Lost",
      relationship: "Limited",
      conflict: "Existing Engagement",
      facts: "Currently under contract with an incumbent vendor through 2028.",
      notes: seedNotes([["2026-02-08", "Declined — locked into existing vendor."]]),
    },
    {
      agencyName: "Town of Chapel Hill",
      priority: "P3",
      status: "Not Contacted",
      relationship: "Unknown",
      conflict: "Clear",
      facts: "Small locality piloting smart-corridor grants from state funding.",
      notes: [],
    },
    {
      agencyName: "Colorado DOT",
      priority: "P2",
      status: "Pilot Active",
      relationship: "Moderate",
      conflict: "Needs Review",
      facts: "Mountain-corridor weather-responsive systems are a stated priority.",
      notes: seedNotes([["2026-05-28", "Pilot underway on I-70 mountain corridor."]]),
    },
    {
      agencyName: "Fulton County Public Works",
      priority: "P3",
      status: "Demo Scheduled",
      relationship: "Limited",
      conflict: "Clear",
      facts: "Recently reorganized public works division; new director as of Q1 2026.",
      notes: seedNotes([["2026-06-30", "Demo booked with new director's office."]]),
    },
    {
      agencyName: "Oregon DOT",
      priority: "P1",
      status: "Proposal Sent",
      relationship: "Strong",
      conflict: "Clear",
      facts: "Legislature approved new transportation funding package in 2026 session.",
      notes: seedNotes([["2026-06-10", "Proposal sent following funding approval."]]),
    },
  ] as Omit<Account, "id">[]
).map((a) => ({ id: nextId(), ...a }));
