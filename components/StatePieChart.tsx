"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";

const STATE_COLORS = [
  "#f4b942", "#6da3d9", "#4ade80", "#a888d8", "#5fb78a",
  "#c96f7e", "#e8a23d", "#6b7494", "#8dd3c7", "#bebada",
];

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: "var(--panel-2)", border: "1px solid var(--line-strong)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px" }}>
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
      <span style={{ color: "var(--ink-muted)" }}> — {p.value}</span>
    </div>
  );
}

interface StatePieChartProps {
  counts: Record<string, number>;
  total: number;
}

export default function StatePieChart({ counts, total }: StatePieChartProps) {
  // Sort by count descending, show top 8, group rest as "Other"
  const sorted = Object.entries(counts)
    .filter(([k]) => k)
    .sort((a, b) => b[1] - a[1]);

  const top = sorted.slice(0, 8);
  const otherCount = sorted.slice(8).reduce((sum, [, v]) => sum + v, 0);
  const data = [
    ...top.map(([name, value]) => ({ name, value })),
    ...(otherCount > 0 ? [{ name: "Other", value: otherCount }] : []),
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="text-xs italic py-8 text-center" style={{ color: "var(--ink-muted)" }}>No contacts yet.</div>;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ width: 190, height: 190 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.name} fill={STATE_COLORS[i % STATE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1 max-h-[190px] overflow-y-auto pr-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-dim)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATE_COLORS[i % STATE_COLORS.length] }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</span>
            <span style={{ color: "var(--ink-muted)" }} className="truncate max-w-[90px]">{d.name || "Unknown"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
