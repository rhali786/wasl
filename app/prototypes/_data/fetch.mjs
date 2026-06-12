// Snapshot real Madani mushaf page data from the open quran.com API into a
// local JSON file (local-first; no runtime network). This is the pipeline that
// scales to all 604 pages — just widen PAGES.
//
//   node app/prototypes/_data/fetch.mjs
//
import { writeFileSync } from "node:fs";

const PAGES = [78, 79, 80, 81, 82];
const base = "https://api.quran.com/api/v4";

const chapters = (await (await fetch(`${base}/chapters?language=en`)).json()).chapters;
const chapterMap = Object.fromEntries(
  chapters.map((c) => [c.id, { name: c.name_simple, arabic: c.name_arabic }])
);

const out = {};
for (const p of PAGES) {
  const url =
    `${base}/verses/by_page/${p}?words=true&per_page=all` +
    `&fields=text_uthmani,chapter_id,juz_number` +
    `&word_fields=text_uthmani,line_number,char_type_name` +
    `&word_translation_language=en`;
  const d = await (await fetch(url)).json();
  const verses = d.verses || [];

  const linesMap = {};
  for (const v of verses) {
    const ayahNum = Number(v.verse_key.split(":")[1]);
    for (const w of v.words || []) {
      const ln = w.line_number;
      (linesMap[ln] ||= []).push({
        t: w.text_uthmani,
        en: w.translation?.text || "",
        type: w.char_type_name, // "word" | "end"
        key: v.verse_key,
        ayah: ayahNum,
      });
    }
  }
  const lines = Object.keys(linesMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((ln) => ({ line: ln, words: linesMap[ln] }));

  const first = verses[0];
  out[p] = {
    page: p,
    surah: chapterMap[first?.chapter_id]?.name || "",
    surahAr: chapterMap[first?.chapter_id]?.arabic || "",
    juz: first?.juz_number ?? null,
    firstVerse: first?.verse_key,
    lastVerse: verses[verses.length - 1]?.verse_key,
    lines,
  };
  console.log(`page ${p}: ${lines.length} lines, ${verses.length} verses (${out[p].surah})`);
}

writeFileSync(new URL("./pages.json", import.meta.url), JSON.stringify(out));
console.log("wrote pages.json");
