"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "../lib/email";
import { signUp } from "@/features/settings/store";

// First-run sign-up — email only, no password, no verification (v1 local-first).
export function OnboardingView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      signUp(email);
      router.replace("/");
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-16">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Welcome
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          Begin your return
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Enter your email to save your progress on this device. No password — just
          a quiet place to come back to.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl bg-card px-4 py-3.5 text-base text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-garden-500"
          />
        </label>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting || !email.trim()}
          className="h-12 w-full rounded-2xl text-base font-semibold"
        >
          {submitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
