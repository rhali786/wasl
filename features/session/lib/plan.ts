// Pure session-planning logic — builds the 5:3:2 step plan from the user's
// memorized/memorizing lists and ranks breadth sūrahs by length. No I/O.
// See docs/design-visual.md §24-33 and docs/design-voice.md §53-54.

import { TOTAL_PAGES, type SurahIndexEntry } from "@/features/corpus/lib/types";
import type { Settings } from "@/features/settings/lib/types";
import type { SessionCategory, SessionStep } from "./types";

const WEIGHTS: Record<SessionCategory, number> = {
  memorizing: 5,
  memorized: 3,
  longer: 2,
};

/**
 * Approximate each sūrah's length by the page span until the next sūrah
 * (chapters.json carries no verse counts). Coarse for short sūrahs but
 * accurate for ranking the long ones, which is all the breadth step needs.
 */
function lengthByPageSpan(surahs: readonly SurahIndexEntry[]): Map<number, number> {
  const sorted = [...surahs].sort((a, b) => a.number - b.number);
  const lengths = new Map<number, number>();
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i].page;
    const end = i + 1 < sorted.length ? sorted[i + 1].page : TOTAL_PAGES + 1;
    lengths.set(sorted[i].number, end - start);
  }
  return lengths;
}

/**
 * Build the ordered session plan. One step per category that has content:
 * memorizing (first — what's being worked on), memorized (second), then a
 * breadth step (the longest sūrah the user hasn't selected). Empty lists →
 * empty plan (the home shows the "set your sūrahs" prompt instead).
 */
export function buildSessionPlan(
  settings: Settings,
  surahs: readonly SurahIndexEntry[]
): SessionStep[] {
  const byNumber = new Map(surahs.map((s) => [s.number, s]));
  const steps: SessionStep[] = [];

  const push = (category: SessionCategory, surahNum: number) => {
    const s = byNumber.get(surahNum);
    if (!s) return;
    steps.push({
      category,
      surah: s.number,
      page: s.page,
      name: s.name,
      weight: WEIGHTS[category],
    });
  };

  if (settings.memorizing.length) push("memorizing", settings.memorizing[0]);
  if (settings.memorized.length) push("memorized", settings.memorized[0]);

  const engaged = settings.memorized.length + settings.memorizing.length > 0;
  if (engaged) {
    const used = new Set([...settings.memorized, ...settings.memorizing]);
    const lengths = lengthByPageSpan(surahs);
    const longest = surahs
      .filter((s) => !used.has(s.number))
      .sort(
        (a, b) =>
          (lengths.get(b.number) ?? 0) - (lengths.get(a.number) ?? 0) ||
          a.number - b.number
      )[0];
    if (longest) push("longer", longest.number);
  }

  return steps;
}

/** Split a total duration across the plan's steps by their normalized weights. */
export function stepDurations(plan: readonly SessionStep[], totalMs: number): number[] {
  const totalWeight = plan.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return [];
  return plan.map((s) => Math.round((totalMs * s.weight) / totalWeight));
}
