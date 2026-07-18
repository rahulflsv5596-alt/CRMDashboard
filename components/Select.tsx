"use client";

import { ChevronDown } from "lucide-react";
import { StyleToken } from "@/lib/types";

interface SelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  styleMap?: Record<string, StyleToken>;
}

/**
 * Color-coded dropdown used for Priority, Status, Relationship, and Conflict
 * fields. Pass a styleMap (see lib/constants.ts) to tint it by the current value.
 */
export default function Select<T extends string>({
  value,
  options,
  onChange,
  styleMap,
}: SelectProps<T>) {
  const s = styleMap ? styleMap[value] : undefined;

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`text-xs font-medium rounded px-2 py-1 pr-6 border-0 outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-slate-400 w-full ${
          s ? `${s.bg} ${s.text}` : "bg-slate-100 text-slate-600"
        }`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 ${
          s ? s.text : "text-slate-500"
        }`}
      />
    </div>
  );
}