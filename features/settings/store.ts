// Settings store — thin read/update helpers over the localStorage boundary.
// Toggling a sūrah into "memorized" removes it from "memorizing" (a sūrah is
// either still being learned or already held, never both).

import {
  displayNameFromEmail,
  isValidEmail,
} from "@/features/onboarding/lib/email";
import { logger } from "@/features/lib/logger";
import { scopedKey } from "@/features/lib/userScope";
import { MIN_SESSION_MINUTES, SESSION_MINUTE_STEP, type Settings } from "./lib/types";
import { readSettings, writeSettings } from "./lib/storage";

export function getSettings(): Settings {
  return readSettings();
}

/** True when a new user still needs the email sign-up screen. */
export function needsOnboarding(): boolean {
  const s = readSettings();
  if (s.onboardingComplete) return false;
  // Grandfather existing local users who were already using the app.
  if (s.memorized.length > 0 || s.memorizing.length > 0) return false;
  if (typeof window !== "undefined") {
    // Check both pre-scoping legacy keys and the post-migration "guest" scope —
    // migration runs lazily on first read, so either may hold the data.
    if (window.localStorage.getItem("wird:wordStatuses")) return false;
    if (window.localStorage.getItem("wird:completedSessions")) return false;
    if (window.localStorage.getItem(scopedKey("wordStatuses"))) return false;
    if (window.localStorage.getItem(scopedKey("completedSessions"))) return false;
  }
  return true;
}

/** Stores the given email locally, completes onboarding, and clears any sign-out. */
function saveAccountEmail(email: string): Settings {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    throw new Error("invalid email");
  }
  const next: Settings = {
    ...readSettings(),
    email: normalized,
    name: displayNameFromEmail(normalized),
    onboardingComplete: true,
    signedOut: false,
  };
  writeSettings(next);
  return next;
}

/** Passwordless sign-up — stores email locally and finishes onboarding. */
export function signUp(email: string): Settings {
  return saveAccountEmail(email);
}

/** Passwordless sign-in (returning, signed-out user) — same as sign-up. */
export function signIn(email: string): Settings {
  return saveAccountEmail(email);
}

/** True once the user has logged out and hasn't signed back in. */
export function needsLogin(): boolean {
  return readSettings().signedOut === true;
}

/** Logs the user out — clears the local account identity, keeps reading progress. */
export function signOut(): Settings {
  const next: Settings = {
    ...readSettings(),
    email: undefined,
    name: undefined,
    signedOut: true,
  };
  writeSettings(next);
  return next;
}

/**
 * Irreversibly erase everything this app stores on the device — account
 * identity, settings, word statuses, session history. v1 is local-first, so
 * this is the full "delete my account and data". The caller routes the user
 * back to onboarding afterwards.
 */
export function deleteAccountAndData(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.clear();
  } catch (err) {
    logger.error({ err }, "failed to clear local data");
  }
}

/** Set or clear the display name shown in greetings and Settings. */
export function setName(name: string): Settings {
  const trimmed = name.trim();
  const next: Settings = { ...readSettings(), name: trimmed || undefined };
  writeSettings(next);
  return next;
}

function without(list: number[], surah: number): number[] {
  return list.filter((n) => n !== surah);
}

/** Toggle a sūrah's membership in the memorized list (mutually exclusive with memorizing). */
export function toggleMemorized(surah: number): Settings {
  const s = readSettings();
  const has = s.memorized.includes(surah);
  const next: Settings = {
    ...s,
    memorized: has ? without(s.memorized, surah) : [...s.memorized, surah],
    memorizing: has ? s.memorizing : without(s.memorizing, surah),
  };
  writeSettings(next);
  return next;
}

/** Toggle a sūrah's membership in the memorizing list. No-op if already memorized. */
export function toggleMemorizing(surah: number): Settings {
  const s = readSettings();
  if (s.memorized.includes(surah)) return s;
  const has = s.memorizing.includes(surah);
  const next: Settings = {
    ...s,
    memorizing: has ? without(s.memorizing, surah) : [...s.memorizing, surah],
  };
  writeSettings(next);
  return next;
}

/** Adjust session length by whole 5-minute steps, never below the floor. */
export function setSessionMinutes(minutes: number): Settings {
  const clamped = Math.max(
    MIN_SESSION_MINUTES,
    Math.round(minutes / SESSION_MINUTE_STEP) * SESSION_MINUTE_STEP
  );
  const next: Settings = { ...readSettings(), sessionMinutes: clamped };
  writeSettings(next);
  return next;
}
