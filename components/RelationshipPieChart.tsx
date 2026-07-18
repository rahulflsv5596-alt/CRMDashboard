"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { RELATIONSHIPS, REL_STYLE } from "@/lib/constants";
import { Relationship } from "@/lib/types";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm px-2.5 py-1.5 text-xs">
      <span className="font-semibold text-slate-700">{p.name}</span>
      <span className="text-slate-400"> — {p.value}</span>
    </div>
  );
}

interface RelationshipPieChartProps {
  counts: Record<Relationship, number>;
  total: number;
}

export default function RelationshipPieChart({ counts, total }: RelationshipPieChartProps) {
  const data = RELATIONSHIPS.map((r) => ({ name: r, value: counts[r] })).filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="text-xs text-slate-400 italic py-8 text-center">No accounts yet.</div>;
  }

  return (
   <div className="flex items-center justify-center gap-2">
      <div style={{ width: 200, height: 200 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={65}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={REL_STYLE[d.name].hex} />
              ))}
            </Pie>
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {RELATIONSHIPS.map((r) => (
          <div key={r} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REL_STYLE[r].hex }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right">{counts[r]}</span>
            <span className="text-slate-400">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}