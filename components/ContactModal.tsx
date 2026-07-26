"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  agency_name: string;
  state: string | null;
}

interface Interaction {
  id: string;
  type: string;
  note: string;
  created_at: string;
}

interface ContactModalProps {
  preselectedState?: string | null;
  contactId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

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

export default function ContactModal({
  preselectedState = null,
  contactId = null,
  onClose,
  onSaved,
}: ContactModalProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState(preselectedState ?? "");
  const [category, setCategory] = useState("State DOT Leadership");
  const [influence, setInfluence] = useState("Medium");
  const [stage, setStage] = useState("New");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");

  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [intType, setIntType] = useState("Call");
  const [intNote, setIntNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all accounts once on mount
  useEffect(() => {
    async function loadAccounts() {
      const { data } = await supabase
        .from("accounts")
        .select("id, agency_name, state")
        .order("agency_name", { ascending: true });
      setAllAccounts(data ?? []);
    }
    loadAccounts();
  }, []);

  // Filter agencies whenever state changes
  useEffect(() => {
    if (!state) {
      setFilteredAccounts(allAccounts);
    } else {
      setFilteredAccounts(
        allAccounts.filter(
          (a) =>
            a.state?.toLowerCase() === state.toLowerCase() ||
            a.agency_name?.toLowerCase().includes(state.toLowerCase())
        )
      );
    }
  }, [state, allAccounts]);

  // Load existing contact data when editing
  useEffect(() => {
    if (!contactId) return;

    async function loadContact() {
      const [{ data: contact }, { data: linkedAgencies }] = await Promise.all([
        supabase.from("contacts").select("*").eq("id", contactId).single(),
        supabase
          .from("contact_agencies")
          .select("account_id")
          .eq("contact_id", contactId),
      ]);

      if (!contact) return;
      setName(contact.name ?? "");
      setTitle(contact.title ?? "");
      setOrganization(contact.organization ?? "");
      setState(contact.state ?? "");
      setCategory(contact.category ?? "State DOT Leadership");
      setInfluence(contact.influence ?? "Medium");
      setStage(contact.stage ?? "New");
      setEmail(contact.email ?? "");
      setPhone(contact.phone ?? "");
      setTags(contact.tags ?? "");
      setNotes(contact.notes ?? "");
      setNextAction(contact.next_action ?? "");
      setNextActionDate(contact.next_action_date ?? "");

      // Restore checked agencies
      const ids = new Set<string>(
        (linkedAgencies ?? []).map((r: { account_id: string }) => r.account_id)
      );
      setSelectedAccountIds(ids);

      // Load interactions
      const { data: ints } = await supabase
        .from("interactions")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });
      setInteractions(ints ?? []);
    }

    loadContact();
  }, [contactId]);

  const toggleAgency = (id: string) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSaving(true);

    const payload = {
      name: name.trim(),
      title: title.trim() || null,
      organization: organization.trim() || null,
      state: state || null,
      category,
      influence,
      stage,
      email: email.trim() || null,
      phone: phone.trim() || null,
      tags: tags.trim() || null,
      notes: notes.trim() || null,
      next_action: nextAction.trim() || null,
      next_action_date: nextActionDate || null,
    };

    let savedContactId = contactId;

    if (contactId) {
      const { error: err } = await supabase
        .from("contacts")
        .update(payload)
        .eq("id", contactId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase
        .from("contacts")
        .insert(payload)
        .select()
        .single();
      if (err || !data) { setError(err?.message ?? "Failed to save"); setSaving(false); return; }
      savedContactId = data.id;
    }

    // Sync contact_agencies junction table
    if (savedContactId) {
      // Delete existing links then re-insert selected ones
      await supabase
        .from("contact_agencies")
        .delete()
        .eq("contact_id", savedContactId);

      if (selectedAccountIds.size > 0) {
        const links = Array.from(selectedAccountIds).map((account_id) => ({
          contact_id: savedContactId,
          account_id,
        }));
        await supabase.from("contact_agencies").insert(links);
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!contactId) return;
    setDeleting(true);
    await supabase.from("contacts").delete().eq("id", contactId);
    setDeleting(false);
    onSaved();
    onClose();
  };

  const handleLogInteraction = async () => {
    if (!intNote.trim() || !contactId) return;
    const { data } = await supabase
      .from("interactions")
      .insert({ contact_id: contactId, type: intType, note: intNote.trim() })
      .select()
      .single();
    if (data) {
      setInteractions((prev) => [data, ...prev]);
      setIntNote("");
    }
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
          maxWidth: "640px",
          maxHeight: "90vh",
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
            <div style={{ ...labelStyle, marginBottom: "2px" }}>Contact</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "17px", color: "var(--ink)" }}>
              {contactId ? "Edit Contact" : "New Contact"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", fontSize: "20px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {/* Name */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chief Engineer" />
            </div>

            {/* Organization */}
            <div>
              <label style={labelStyle}>Organization</label>
              <input style={inputStyle} value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Acme Infrastructure" />
            </div>

            {/* State */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>State / Territory</label>
              <select style={inputStyle} value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">— All states —</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Agencies — multi-select checkboxes */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                Agencies
                {selectedAccountIds.size > 0 && (
                  <span style={{ color: "var(--accent)", marginLeft: "6px" }}>
                    {selectedAccountIds.size} selected
                  </span>
                )}
                {state && (
                  <span style={{ color: "var(--ink-muted)", marginLeft: "6px" }}>
                    · {filteredAccounts.length} in {state}
                  </span>
                )}
              </label>
              <div
                style={{
                  background: "var(--panel-2)",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  maxHeight: "160px",
                  overflowY: "auto",
                  padding: "4px 0",
                }}
              >
                {filteredAccounts.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: "12px", color: "var(--ink-muted)", fontStyle: "italic" }}>
                    {state ? `No agencies found for ${state}` : "No agencies in database yet"}
                  </div>
                ) : (
                  filteredAccounts.map((a) => (
                    <label
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: selectedAccountIds.has(a.id) ? "var(--ink)" : "var(--ink-dim)",
                        background: selectedAccountIds.has(a.id) ? "rgba(244,185,66,0.06)" : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccountIds.has(a.id)}
                        onChange={() => toggleAgency(a.id)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span>{a.agency_name}</span>
                      {a.state && a.state !== state && (
                        <span style={{ fontSize: "10px", color: "var(--ink-muted)", marginLeft: "auto" }}>
                          {a.state}
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                {["State DOT Leadership","State DOT Staff","District Engineer","County / Local Official",
                  "Elected Official","MPO / Transit Agency","Contractor","Consultant / Engineering Firm",
                  "Industry Association","Media / Analyst","Other"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Influence */}
            <div>
              <label style={labelStyle}>Influence</label>
              <select style={inputStyle} value={influence} onChange={(e) => setInfluence(e.target.value)}>
                {["High","Medium","Low"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Relationship Stage */}
            <div>
              <label style={labelStyle}>Relationship Stage</label>
              <select style={inputStyle} value={stage} onChange={(e) => setStage(e.target.value)}>
                {["New","Contacted","Engaged","Champion","Dormant"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>

            {/* Tags */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Tags (semicolon separated)</label>
              <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bridge-program; key-account" />
            </div>

            {/* Notes */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context, history, preferences…"
              />
            </div>

            {/* Next Action */}
            <div>
              <label style={labelStyle}>Next Action</label>
              <input style={inputStyle} value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Send capabilities deck" />
            </div>

            {/* Next Action Date */}
            <div>
              <label style={labelStyle}>Next Action Date</label>
              <input style={inputStyle} type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} />
            </div>
          </div>

          {/* Interaction log — editing only */}
          {contactId && (
            <div style={{ marginTop: "20px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
              <div style={{ ...labelStyle, marginBottom: "10px" }}>Interaction Log</div>

              <div style={{ maxHeight: "160px", overflowY: "auto", marginBottom: "10px" }}>
                {interactions.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--ink-muted)", fontStyle: "italic" }}>No interactions logged yet.</p>
                ) : (
                  interactions.map((int) => (
                    <div key={int.id} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "12.5px" }}>
                      <span style={{ color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", whiteSpace: "nowrap" }}>
                        {int.type} · {int.created_at?.slice(0, 10)}
                      </span>
                      <span style={{ color: "var(--ink-dim)" }}>{int.note}</span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  style={{ ...inputStyle, width: "120px", flexShrink: 0 }}
                  value={intType}
                  onChange={(e) => setIntType(e.target.value)}
                >
                  {["Call","Email","Meeting","Event","Note"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={intNote}
                  onChange={(e) => setIntNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogInteraction()}
                  placeholder="What happened?"
                />
                <button
                  onClick={handleLogInteraction}
                  disabled={!intNote.trim()}
                  style={{
                    background: "var(--accent)",
                    color: "#1a1200",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: intNote.trim() ? 1 : 0.4,
                  }}
                >
                  Log
                </button>
              </div>
            </div>
          )}

          {error && (
            <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--red)" }}>{error}</p>
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
            alignItems: "center",
            gap: "8px",
          }}
        >
          {contactId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "var(--red)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: deleting ? 0.5 : 1,
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
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
              }}
            >
              {saving ? "Saving…" : "Save Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
