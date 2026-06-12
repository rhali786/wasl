// Persisted word-status store. Wraps the pure honesty engine
// (features/review/lib/engine.ts) over the localStorage boundary
// (features/review/lib/storage.ts). See docs/design-interaction.md.

import { recordMovement, recordReturn } from "@/features/history/store";
import { hasMoved, markMoved } from "@/features/session/store";
import { demote, resolvePageFinish } from "./lib/engine";
import { readStatuses, writeStatuses } from "./lib/storage";
import { defaultStatus, type WordStatus } from "./lib/types";

export function getStatus(id: string): WordStatus {
  const all = readStatuses();
  return all[id] ?? defaultStatus(id);
}

export function getStatuses(ids: readonly string[]): Record<string, WordStatus> {
  const all = readStatuses();
  const result: Record<string, WordStatus> = {};
  for (const id of ids) {
    result[id] = all[id] ?? defaultStatus(id);
  }
  return result;
}

export function getAllStatuses(): Record<string, WordStatus> {
  return readStatuses();
}

/** Engine B — Study mode only. Demotes id by one level (live) and persists it. */
export function demoteWord(id: string): WordStatus {
  const all = readStatuses();
  const prev = all[id] ?? defaultStatus(id);
  // Once-per-session: a word-form already moved this session does not move
  // again, no matter how many times it is tapped.
  if (hasMoved(id)) return prev;
  const next = demote(prev);
  all[id] = next;
  writeStatuses(all);
  markMoved([id]);
  if (next.level < prev.level) {
    recordMovement(0, 1);
  } else {
    recordReturn();
  }
  return next;
}

/** Engine A entry point — finishing a page promotes untapped word-forms. */
export function finishPage(
  pageWordIds: readonly string[],
  tappedIds: ReadonlySet<string>
): Record<string, WordStatus> {
  const all = readStatuses();
  // Exclude tapped words AND any word-form already moved this session, so
  // flipping back and forth across pages never re-promotes the same form.
  const excluded = new Set(tappedIds);
  for (const id of new Set(pageWordIds)) {
    if (hasMoved(id)) excluded.add(id);
  }
  const next = resolvePageFinish(all, pageWordIds, excluded);
  writeStatuses(next);

  let promotions = 0;
  const promotedIds: string[] = [];
  for (const id of new Set(pageWordIds)) {
    const before = all[id]?.level ?? 0;
    const after = next[id]?.level ?? 0;
    if (after > before) {
      promotions++;
      promotedIds.push(id);
    }
  }
  markMoved(promotedIds);
  if (promotions > 0) {
    recordMovement(promotions, 0);
  } else {
    recordReturn();
  }

  return next;
}
