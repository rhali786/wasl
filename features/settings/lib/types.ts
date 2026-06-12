// User settings — the memorized/memorizing sūrah lists that drive the session
// plan and home hero, plus session duration. Stored locally (v1 local-first).
// Sūrah identity is the canonical number 1–114 (SurahIndexEntry.number).

export interface Settings {
  /** Sūrahs the user has memorized (ḥifẓ). */
  memorized: number[];
  /** Sūrahs the user is currently memorizing. */
  memorizing: number[];
  /** Session length in minutes; adjusted in 5-minute increments. */
  sessionMinutes: number;
}

/** Session duration floor and step (design.md §53 — 5-minute increments). */
export const MIN_SESSION_MINUTES = 5;
export const SESSION_MINUTE_STEP = 5;

export const DEFAULT_SETTINGS: Settings = {
  memorized: [],
  memorizing: [],
  sessionMinutes: MIN_SESSION_MINUTES,
};
