// Warm, repair-toned home greetings — English with Arabic beneath. One pair is
// chosen at random on each Garden home mount, filtered to match the current
// time-of-day mood (see GardenHome.tsx).

import type { Mood } from "@/features/lib/timeOfDay";

const ANY_TIME: readonly Mood[] = ["morning", "midday", "evening", "night"];

export type GardenGreeting = {
  english: (name: string) => string;
  arabic: (name: string) => string;
  /** Which moods this greeting may appear in — never cross morning/evening/night. */
  moods: readonly Mood[];
};

export const GARDEN_GREETINGS: readonly GardenGreeting[] = [
  {
    english: (n) => `Good morning, ${n}`,
    arabic: (n) => `صَبَاحُ الخَيْرِ، يا ${n}`,
    moods: ["morning"],
  },
  {
    english: (n) => `Welcome back, ${n}`,
    arabic: (n) => `أَهْلًا بِعَوْدَتِكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Peace be upon you, ${n}`,
    arabic: (n) => `السَّلَامُ عَلَيْكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Good evening, ${n}`,
    arabic: (n) => `مَسَاءُ الخَيْرِ، يا ${n}`,
    moods: ["evening"],
  },
  {
    english: (n) => `The words are still here, ${n}`,
    arabic: (n) => `الكَلِمَاتُ مَا زَالَتْ هُنَا، يا ${n}`,
    moods: ["night"],
  },
  {
    english: (n) => `Glad you returned, ${n}`,
    arabic: (n) => `سُرِرْنَا بِعَوْدَتِكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Another gentle return, ${n}`,
    arabic: (n) => `عَوْدَةٌ لَطِيفَةٌ أُخْرَى، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Take your time, ${n}`,
    arabic: (n) => `خُذْ وَقْتَكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Ready when you are, ${n}`,
    arabic: (n) => `نَحْنُ جَاهِزُونَ عِنْدَمَا تَكُونُ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `May this sitting be blessed, ${n}`,
    arabic: (n) => `بَارَكَ اللَّهُ فِيكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `You belong here, ${n}`,
    arabic: (n) => `أَنْتَ مِنْ أَهْلِ هَذَا المَكَانِ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `A quiet moment awaits, ${n}`,
    arabic: (n) => `لَحْظَةٌ هَادِئَةٌ تَنْتَظِرُكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Welcome, ${n}`,
    arabic: (n) => `أَهْلًا وَسَهْلًا، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Good to see you, ${n}`,
    arabic: (n) => `تَشَرَّفْنَا بِرُؤْيَتِكَ، يا ${n}`,
    moods: ANY_TIME,
  },
  {
    english: (n) => `Continue at your pace, ${n}`,
    arabic: (n) => `وَاصِلْ عَلَى وَتِيرَتِكَ، يا ${n}`,
    moods: ANY_TIME,
  },
] as const;

export function greetingsForMood(mood: Mood): readonly GardenGreeting[] {
  return GARDEN_GREETINGS.filter((g) => g.moods.includes(mood));
}

export function pickGreeting(mood: Mood, index?: number): GardenGreeting {
  const pool = greetingsForMood(mood);
  if (index !== undefined) {
    return pool[index % pool.length]!;
  }
  const i = Math.floor(Math.random() * pool.length);
  return pool[i]!;
}
