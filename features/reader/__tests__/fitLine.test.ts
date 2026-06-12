import { computeFit, FILL_RATIO, FIT_MIN_PX } from "../lib/fitLine";

describe("computeFit", () => {
  it("keeps the justified default when there is no layout yet (jsdom/SSR)", () => {
    expect(computeFit(0, 0, 23)).toEqual({ size: 23, justify: "between" });
  });

  it("justifies a line that nearly fills the available width", () => {
    // 0.85 of the width is comfortably above FILL_RATIO → stretch edge-to-edge.
    expect(computeFit(100, 85, 23)).toEqual({ size: 23, justify: "between" });
  });

  it("justifies a line exactly at the fill threshold", () => {
    const natural = 100 * FILL_RATIO;
    expect(computeFit(100, natural, 23)).toEqual({ size: 23, justify: "between" });
  });

  it("centers a clearly short line at the base size (Fātiḥah / short surahs)", () => {
    // 0.4 of the width — far short of full, so center instead of stretching.
    expect(computeFit(100, 40, 23)).toEqual({ size: 23, justify: "center" });
  });

  it("scales an overflowing line down to fit and keeps it justified", () => {
    const { size, justify } = computeFit(100, 200, 23);
    expect(justify).toBe("between");
    expect(size).toBeLessThan(23);
    expect(size).toBeGreaterThanOrEqual(FIT_MIN_PX);
  });

  it("never scales below the floor", () => {
    const { size } = computeFit(10, 10000, 23);
    expect(size).toBe(FIT_MIN_PX);
  });
});
