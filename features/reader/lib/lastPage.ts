// Persists the last-visited reader page (the bottom nav's Reader tab opens
// here). v1 = localStorage; same guard pattern as
// features/review/lib/storage.ts.

import { logger } from "@/features/lib/logger";
import { TOTAL_PAGES } from "@/features/corpus/lib/types";

const STORAGE_KEY = "wird:lastPage";

export function readLastPage(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_PAGES) return 1;
  return n;
}

export function writeLastPage(page: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(page));
  } catch (err) {
    logger.error({ err }, "failed to persist last reader page");
  }
}
