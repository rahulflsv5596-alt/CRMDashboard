"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { STATUSES, STATUS_STYLE } from "@/lib/constants";
import { Status } from "@/lib/types";

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

interface StatusPieChartProps {
  counts: Record<Status, number>;
  total: number;
}

/** Donut chart of accounts by status, with a live count list beside it. */
export default function StatusPieChart({ counts, total }: StatusPieChartProps) {
  const data = STATUSES.map((s) => ({ name: s, value: counts[s] })).filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="text-xs text-slate-400 italic py-8 text-center">No accounts yet.</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 150, height: 150 }} className="shrink-0">
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
                <Cell key={d.name} fill={STATUS_STYLE[d.name].hex} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_STYLE[s].hex }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right">{counts[s]}</span>
            <span className="text-slate-400">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
