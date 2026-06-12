// The page the Garden home recommends starting on: the first sūrah the user
// is memorizing (else the first memorized sūrah), or page 1 if neither list
// has been set up yet. Mirrors GardenHome's hero/entry-card derivation
// (settings.memorizing[0] ?? settings.memorized[0]) so the Reader tab and a
// bare /reader always land where Home points — Browse remains the only way
// to open a specific, different page.

import { getSettings } from "@/features/settings/store";
import surahsData from "@/features/corpus/data/surahs.json";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

const surahs = surahsData as SurahIndexEntry[];
const surahByNumber = new Map(surahs.map((s) => [s.number, s]));

export function getRecommendedPage(): number {
  const settings = getSettings();
  const surahNum = settings.memorizing[0] ?? settings.memorized[0];
  if (!surahNum) return 1;
  return surahByNumber.get(surahNum)?.page ?? 1;
}
