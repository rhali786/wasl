"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MOOD_THEME } from "@/features/lib/timeOfDay";
import { useMood } from "@/features/shell/components/MoodContext";
import { Sprout } from "./components/Sprout";
import { GrowthVine } from "./components/GrowthVine";
import { BottomNav } from "@/features/nav/components/BottomNav";
import { getTotalSessions } from "@/features/history/store";
import { getRecommendedPage } from "@/features/reader/lib/recommendedPage";
import { getSettings } from "@/features/settings/store";
import { DEFAULT_SETTINGS, type Settings } from "@/features/settings/lib/types";
import { buildSessionPlan } from "@/features/session/lib/plan";
import surahsData from "@/features/corpus/data/surahs.json";
import openingsData from "@/features/corpus/data/openings.json";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

const surahs = surahsData as SurahIndexEntry[];
const openings = openingsData as Record<string, { arabic: string; meaning: string }>;
const surahByNumber = new Map(surahs.map((s) => [s.number, s]));

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
  sessions: sessionsProp,
  ayah: ayahProp,
}: {
  name?: string;
  sessions?: number;
  ayah?: WaitingAyah;
}) {
  // Mood comes from the app-wide shell (single source of truth). The weekday
  // is garden-only chrome; resolve it after mount to avoid a clock hydration
  // mismatch (the shell handles the same for the background wash).
  const mood = useMood();
  const [weekday, setWeekday] = useState("");
  const [sessions, setSessions] = useState(sessionsProp ?? 0);
  const [enterBase, setEnterBase] = useState("/reader/1");
  // Settings drive the hero ayah and session plan; load after mount (the
  // server has no localStorage, so SSR renders the neutral default).
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setWeekday(new Date().toLocaleDateString(undefined, { weekday: "long" }));
  }, []);

  useEffect(() => {
    if (sessionsProp === undefined) {
      setSessions(getTotalSessions());
    }
  }, [sessionsProp]);

  useEffect(() => {
    setEnterBase(`/reader/${getRecommendedPage()}`);
  }, []);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const theme = MOOD_THEME[mood];

  // The session plan and the hero it implies. The hero is the opening of what
  // the user is memorizing (else memorized); an explicit `ayah` prop overrides.
  const plan = useMemo(() => buildSessionPlan(settings, surahs), [settings]);
  const heroSurahNum = settings.memorizing[0] ?? settings.memorized[0];
  const derivedAyah: WaitingAyah | null = (() => {
    if (!heroSurahNum) return null;
    const opening = openings[String(heroSurahNum)];
    const meta = surahByNumber.get(heroSurahNum);
    if (!opening || !meta) return null;
    return {
      arabic: opening.arabic,
      meaning: opening.meaning,
      surah: meta.name,
      number: heroSurahNum,
      minutes: settings.sessionMinutes,
    };
  })();
  const ayah = ayahProp ?? derivedAyah ?? DEFAULT_AYAH;

  const planNames = plan.map((s) => s.name);
  const hasLists = settings.memorized.length + settings.memorizing.length > 0;

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 pb-32">
        {/* top: greeting + growth vine */}
        <header className="flex items-start justify-between pt-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
              {weekday ? `${weekday} · ${theme.label}` : theme.label}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              {theme.greeting(name)}
            </h1>
          </div>
          <GrowthVine sessions={sessions} className="mt-2 shrink-0" />
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
            <p className="font-display text-lg font-semibold italic leading-relaxed text-foreground">
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

        {/* session hint — what this return will hold (the 5:3:2 plan), or a
            gentle pointer to set up your sūrahs. Calm, never a nag. */}
        <div className="mt-6 text-center">
          {planNames.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Today’s path:{" "}
              <span className="text-foreground">{planNames.join(" · ")}</span>
            </p>
          ) : !hasLists ? (
            <Link href="/settings" className="text-sm text-garden-600 underline-offset-4 hover:underline">
              Set your sūrahs to shape your sessions
            </Link>
          ) : null}
        </div>

        {/* mode pick — the one choice (design-visual §mode selection) */}
        <div className="mt-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Enter as
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link
              href={`${enterBase}?mode=study`}
              className="flex flex-col items-start gap-2 rounded-2xl bg-primary px-4 py-3.5 text-left text-primary-foreground shadow-[0_16px_32px_-18px_var(--garden-500)]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm font-bold">
                S
              </span>
              <span className="font-semibold">Study</span>
              <span className="text-sm leading-snug opacity-90">
                Tap any word for its meaning — each tap is remembered and brought back for review.
              </span>
            </Link>
            <Link
              href={`${enterBase}?mode=mushaf`}
              className="flex flex-col items-start gap-2 rounded-2xl bg-card px-4 py-3.5 text-left text-foreground ring-1 ring-border"
            >
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm font-bold text-garden-700">
                M
              </span>
              <span className="font-semibold">Mushaf</span>
              <span className="text-sm leading-snug text-muted-foreground">
                Read the full page with all its marks, at your own pace — nothing is tracked.
              </span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
