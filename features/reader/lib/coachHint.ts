// One-time "tap a word" coach hint in the reader. The core loop (tap → reveal
// → status) is otherwise undiscoverable once you're on the page, so the first
// Study entry shows a single dismissible cue. Persisted so it never returns.
// Same localStorage guard pattern as readerMode.ts.

import { logger } from "@/features/lib/logger";

const STORAGE_KEY = "wird:readerCoachSeen";

export function readReaderCoachSeen(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function markReaderCoachSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch (err) {
    logger.error({ err }, "failed to persist reader coach-hint flag");
  }
}
