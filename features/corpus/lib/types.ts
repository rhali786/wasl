// Canonical corpus types for a snapshotted Madani mushaf page (quran.com
// API v4). One JSON file per page lives under features/corpus/data/pages/.

export type CorpusWordType = "word" | "end";

export interface CorpusWord {
  /** Uthmani text as rendered on the page. */
  t: string;
  /** English gloss (quran.com translation for this word). */
  en: string;
  /** "word" for ordinary words, "end" for ayah-end markers. */
  type: CorpusWordType;
  /** Ayah number within the surah. */
  ayah: number;
  /** Verse key, e.g. "4:7". */
  key: string;
  /** Normalized per-word-form id (normalize(t)); shared status key. */
  id: string;
}

export interface CorpusLine {
  /** 1-indexed line number on the page (1-15 for a Madani page). */
  line: number;
  words: CorpusWord[];
}

export interface CorpusPage {
  page: number;
  surah: string;
  surahAr: string;
  juz: number | null;
  firstVerse: string;
  lastVerse: string;
  lines: CorpusLine[];
}

/** Total number of Madani mushaf pages snapshotted under data/pages/. */
export const TOTAL_PAGES = 604;

/** One entry per surah in the fihris (Browse), see scripts/build-surahs.ts. */
export interface SurahIndexEntry {
  number: number;
  name: string;
  arabic: string;
  /** Page on which this surah's ayah 1 first appears. */
  page: number;
  juz: number | null;
}
