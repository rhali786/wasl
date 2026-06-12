import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CorpusPage } from "../lib/types";

const PAGES_DIR = path.join(__dirname, "..", "data", "pages");
const TOTAL_PAGES = 604;

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function loadPage(page: number): CorpusPage {
  return JSON.parse(readFileSync(path.join(PAGES_DIR, `${pad(page)}.json`), "utf8"));
}

const dirExists = existsSync(PAGES_DIR);
const describeIfSnapshot = dirExists ? describe : describe.skip;

describeIfSnapshot("corpus snapshot", () => {
  it("has a JSON file for all 604 Madani pages", () => {
    const files = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"));
    expect(files).toHaveLength(TOTAL_PAGES);
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      expect(existsSync(path.join(PAGES_DIR, `${pad(page)}.json`))).toBe(true);
    }
  });

  it("every page has 1-15 lines, each with words", () => {
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      const data = loadPage(page);
      expect(data.page).toBe(page);
      expect(data.lines.length).toBeGreaterThan(0);
      expect(data.lines.length).toBeLessThanOrEqual(15);
      for (const line of data.lines) {
        expect(line.words.length).toBeGreaterThan(0);
      }
    }
  });

  it("every word has a non-empty normalized id", () => {
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      const data = loadPage(page);
      for (const line of data.lines) {
        for (const word of line.words) {
          expect(word.id).toBeTruthy();
          expect(["word", "end"]).toContain(word.type);
        }
      }
    }
  });

  it("every word-type token has an English gloss", () => {
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      const data = loadPage(page);
      for (const line of data.lines) {
        for (const word of line.words) {
          if (word.type === "word") {
            expect(word.en).toBeTruthy();
          }
        }
      }
    }
  });

  it("every page has surah metadata and a verse range", () => {
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      const data = loadPage(page);
      expect(data.surah).toBeTruthy();
      expect(data.surahAr).toBeTruthy();
      expect(data.firstVerse).toMatch(/^\d+:\d+$/);
      expect(data.lastVerse).toMatch(/^\d+:\d+$/);
    }
  });
});
