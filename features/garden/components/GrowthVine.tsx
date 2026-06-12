"use client";

import { motion, useReducedMotion } from "motion/react";
import { TICK_ON } from "@/features/reader/components/Ticks";

// The home's single growth signal: a branch that sprouts one leaf per return.
// Open-ended — no denominator, no ceiling, never a streak (design-visual.md
// §growth vine). A missed day removes nothing.
export function GrowthVine({
  returns,
  className,
}: {
  returns: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const n = Math.max(0, Math.floor(returns));
  const step = 15;
  const startX = 8;
  const width = startX + Math.max(1, n) * step + 8;
  const midY = 15;

  return (
    <svg
      viewBox={`0 0 ${width} 30`}
      width={width}
      height={30}
      className={className}
      role="img"
      aria-label={`${n} return${n === 1 ? "" : "s"} — your garden is growing`}
    >
      {/* the branch */}
      <path
        d={`M${startX} ${midY} H${startX + n * step}`}
        stroke="#7fa988"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {Array.from({ length: n }).map((_, i) => {
        const x = startX + (i + 1) * step;
        const up = i % 2 === 0;
        const y = up ? midY - 5 : midY + 5;
        return (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, delay: reduce ? 0 : i * 0.07, ease: [0.22, 1, 0.28, 1] }}
            style={{ transformBox: "fill-box", transformOrigin: `${x}px ${midY}px` }}
          >
            <ellipse
              cx={x}
              cy={y}
              rx="5.2"
              ry="2.7"
              fill={TICK_ON}
              transform={`rotate(${up ? -38 : 38} ${x} ${y})`}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
