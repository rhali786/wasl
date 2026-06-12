"use client";

import { createContext, useContext } from "react";
import type { Mood } from "@/features/lib/timeOfDay";

// The current time-of-day mood, shared app-wide by MoodShell so any screen
// (Garden greeting, reader accent, etc.) reads a single source of truth.
// Defaults to the SSR-neutral "midday" until the shell resolves the clock.
export const MoodContext = createContext<Mood>("midday");

export function useMood(): Mood {
  return useContext(MoodContext);
}
