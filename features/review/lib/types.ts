// Word status types — see docs/design-interaction.md for the honesty model.

export type StatusLevel = 0 | 1 | 2 | 3 | 4;

export interface WordStatus {
  /** Normalized per-word-form id (see features/corpus/lib/normalize.ts). */
  id: string;
  level: StatusLevel;
  /** Total clean-read credits earned (Engine A); ceiling is not enforced here. */
  cleanReads: number;
}

/**
 * Clean-read counts required to reach levels 1/2/3/4
 * (Unknown -> Seen -> Familiar -> Recognized -> Known).
 */
export const THRESHOLDS = [1, 3, 6, 12] as const;

export const DEFAULT_STATUS: Omit<WordStatus, "id"> = { level: 0, cleanReads: 0 };

export function defaultStatus(id: string): WordStatus {
  return { id, ...DEFAULT_STATUS };
}
