// One-time "how this works" explainer on the Garden home. New users (a child,
// say) don't get the two-room model or tap-to-reveal from the UI alone, so the
// first home visit shows a single dismissible card. Persisted so it never
// returns. Same localStorage guard pattern as reader/lib/readerMode.ts.

import { logger } from "@/features/lib/logger";

const STORAGE_KEY = "wird:howItWorksSeen";

export function readHowItWorksSeen(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function markHowItWorksSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch (err) {
    logger.error({ err }, "failed to persist how-it-works flag");
  }
}
