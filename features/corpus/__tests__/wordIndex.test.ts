import wordIndex from "../data/wordIndex.json";
import { normalize } from "../lib/normalize";

describe("wordIndex", () => {
  it("totalWords matches the size of allIds, in the expected range", () => {
    expect(wordIndex.totalWords).toBe(wordIndex.allIds.length);
    expect(wordIndex.totalWords).toBeGreaterThan(10000);
    expect(wordIndex.totalWords).toBeLessThan(20000);
  });

  it("bySurah has exactly 114 entries, keyed 1..114", () => {
    const keys = Object.keys(wordIndex.bySurah);
    expect(keys).toHaveLength(114);
    for (let n = 1; n <= 114; n++) {
      expect(wordIndex.bySurah[String(n)]).toBeDefined();
    }
  });

  it("Al-Fatihah includes the normalized form of بِسْمِ", () => {
    expect(wordIndex.bySurah["1"]).toContain(normalize("بِسْمِ"));
  });

  it("every per-surah id is present in allIds", () => {
    const all = new Set(wordIndex.allIds);
    for (const ids of Object.values(wordIndex.bySurah)) {
      for (const id of ids) {
        expect(all.has(id)).toBe(true);
      }
    }
  });
});
