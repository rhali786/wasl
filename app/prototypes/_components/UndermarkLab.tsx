"use client";

import pagesData from "../_data/pages.json";
import { FitLine } from "./FitLine";

type Word = { t: string; en: string; type: "word" | "end"; key: string; ayah: number };
type Line = { line: number; words: Word[] };
type PageData = { page: number; surah: string; lines: Line[] };

const P = (pagesData as Record<string, PageData>)["78"];
const lines = (from: number, count: number) => P.lines.slice(from, from + count);

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
const GREEN = "#3f8f5c";
const TRACK = "rgba(20,49,36,0.12)";

type Variant = "fill" | "segments" | "ticks" | "dots" | "weight" | "sprout";

// faint grey haze only for the truly Unknown — consistent across every variant
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

function Mark({ variant, status }: { variant: Variant; status: number }) {
  const frac = status / 4;

  if (variant === "fill") {
    return (
      <span
        className="pointer-events-none absolute -bottom-[0.26em] left-[0.08em] right-[0.08em] h-[3px] rounded-full"
        style={{ background: TRACK }}
      >
        <span
          className="absolute inset-y-0 right-0 rounded-full"
          style={{ width: `${frac * 100}%`, background: GREEN }}
        />
      </span>
    );
  }

  if (variant === "segments") {
    return (
      <span className="pointer-events-none absolute -bottom-[0.28em] left-[0.08em] right-[0.08em] flex gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full"
            style={{ background: i < status ? GREEN : TRACK }}
          />
        ))}
      </span>
    );
  }

  if (variant === "ticks") {
    return (
      <span className="pointer-events-none absolute -bottom-[0.32em] left-1/2 flex -translate-x-1/2 gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-[2px] w-[5px] rounded-full"
            style={{ background: i < status ? GREEN : TRACK }}
          />
        ))}
      </span>
    );
  }

  if (variant === "dots") {
    return (
      <span className="pointer-events-none absolute -bottom-[0.38em] left-1/2 flex -translate-x-1/2 gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="size-[4px] rounded-full"
            style={{ background: i < status ? GREEN : TRACK }}
          />
        ))}
      </span>
    );
  }

  if (variant === "weight") {
    return (
      <span
        className="pointer-events-none absolute -bottom-[0.26em] left-[0.08em] right-[0.08em] rounded-full"
        style={{
          height: `${1 + status * 0.9}px`,
          background: GREEN,
          opacity: status === 0 ? 0.14 : 0.28 + status * 0.16,
        }}
      />
    );
  }

  // sprout — a tiny leaf that grows under the word (on-brand with the vine)
  if (status === 0) return null;
  const scale = 0.45 + status * 0.16;
  return (
    <span
      className="pointer-events-none absolute -bottom-[0.5em] left-1/2 -translate-x-1/2"
      style={{ transform: `translateX(-50%) scale(${scale})` }}
    >
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M7 10 V4" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M7 5 C4 5 2.5 3 2.5 1 C5 1 7 2.5 7 5 Z" fill={GREEN} opacity="0.85" />
        <path d="M7 6 C10 6 11.5 4.2 11.5 2.4 C9 2.4 7 3.8 7 6 Z" fill={GREEN} opacity="0.6" />
      </svg>
    </span>
  );
}

function MWord({ text, status, variant }: { text: string; status: number; variant: Variant }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-[0.12em] text-foreground">
      <UnknownHaze status={status} />
      <span className="relative">{text}</span>
      <Mark variant={variant} status={status} />
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

function MiniPage({ variant }: { variant: Variant }) {
  return (
    <div className="rounded-2xl bg-[#f6f0e2] px-4 py-4 ring-1 ring-black/5">
      <div className="flex flex-col gap-3">
        {lines(0, 4).map((line) => (
          <FitLine key={line.line} base={21} lineHeight={2.7}>
            {line.words.map((w, wi) => {
              const id = `${line.line}:${wi}`;
              if (w.type === "end") return <EndMark key={id} ayah={w.ayah} />;
              return <MWord key={id} text={w.t} status={st(id)} variant={variant} />;
            })}
          </FitLine>
        ))}
      </div>
    </div>
  );
}

function Legend({ variant }: { variant: Variant }) {
  return (
    <div className="mt-3 flex items-end justify-between gap-1 rounded-xl bg-white/70 px-3 py-4 ring-1 ring-black/5">
      {LEVELS.map((label, status) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-3">
          <div className="grid h-8 place-items-center font-arabic text-xl">
            <MWord text="كلمة" status={status} variant={variant} />
          </div>
          <span className="text-center text-[9px] font-medium leading-tight text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const VARIANTS: { key: Variant; name: string; blurb: string }[] = [
  {
    key: "fill",
    name: "1 · Filling underline",
    blurb:
      "One underline that fills along its length (right→left) as the word is learned — empty track at Unknown, full bar at Known. The one you asked to see. Continuous, quiet.",
  },
  {
    key: "segments",
    name: "2 · Segmented bar",
    blurb:
      "Same underline, but split into four segments that light up one by one — continuous like the fill, yet still countable at a glance.",
  },
  {
    key: "ticks",
    name: "3 · Ticks (current)",
    blurb:
      "Four short detached ticks centred under the word. Most explicitly countable; reads a little busier.",
  },
  {
    key: "dots",
    name: "4 · Dots",
    blurb:
      "Four small dots filling in. Softest, most tasbīḥ-like; the level is countable but understated.",
  },
  {
    key: "weight",
    name: "5 · Weight & ink",
    blurb:
      "A single underline that grows thicker and darker with status — no counting, just a felt sense of 'more settled'. The most minimal.",
  },
  {
    key: "sprout",
    name: "6 · Growing sprout",
    blurb:
      "A tiny leaf under the word that grows with mastery — on-brand with the garden vine. Charming, but the busiest per-word.",
  },
];

export function UndermarkLab() {
  return (
    <div className="min-h-full w-full bg-mist px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-garden-700/70">
          Wird · undermark variants
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">
          Pick the mark under the word
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          The word always stays crisp ink — only the small mark beneath it carries
          status (0→4). Real words from An-Nisāʾ (p.78). Tell me the number you
          want and I&rsquo;ll lock it into the reader.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VARIANTS.map((v) => (
            <div key={v.key} className="flex flex-col">
              <h3 className="text-lg font-semibold text-forest">{v.name}</h3>
              <p className="mb-3 mt-1 text-sm leading-snug text-muted-foreground">{v.blurb}</p>
              <MiniPage variant={v.key} />
              <Legend variant={v.key} />
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Lab only — static mock statuses. Reveal mechanism still TBD (D1&rsquo;s
          page-jump needs fixing separately).
        </p>
      </div>
    </div>
  );
}
