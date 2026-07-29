"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Globe } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Which contacts haven't been reached out to yet?",
  "Summarize all High influence contacts",
  "What are the latest programs at PennDOT?",
  "Which contacts are in Texas?",
  "Who needs a follow-up action this week?",
  "What does the Pennsylvania Turnpike Commission do?",
];

export default function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPages, setFetchingPages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);
    setFetchingPages(true);

    // Small delay to show "Reading agency sites..." before the real fetch
    await new Promise((r) => setTimeout(r, 400));
    setFetchingPages(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok
            ? data.reply
            : `Sorry — something went wrong: ${data.error ?? "unknown error"}`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry — couldn't reach the assistant. Try again." },
      ]);
    } finally {
      setLoading(false);
      setFetchingPages(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Ask about your contacts and agencies"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: open ? "var(--accent-2)" : "var(--accent)",
          color: "#1a1200",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(244,185,66,0.3)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(244,185,66,0.5)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(244,185,66,0.3)"; }}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Sidebar panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "400px",
            maxWidth: "100vw",
            background: "var(--panel)",
            borderLeft: "1px solid var(--line)",
            zIndex: 49,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid var(--line)",
              background: "var(--bg-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <Globe size={13} style={{ color: "var(--accent)" }} />
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--accent)",
                }}
              >
                Live Agency Research
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", color: "var(--ink)" }}>
              Ask about your contacts
            </div>
            <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px" }}>
              Reads linked agency websites in real time
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: "12px", color: "var(--ink-muted)", marginBottom: "12px", lineHeight: 1.6 }}>
                  I can answer questions about your contacts and browse their agency websites live. Try:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        background: "var(--panel-2)",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        padding: "7px 10px",
                        fontSize: "12px",
                        color: "var(--ink-dim)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s, color 0.15s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(244,185,66,0.4)";
                        e.currentTarget.style.color = "var(--ink)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--line)";
                        e.currentTarget.style.color = "var(--ink-dim)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: m.role === "user" ? "var(--accent)" : "var(--ink-muted)",
                    marginBottom: "4px",
                  }}
                >
                  {m.role === "user" ? "You" : "Assistant"}
                </div>
                <div
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: m.role === "user" ? "var(--ink)" : "var(--ink-dim)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: "12px", color: "var(--ink-muted)", fontStyle: "italic", display: "flex", alignItems: "center", gap: "6px" }}>
                <Globe size={13} style={{ color: "var(--accent)", animation: "spin 1.5s linear infinite" }} />
                {fetchingPages ? "Reading agency websites…" : "Thinking…"}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--ink-muted)",
                  marginBottom: "8px",
                  padding: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                ↺ New conversation
              </button>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything about your contacts..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  color: "var(--ink)",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              />
              <button
                onClick={() => send()}
                disabled={loading || !draft.trim()}
                style={{
                  background: "var(--accent)",
                  color: "#1a1200",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  opacity: loading || !draft.trim() ? 0.4 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
