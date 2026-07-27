"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { INFLUENCES } from "@/lib/constants";
import { Influence } from "@/lib/types";

const INFLUENCE_HEX: Record<Influence, string> = {
  High:   "#4ade80",
  Medium: "#6da3d9",
  Low:    "#6b7494",
};

type TooltipPayload = {
  name?: string;
  value?: number | string;
  payload?: {
    name?: string;
    value?: number | string;
  };
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: "var(--panel-2)", border: "1px solid var(--line-strong)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px" }}>
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
      <span style={{ color: "var(--ink-muted)" }}> — {p.value}</span>
    </div>
  );
}

interface InfluencePieChartProps {
  counts: Record<Influence, number>;
  total: number;
}

export default function InfluencePieChart({ counts, total }: InfluencePieChartProps) {
  const data = INFLUENCES.map((i) => ({ name: i, value: counts[i] })).filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="text-xs italic py-8 text-center" style={{ color: "var(--ink-muted)" }}>No contacts yet.</div>;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ width: 190, height: 190 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={INFLUENCE_HEX[d.name as Influence]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {INFLUENCES.map((i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-dim)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: INFLUENCE_HEX[i] }} />
            <span className="font-mono font-semibold tabular-nums w-4 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{counts[i]}</span>
            <span style={{ color: "var(--ink-muted)" }}>{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
