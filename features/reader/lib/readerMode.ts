// Persists the reader's Study/Mushaf mode so it survives page-to-page
// navigation (the route push between /reader/N pages carries no query
// string). v1 = localStorage; same guard pattern as
// features/review/lib/storage.ts and lastPage.ts.

import { logger } from "@/features/lib/logger";
import type { ReaderMode } from "./types";

const STORAGE_KEY = "wird:readerMode";

export function readReaderMode(): ReaderMode {
  if (typeof window === "undefined") return "study";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "mushaf" ? "mushaf" : "study";
}

export function writeReaderMode(mode: ReaderMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch (err) {
    logger.error({ err }, "failed to persist reader mode");
  }
}
