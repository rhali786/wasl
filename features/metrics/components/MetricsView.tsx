"use client";

import { useEffect, useState } from "react";
import { getAllStatuses } from "@/features/review/store";
import {
  getDailyMovement,
  getMonthlyMovement,
  getReturnGrid,
  getTotalReturns,
  getTotalSessions,
} from "@/features/history/store";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";
import { computeStatusSpread, computeSurahPct, fmtK } from "../lib/computeStats";
import { StatusSpread } from "./StatusSpread";
import { SurahKnown, type SurahKnownItem } from "./SurahKnown";
import { ReturnsGrid } from "./ReturnsGrid";
import { DailyMovement } from "./DailyMovement";

export interface WordIndex {
  totalWords: number;
  allIds: string[];
  bySurah: Record<string, string[]>;
}

interface MetricsState {
  spread: number[];
  surahItems: SurahKnownItem[];
  totalReturns: number;
  totalSessions: number;
  monthlyMovement: { promotions: number; demotions: number };
  returnGrid: boolean[][];
  dailyMovement: { up: number; down: number }[];
}

const EMPTY_GRID: boolean[][] = Array.from({ length: 6 }, () => Array(7).fill(false));
const EMPTY_DAILY: { up: number; down: number }[] = Array.from({ length: 14 }, () => ({
  up: 0,
  down: 0,
}));

function emptyState(surahs: readonly SurahIndexEntry[], wordIndex: WordIndex): MetricsState {
  return {
    spread: [wordIndex.totalWords, 0, 0, 0, 0],
    surahItems: surahs.map((s) => ({ number: s.number, name: s.name, arabic: s.arabic, pct: 0 })),
    totalReturns: 0,
    totalSessions: 0,
    monthlyMovement: { promotions: 0, demotions: 0 },
    returnGrid: EMPTY_GRID,
    dailyMovement: EMPTY_DAILY,
  };
}

// Lifts app/prototypes/metrics-surahs into a real view fed by the review +
// history stores. SSR-safe: state starts at the all-Unknown/zero default and
// is replaced with real values from localStorage after mount.
export function MetricsView({
  surahs,
  wordIndex,
}: {
  surahs: SurahIndexEntry[];
  wordIndex: WordIndex;
}) {
  const [state, setState] = useState<MetricsState>(() => emptyState(surahs, wordIndex));

  useEffect(() => {
    const statuses = getAllStatuses();
    const spread = computeStatusSpread(wordIndex.allIds, statuses);
    const surahItems: SurahKnownItem[] = surahs.map((s) => ({
      number: s.number,
      name: s.name,
      arabic: s.arabic,
      pct: computeSurahPct(wordIndex.bySurah[String(s.number)] ?? [], statuses),
    }));
    setState({
      spread,
      surahItems,
      totalReturns: getTotalReturns(),
      totalSessions: getTotalSessions(),
      monthlyMovement: getMonthlyMovement(),
      returnGrid: getReturnGrid(),
      dailyMovement: getDailyMovement(),
    });
  }, [surahs, wordIndex]);

  const fullyLuminous = state.surahItems.filter((s) => s.pct === 1).length;
  const top4 = [...state.surahItems].sort((a, b) => b.pct - a.pct).slice(0, 4);
  const tend3 = state.surahItems
    .filter((s) => s.pct < 1)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-6 px-6 pb-32 pt-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Luminosity by surah
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">How clear each one is</h1>
        <p className="mt-1 text-sm font-medium text-foreground">
          {fullyLuminous > 0
            ? `${fullyLuminous} of ${surahs.length} surahs fully luminous`
            : "Every surah starts in the fog — your first sessions will begin to clear it."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {state.totalSessions} study session{state.totalSessions === 1 ? "" : "s"} completed
        </p>
      </header>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Most luminous
        </p>
        <SurahKnown items={top4} />
      </section>

      <section>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Tend next
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          where the fog is thickest — an invitation, not a score
        </p>
        <SurahKnown items={tend3} />
      </section>

      <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Daily movement
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            +{state.monthlyMovement.promotions} / −{state.monthlyMovement.demotions} this month
          </span>
        </div>
        <DailyMovement days={state.dailyMovement} />
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Across all words
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {fmtK(wordIndex.totalWords)} unique words
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Status moves only as you read: finishing a Study page clears the fog
          on the words you didn’t tap; tapping one for its meaning brings it
          back for review.
        </p>
        <StatusSpread counts={state.spread} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
            Returns
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {state.totalSessions} sessions · {state.totalReturns} days
          </span>
        </div>
        <ReturnsGrid weeks={state.returnGrid} />
      </section>
    </div>
  );
}
