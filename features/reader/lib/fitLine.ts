// Pure fit math for a single mushaf line, kept out of the React component so it
// can be unit-tested without a layout engine (jsdom has none). Given the line's
// available width and its natural content width (measured un-stretched), decide
// the final font size and how the words should sit:
//
//  - overflow  → scale the font down so the line fits, then spread edge-to-edge
//                (justify-between) like a justified mushaf line.
//  - nearly full → keep the base size and justify edge-to-edge.
//  - clearly short → keep the base size but CENTER the words. Real maṣāḥif
//                center short lines (Al-Fātiḥah, surah-final lines, the short
//                last surahs like Al-Ikhlāṣ/An-Nās) rather than stretching a
//                handful of words across the whole width.

/** Smallest font we will scale down to before giving up (px). */
export const FIT_MIN_PX = 11;

/**
 * A line whose natural width is at least this fraction of the available width
 * is treated as a "full" line and justified; anything shorter is centered.
 * Tunable: lower → more lines justify (stretch); higher → more lines center.
 * Madani-mushaf lines are packed, so normal lines measure well above this.
 */
export const FILL_RATIO = 0.66;

export type FitJustify = "between" | "center";
export type FitResult = { size: number; justify: FitJustify };

export function computeFit(avail: number, natural: number, base: number): FitResult {
  // No layout yet (SSR / jsdom) — keep the justified default, unscaled.
  if (avail <= 0 || natural <= 0) return { size: base, justify: "between" };

  if (natural > avail + 1) {
    const size = Math.max(FIT_MIN_PX, base * (avail / natural) - 0.4);
    return { size, justify: "between" };
  }

  if (natural >= avail * FILL_RATIO) {
    return { size: base, justify: "between" };
  }

  return { size: base, justify: "center" };
}
