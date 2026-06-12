import { computeStatusSpread, computeSurahPct, fmtK } from "../lib/computeStats";
import type { WordStatus } from "@/features/review/lib/types";

describe("computeStatusSpread", () => {
  it("sums to allIds.length, defaulting missing ids to level 0", () => {
    const statuses: Record<string, WordStatus> = {
      a: { id: "a", level: 4, cleanReads: 12 },
    };
    const counts = computeStatusSpread(["a", "b", "c"], statuses);
    expect(counts.reduce((sum, c) => sum + c, 0)).toBe(3);
    expect(counts[4]).toBe(1);
    expect(counts[0]).toBe(2);
  });

  it("returns all-zero spread for an empty id list", () => {
    expect(computeStatusSpread([], {})).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("computeSurahPct", () => {
  it("returns 0 for an empty id list", () => {
    expect(computeSurahPct([], {})).toBe(0);
  });

  it("returns the fraction of ids at level 4 (Known)", () => {
    const statuses: Record<string, WordStatus> = {
      a: { id: "a", level: 4, cleanReads: 12 },
      b: { id: "b", level: 2, cleanReads: 4 },
    };
    expect(computeSurahPct(["a", "b"], statuses)).toBe(0.5);
  });

  it("treats ids missing from statuses as level 0 (not Known)", () => {
    expect(computeSurahPct(["a"], {})).toBe(0);
  });
});

describe("fmtK", () => {
  it("formats numbers under 1000 as-is", () => {
    expect(fmtK(0)).toBe("0");
    expect(fmtK(42)).toBe("42");
  });

  it("formats thousands with one decimal, dropping a trailing .0", () => {
    expect(fmtK(14697)).toBe("14.7k");
    expect(fmtK(1000)).toBe("1k");
  });
});
