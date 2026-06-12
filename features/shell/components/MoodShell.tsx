"use client";

import { useEffect, useState } from "react";
import { moodForHour, MOOD_THEME, type Mood } from "@/features/lib/timeOfDay";
import { MoodContext } from "./MoodContext";

// App-wide time-of-day wash. Wraps every screen (mounted in app/layout.tsx)
// so the home, reader, browse, metrics and settings all shift with the clock
// and go dark at night — the user's "every screen, like the home" direction.
//
// Mood resolves only after mount: the server has no clock, so we render the
// neutral "midday" first and update on the client to avoid a hydration
// mismatch (same pattern as features/garden/GardenHome.tsx).
export function MoodShell({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<Mood>("midday");

  useEffect(() => {
    setMood(moodForHour(new Date().getHours()));
  }, []);

  const theme = MOOD_THEME[mood];

  return (
    <MoodContext.Provider value={mood}>
      <div
        className={`relative flex min-h-full flex-1 flex-col transition-colors duration-700 ${
          theme.dark ? "dark " : ""
        }${theme.bg}`}
      >
        {children}
      </div>
    </MoodContext.Provider>
  );
}
