// Per-day return + movement log. A "return" is any day with reading
// activity (Study tap or page finish); "movement" is promotions/demotions
// observed that day. Not derivable from WordStatus alone — see
// docs/mvp-implementation-plan.md Phase 4.

export interface DayActivity {
  promotions: number;
  demotions: number;
}

/** Keyed by local date "YYYY-MM-DD". */
export type History = Record<string, DayActivity>;
