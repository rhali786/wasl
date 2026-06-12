// Server-only page loader — reads snapshotted corpus pages from disk under
// data/pages/. Do not import from 'use client' components (uses node:fs).
// Callers (route handlers) validate the page number against TOTAL_PAGES
// before calling.

import { readFileSync } from "node:fs";
import path from "node:path";
import type { CorpusPage } from "./types";

// process.cwd() (not __dirname) — Turbopack rewrites __dirname in server
// chunks to a virtual root that doesn't map to real files on disk.
const PAGES_DIR = path.join(process.cwd(), "features", "corpus", "data", "pages");

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export function loadPage(page: number): CorpusPage {
  const file = path.join(PAGES_DIR, `${pad(page)}.json`);
  return JSON.parse(readFileSync(file, "utf8")) as CorpusPage;
}
