// Warm, repair-toned home greetings — English with Arabic beneath. One pair is
// chosen at random on each Garden home mount (see GardenHome.tsx).

export type GardenGreeting = {
  english: (name: string) => string;
  arabic: (name: string) => string;
};

export const GARDEN_GREETINGS: readonly GardenGreeting[] = [
  {
    english: (n) => `Good morning, ${n}`,
    arabic: (n) => `صَبَاحُ الخَيْرِ، يا ${n}`,
  },
  {
    english: (n) => `Welcome back, ${n}`,
    arabic: (n) => `أَهْلًا بِعَوْدَتِكَ، يا ${n}`,
  },
  {
    english: (n) => `Peace be upon you, ${n}`,
    arabic: (n) => `السَّلَامُ عَلَيْكَ، يا ${n}`,
  },
  {
    english: (n) => `Good evening, ${n}`,
    arabic: (n) => `مَسَاءُ الخَيْرِ، يا ${n}`,
  },
  {
    english: (n) => `The words are still here, ${n}`,
    arabic: (n) => `الكَلِمَاتُ مَا زَالَتْ هُنَا، يا ${n}`,
  },
  {
    english: (n) => `Glad you returned, ${n}`,
    arabic: (n) => `سُرِرْنَا بِعَوْدَتِكَ، يا ${n}`,
  },
  {
    english: (n) => `Another gentle return, ${n}`,
    arabic: (n) => `عَوْدَةٌ لَطِيفَةٌ أُخْرَى، يا ${n}`,
  },
  {
    english: (n) => `Take your time, ${n}`,
    arabic: (n) => `خُذْ وَقْتَكَ، يا ${n}`,
  },
  {
    english: (n) => `Ready when you are, ${n}`,
    arabic: (n) => `نَحْنُ جَاهِزُونَ عِنْدَمَا تَكُونُ، يا ${n}`,
  },
  {
    english: (n) => `May this sitting be blessed, ${n}`,
    arabic: (n) => `بَارَكَ اللَّهُ فِيكَ، يا ${n}`,
  },
  {
    english: (n) => `You belong here, ${n}`,
    arabic: (n) => `أَنْتَ مِنْ أَهْلِ هَذَا المَكَانِ، يا ${n}`,
  },
  {
    english: (n) => `A quiet moment awaits, ${n}`,
    arabic: (n) => `لَحْظَةٌ هَادِئَةٌ تَنْتَظِرُكَ، يا ${n}`,
  },
  {
    english: (n) => `Welcome, ${n}`,
    arabic: (n) => `أَهْلًا وَسَهْلًا، يا ${n}`,
  },
  {
    english: (n) => `Good to see you, ${n}`,
    arabic: (n) => `تَشَرَّفْنَا بِرُؤْيَتِكَ، يا ${n}`,
  },
  {
    english: (n) => `Continue at your pace, ${n}`,
    arabic: (n) => `وَاصِلْ عَلَى وَتِيرَتِكَ، يا ${n}`,
  },
] as const;

export function pickGreeting(index?: number): GardenGreeting {
  if (index !== undefined) {
    return GARDEN_GREETINGS[index % GARDEN_GREETINGS.length]!;
  }
  const i = Math.floor(Math.random() * GARDEN_GREETINGS.length);
  return GARDEN_GREETINGS[i]!;
}
