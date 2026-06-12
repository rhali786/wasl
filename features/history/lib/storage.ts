// Persistence boundary for the return/movement history (v1 = localStorage;
// see features/review/lib/storage.ts for the established pattern). Guarded
// against `window === undefined` because 'use client' components render
// once on the server in Next.js before hydration.

import { logger } from "@/features/lib/logger";
import type { History } from "./types";

const STORAGE_KEY = "wird:history";

export function readHistory(): History {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as History;
  } catch (err) {
    logger.warn({ err }, "failed to parse stored history; resetting");
    return {};
  }
}

export function writeHistory(history: History): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    logger.error({ err }, "failed to persist history");
  }
}
