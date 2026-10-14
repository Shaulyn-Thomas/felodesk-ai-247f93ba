import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — FeloDesk AI" },
      { name: "description", content: "Sign in or create a free FeloDesk AI account." },
      { property: "og:title", content: "Sign in — FeloDesk AI" },
      { property: "og:description", content: "Sign in or create a free FeloDesk AI account." },
    ],
  }),
  component: AuthPage,
});

function safePath(p?: string) {
  return p && p.startsWith("/") && !p.startsWith("//") ? p : "/";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      navigate({ to: safePath(redirect), replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) navigate({ to: safePath(redirect), replace: true });
      else setInfo("Check your email and click the confirmation link, then sign in.");
    }
  }

  const input =
    "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-brand";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 font-body text-foreground">
      <div className="ambient pointer-events-none absolute inset-0" />
      <form onSubmit={submit} className="glass relative z-10 w-full max-w-sm space-y-4 rounded-2xl p-6">
        <div>
          <p className="font-display text-xl font-bold">
            FeloDesk <span className="text-brand">AI</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to use your tools." : "Create your free account."}
          </p>
        </div>
        <input className={input} type="email" required placeholder="Email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={6} placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {info && <p className="text-sm text-brand">{info}</p>}
        <button disabled={busy}
          className="gradient-brand w-full rounded-xl py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
