// Time-of-day moods for the Garden home. The background/environment shifts
// across the day (design-visual.md §home screen); the tree backdrop stays
// mood-neutral. Pure + framework-free so it is trivially testable.

export type Mood = "morning" | "midday" | "evening" | "night";

export function moodForHour(hour: number): Mood {
  const h = ((Math.floor(hour) % 24) + 24) % 24; // tolerate any int
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "midday";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

export type MoodTheme = {
  label: string;
  dark: boolean;
  /** Tailwind classes for the full-screen background wash. */
  bg: string;
  /** Warm, repair-toned greeting (design-voice). */
  greeting: (name: string) => string;
};

export const MOOD_THEME: Record<Mood, MoodTheme> = {
  morning: {
    label: "Morning",
    dark: false,
    bg: "bg-gradient-to-b from-sand-100 via-white to-garden-50",
    greeting: (name) => `Good morning, ${name}`,
  },
  midday: {
    label: "Midday",
    dark: false,
    bg: "bg-gradient-to-b from-garden-100 via-white to-white",
    greeting: (name) => `Merhaba, ${name}`,
  },
  evening: {
    label: "Evening",
    dark: false,
    bg: "bg-gradient-to-b from-sand-200 via-sand-100 to-garden-50",
    greeting: (name) => `Good evening, ${name}`,
  },
  night: {
    label: "Night",
    dark: true,
    bg: "bg-[radial-gradient(120%_90%_at_70%_-10%,#10301d_0%,#0a1c12_45%,#06120b_100%)]",
    greeting: (name) => `The words are still here, ${name}`,
  },
};
