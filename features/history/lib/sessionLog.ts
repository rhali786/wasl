// Completed Study sessions — one leaf on the home vine per entry. Multiple
// sessions on the same calendar day each count separately (unlike the
// per-day Returns grid, which marks whether you read that day at all).

import { logger } from "@/features/lib/logger";

const STORAGE_KEY = "wird:completedSessions";

export function readCompletedSessions(): number[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch (err) {
    logger.warn({ err }, "failed to parse completed sessions; resetting");
    return [];
  }
}

export function writeCompletedSessions(completedAt: number[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedAt));
  } catch (err) {
    logger.error({ err }, "failed to persist completed sessions");
  }
}

/** Record a finished Study session (called from session/store endSession). */
export function recordSessionComplete(now: number = Date.now()): void {
  writeCompletedSessions([...readCompletedSessions(), now]);
}

export function getTotalSessions(): number {
  return readCompletedSessions().length;
}
