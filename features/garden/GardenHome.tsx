"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { moodForHour, MOOD_THEME, type Mood } from "./lib/timeOfDay";
import { Sprout } from "./components/Sprout";
import { GrowthVine } from "./components/GrowthVine";
import { BottomNav } from "@/features/nav/components/BottomNav";
import { getTotalReturns } from "@/features/history/store";
import { readLastPage } from "@/features/reader/lib/lastPage";

export type WaitingAyah = {
  arabic: string;
  meaning: string;
  surah: string;
  number: number;
  minutes: number;
};

// Mock data until the local-first corpus/store exists (v1 local-first).
const DEFAULT_AYAH: WaitingAyah = {
  arabic: "إِذَا زُلْزِلَتِ ٱلْأَرْضُ زِلْزَالَهَا",
  meaning: "When the earth is shaken with its quaking.",
  surah: "Az-Zalzalah",
  number: 99,
  minutes: 5,
};

// The Garden home (Mushaf-forward). The waiting ayah is the hero; a faint
// sprout sits behind it as atmosphere; a growing vine carries returns; the
// background shifts with time of day. See design-visual.md §Garden home.
export function GardenHome({
  name = "Rasheed",
  returns: returnsProp,
  ayah = DEFAULT_AYAH,
}: {
  name?: string;
  returns?: number;
  ayah?: WaitingAyah;
}) {
  // Start mood-neutral for SSR, resolve to the user's local time after mount
  // (avoids a server/client hydration mismatch on the clock).
  const [now, setNow] = useState<{ mood: Mood; weekday: string }>({
    mood: "midday",
    weekday: "",
  });
  const [returns, setReturns] = useState(returnsProp ?? 0);
  const [readerHref, setReaderHref] = useState("/reader/1");

  useEffect(() => {
    const d = new Date();
    setNow({
      mood: moodForHour(d.getHours()),
      weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    });
  }, []);

  useEffect(() => {
    if (returnsProp === undefined) {
      setReturns(getTotalReturns());
    }
  }, [returnsProp]);

  useEffect(() => {
    setReaderHref(`/reader/${readLastPage()}`);
  }, []);

  const theme = MOOD_THEME[now.mood];

  return (
    <div
      className={`relative flex min-h-full flex-1 flex-col ${theme.dark ? "dark " : ""}${theme.bg}`}
    >
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 pb-32">
        {/* top: greeting + growth vine */}
        <header className="flex items-start justify-between pt-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
              {now.weekday ? `${now.weekday} · ${theme.label}` : theme.label}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              {theme.greeting(name)}
            </h1>
          </div>
          <GrowthVine returns={returns} className="mt-2 shrink-0" />
        </header>

        {/* hero: the waiting ayah, faint sprout behind it */}
        <main className="relative flex flex-1 flex-col items-center justify-center text-center">
          <Sprout
            size={232}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p dir="rtl" className="font-arabic text-[2.15rem] leading-[2.5] text-foreground">
              {ayah.arabic}
            </p>
            <p className="font-display text-lg italic leading-relaxed text-foreground/70">
              {ayah.meaning}
            </p>
          </div>
          <div className="relative z-10 mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{ayah.surah}</span>
            <span className="text-garden-300">·</span>
            <span>sūrah {ayah.number}</span>
            <span className="text-garden-300">·</span>
            <span>~{ayah.minutes} min</span>
          </div>
        </main>

        {/* mode pick — the one choice (design-visual §mode selection) */}
        <div className="mt-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Enter as
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link
              href={`${readerHref}?mode=study`}
              className="flex flex-col items-start gap-2 rounded-2xl bg-primary px-4 py-3.5 text-left text-primary-foreground shadow-[0_16px_32px_-18px_var(--garden-500)]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm font-bold">
                S
              </span>
              <span className="font-semibold">Study</span>
              <span className="text-xs opacity-80">Reads track your words</span>
            </Link>
            <Link
              href={`${readerHref}?mode=mushaf`}
              className="flex flex-col items-start gap-2 rounded-2xl bg-card px-4 py-3.5 text-left text-foreground ring-1 ring-border"
            >
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm font-bold text-garden-700">
                M
              </span>
              <span className="font-semibold">Mushaf</span>
              <span className="text-xs text-muted-foreground">Read freely, no tracking</span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
