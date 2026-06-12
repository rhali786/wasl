// Pure history-engine functions — no I/O. features/history/store.ts wires
// these to persistence. See docs/mvp-implementation-plan.md Phase 4.

import type { DayActivity, History } from "./types";

const EMPTY_DAY: DayActivity = { promotions: 0, demotions: 0 };

/** Local-date key, "YYYY-MM-DD". */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Mark `date` as a return day, if it isn't already (no-op if present). */
export function withReturn(history: History, date: Date): History {
  const key = dateKey(date);
  if (history[key]) return history;
  return { ...history, [key]: { ...EMPTY_DAY } };
}

/**
 * Add promotions/demotions to `date`'s entry (creating it if absent). The
 * entry existing is itself the return signal — no separate counter.
 */
export function withMovement(
  history: History,
  date: Date,
  promotions: number,
  demotions: number
): History {
  const key = dateKey(date);
  const prev = history[key] ?? EMPTY_DAY;
  return {
    ...history,
    [key]: {
      promotions: prev.promotions + promotions,
      demotions: prev.demotions + demotions,
    },
  };
}

export function totalReturns(history: History): number {
  return Object.keys(history).length;
}

/** Sum of promotions/demotions for days in the same calendar month as `now`. */
export function monthlyMovement(history: History, now: Date): DayActivity {
  const prefix = dateKey(now).slice(0, 7); // "YYYY-MM"
  let promotions = 0;
  let demotions = 0;
  for (const [key, day] of Object.entries(history)) {
    if (key.startsWith(prefix)) {
      promotions += day.promotions;
      demotions += day.demotions;
    }
  }
  return { promotions, demotions };
}

/**
 * `weeks` x 7 grid (oldest -> newest), `true` for days present in `history`,
 * for the `weeks * 7` days ending today (today is the last cell).
 */
export function returnGrid(history: History, now: Date, weeks = 6): boolean[][] {
  const totalDays = weeks * 7;
  const flat: boolean[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    flat.push(dateKey(d) in history);
  }
  const grid: boolean[][] = [];
  for (let w = 0; w < weeks; w++) {
    grid.push(flat.slice(w * 7, w * 7 + 7));
  }
  return grid;
}

/**
 * Last `days` days (oldest -> newest, today last) as `{up, down}` pairs;
 * zero-filled for days with no recorded movement.
 */
export function dailyMovement(
  history: History,
  now: Date,
  days = 14
): { up: number; down: number }[] {
  const result: { up: number; down: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const entry = history[dateKey(d)];
    result.push({ up: entry?.promotions ?? 0, down: entry?.demotions ?? 0 });
  }
  return result;
}
