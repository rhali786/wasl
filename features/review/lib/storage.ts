// Persistence boundary for word statuses (v1 = localStorage; see
// docs/design-architecture.md for the local-first model). Guarded against
// `window === undefined` because 'use client' components render once on the
// server in Next.js before hydration.

import { logger } from "@/features/lib/logger";
import type { WordStatus } from "./types";

const STORAGE_KEY = "wird:wordStatuses";

export function readStatuses(): Record<string, WordStatus> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, WordStatus>;
  } catch (err) {
    logger.warn({ err }, "failed to parse stored word statuses; resetting");
    return {};
  }
}

export function writeStatuses(statuses: Record<string, WordStatus>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  } catch (err) {
    logger.error({ err }, "failed to persist word statuses");
  }
}
