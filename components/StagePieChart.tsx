"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { STAGES } from "@/lib/constants";
import { Stage } from "@/lib/types";

const STAGE_HEX: Record<Stage, string> = {
  New:       "#6b7494",
  Contacted: "#6da3d9",
  Engaged:   "#f4b942",
  Champion:  "#4ade80",
  Dormant:   "#c96f7e",
};

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

interface StagePieChartProps {
  counts: Record<Stage, number>;
  total: number;
}

export default function StagePieChart({ counts, total }: StagePieChartProps) {
  const data = STAGES.map((s) => ({ name: s, value: counts[s] })).filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="text-xs italic py-8 text-center" style={{ color: "var(--ink-muted)" }}>No contacts yet.</div>;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ width: 190, height: 190 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={STAGE_HEX[d.name as Stage]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {STAGES.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-dim)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STAGE_HEX[s] }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{counts[s]}</span>
            <span style={{ color: "var(--ink-muted)" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
