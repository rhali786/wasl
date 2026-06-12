"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TICK_ON } from "@/features/reader/components/Ticks";

// A small leaf shape, attached at the origin and reaching up-left — mirrored
// vertically for leaves below the branch. Mirrors the painterly gradient
// style of the Sprout backdrop (features/garden/components/Sprout.tsx) so the
// vine reads as the same hand as the tree, not a placeholder tick mark.
const LEAF_PATH = "M0 0 C-4 -1 -11 -3 -13 -9 C-7 -11 1 -7 0 0 Z";

// The home's single growth signal: a branch that sprouts one leaf per
// completed Study session. Open-ended — no denominator, no ceiling, never a
// streak (design-visual.md §growth vine). Multiple sessions on one day each
// earn their own leaf.
export function GrowthVine({
  sessions,
  className,
}: {
  sessions: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const n = Math.max(0, Math.floor(sessions));
  const step = 19;
  const startX = 10;
  const width = startX + Math.max(1, n) * step + 10;
  const midY = 22;
  const label = `${n} session${n === 1 ? "" : "s"}`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} 44`}
        width={width}
        height={44}
        role="img"
        aria-label={`${label} — your garden is growing`}
      >
        <defs>
          <radialGradient id={`vine-leaf-${id}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#d9f4c4" />
            <stop offset="55%" stopColor="#8cd49a" />
            <stop offset="100%" stopColor={TICK_ON} />
          </radialGradient>
        </defs>
        {/* the branch */}
        <path
          d={`M${startX} ${midY} H${startX + n * step}`}
          stroke="#7fa988"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {Array.from({ length: n }).map((_, i) => {
          const x = startX + (i + 1) * step;
          const up = i % 2 === 0;
          return (
            <motion.g
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, delay: reduce ? 0 : i * 0.07, ease: [0.22, 1, 0.28, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: `${x}px ${midY}px` }}
            >
              <path
                data-testid="vine-leaf"
                d={LEAF_PATH}
                fill={`url(#vine-leaf-${id})`}
                transform={`translate(${x} ${midY}) ${up ? "" : "scale(1 -1)"}`}
              />
            </motion.g>
          );
        })}
      </svg>
      <p className="mt-1 text-right text-[11px] font-medium text-muted-foreground">
        {label} so far
      </p>
    </div>
  );
}
