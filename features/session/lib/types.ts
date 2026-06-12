// Session types — a session is a continuous review sitting (time in the
// reader). It carries the 5:3:2 step plan, the per-form ids already moved
// (the once-per-session throttle), and timing. See docs/design-visual.md
// §Session model and docs/design-interaction.md §Session window.

export type SessionCategory = "memorized" | "memorizing" | "longer";

export interface SessionStep {
  category: SessionCategory;
  /** Sūrah number 1–114. */
  surah: number;
  /** Mushaf page where the sūrah begins (reader entry point). */
  page: number;
  name: string;
  /** Relative time weight (memorized 5 : memorizing 3 : longer 2). */
  weight: number;
}

export interface Session {
  id: string;
  /** Epoch ms when the session began. */
  startedAt: number;
  /** Planned length in ms (from settings.sessionMinutes). */
  durationMs: number;
  /** Normalized word-form ids already promoted/demoted this session. */
  movedIds: string[];
  plan: SessionStep[];
  /** Index into `plan` of the current step. */
  stepIndex: number;
}
