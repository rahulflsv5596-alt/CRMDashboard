"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { PRIORITIES, PRIORITY_STYLE } from "@/lib/constants";
import { Priority } from "@/lib/types";

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

interface PriorityPieChartProps {
  counts: Record<Priority, number>;
  total: number;
}

export default function PriorityPieChart({ counts, total }: PriorityPieChartProps) {
  const data = PRIORITIES.map((p) => ({ name: p, value: counts[p] })).filter((d) => d.value > 0);

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
                <Cell key={d.name} fill={PRIORITY_STYLE[d.name].hex} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {PRIORITIES.map((p) => (
          <div key={p} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_STYLE[p].hex }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right">{counts[p]}</span>
            <span className="text-slate-400">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}