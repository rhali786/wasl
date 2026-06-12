// Metrics palette — same green-on-ink language as the reader's undermark
// ticks (features/reader/components/Ticks.tsx), so the status spread reads
// as a continuation of the same visual system rather than a separate scale.

import { TICK_ON, TICK_OFF } from "@/features/reader/components/Ticks";

export { TICK_ON, TICK_OFF };

export const STATUS_LABELS = ["Unknown", "Seen", "Familiar", "Practiced", "Known"] as const;

/** 5-step alpha ramp on TICK_ON, anchored by TICK_OFF (Unknown) and TICK_ON (Known). */
export const STATUS_COLORS: readonly string[] = [
  TICK_OFF,
  "rgba(63,143,92,0.25)",
  "rgba(63,143,92,0.45)",
  "rgba(63,143,92,0.7)",
  TICK_ON,
];
