"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import pagesData from "../_data/pages.json";
import { FitLine } from "./FitLine";

// Mock tafsir/phrase note (quran.com gives single-word glosses only).
const NOTE =
  "Phrase sense and a brief tafsīr note can live here — root, context, and how the word reads in the ayah.";

export type RevealKind = "docked" | "caret" | "sheet" | "ribbon";

type Word = { t: string; en: string; type: "word" | "end"; key: string; ayah: number };
type Line = { line: number; words: Word[] };
type PageData = {
  page: number;
  surah: string;
  surahAr: string;
  juz: number | null;
  firstVerse: string;
  lastVerse: string;
  lines: Line[];
};

const PAGES = pagesData as Record<string, PageData>;
const PAGE_NUMS = Object.keys(PAGES).map(Number).sort((a, b) => a - b);

// Status display = TAJWEED UNDERMARK (chosen 2026-06-10): the WORD always stays
// crisp ink — the Qur'an is never fogged/faded. Four short ticks under the word
// fill with status (0→4, countable). A faint grey haze marks only the truly
// Unknown. (design-visual.md §status scale.)
const TICK_ON = "#3f8f5c";
const TICK_OFF = "rgba(20,49,36,0.12)";

function UnknownHaze({ status }: { status: number }) {
  if (status > 0) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: "calc(100% + 0.6em)",
        height: "1.4em",
        background: "radial-gradient(closest-side, rgba(110,130,120,0.22), transparent 75%)",
        filter: "blur(5px)",
      }}
    />
  );
}

function Ticks({ status }: { status: number }) {
  return (
    <span className="pointer-events-none absolute -bottom-[0.32em] left-1/2 flex -translate-x-1/2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-[2px] w-[5px] rounded-full"
          style={{ background: i < status ? TICK_ON : TICK_OFF }}
        />
      ))}
    </span>
  );
}

// Study mode strips tashkil (harakat, shadda, sukun, Quranic annotation marks)
// so the bare letters read more analytically. Mushaf keeps the full vowelling.
const TASHKIL = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/g;
const stripTashkil = (s: string) => s.replace(TASHKIL, "");

// Deterministic mock status per word (skewed toward more-known so the page
// reads mostly clear with pockets of fog).
function baseStatus(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 12) return 0;
  if (r < 26) return 1;
  if (r < 45) return 2;
  if (r < 70) return 3;
  return 4;
}

type Mode = "study" | "mushaf";
const ACCENT: Record<Mode, { name: string; badge: string; color: string; glow: string }> = {
  study: { name: "Study", badge: "S", color: "#2fa85a", glow: "rgba(63,191,104,0.16)" },
  mushaf: { name: "Mushaf", badge: "M", color: "#b9892f", glow: "rgba(201,162,75,0.20)" },
};

export function Reader({
  initialMode = "study",
  reveal = "docked",
}: {
  initialMode?: Mode;
  reveal?: RevealKind;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pageIdx, setPageIdx] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<{ id: string; w: Word } | null>(null);

  const page = PAGES[String(PAGE_NUMS[pageIdx])];
  const accent = ACCENT[mode];

  // reset transient state on page/mode change is intentional-light: keep
  // overrides per id (ids are page-scoped below) and just clear selection.
  const statusOf = useMemo(
    () => (id: string) => overrides[id] ?? baseStatus(id),
    [overrides]
  );

  function tap(id: string, w: Word) {
    setSelected({ id, w });
    // Engine B — honest check demotes one level on tap.
    setOverrides((o) => ({ ...o, [id]: Math.max(0, (o[id] ?? baseStatus(id)) - 1) }));
  }

  function gotoPage(delta: number) {
    setSelected(null);
    setPageIdx((i) => Math.min(PAGE_NUMS.length - 1, Math.max(0, i + delta)));
  }

  return (
    <div className="relative flex h-full flex-col bg-[#f5efe1]">
      {/* mode ambient: accent glow + faint tint */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(120% 60% at 50% -8%, ${accent.glow} 0%, transparent 60%)`,
        }}
      />

      {/* top chrome: timer + header — the ribbon hangs just below this */}
      <div className="relative z-20">
      {/* session timer — faint, fills right-to-left */}
      <div className="relative z-10 h-[3px] w-full bg-black/5">
        <div className="absolute right-0 top-0 h-full rounded-l-full" style={{ width: "58%", background: accent.color, opacity: 0.5 }} />
      </div>

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-garden-700/70">
            {page.surah} · juz {page.juz}
          </p>
          <p className="text-sm text-muted-foreground">
            page {page.page} · {page.firstVerse}–{page.lastVerse.split(":")[1]}
          </p>
        </div>
        {/* mode toggle with badge */}
        <button
          onClick={() => setMode((m) => (m === "study" ? "mushaf" : "study"))}
          className="flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 ring-1 ring-black/5"
          aria-label={`Mode: ${accent.name} (tap to switch)`}
        >
          <span
            className="grid size-7 place-items-center rounded-full text-sm font-bold text-white"
            style={{ background: accent.color }}
          >
            {accent.badge}
          </span>
          <span className="text-sm font-medium text-forest">{accent.name}</span>
        </button>
      </div>

        {/* R4 · RIBBON — drops just BELOW the header, overlaying the page; no shift */}
        {reveal === "ribbon" ? (
          <div
            className="absolute inset-x-0 top-full z-30 flex items-center gap-3 border-t border-garden-100 bg-white/95 px-4 py-2 shadow-sm transition-all duration-300"
            style={{
              transform: selected ? "translateY(0)" : "translateY(-6px)",
              opacity: selected ? 1 : 0,
              pointerEvents: selected ? "auto" : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selected ? (
              <>
                <span dir="rtl" className="font-arabic text-xl text-forest">{selected.w.t}</span>
                <span className="font-display text-base italic text-garden-700">{selected.w.en}</span>
                <button
                  onClick={() => setSelected(null)}
                  className="ml-auto grid size-6 place-items-center rounded-full text-garden-500 hover:bg-garden-50"
                  aria-label="Clear"
                >
                  <X className="size-3.5" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* the page — a faithful Madani page: exactly 15 lines as equal vertical
          bands that fill the height, NO scroll. Each row stretches edge-to-edge
          (never wraps). Mushaf keeps full tashkil; Study shows bare letters. */}
      <div
        className="relative z-10 flex-1 overflow-hidden px-4 py-2"
        onClick={() => setSelected(null)}
      >
        <div className="flex h-full flex-col">
          {page.lines.map((line) => (
            <FitLine
              key={line.line}
              dep={`${page.page}-${mode}`}
              base={mode === "mushaf" ? 21 : 23}
              lineHeight={1.25}
              className="flex-1"
            >
              {line.words.map((w, wi) => {
                const id = `${page.page}:${line.line}:${wi}`;
                if (w.type === "end") {
                  return (
                    <span
                      key={id}
                      className="mx-0.5 grid size-[1.35em] shrink-0 place-items-center rounded-full text-[0.6em] font-semibold text-garden-600 ring-1 ring-garden-400/60"
                    >
                      {w.ayah}
                    </span>
                  );
                }
                const s = statusOf(id);
                const isSel = selected?.id === id;
                const text = mode === "study" ? stripTashkil(w.t) : w.t;
                return (
                  <span
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      tap(id, w);
                    }}
                    className="relative inline-block cursor-pointer whitespace-nowrap rounded-md px-[0.12em] text-foreground"
                    style={
                      isSel
                        ? { outline: `2px solid ${accent.color}`, outlineOffset: "2px" }
                        : undefined
                    }
                  >
                    {/* caret reveal floats above the word — never shifts the page */}
                    {reveal === "caret" && isSel ? (
                      <span
                        dir="rtl"
                        className="absolute bottom-full left-1/2 z-30 mb-2 w-44 -translate-x-1/2 rounded-xl bg-forest px-3 py-2 text-right shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="block font-display text-sm italic text-white" dir="ltr">
                          {w.en}
                        </span>
                        <span className="mt-1 block text-[10px] leading-snug text-white/70" dir="ltr">
                          {NOTE}
                        </span>
                        <span className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-forest" />
                      </span>
                    ) : null}
                    <UnknownHaze status={s} />
                    <span className="relative">{text}</span>
                    <Ticks status={s} />
                  </span>
                );
              })}
            </FitLine>
          ))}
        </div>
      </div>

      {/* paging */}
      <div className="relative z-10 flex items-center justify-between px-5 py-2">
        <button
          onClick={() => gotoPage(+1)}
          disabled={pageIdx >= PAGE_NUMS.length - 1}
          className="grid size-9 place-items-center rounded-full bg-white/70 text-forest ring-1 ring-black/5 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="text-xs text-muted-foreground">{page.page} / 604</span>
        <button
          onClick={() => gotoPage(-1)}
          disabled={pageIdx <= 0}
          className="grid size-9 place-items-center rounded-full bg-white/70 text-forest ring-1 ring-black/5 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* R1 · DOCKED — card in permanently-reserved space; tapping fills it,
          nothing shifts. */}
      {reveal === "docked" ? (
        <div className="relative z-10 mx-3 mb-3 min-h-[92px] rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-garden-200">
          {selected ? (
            <div onClick={(e) => e.stopPropagation()}>
              <p className="flex items-baseline gap-2">
                <span dir="rtl" className="font-arabic text-2xl text-forest">{selected.w.t}</span>
                <span className="font-display text-lg italic text-garden-700">{selected.w.en}</span>
              </p>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{NOTE}</p>
            </div>
          ) : (
            <p className="grid h-full min-h-[68px] place-items-center text-center text-[12px] italic text-muted-foreground">
              Tap a word — its meaning rests here.
            </p>
          )}
        </div>
      ) : null}

      {/* R3 · SHEET — slides up over the page bottom; page underneath stays put. */}
      {reveal === "sheet" ? (
        <div
          className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white px-6 pb-7 pt-2 shadow-[0_-14px_34px_-18px_rgba(20,83,45,0.45)] transition-transform duration-300"
          style={{ transform: selected ? "translateY(0)" : "translateY(100%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-garden-200" />
          {selected ? (
            <div>
              <p className="flex items-baseline gap-2">
                <span dir="rtl" className="font-arabic text-3xl text-forest">{selected.w.t}</span>
                <span className="font-display text-xl italic text-garden-700">{selected.w.en}</span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{NOTE}</p>
            </div>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}
