"use client";

import { useState } from "react";
import { X } from "lucide-react";
import pagesData from "../_data/pages.json";
import { FitLine } from "./FitLine";

type Word = { t: string; en: string; type: "word" | "end"; key: string; ayah: number };
type Line = { line: number; words: Word[] };
type PageData = { page: number; surah: string; lines: Line[] };

const P = (pagesData as Record<string, PageData>)["78"];
const demoLines = P.lines.slice(1, 5);

const NOTE =
  "Phrase sense and a brief tafsir note can live here — root, context, and how the word reads in the ayah.";

function Ticks({ status }: { status: number }) {
  return (
    <span className="pointer-events-none absolute -bottom-[0.32em] left-1/2 flex -translate-x-1/2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-[2px] w-[5px] rounded-full"
          style={{ background: i < status ? "#3f8f5c" : "rgba(20,49,36,0.12)" }}
        />
      ))}
    </span>
  );
}

function EndMark({ ayah }: { ayah: number }) {
  return (
    <span className="relative mx-0.5 grid size-[1.35em] shrink-0 place-items-center rounded-full text-[0.58em] font-semibold text-garden-600 ring-1 ring-garden-400/60">
      {ayah}
    </span>
  );
}

// shared: a tappable word carrying ticks; selection just outlines (no layout shift)
function W({
  w,
  id,
  selId,
  onTap,
}: {
  w: Word;
  id: string;
  selId: string | null;
  onTap: (id: string, w: Word) => void;
}) {
  if (w.type === "end") return <EndMark ayah={w.ayah} />;
  const on = selId === id;
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onTap(id, w);
      }}
      className="relative inline-block cursor-pointer whitespace-nowrap px-[0.12em] text-foreground"
      style={on ? { outline: "2px solid #2fa85a", outlineOffset: "2px", borderRadius: 6 } : undefined}
    >
      <span className="relative">{w.t}</span>
      <Ticks status={2} />
    </span>
  );
}

function Lines({
  selId,
  onTap,
  lineHeight = 2.4,
}: {
  selId: string | null;
  onTap: (id: string, w: Word) => void;
  lineHeight?: number;
}) {
  return (
    <div className="flex flex-col gap-[0.15rem]">
      {demoLines.map((line) => (
        <FitLine key={line.line} base={21} lineHeight={lineHeight}>
          {line.words.map((w, wi) => {
            const id = `${line.line}:${wi}`;
            return <W key={id} w={w} id={id} selId={selId} onTap={onTap} />;
          })}
        </FitLine>
      ))}
    </div>
  );
}

/* R1 — DOCKED CARD: a calm card sits in space ALWAYS reserved at the bottom of
   the page. Tap fills it; nothing ever shifts. (Not a pop-up modal.) */
function DockedDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="flex h-[420px] flex-col rounded-2xl bg-[#f6f0e2] ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <div className="flex-1 overflow-hidden px-4 py-5">
        <Lines selId={sel?.id ?? null} onTap={(id, w) => setSel({ id, w })} />
      </div>
      {/* reserved dock — same height whether or not a word is selected */}
      <div className="m-3 min-h-[88px] rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-garden-200">
        {sel ? (
          <div onClick={(e) => e.stopPropagation()}>
            <p className="flex items-baseline gap-2">
              <span dir="rtl" className="font-arabic text-2xl text-forest">
                {sel.w.t}
              </span>
              <span className="font-display text-lg italic text-garden-700">{sel.w.en}</span>
            </p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{NOTE}</p>
          </div>
        ) : (
          <p className="grid h-full place-items-center text-center text-[12px] italic text-muted-foreground">
            Tap a word — its meaning rests here.
          </p>
        )}
      </div>
    </div>
  );
}

/* R2 — FLOATING CARET: a card lifts ABOVE the tapped word, pointer aimed at it,
   absolutely positioned so the page never moves. Dismiss on next tap. */
function CaretDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="relative h-[420px] overflow-hidden rounded-2xl bg-[#f6f0e2] px-4 py-7 ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <div className="flex flex-col gap-3">
        {demoLines.map((line) => (
          <FitLine key={line.line} base={21} lineHeight={2.2}>
            {line.words.map((w, wi) => {
              const id = `${line.line}:${wi}`;
              if (w.type === "end") return <EndMark key={id} ayah={w.ayah} />;
              const on = sel?.id === id;
              return (
                <span
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSel(on ? null : { id, w });
                  }}
                  className="relative inline-block cursor-pointer px-[0.12em] text-foreground"
                  style={on ? { color: "#1f6b3f" } : undefined}
                >
                  {on ? (
                    <span className="absolute bottom-full left-1/2 z-10 mb-2 w-40 -translate-x-1/2 rounded-xl bg-forest px-3 py-2 text-left shadow-lg">
                      <span className="block font-display text-sm italic text-white">{w.en}</span>
                      <span className="mt-1 block text-[10px] leading-snug text-white/70">
                        {NOTE}
                      </span>
                      <span className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-forest" />
                    </span>
                  ) : null}
                  <span className="relative">{w.t}</span>
                  <Ticks status={2} />
                </span>
              );
            })}
          </FitLine>
        ))}
      </div>
    </div>
  );
}

/* R3 — SLIDE-OVER SHEET: a sheet slides UP over the bottom of the page (the page
   underneath does not move). Has room for full tafsir. Dismiss by tapping page
   or the close affordance — a grabber, not a bare X. */
function SheetDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="relative h-[420px] overflow-hidden rounded-2xl bg-[#f6f0e2] px-4 py-5 ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <Lines selId={sel?.id ?? null} onTap={(id, w) => setSel({ id, w })} lineHeight={2.2} />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pb-5 pt-2 shadow-[0_-14px_34px_-18px_rgba(20,83,45,0.45)] transition-transform duration-300"
        style={{ transform: sel ? "translateY(0)" : "translateY(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-garden-200" />
        {sel ? (
          <div>
            <p className="flex items-baseline gap-2">
              <span dir="rtl" className="font-arabic text-3xl text-forest">
                {sel.w.t}
              </span>
              <span className="font-display text-xl italic text-garden-700">{sel.w.en}</span>
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{NOTE}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Tafsīr continues here with as much depth as you want — the sheet can
              scroll, and the page beneath it never moved.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* R4 — HEADER RIBBON: a slim strip at the TOP (already-reserved height) holds the
   word + meaning, replaced on each tap. Quietest; the line you read is untouched. */
function RibbonDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="flex h-[420px] flex-col rounded-2xl bg-[#f6f0e2] ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <div className="m-3 flex min-h-[52px] items-center gap-3 rounded-xl bg-white/80 px-4 ring-1 ring-garden-200">
        {sel ? (
          <>
            <span dir="rtl" className="font-arabic text-xl text-forest">
              {sel.w.t}
            </span>
            <span className="font-display text-base italic text-garden-700">{sel.w.en}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSel(null);
              }}
              className="ml-auto grid size-6 place-items-center rounded-full text-garden-500 hover:bg-garden-50"
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <span className="text-[12px] italic text-muted-foreground">
            Tap a word — its meaning shows up here.
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <Lines selId={sel?.id ?? null} onTap={(id, w) => setSel({ id, w })} lineHeight={2.3} />
      </div>
    </div>
  );
}

const REVEALS: { name: string; blurb: string; node: React.ReactNode }[] = [
  {
    name: "R1 · Docked card",
    blurb:
      "A calm card lives in space permanently reserved at the page bottom. Tapping fills it — nothing ever shifts. Roomy for tafsir, always visible, not a modal.",
    node: <DockedDemo />,
  },
  {
    name: "R2 · Floating caret",
    blurb:
      "A card lifts above the word with a pointer aimed at it, floating over the page (no shift). Eye stays on the line. Tighter on space for long tafsir.",
    node: <CaretDemo />,
  },
  {
    name: "R3 · Slide-over sheet",
    blurb:
      "A sheet slides up over the bottom of the page — the page underneath stays put. Most room (scrolls for full tafsir). Grabber to dismiss, no bare X.",
    node: <SheetDemo />,
  },
  {
    name: "R4 · Header ribbon",
    blurb:
      "A slim strip at the top (reserved height) holds word + meaning, swapped each tap. Quietest and most minimal; the line you're reading is never touched.",
    node: <RibbonDemo />,
  },
];

export function RevealLab() {
  return (
    <div className="min-h-full w-full bg-mist px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-garden-700/70">
          Wird · reveal variants
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">
          Pick the definition reveal
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          All four obey one rule: tapping a word <strong>never moves the page</strong>{" "}
          (the D1 jump is gone). Each frame is the real page bottom-cropped. Tap the
          words. Status ticks shown at a fixed level for the demo.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {REVEALS.map((r) => (
            <div key={r.name} className="flex flex-col">
              <h3 className="text-lg font-semibold text-forest">{r.name}</h3>
              <p className="mb-3 mt-1 text-sm leading-snug text-muted-foreground">{r.blurb}</p>
              {r.node}
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Lab only. Pick a number and I&rsquo;ll wire it into{" "}
          <code>/prototypes/reader</code> with the ticks.
        </p>
      </div>
    </div>
  );
}
