"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

export type TreeMood = "day" | "mist" | "evening" | "night";

type Palette = {
  c0: string; // dappled highlight
  c1: string; // canopy light
  c2: string; // canopy mid
  c3: string; // canopy edge
  trunkTop: string;
  trunkBot: string;
  glow: string; // luminous halo behind canopy (transparent => off)
  gold: string;
};

const PALETTES: Record<TreeMood, Palette> = {
  day: {
    c0: "#d9f4c4", c1: "#8fd06f", c2: "#4faf5e", c3: "#2f8a4c",
    trunkTop: "#9a6238", trunkBot: "#5f3d22", glow: "rgba(63,191,104,0)", gold: "#c9a24b",
  },
  mist: {
    c0: "#e9f7e1", c1: "#b3e0a6", c2: "#7cc389", c3: "#5aa775",
    trunkTop: "#a4794f", trunkBot: "#6f4f33", glow: "rgba(120,200,140,0)", gold: "#cdb070",
  },
  evening: {
    c0: "#f1e7ad", c1: "#a9c971", c2: "#5f9a54", c3: "#3c7a45",
    trunkTop: "#7d5230", trunkBot: "#4d3320", glow: "rgba(201,162,75,0.12)", gold: "#d8b25a",
  },
  night: {
    c0: "#9be6a8", c1: "#43d17c", c2: "#1f8f55", c3: "#0f5a39",
    trunkTop: "#3c2c1f", trunkBot: "#211610", glow: "rgba(67,209,124,0.45)", gold: "#e7c768",
  },
};

type Blob = { cx: number; cy: number; r: number; outer?: boolean };

// A rounded crown built from overlapping blobs. `outer` blobs fade in as the
// tree grows (Known-word %), so a young tree reads sparser than a full one.
const CANOPY: Blob[] = [
  { cx: 120, cy: 92, r: 58 },
  { cx: 120, cy: 60, r: 40 },
  { cx: 84, cy: 104, r: 44, outer: true },
  { cx: 158, cy: 104, r: 44, outer: true },
  { cx: 95, cy: 70, r: 34 },
  { cx: 148, cy: 72, r: 34 },
  { cx: 92, cy: 132, r: 30, outer: true },
  { cx: 152, cy: 132, r: 30, outer: true },
];

const HIGHLIGHTS = [
  { cx: 101, cy: 68, r: 12 },
  { cx: 122, cy: 56, r: 8 },
  { cx: 86, cy: 96, r: 7 },
];

const GOLD = [
  { cx: 140, cy: 84, r: 2.4 },
  { cx: 104, cy: 112, r: 2.2 },
  { cx: 132, cy: 120, r: 2 },
  { cx: 118, cy: 76, r: 1.8 },
];

export function Tree({
  knownPct = 0.45,
  mood = "day",
  size = 240,
  breathe = true,
  className,
}: {
  knownPct?: number;
  mood?: TreeMood;
  size?: number;
  breathe?: boolean;
  className?: string;
}) {
  const id = useId().replace(/[:]/g, "");
  const reduce = useReducedMotion();
  const p = PALETTES[mood];

  const pct = Math.max(0, Math.min(1, knownPct));
  const grow = 0.66 + 0.34 * pct; // crown scale
  const outerOpacity = Math.max(0, Math.min(1, (pct - 0.12) * 1.5));

  return (
    <svg
      viewBox="0 0 240 264"
      width={size}
      height={(size * 264) / 240}
      className={className}
      role="img"
      aria-label="The living tree, rooted in known words"
    >
      <defs>
        <radialGradient id={`canopy-${id}`} cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor={p.c0} />
          <stop offset="38%" stopColor={p.c1} />
          <stop offset="74%" stopColor={p.c2} />
          <stop offset="100%" stopColor={p.c3} />
        </radialGradient>
        <linearGradient id={`trunk-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={p.trunkBot} />
          <stop offset="45%" stopColor={p.trunkTop} />
          <stop offset="100%" stopColor={p.trunkBot} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={p.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id={`ground-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p.c2} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.c3} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* luminous halo (night) */}
      <rect x="0" y="0" width="240" height="200" fill={`url(#glow-${id})`} />

      {/* ground mound */}
      <ellipse cx="120" cy="244" rx="86" ry="15" fill={`url(#ground-${id})`} />

      {/* trunk + roots */}
      <path
        d="M110 244 C107 218 106 196 110 168 C112 150 110 140 120 140 C130 140 128 150 130 168 C134 196 133 218 130 244 C126 246 114 246 110 244 Z"
        fill={`url(#trunk-${id})`}
      />
      <path
        d="M120 232 C118 210 119 188 120 168"
        stroke={p.trunkBot}
        strokeOpacity="0.35"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* canopy — breathes as one, scales with growth */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 88%" }}
        animate={breathe && !reduce ? { scale: [1, 1.025, 1] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform={`translate(120 96) scale(${grow}) translate(-120 -96)`}>
          {CANOPY.map((b, i) => (
            <circle
              key={i}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={`url(#canopy-${id})`}
              opacity={b.outer ? outerOpacity : 1}
            />
          ))}
          {HIGHLIGHTS.map((h, i) => (
            <circle key={`h${i}`} cx={h.cx} cy={h.cy} r={h.r} fill={p.c0} opacity="0.55" />
          ))}
          {GOLD.map((g, i) => (
            <circle key={`g${i}`} cx={g.cx} cy={g.cy} r={g.r} fill={p.gold} opacity={0.5 + 0.5 * pct} />
          ))}
        </g>
      </motion.g>
    </svg>
  );
}

// A single seedling — used for invitations, empty states, and gallery chips.
export function Sprout({
  mood = "day",
  size = 64,
  className,
}: {
  mood?: TreeMood;
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/[:]/g, "");
  const reduce = useReducedMotion();
  const p = PALETTES[mood];
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id={`leaf-${id}`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor={p.c0} />
          <stop offset="60%" stopColor={p.c1} />
          <stop offset="100%" stopColor={p.c2} />
        </radialGradient>
        <radialGradient id={`sglow-${id}`} cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor={p.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="72" height="72" fill={`url(#sglow-${id})`} />
      <path d="M36 64 C36 52 36 44 36 38" stroke={p.c3} strokeWidth="3" strokeLinecap="round" fill="none" />
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 90%" }}
        animate={reduce ? undefined : { rotate: [-2, 2, -2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* left leaf */}
        <path d="M36 42 C24 42 14 34 12 24 C24 22 35 28 36 42 Z" fill={`url(#leaf-${id})`} />
        {/* right leaf */}
        <path d="M36 40 C48 38 58 30 60 20 C48 19 37 26 36 40 Z" fill={`url(#leaf-${id})`} />
      </motion.g>
    </svg>
  );
}
