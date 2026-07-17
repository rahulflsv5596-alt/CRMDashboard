"use client";

import StatusPieChart from "./StatusPieChart";
import { PRIORITIES, RELATIONSHIPS, PRIORITY_STYLE, REL_STYLE } from "@/lib/constants";
import { StatusCounts } from "@/lib/types";

interface SummaryBarProps {
  counts: StatusCounts;
}

/**
 * Top summary panel: live pie chart of statuses, plus quick-glance
 * counts by priority and by relationship strength. All values come
 * from the `counts` object computed in AgencyCRM (via useMemo), so
 * this component just renders — no logic of its own.
 */
export default function SummaryBar({ counts }: SummaryBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status pipeline */}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            Pipeline · {counts.total} accounts
          </div>
          <StatusPieChart counts={counts.byStatus} total={counts.total} />
        </div>

        {/* Priority */}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            By priority
          </div>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <div key={p} className={`flex-1 rounded px-3 py-2 ${PRIORITY_STYLE[p].bg}`}>
                <div className={`font-mono text-lg font-bold tabular-nums ${PRIORITY_STYLE[p].text}`}>
                  {counts.byPriority[p]}
                </div>
                <div className={`text-[11px] font-medium ${PRIORITY_STYLE[p].text}`}>{p}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship strength */}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            By relationship strength
          </div>
          <div className="flex gap-2">
            {RELATIONSHIPS.map((r) => (
              <div key={r} className={`flex-1 rounded px-2 py-2 ${REL_STYLE[r].bg}`}>
                <div className={`font-mono text-lg font-bold tabular-nums ${REL_STYLE[r].text}`}>
                  {counts.byRelationship[r]}
                </div>
                <div className={`text-[10px] font-medium ${REL_STYLE[r].text}`}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
