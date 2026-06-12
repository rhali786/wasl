import surahs from "../data/surahs.json";
import chapters from "../data/chapters.json";
import type { SurahIndexEntry } from "../lib/types";
import { TOTAL_PAGES } from "../lib/types";

const entries = surahs as SurahIndexEntry[];

describe("surahs.json", () => {
  it("has all 114 surahs, sequential and unique", () => {
    expect(entries).toHaveLength(114);
    expect(entries.map((e) => e.number)).toEqual(
      Array.from({ length: 114 }, (_, i) => i + 1)
    );
  });

  it("every page is within 1..TOTAL_PAGES, non-decreasing in mushaf order", () => {
    let prevPage = 0;
    for (const entry of entries) {
      expect(entry.page).toBeGreaterThanOrEqual(1);
      expect(entry.page).toBeLessThanOrEqual(TOTAL_PAGES);
      expect(entry.page).toBeGreaterThanOrEqual(prevPage);
      prevPage = entry.page;
    }
  });

  it("Al-Fatihah starts on page 1, An-Nas starts on page 604", () => {
    expect(entries[0]).toMatchObject({ number: 1, name: "Al-Fatihah", page: 1 });
    expect(entries[113]).toMatchObject({ number: 114, name: "An-Nas", page: 604 });
  });

  it("name and arabic match chapters.json", () => {
    const chapterMap = chapters as Record<string, { name: string; arabic: string }>;
    for (const entry of entries) {
      const chapter = chapterMap[String(entry.number)];
      expect(entry.name).toBe(chapter.name);
      expect(entry.arabic).toBe(chapter.arabic);
      expect(entry.name).toBeTruthy();
      expect(entry.arabic).toBeTruthy();
    }
  });
});
