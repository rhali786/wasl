// Build the surah index for the Browse fihris: for each of the 114 surahs,
// find the page on which its ayah 1 first appears. Page-level
// surah/firstVerse metadata is unreliable for this (a page can contain
// multiple short surahs — e.g. page 604 covers surahs 112-114 but its
// top-level `surah` field is "Al-Ikhlas"), so this scans word-level `key`s
// (format "surah:ayah") for the first ":1" of each surah.
//
//   npx tsx features/corpus/scripts/build-surahs.ts

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CorpusPage, SurahIndexEntry } from "../lib/types";
import { TOTAL_PAGES } from "../lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PAGES_DIR = path.join(DATA_DIR, "pages");

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function loadPage(page: number): CorpusPage {
  return JSON.parse(readFileSync(path.join(PAGES_DIR, `${pad(page)}.json`), "utf8"));
}

type ChapterMap = Record<string, { name: string; arabic: string }>;

function main() {
  const chapters: ChapterMap = JSON.parse(
    readFileSync(path.join(DATA_DIR, "chapters.json"), "utf8")
  );

  const starts = new Map<number, { page: number; juz: number | null }>();

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const data = loadPage(page);
    for (const line of data.lines) {
      for (const word of line.words) {
        const [surahStr, ayahStr] = word.key.split(":");
        if (ayahStr !== "1") continue;
        const surahNum = Number(surahStr);
        if (!starts.has(surahNum)) {
          starts.set(surahNum, { page, juz: data.juz });
        }
      }
    }
  }

  const entries: SurahIndexEntry[] = [];
  for (let number = 1; number <= 114; number++) {
    const chapter = chapters[String(number)];
    const start = starts.get(number);
    if (!chapter || !start) {
      throw new Error(`missing surah index data for surah ${number}`);
    }
    entries.push({
      number,
      name: chapter.name,
      arabic: chapter.arabic,
      page: start.page,
      juz: start.juz,
    });
  }

  writeFileSync(path.join(DATA_DIR, "surahs.json"), JSON.stringify(entries, null, 2) + "\n");
  console.log(`wrote ${entries.length} surah entries to features/corpus/data/surahs.json`);
}

main();
