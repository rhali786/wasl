// Settings store — thin read/update helpers over the localStorage boundary.
// Toggling a sūrah into "memorized" removes it from "memorizing" (a sūrah is
// either still being learned or already held, never both).

import { MIN_SESSION_MINUTES, SESSION_MINUTE_STEP, type Settings } from "./lib/types";
import { readSettings, writeSettings } from "./lib/storage";

export function getSettings(): Settings {
  return readSettings();
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
