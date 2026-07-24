"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function Masthead() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="masthead">
      <div className="masthead-left">
        <div className="eyebrow">U.S. State DOT Atlas + Territory CRM · FY2025</div>
        <h1 className="title">
          DOT Territory <em>Intelligence &amp; CRM</em>
        </h1>
        <p className="subtitle">
          Click any state to{' '}
          <em style={{ color: 'var(--accent)' }}>zoom in and explore its counties</em>. FY2025
          expenditures from{' '}
          <a
            href="https://higherlogicdownload.s3.amazonaws.com/NASBO/9d2d2db1-c943-4f1b-b750-0fca152d64c2/UploadedImages/SER%20Archive/2025_SER/Transportation_Tables_2025_State_Expenditure_Report.pdf"
            target="_blank"
            rel="noopener"
          >
            NASBO
          </a>{' '}
          · expenditure detail from{' '}
          <a
            href="https://www.fhwa.dot.gov/policyinformation/statistics/2023/sf21.cfm"
            target="_blank"
            rel="noopener"
          >
            FHWA SF-21
          </a>{' '}
          · bridges from{' '}
          <a href="https://www.fhwa.dot.gov/bridge/nbi.cfm" target="_blank" rel="noopener">
            NBI 2024
          </a>{' '}
          · county boundaries from{' '}
          <a
            href="https://www.census.gov/geographies/mapping-files.html"
            target="_blank"
            rel="noopener"
          >
            Census TIGER/Line
          </a>{' '}
          · leadership from{' '}
          <a
            href="https://transportation.org/meetings/membership-state-by-state/"
            target="_blank"
            rel="noopener"
          >
            AASHTO
          </a>
          .
        </p>
      </div>
      <div className="masthead-right" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'inherit' }}>
          <div className="masthead-stat">
            <div className="masthead-stat-label">FY2025 National</div>
            <div className="masthead-stat-value" id="hdr-total">$—</div>
          </div>
          <div className="masthead-stat">
            <div className="masthead-stat-label">Contacts</div>
            <div className="masthead-stat-value" id="hdr-contacts">—</div>
          </div>
          <div className="masthead-stat">
            <div className="masthead-stat-label">Champions</div>
            <div className="masthead-stat-value" id="hdr-champions">—</div>
          </div>
          <div className="masthead-stat">
            <div className="masthead-stat-label">Follow-ups Due</div>
            <div className="masthead-stat-value" id="hdr-followups" style={{ color: 'var(--red)' }}>—</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            color: 'var(--ink-muted)',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            marginLeft: '16px',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.borderColor = 'var(--line-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ink-muted)';
            e.currentTarget.style.borderColor = 'var(--line)';
          }}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  );
}
