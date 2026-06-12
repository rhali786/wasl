import { buildSessionPlan, stepDurations } from "../lib/plan";
import type { Settings } from "@/features/settings/lib/types";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

// Fixture sūrahs with page gaps that make Al-Baqarah (#2) the longest of the
// non-selected sūrahs by page-span (48 pages). #114 is last → tiny span.
const SURAHS: SurahIndexEntry[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", page: 1, juz: 1 },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", page: 2, juz: 1 },
  { number: 3, name: "Aal-Imran", arabic: "آل عمران", page: 50, juz: 3 },
  { number: 114, name: "An-Nas", arabic: "الناس", page: 604, juz: 30 },
];

function settings(partial: Partial<Settings>): Settings {
  return { memorized: [], memorizing: [], sessionMinutes: 5, ...partial };
}

describe("buildSessionPlan", () => {
  it("returns an empty plan when the user has selected no sūrahs", () => {
    expect(buildSessionPlan(settings({}), SURAHS)).toEqual([]);
  });

  it("orders the steps memorized → memorizing → longer with 5:3:2 weights", () => {
    const plan = buildSessionPlan(
      settings({ memorized: [1], memorizing: [3] }),
      SURAHS
    );
    expect(plan.map((s) => s.category)).toEqual([
      "memorized",
      "memorizing",
      "longer",
    ]);
    expect(plan.map((s) => s.weight)).toEqual([5, 3, 2]);
    expect(plan[0]).toMatchObject({ surah: 1, page: 1 });
    expect(plan[1]).toMatchObject({ surah: 3, page: 50 });
  });

  it("derives the longer step from the longest non-selected sūrah (page-span)", () => {
    const plan = buildSessionPlan(
      settings({ memorized: [1], memorizing: [3] }),
      SURAHS
    );
    const longer = plan.find((s) => s.category === "longer");
    expect(longer?.surah).toBe(2); // Al-Baqarah, longest of {2, 114}
  });

  it("includes a breadth step even when only memorized is set", () => {
    const plan = buildSessionPlan(settings({ memorized: [1] }), SURAHS);
    expect(plan.map((s) => s.category)).toEqual(["memorized", "longer"]);
  });
});

describe("stepDurations", () => {
  it("splits the total time by normalized 5:3:2 weights", () => {
    const plan = buildSessionPlan(
      settings({ memorized: [1], memorizing: [3] }),
      SURAHS
    );
    const budgets = stepDurations(plan, 600_000); // 10 min
    expect(budgets).toEqual([300_000, 180_000, 120_000]); // 5/10, 3/10, 2/10
  });

  it("returns an empty array for an empty plan", () => {
    expect(stepDurations([], 600_000)).toEqual([]);
  });
});
