// Build one opening ayah (ayah 1) per sūrah for the Garden home hero. The
// home picks the opening of what the user is memorizing; precomputing keeps
// the client light (no page-file load in the browser). Arabic and meaning are
// reconstructed from the existing page snapshots by collecting the words whose
// verse key is "<surah>:1".
//
//   npx tsx features/corpus/scripts/build-openings.ts   (npm run corpus:openings)

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

interface Opening {
  arabic: string;
  meaning: string;
}

function main() {
  // Collect ayah-1 words per sūrah in mushaf order.
  const words = new Map<number, { t: string[]; en: string[] }>();

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const data = loadPage(page);
    for (const line of data.lines) {
      for (const word of line.words) {
        if (word.type !== "word") continue;
        const [surahStr, ayahStr] = word.key.split(":");
        if (ayahStr !== "1") continue;
        const surahNum = Number(surahStr);
        const entry = words.get(surahNum) ?? { t: [], en: [] };
        entry.t.push(word.t);
        entry.en.push(word.en);
        words.set(surahNum, entry);
      }
    }
  }

  const openings: Record<string, Opening> = {};
  for (let number = 1; number <= 114; number++) {
    const entry = words.get(number);
    if (!entry) throw new Error(`missing opening ayah for surah ${number}`);
    openings[String(number)] = {
      arabic: entry.t.join(" "),
      meaning: entry.en.join(" "),
    };
  }

  writeFileSync(
    path.join(DATA_DIR, "openings.json"),
    JSON.stringify(openings, null, 2) + "\n"
  );
  console.log(`wrote opening ayat for ${Object.keys(openings).length} surahs to features/corpus/data/openings.json`);
}

main();
