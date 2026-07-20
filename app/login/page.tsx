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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">
          {isSignUp ? "Create an account" : "Sign in"}
        </h1>
        <p className="text-xs text-slate-400 mb-6">Dashboard CRM</p>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm font-semibold py-2 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>
{/* 
        <button
          onClick={handleGoogleAuth}
          className="w-full border border-slate-200 text-sm font-medium py-2 rounded hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          Continue with Google
        </button> */}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-xs text-slate-400 hover:text-slate-600 mt-4"
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}