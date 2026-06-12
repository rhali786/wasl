"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";
import { Button } from "@/components/ui/button";
import { SESSION_MINUTE_STEP, type Settings } from "../lib/types";
import {
  getSettings,
  setSessionMinutes,
  signOut,
  toggleMemorized,
  toggleMemorizing,
} from "../store";

// Settings — the user picks which sūrahs they've memorized / are memorizing
// (these drive the session plan and home hero) and tunes session length.
// A Garden hub screen: calm, semantic palette, no dashboards.
export function SettingsView({ surahs }: { surahs: SurahIndexEntry[] }) {
  const router = useRouter();
  // SSR-neutral defaults; real settings load after mount (localStorage).
  const [settings, setSettings] = useState<Settings>(getSettings);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function handleLogOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 pb-28 pt-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Settings
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Your review</h1>
      </header>

      {/* Session length — 5-minute increments */}
      <section className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Session length
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => setSettings(setSessionMinutes(settings.sessionMinutes - SESSION_MINUTE_STEP))}
            aria-label="Decrease session length"
            className="grid size-10 place-items-center rounded-full bg-card text-foreground ring-1 ring-border disabled:opacity-30"
          >
            <Minus className="size-4" strokeWidth={1.75} />
          </button>
          <span
            data-testid="session-minutes"
            className="min-w-[5ch] text-center text-lg font-semibold tabular-nums text-foreground"
          >
            {settings.sessionMinutes} min
          </span>
          <button
            onClick={() => setSettings(setSessionMinutes(settings.sessionMinutes + SESSION_MINUTE_STEP))}
            aria-label="Increase session length"
            className="grid size-10 place-items-center rounded-full bg-card text-foreground ring-1 ring-border"
          >
            <Plus className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </section>

      {/* Your sūrahs — memorized / memorizing pickers */}
      <section className="mt-8 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Your sūrahs
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your session draws from these. The rest become breadth.
        </p>
        <ul className="mt-3 flex flex-col gap-1">
          {surahs.map((surah) => {
            const isMemorized = settings.memorized.includes(surah.number);
            const isMemorizing = settings.memorizing.includes(surah.number);
            return (
              <li
                key={surah.number}
                className="flex items-center gap-3 rounded-xl px-2 py-2"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-garden-700">
                  {surah.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {surah.name}
                  </span>
                </span>
                <span dir="rtl" className="font-arabic text-base text-foreground/80">
                  {surah.arabic}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => setSettings(toggleMemorized(surah.number))}
                    aria-label={`Memorized: ${surah.name}`}
                    aria-pressed={isMemorized}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors ${
                      isMemorized
                        ? "bg-primary text-primary-foreground ring-transparent"
                        : "bg-transparent text-muted-foreground ring-border"
                    }`}
                  >
                    Memorized
                  </button>
                  <button
                    onClick={() => setSettings(toggleMemorizing(surah.number))}
                    aria-label={`Memorizing: ${surah.name}`}
                    aria-pressed={isMemorizing}
                    disabled={isMemorized}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors disabled:opacity-30 ${
                      isMemorizing
                        ? "bg-gold text-forest ring-transparent"
                        : "bg-transparent text-muted-foreground ring-border"
                    }`}
                  >
                    Memorizing
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Account — local email identity, sign out returns to /login */}
      <section className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Account
        </p>
        {settings.email ? (
          <p className="mt-1 text-sm text-muted-foreground">{settings.email}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleLogOut}
          className="mt-3 h-10 w-full rounded-2xl text-sm font-semibold"
        >
          Log out
        </Button>
      </section>
    </div>
  );
}
