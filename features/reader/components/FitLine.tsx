"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// A single mushaf line that NEVER wraps and NEVER overflows: it measures its
// natural width and scales the font down until the row fits, then spreads the
// words edge-to-edge (justify-between) like a real mushaf line.
//
// The fit runs only when `dep` changes (NOT on every render) and writes the
// final font size straight to the DOM, so re-renders from tapping a word can
// never resize the text. useLayoutEffect runs pre-paint, so there's no flicker.
export function FitLine({
  children,
  dep,
  base = 23,
  className = "",
  lineHeight = 2.2,
}: {
  children: ReactNode;
  dep?: unknown; // changes => re-fit (e.g. page + mode). omit => fit once on mount.
  base?: number;
  className?: string;
  lineHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(base);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.fontSize = `${base}px`; // measure at base
    const avail = el.clientWidth;
    const natural = el.scrollWidth; // with justify-between, only exceeds avail when overflowing
    const next = natural > avail + 1 ? Math.max(11, base * (avail / natural) - 0.4) : base;
    el.style.fontSize = `${next}px`; // persist final size even if setSize is a no-op
    setSize(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, base]);

  return (
    <div
      ref={ref}
      dir="rtl"
      className={`flex flex-nowrap items-center justify-between font-arabic ${className}`}
      style={{ fontSize: `${size}px`, lineHeight }}
    >
      {children}
    </div>
  );
}
