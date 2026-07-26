"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","District of Columbia","Puerto Rico","Guam",
  "U.S. Virgin Islands","American Samoa","Northern Mariana Islands",
];

const AGENCY_TYPES = [
  "State DOT",
  "Toll Authority",
  "Transit Authority",
  "Port Authority",
  "Bridge Authority",
  "County DOT",
  "City / Municipal DOT",
  "Metropolitan Planning Organization",
  "Other",
];

interface AddAgencyModalProps {
  /** Pre-selected state when opened from a state drill-down. Null = whole US view. */
  preselectedState?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddAgencyModal({
  preselectedState = null,
  onClose,
  onSaved,
}: AddAgencyModalProps) {
  const supabase = createClient();

  const [agencyName, setAgencyName] = useState("");
  const [state, setState] = useState(preselectedState ?? "");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("State DOT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!agencyName.trim()) {
      setError("Agency name is required.");
      return;
    }
    if (!state) {
      setError("Please select a state.");
      return;
    }
    setError(null);
    setSaving(true);

    const { error: err } = await supabase.from("accounts").insert({
      agency_name: agencyName.trim(),
      state,
      agency_facts: [
        type ? `Type: ${type}` : null,
        url ? `Website: ${url}` : null,
      ]
        .filter(Boolean)
        .join("\n") || null,
      priority: "P3",
      status: "Not Contacted",
      relationship_strength: "Unknown",
      conflict_status: "Clear",
    });

    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

  // Small delay so Supabase write is fully committed before re-fetching
  setTimeout(() => {
    if (typeof (window as any).__atlasRefreshTab === 'function') {
      (window as any).__atlasRefreshTab('agencies');
    }
  }, 300);


    onSaved();
    onClose();
// Trigger re-render of the agencies tab if atlas is active
    
  };

  const inputStyle = {
    background: "var(--panel-2)",
    border: "1px solid var(--line)",
    borderRadius: "6px",
    padding: "7px 10px",
    color: "var(--ink)",
    fontSize: "13px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    color: "var(--ink-muted)",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--bg-2)",
            borderRadius: "10px 10px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ ...labelStyle, marginBottom: "2px" }}>
              {preselectedState ? preselectedState : "All States"}
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "17px",
                color: "var(--ink)",
              }}
            >
              Add <em style={{ color: "var(--accent)", fontStyle: "italic" }}>Agency</em>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-muted)",
              fontSize: "20px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Agency Name */}
          <div>
            <label style={labelStyle}>Agency Name *</label>
            <input
              style={inputStyle}
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="e.g. Pennsylvania Turnpike Commission"
              autoFocus
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* State */}
          <div>
            <label style={labelStyle}>
              State / Territory *
              {preselectedState && (
                <span style={{ color: "var(--accent)", marginLeft: "6px" }}>
                  (pre-filled from map)
                </span>
              )}
            </label>
            <select
              style={inputStyle}
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">— Select state —</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Agency Type</label>
            <select
              style={inputStyle}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {AGENCY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label style={labelStyle}>Website URL</label>
            <input
              style={inputStyle}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.gov"
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            />
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "var(--red)", margin: 0 }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--bg-2)",
            borderRadius: "0 0 10px 10px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "12px",
              color: "var(--ink-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "var(--accent)",
              color: "#1a1200",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : "Add Agency"}
          </button>
        </div>
      </div>
    </div>
  );
}
