"use client";

import StatusPieChart from "./StatusPieChart";
import PriorityPieChart from "./PriorityPieChart";
import RelationshipPieChart from "./RelationshipPieChart";
import { StatusCounts } from "@/lib/types";

interface SummaryBarProps {
  counts: StatusCounts;
}

export default function SummaryBar({ counts }: SummaryBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            Pipeline · {counts.total} accounts
          </div>
          <StatusPieChart counts={counts.byStatus} total={counts.total} />
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            By priority
          </div>
          <PriorityPieChart counts={counts.byPriority} total={counts.total} />
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
            By relationship strength
          </div>
          <RelationshipPieChart counts={counts.byRelationship} total={counts.total} />
        </div>
      </div>
    </div>
  );
}