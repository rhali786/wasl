// Persistence boundary for the active session (v1 = localStorage, so it
// survives the route push between reader pages). Same guarded pattern as
// features/review/lib/storage.ts. `null` means no session is active.

import { logger } from "@/features/lib/logger";
import { migrateLegacyKey, scopedKey } from "@/features/lib/userScope";
import type { Session } from "./types";

const BASE_KEY = "session";
const LEGACY_KEY = "wird:session";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  migrateLegacyKey(LEGACY_KEY, BASE_KEY);
  const raw = window.localStorage.getItem(scopedKey(BASE_KEY));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch (err) {
    logger.warn({ err }, "failed to parse stored session; clearing");
    return null;
  }
}

export function writeSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(scopedKey(BASE_KEY), JSON.stringify(session));
  } catch (err) {
    logger.error({ err }, "failed to persist session");
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(scopedKey(BASE_KEY));
}
