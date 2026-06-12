// Pure stat-computation helpers — fed by the real review store + corpus
// word index. No I/O here.

import type { WordStatus } from "@/features/review/lib/types";

/** Per-level (0-4) counts across `allIds`; ids missing from `statuses` count as level 0. */
export function computeStatusSpread(
  allIds: readonly string[],
  statuses: Record<string, WordStatus>
): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const id of allIds) {
    const level = statuses[id]?.level ?? 0;
    counts[level]++;
  }
  return counts;
}

/** Fraction (0-1) of `ids` at level 4 (Known). 0 for an empty list. */
export function computeSurahPct(
  ids: readonly string[],
  statuses: Record<string, WordStatus>
): number {
  if (ids.length === 0) return 0;
  const known = ids.filter((id) => (statuses[id]?.level ?? 0) === 4).length;
  return known / ids.length;
}

/** Compact large counts: 1600 -> "1.6k", 14697 -> "14.7k". */
export function fmtK(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}
