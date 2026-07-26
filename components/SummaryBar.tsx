"use client";

import StagePieChart from "./StagePieChart";
import InfluencePieChart from "./InfluencePieChart";
import StatePieChart from "./StatePieChart";
import { Stage, Influence } from "@/lib/types";
import { STAGES, INFLUENCES } from "@/lib/constants";
import { ContactRow } from "./AgencyCRM";

interface SummaryBarProps {
  contacts: ContactRow[];
}

export default function SummaryBar({ contacts }: SummaryBarProps) {
  const total = contacts.length;
  const labelStyle = { fontFamily: "'JetBrains Mono', monospace" };

  const byStageCounts = Object.fromEntries(
    STAGES.map((s) => [s, contacts.filter((c) => c.stage === s).length])
  ) as Record<Stage, number>;

  const byInfluence = Object.fromEntries(
    INFLUENCES.map((i) => [i, contacts.filter((c) => c.influence === i).length])
  ) as Record<Influence, number>;

  const byState: Record<string, number> = {};
  contacts.forEach((c) => {
    const s = c.state || "Unknown";
    byState[s] = (byState[s] ?? 0) + 1;
  });

  return (
    <div className="bg-[var(--bg-2)] border-b border-[var(--line)] px-10 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2" style={labelStyle}>
            By Stage · {total} contacts
          </div>
          <StagePieChart counts={byStageCounts} total={total} />
        </div>

        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2" style={labelStyle}>
            By Influence
          </div>
          <InfluencePieChart counts={byInfluence} total={total} />
        </div>

        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2" style={labelStyle}>
            By State
          </div>
          <StatePieChart counts={byState} total={total} />
        </div>
      </div>
    </div>
  );
}