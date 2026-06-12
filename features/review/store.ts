// Persisted word-status store. Wraps the pure honesty engine
// (features/review/lib/engine.ts) over the localStorage boundary
// (features/review/lib/storage.ts). See docs/design-interaction.md.

import { recordMovement, recordReturn } from "@/features/history/store";
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
  const next = demote(prev);
  all[id] = next;
  writeStatuses(all);
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
  const next = resolvePageFinish(all, pageWordIds, tappedIds);
  writeStatuses(next);

  let promotions = 0;
  for (const id of new Set(pageWordIds)) {
    const before = all[id]?.level ?? 0;
    const after = next[id]?.level ?? 0;
    if (after > before) promotions++;
  }
  if (promotions > 0) {
    recordMovement(promotions, 0);
  } else {
    recordReturn();
  }

  return next;
}
