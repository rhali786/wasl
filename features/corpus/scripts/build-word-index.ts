// Build the corpus-wide word-form index used by Phase 4 metrics: every
// unique normalized word id (`word.id`), plus the set of ids that occur in
// each surah (derived from the word-level `key`, format "surah:ayah" — see
// build-surahs.ts for why page-level surah metadata is unreliable).
// Ayah-end markers (`type === "end"`) are excluded — they aren't vocabulary.
//
//   npx tsx features/corpus/scripts/build-word-index.ts

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CorpusPage } from "../lib/types";
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

function main() {
  const allIds = new Set<string>();
  const bySurah = new Map<number, Set<string>>();

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const data = loadPage(page);
    for (const line of data.lines) {
      for (const word of line.words) {
        if (word.type !== "word") continue;
        const surahNum = Number(word.key.split(":")[0]);
        allIds.add(word.id);
        if (!bySurah.has(surahNum)) bySurah.set(surahNum, new Set());
        bySurah.get(surahNum)!.add(word.id);
      }
    }
  }

  const bySurahOut: Record<string, string[]> = {};
  for (let number = 1; number <= 114; number++) {
    bySurahOut[String(number)] = Array.from(bySurah.get(number) ?? []);
  }

  const out = {
    totalWords: allIds.size,
    allIds: Array.from(allIds),
    bySurah: bySurahOut,
  };

  writeFileSync(path.join(DATA_DIR, "wordIndex.json"), JSON.stringify(out) + "\n");
  console.log(
    `wrote wordIndex.json: ${out.totalWords} unique words across ${Object.keys(bySurahOut).length} surahs`
  );
}

main();
