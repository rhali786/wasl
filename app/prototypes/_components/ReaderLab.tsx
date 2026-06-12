"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import pagesData from "../_data/pages.json";
import { FitLine } from "./FitLine";

type Word = { t: string; en: string; type: "word" | "end"; key: string; ayah: number };
type Line = { line: number; words: Word[] };
type PageData = { page: number; surah: string; lines: Line[] };

const P = (pagesData as Record<string, PageData>)["78"];
const lines = (from: number, count: number) => P.lines.slice(from, from + count);

const TASHKIL = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/g;
const strip = (s: string) => s.replace(TASHKIL, "");

// deterministic mock status 0..4, skewed toward known
function st(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 12) return 0;
  if (r < 26) return 1;
  if (r < 45) return 2;
  if (r < 70) return 3;
  return 4;
}

const LEVELS = ["Unknown", "Seen", "Familiar", "Recognized", "Known"];

/* ------------------------------------------------------------------ *
 *  STATUS / FOG SYSTEMS — three ways to distinguish the five levels   *
 * ------------------------------------------------------------------ */

type SystemKey = "focus" | "temp" | "mark";

// A — FOCUS DEPTH: one hue; an unknown word sits inside a big soft mist that
// shrinks and clears as it becomes Known. Distinguished by halo size + blur.
function focusHalo(status: number): CSSProperties | null {
  const u = (4 - status) / 4; // unknown-ness
  if (u <= 0) return null;
  return {
    width: `calc(100% + ${0.35 + u * 1.5}em)`,
    height: `${1.0 + u * 0.9}em`,
    background: `radial-gradient(closest-side, rgba(74,116,90,${0.16 + 0.42 * u}), transparent 75%)`,
    filter: `blur(${1.5 + u * 5}px)`,
  };
}

// B — TEMPERATURE: cool misty blue-grey when unknown → warm clear green when
// Known. Adjacent levels differ in HUE, not just lightness.
const TEMP = ["#6c91a6", "#6f9e95", "#5aa978", "#8ec887", "transparent"];
function tempHalo(status: number): CSSProperties | null {
  const u = (4 - status) / 4;
  if (status >= 4) return null;
  return {
    width: `calc(100% + ${0.3 + u * 1.2}em)`,
    height: `${1.0 + u * 0.7}em`,
    background: `radial-gradient(closest-side, ${TEMP[status]}, transparent 78%)`,
    filter: `blur(${2 + u * 4}px)`,
    opacity: 0.55 + 0.25 * u,
  };
}

// C — TAJWEED UNDERMARK: word stays crisp ink; four tiny ticks below it fill
// in with status (countable). A faint grey haze only for the truly Unknown.
function markHalo(status: number): CSSProperties | null {
  if (status > 1) return null;
  const u = 1 - status; // 1 at Unknown, 0 at Seen
  return {
    width: `calc(100% + 0.6em)`,
    height: `1.4em`,
    background: `radial-gradient(closest-side, rgba(110,130,120,${0.16 + 0.14 * u}), transparent 75%)`,
    filter: `blur(5px)`,
  };
}

function Halo({ style }: { style: CSSProperties | null }) {
  if (!style) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={style}
    />
  );
}

function Ticks({ status }: { status: number }) {
  return (
    <span className="pointer-events-none absolute -bottom-[0.35em] left-1/2 flex -translate-x-1/2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-[2px] w-[5px] rounded-full"
          style={{ background: i < status ? "#3f8f5c" : "rgba(20,49,36,0.14)" }}
        />
      ))}
    </span>
  );
}

function SysWord({
  text,
  status,
  system,
  onTap,
  selected,
}: {
  text: string;
  status: number;
  system: SystemKey;
  onTap?: () => void;
  selected?: boolean;
}) {
  const halo =
    system === "focus" ? focusHalo(status) : system === "temp" ? tempHalo(status) : markHalo(status);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      className="relative inline-block cursor-pointer whitespace-nowrap px-[0.12em] text-foreground"
      style={selected ? { outline: "2px solid #2fa85a", outlineOffset: "2px", borderRadius: 6 } : undefined}
    >
      <Halo style={halo} />
      <span className="relative">{text}</span>
      {system === "mark" ? <Ticks status={status} /> : null}
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

function MiniPage({ system, tashkil = true }: { system: SystemKey; tashkil?: boolean }) {
  const ls = system === "mark" ? lines(0, 4) : lines(0, 5);
  return (
    <div className="rounded-2xl bg-[#f6f0e2] px-4 py-4 ring-1 ring-black/5">
      <div className={`flex flex-col ${system === "mark" ? "gap-3" : "gap-1"}`}>
        {ls.map((line) => (
          <FitLine key={line.line} base={21} lineHeight={system === "mark" ? 2.6 : 2.2}>
            {line.words.map((w, wi) => {
              const id = `${line.line}:${wi}`;
              if (w.type === "end") return <EndMark key={id} ayah={w.ayah} />;
              return (
                <SysWord key={id} text={tashkil ? w.t : strip(w.t)} status={st(id)} system={system} />
              );
            })}
          </FitLine>
        ))}
      </div>
    </div>
  );
}

function Legend({ system }: { system: SystemKey }) {
  return (
    <div className="mt-3 flex items-end justify-between gap-1 rounded-xl bg-white/70 px-3 py-3 ring-1 ring-black/5">
      {LEVELS.map((label, status) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="grid h-9 place-items-center">
            <SysWord text="كلمة" status={status} system={system} />
          </div>
          <span className="text-center text-[9px] font-medium leading-tight text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const SYSTEMS: { key: SystemKey; name: string; blurb: string }[] = [
  {
    key: "focus",
    name: "A · Focus depth",
    blurb:
      "One hue. Unknown words sit in a big soft mist that shrinks and sharpens into focus as they become Known. Pretty, radial, no boxes — distinguished by haze size, not shade.",
  },
  {
    key: "temp",
    name: "B · Temperature",
    blurb:
      "Cool misty blue-grey when Unknown → warm clear green when Known. Neighbouring levels differ in colour temperature (hue), which the eye separates far better than five greens.",
  },
  {
    key: "mark",
    name: "C · Tajweed undermark",
    blurb:
      "The word stays crisp ink — never fogged. Four little ticks beneath it fill in with status, so the level is countable. A faint grey haze marks only the truly Unknown.",
  },
];

/* ------------------------------------------------------------------ *
 *  DEFINITION REVEAL — three replacements for the bottom bar + X      *
 * ------------------------------------------------------------------ */

const demoLines = lines(1, 3);

// D1 — INTERLINEAR: a short gloss drops under the word; "⌄ more" expands a calm
// inline note (phrase sense / brief tafsir) under the line — no modal, no X.
function InterlinearDemo() {
  const [sel, setSel] = useState<string | null>("3:2");
  const [expanded, setExpanded] = useState(false);
  const selLine = sel ? Number(sel.split(":")[0]) : null;
  const selWord = sel
    ? demoLines
        .find((l) => l.line === selLine)
        ?.words[Number(sel.split(":")[1])]
    : null;

  return (
    <div
      className="rounded-2xl bg-[#f6f0e2] px-4 py-5 ring-1 ring-black/5"
      onClick={() => {
        setSel(null);
        setExpanded(false);
      }}
    >
      <div className="flex flex-col gap-2">
        {demoLines.map((line) => (
          <div key={line.line}>
            <FitLine base={22} lineHeight={1.7}>
              {line.words.map((w, wi) => {
                const id = `${line.line}:${wi}`;
                if (w.type === "end") return <EndMark key={id} ayah={w.ayah} />;
                const on = sel === id;
                return (
                  <span
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSel(on ? null : id);
                      setExpanded(false);
                    }}
                    className="inline-flex cursor-pointer flex-col items-center px-[0.12em] text-foreground"
                  >
                    <span>{w.t}</span>
                    {on ? (
                      <span className="mt-0.5 flex items-center gap-1 font-display text-[0.5em] italic leading-none text-garden-700">
                        {w.en}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((x) => !x);
                          }}
                          className="not-italic"
                          aria-label="More on this word"
                        >
                          <ChevronDown
                            className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </FitLine>
            {/* expandable note — full width under the line, grows downward */}
            {expanded && selLine === line.line && selWord ? (
              <div
                className="mt-1 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-garden-200"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-semibold text-forest">
                  <span dir="rtl" className="font-arabic">
                    {selWord.t}
                  </span>{" "}
                  · <span className="font-display italic text-garden-700">{selWord.en}</span>
                </p>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                  Phrase sense and a short tafsir note live here — and because it grows{" "}
                  <em>downward</em>, there&rsquo;s as much room as a margin would give,
                  while the ayah above keeps its full size.
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// D2 — FLOATING CARET: a small card pops above the word, pointer aimed at it.
function TooltipDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="rounded-2xl bg-[#f6f0e2] px-4 py-7 ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <div className="flex flex-col gap-3">
        {demoLines.map((line) => (
          <FitLine key={line.line} base={22} lineHeight={2.1}>
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
                    <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-forest px-3 py-1.5 font-display text-sm italic text-white shadow-lg">
                      {w.en}
                      <span className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-forest" />
                    </span>
                  ) : null}
                  {w.t}
                </span>
              );
            })}
          </FitLine>
        ))}
      </div>
    </div>
  );
}

// D3 — MARGIN GLOSS: the meaning appears as a quiet manuscript note in the
// right margin, with the tapped word highlighted.
function MarginDemo() {
  const [sel, setSel] = useState<{ id: string; w: Word } | null>(null);
  return (
    <div
      className="flex gap-3 rounded-2xl bg-[#f6f0e2] px-4 py-5 ring-1 ring-black/5"
      onClick={() => setSel(null)}
    >
      <div className="flex-1">
        <div className="flex flex-col gap-2">
          {demoLines.map((line) => (
            <FitLine key={line.line} base={21} lineHeight={1.9}>
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
                    className="cursor-pointer rounded px-[0.12em] text-foreground"
                    style={on ? { background: "rgba(63,143,92,0.18)" } : undefined}
                  >
                    {w.t}
                  </span>
                );
              })}
            </FitLine>
          ))}
        </div>
      </div>
      <div className="w-24 shrink-0 border-l border-garden-300/50 pl-3">
        {sel ? (
          <div>
            <p dir="rtl" className="font-arabic text-lg text-forest">
              {sel.w.t}
            </p>
            <p className="mt-1 font-display text-sm italic leading-snug text-garden-700">
              {sel.w.en}
            </p>
          </div>
        ) : (
          <p className="text-[11px] italic leading-snug text-muted-foreground">
            Tap a word — its meaning notes here in the margin.
          </p>
        )}
      </div>
    </div>
  );
}

const REVEALS: { name: string; blurb: string; node: React.ReactNode }[] = [
  {
    name: "D1 · Interlinear (+ expand)",
    blurb:
      "Tap → a short gloss drops under the word. Tap ⌄ more → a calm note opens under the line for phrase sense or brief tafsir. Spends the cheap axis (vertical scroll), never shrinks the ayah. Seeds your under-Arabic translation view.",
    node: <InterlinearDemo />,
  },
  {
    name: "D2 · Floating caret",
    blurb:
      "Tap → a small card lifts above the word with a pointer aimed at it, then dismisses on the next tap. Nothing covers the page; the eye never leaves the line.",
    node: <TooltipDemo />,
  },
  {
    name: "D3 · Margin gloss",
    blurb:
      "The word lights up and its meaning is written quietly in the side margin — like a scholar's manuscript note. Calm, never modal.",
    node: <MarginDemo />,
  },
];

/* ------------------------------------------------------------------ */

export function ReaderLab() {
  return (
    <div className="min-h-full w-full bg-mist px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-garden-700/70">
          Wird · reader lab
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">
          Pick the fog, the status, the reveal
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Real words from An-Nisāʾ (page 78). Lines now auto-fit the frame — no
          run-off, no wrapping. Tell me which letter wins in each row (e.g.
          &ldquo;B + D1&rdquo;) and I&rsquo;ll wire it into the real reader.
        </p>

        {/* SYSTEMS */}
        <h2 className="mt-12 flex items-center gap-2 text-2xl font-semibold text-forest">
          1 · Fog &amp; status <ChevronDown className="size-5 text-garden-400" />
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Three ways to tell the five levels apart with more than shades of green.
          The fog is radial and soft now — centred on the word, no boxes.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {SYSTEMS.map((s) => (
            <div key={s.key} className="flex flex-col">
              <h3 className="text-lg font-semibold text-forest">{s.name}</h3>
              <p className="mb-3 mt-1 text-sm leading-snug text-muted-foreground">{s.blurb}</p>
              <MiniPage system={s.key} />
              <Legend system={s.key} />
            </div>
          ))}
        </div>

        {/* REVEAL */}
        <h2 className="mt-16 flex items-center gap-2 text-2xl font-semibold text-forest">
          2 · Definition reveal <ChevronDown className="size-5 text-garden-400" />
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Replacing the bottom bar + X. Each is interactive — tap the words.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {REVEALS.map((r) => (
            <div key={r.name} className="flex flex-col">
              <h3 className="text-lg font-semibold text-forest">{r.name}</h3>
              <p className="mb-3 mt-1 text-sm leading-snug text-muted-foreground">{r.blurb}</p>
              {r.node}
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Lab only — static mock statuses. Once you pick, I&rsquo;ll apply the
          combination to <code>/prototypes/reader</code>.
        </p>
      </div>
    </div>
  );
}
