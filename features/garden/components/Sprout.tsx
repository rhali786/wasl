"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

// Placeholder growth illustration — the cute sapling that stands in for the
// painterly tree until that art lands. Mood-neutral by design (the background
// shifts with time of day; the plant does not). Used faint, as backdrop.
export const SPROUT_SWAY_ROTATE_DEG = 11;
export const SPROUT_SWAY_SCALE_MIN = 0.92;
export const SPROUT_SWAY_SCALE_MAX = 1.08;
export const SPROUT_SWAY_DURATION_S = 4.6;

export function Sprout({
  size = 72,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 72 84"
      width={size}
      height={(size * 84) / 72}
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={`leaf-${id}`} cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#d9f4c4" />
          <stop offset="58%" stopColor="#7fcb86" />
          <stop offset="100%" stopColor="#2f8a4c" />
        </radialGradient>
      </defs>
      <path
        d="M36 80 C36 64 36 52 36 44"
        stroke="#2f8a4c"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 92%" }}
        animate={
          reduce
            ? undefined
            : {
                rotate: [
                  -SPROUT_SWAY_ROTATE_DEG,
                  SPROUT_SWAY_ROTATE_DEG,
                  -SPROUT_SWAY_ROTATE_DEG,
                ],
                scale: [
                  SPROUT_SWAY_SCALE_MIN,
                  SPROUT_SWAY_SCALE_MAX,
                  SPROUT_SWAY_SCALE_MIN,
                ],
              }
        }
        transition={{
          duration: SPROUT_SWAY_DURATION_S,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <path d="M36 48 C23 48 12 39 10 28 C24 26 35 33 36 48 Z" fill={`url(#leaf-${id})`} />
        <path d="M36 46 C49 44 60 35 62 24 C49 23 37 30 36 46 Z" fill={`url(#leaf-${id})`} />
        <path d="M36 40 C30 36 26 30 26 23 C33 24 37 30 36 40 Z" fill={`url(#leaf-${id})`} opacity="0.85" />
      </motion.g>
    </svg>
  );
}
