"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthState = "idle" | "sending" | "sent" | "error";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AuthState>("idle");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setState(error ? "error" : "sent");
  };

  return (
    <main className="h-full w-full bg-parchment flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-sand rounded-2xl p-6 flex flex-col gap-4">
        <h1 className="font-gtw text-3xl tracking-[-0.03em] text-ink">Align.</h1>
        <p className="font-body text-sm text-dusk">Enter your email for a magic link.</p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-border bg-parchment px-4 py-3 outline-none"
          placeholder="you@example.com"
          required
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-full bg-ink text-parchment py-3 font-body text-sm"
        >
          {state === "sending" ? "Sending..." : "Continue"}
        </button>
        {state === "sent" && (
          <button type="button" onClick={() => setState("idle")} className="text-sm text-dusk underline">
            Check your inbox. Send again
          </button>
        )}
        {state === "error" && <p className="text-sm text-terra">Couldn&apos;t send magic link. Try again.</p>}
      </form>
    </main>
  );
}
