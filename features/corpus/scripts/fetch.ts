// Snapshot Madani mushaf pages from quran.com API v4 into local JSON, one
// file per page under features/corpus/data/pages/. Resumable: pages whose
// output file already exists are skipped (use --force to re-fetch). Per
// word, computes id = normalize(text_uthmani) — the per-word-form status key.
//
//   npx tsx features/corpus/scripts/fetch.ts [--start=1] [--end=604] [--delay=300] [--force]

import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { normalize } from "../lib/normalize";
import type { CorpusPage, CorpusLine, CorpusWord } from "../lib/types";

const BASE = "https://api.quran.com/api/v4";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PAGES_DIR = path.join(DATA_DIR, "pages");

interface Options {
  start: number;
  end: number;
  delay: number;
  force: boolean;
}

function parseArgs(): Options {
  const opts: Options = { start: 1, end: 604, delay: 300, force: false };
  for (const arg of process.argv.slice(2)) {
    const [key, val] = arg.replace(/^--/, "").split("=");
    if (key === "start") opts.start = Number(val);
    else if (key === "end") opts.end = Number(val);
    else if (key === "delay") opts.delay = Number(val);
    else if (key === "force") opts.force = true;
  }
  return opts;
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

type ChapterMap = Record<number, { name: string; arabic: string }>;

async function fetchChapterMap(): Promise<ChapterMap> {
  const cachePath = path.join(DATA_DIR, "chapters.json");
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }
  const res = await fetch(`${BASE}/chapters?language=en`);
  const data = await res.json();
  const map: ChapterMap = {};
  for (const c of data.chapters) {
    map[c.id] = { name: c.name_simple, arabic: c.name_arabic };
  }
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path.join(DATA_DIR, "chapters.json"), JSON.stringify(map, null, 2));
  return map;
}

async function fetchPage(page: number, chapterMap: ChapterMap): Promise<CorpusPage> {
  const url =
    `${BASE}/verses/by_page/${page}?words=true&per_page=all` +
    `&fields=text_uthmani,chapter_id,juz_number` +
    `&word_fields=text_uthmani,line_number,char_type_name` +
    `&word_translation_language=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`page ${page}: HTTP ${res.status}`);
  const data = await res.json();
  const verses = data.verses ?? [];

  const linesMap = new Map<number, CorpusWord[]>();
  for (const v of verses) {
    const ayah = Number(v.verse_key.split(":")[1]);
    for (const w of v.words ?? []) {
      const lineNumber: number = w.line_number;
      const word: CorpusWord = {
        t: w.text_uthmani,
        en: w.translation?.text ?? "",
        type: w.char_type_name === "end" ? "end" : "word",
        ayah,
        key: v.verse_key,
        id: normalize(w.text_uthmani),
      };
      if (!linesMap.has(lineNumber)) linesMap.set(lineNumber, []);
      linesMap.get(lineNumber)!.push(word);
    }
  }

  const lines: CorpusLine[] = [...linesMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([line, words]) => ({ line, words }));

  const first = verses[0];
  const last = verses[verses.length - 1];
  const chapter = chapterMap[first?.chapter_id];

  return {
    page,
    surah: chapter?.name ?? "",
    surahAr: chapter?.arabic ?? "",
    juz: first?.juz_number ?? null,
    firstVerse: first?.verse_key ?? "",
    lastVerse: last?.verse_key ?? "",
    lines,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { start, end, delay, force } = parseArgs();
  mkdirSync(PAGES_DIR, { recursive: true });
  const chapterMap = await fetchChapterMap();

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  for (let page = start; page <= end; page++) {
    const outPath = path.join(PAGES_DIR, `${pad(page)}.json`);
    if (!force && existsSync(outPath)) {
      skipped++;
      continue;
    }
    try {
      const data = await fetchPage(page, chapterMap);
      writeFileSync(outPath, JSON.stringify(data));
      fetched++;
      console.log(`page ${page}: ${data.lines.length} lines (${data.surah})`);
    } catch (err) {
      failed++;
      console.error(`page ${page}: failed —`, err instanceof Error ? err.message : err);
    }
    await sleep(delay);
  }
  console.log(`done. fetched ${fetched}, skipped ${skipped} (already present), failed ${failed}.`);
}

main();
