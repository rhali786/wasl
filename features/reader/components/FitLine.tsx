"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { computeFit, type FitJustify } from "../lib/fitLine";

// A single mushaf line that NEVER wraps and NEVER overflows: it measures its
// natural width and either scales the font down until the row fits, justifies
// it edge-to-edge like a packed mushaf line, or — when the words are clearly
// short of full — centers them (Al-Fātiḥah, surah-final lines, the short last
// surahs). See ../lib/fitLine.ts for the decision (computeFit).
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
  const [justify, setJustify] = useState<FitJustify>("between");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.fontSize = `${base}px`; // measure at base
    // Measure the true (un-stretched) content width: justify-between would
    // spread the words to fill the row and hide how short the line really is.
    const prevJustify = el.style.justifyContent;
    el.style.justifyContent = "flex-start";
    const avail = el.clientWidth;
    const natural = el.scrollWidth;
    el.style.justifyContent = prevJustify;

    const fit = computeFit(avail, natural, base);
    el.style.fontSize = `${fit.size}px`; // persist final size even if setSize is a no-op
    setSize(fit.size);
    setJustify(fit.justify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, base]);

  return (
    <div
      ref={ref}
      dir="rtl"
      className={`flex flex-nowrap items-center font-arabic ${
        justify === "center" ? "justify-center gap-[0.25em]" : "justify-between"
      } ${className}`}
      style={{ fontSize: `${size}px`, lineHeight }}
    >
      {children}
    </div>
  );
}
