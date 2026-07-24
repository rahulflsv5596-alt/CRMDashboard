"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 1200px 800px at 20% -10%, rgba(244, 185, 66, 0.06), transparent 60%), radial-gradient(ellipse 800px 600px at 110% 50%, rgba(168, 136, 216, 0.05), transparent 60%), var(--bg)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="rounded-lg p-8 w-full max-w-sm"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
        >
          <span className="inline-block w-6 h-px" style={{ background: "var(--accent)" }} />
          CRM Dashboard
        </div>

        <h1
          className="text-2xl leading-tight tracking-tight mb-6"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "var(--ink)" }}
        >
          {isSignUp ? (
            <>Create an <em className="italic font-normal" style={{ color: "var(--accent)" }}>account</em></>
          ) : (
            <>Sign <em className="italic font-normal" style={{ color: "var(--accent)" }}>in</em></>
          )}
        </h1>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          />

          {error && (
            <p className="text-xs" style={{ color: "var(--red)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-semibold py-2 rounded transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#1a1200" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "var(--accent-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {loading ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1" style={{ background: "var(--line)" }} />
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
            or
          </span>
          <div className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        {/* <button
          onClick={handleGoogleAuth}
          className="w-full text-sm font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
          style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          Continue with Google
        </button> */}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-xs mt-4 transition-colors"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
