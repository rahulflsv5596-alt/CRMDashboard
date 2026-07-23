"use client";

import StatusPieChart from "./StatusPieChart";
import PriorityPieChart from "./PriorityPieChart";
import RelationshipPieChart from "./RelationshipPieChart";
import { StatusCounts } from "@/lib/types";

interface SummaryBarProps {
  counts: StatusCounts;
}

export default function SummaryBar({ counts }: SummaryBarProps) {
  const labelStyle = {
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div className="bg-[var(--bg-2)] border-b border-[var(--line)] px-10 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div
            className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2"
            style={labelStyle}
          >
            Pipeline · {counts.total} accounts
          </div>
          <StatusPieChart counts={counts.byStatus} total={counts.total} />
        </div>

        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div
            className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2"
            style={labelStyle}
          >
            By priority
          </div>
          <PriorityPieChart counts={counts.byPriority} total={counts.total} />
        </div>

        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg p-4">
          <div
            className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium mb-2"
            style={labelStyle}
          >
            By relationship strength
          </div>
          <RelationshipPieChart counts={counts.byRelationship} total={counts.total} />
        </div>
      </div>
    </div>
  );
}