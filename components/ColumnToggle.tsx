"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";

export type ColumnKey = "influence" | "stage" | "state" | "agencies" | "notes" | "delete";

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  influence: "Influence",
  stage: "Stage",
  state: "State",
  agencies: "Agencies",
  notes: "Notes",
  delete: "Delete",
};

// All columns visible by default
export const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  influence: true,
  stage: true,
  state: true,
  agencies: true,
  notes: true,
  delete: true,
};

interface ColumnToggleProps {
  visible: Record<ColumnKey, boolean>;
  onChange: (visible: Record<ColumnKey, boolean>) => void;
}

export default function ColumnToggle({ visible, onChange }: ColumnToggleProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCol = (key: ColumnKey) => {
    onChange({ ...visible, [key]: !visible[key] });
  };

  const visibleCount = Object.values(visible).filter(Boolean).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Show / hide columns"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: open ? "rgba(244,185,66,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(244,185,66,0.4)" : "var(--line)"}`,
          borderRadius: "6px",
          padding: "6px 10px",
          cursor: "pointer",
          color: open ? "var(--accent)" : "var(--ink-muted)",
          fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace",
          transition: "color 0.15s, border-color 0.15s, background 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.color = "var(--ink-muted)";
            e.currentTarget.style.borderColor = "var(--line)";
          }
        }}
      >
        <SlidersHorizontal size={13} />
        Columns
        {visibleCount < Object.keys(visible).length && (
          <span
            style={{
              background: "var(--accent)",
              color: "#1a1200",
              borderRadius: "10px",
              padding: "0 5px",
              fontSize: "10px",
              fontWeight: 700,
              lineHeight: "16px",
            }}
          >
            {visibleCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            background: "var(--panel-2)",
            border: "1px solid var(--line-strong)",
            borderRadius: "8px",
            padding: "8px",
            minWidth: "160px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--ink-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              padding: "2px 8px 8px",
              borderBottom: "1px solid var(--line)",
              marginBottom: "4px",
            }}
          >
            Show / Hide
          </div>

          {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12.5px",
                color: visible[key] ? "var(--ink)" : "var(--ink-muted)",
                background: visible[key] ? "rgba(244,185,66,0.05)" : "transparent",
                transition: "background 0.1s",
              }}
            >
              <input
                type="checkbox"
                checked={visible[key]}
                onChange={() => toggleCol(key)}
                style={{ accentColor: "var(--accent)", width: "13px", height: "13px" }}
              />
              {COLUMN_LABELS[key]}
            </label>
          ))}

          <div style={{ borderTop: "1px solid var(--line)", marginTop: "4px", paddingTop: "4px" }}>
            <button
              onClick={() => onChange({ ...DEFAULT_VISIBLE })}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--ink-muted)",
                fontFamily: "'JetBrains Mono', monospace",
                padding: "4px 8px",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
