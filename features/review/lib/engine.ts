// Pure honesty-engine functions — see docs/design-interaction.md.
// No I/O here; features/review/store.ts wires these to persistence.

import { defaultStatus, THRESHOLDS, type StatusLevel, type WordStatus } from "./types";

/** Step function: how many clean reads map to which status level. */
export function levelFor(cleanReads: number): StatusLevel {
  if (cleanReads >= THRESHOLDS[3]) return 4;
  if (cleanReads >= THRESHOLDS[2]) return 3;
  if (cleanReads >= THRESHOLDS[1]) return 2;
  if (cleanReads >= THRESHOLDS[0]) return 1;
  return 0;
}

/**
 * Engine A — a clean read (an untapped word on a finished page) earns one
 * credit; level recomputes from the new total. Known (4) is the ceiling.
 */
export function applyCleanRead(status: WordStatus): WordStatus {
  const cleanReads = status.cleanReads + 1;
  return { ...status, cleanReads, level: levelFor(cleanReads) };
}

/**
 * Engine B — Study mode only. Tapping a word to reveal its meaning steps it
 * down one level immediately. cleanReads resets to the new level's threshold
 * floor, so re-climbing to the previous level costs the right number of
 * clean reads (not just one).
 */
export function demote(status: WordStatus): WordStatus {
  const level = Math.max(0, status.level - 1) as StatusLevel;
  const cleanReads = level === 0 ? 0 : THRESHOLDS[level - 1];
  return { ...status, level, cleanReads };
}

/**
 * Engine A entry point — finishing a page. For each unique word-form id on
 * the page that was NOT tapped during the session, apply one clean read.
 * Per-form sharing: an id tapped via any occurrence on the page is excluded
 * entirely, even if other occurrences of the same form went untapped.
 */
export function resolvePageFinish(
  statuses: Readonly<Record<string, WordStatus>>,
  pageWordIds: readonly string[],
  tappedIds: ReadonlySet<string>
): Record<string, WordStatus> {
  const result: Record<string, WordStatus> = { ...statuses };
  const uniqueIds = new Set(pageWordIds);
  for (const id of uniqueIds) {
    if (tappedIds.has(id)) continue;
    const prev = result[id] ?? defaultStatus(id);
    result[id] = applyCleanRead(prev);
  }
  return result;
}
