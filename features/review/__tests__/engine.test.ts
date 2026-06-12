import {
  levelFor,
  applyCleanRead,
  demote,
  resolvePageFinish,
} from "../lib/engine";
import { defaultStatus, THRESHOLDS, type WordStatus } from "../lib/types";

describe("levelFor", () => {
  it("steps through THRESHOLDS = [1,3,6,12]", () => {
    expect(levelFor(0)).toBe(0);
    expect(levelFor(1)).toBe(1);
    expect(levelFor(2)).toBe(1);
    expect(levelFor(3)).toBe(2);
    expect(levelFor(5)).toBe(2);
    expect(levelFor(6)).toBe(3);
    expect(levelFor(11)).toBe(3);
    expect(levelFor(12)).toBe(4);
    expect(levelFor(100)).toBe(4);
  });
});

describe("applyCleanRead (Engine A)", () => {
  it("increments cleanReads and recomputes level", () => {
    let status = defaultStatus("w");
    status = applyCleanRead(status);
    expect(status).toEqual({ id: "w", level: 1, cleanReads: 1 });
  });

  it("Known (level 4) is reachable only via 12 clean reads", () => {
    let status = defaultStatus("w");
    for (let i = 1; i <= 11; i++) {
      status = applyCleanRead(status);
      expect(status.level).toBeLessThan(4);
    }
    status = applyCleanRead(status);
    expect(status.cleanReads).toBe(12);
    expect(status.level).toBe(4);
  });

  it("keeps level at the ceiling (4) past 12 clean reads", () => {
    let status: WordStatus = { id: "w", level: 4, cleanReads: 12 };
    status = applyCleanRead(status);
    expect(status).toEqual({ id: "w", level: 4, cleanReads: 13 });
  });
});

describe("demote (Engine B)", () => {
  it("Unknown stays Unknown", () => {
    expect(demote(defaultStatus("w"))).toEqual({ id: "w", level: 0, cleanReads: 0 });
  });

  it.each([
    [{ id: "w", level: 1 as const, cleanReads: 2 }, { id: "w", level: 0, cleanReads: 0 }],
    [{ id: "w", level: 2 as const, cleanReads: 4 }, { id: "w", level: 1, cleanReads: THRESHOLDS[0] }],
    [{ id: "w", level: 3 as const, cleanReads: 9 }, { id: "w", level: 2, cleanReads: THRESHOLDS[1] }],
    [{ id: "w", level: 4 as const, cleanReads: 15 }, { id: "w", level: 3, cleanReads: THRESHOLDS[2] }],
  ])("steps down one level and resets cleanReads to the new level's floor", (input, expected) => {
    expect(demote(input)).toEqual(expected);
  });

  it("re-climb after demotion costs the right number of clean reads", () => {
    // Familiar (2, cleanReads=4) -> demote -> Seen (1, cleanReads=1).
    let status = demote({ id: "w", level: 2, cleanReads: 4 });
    expect(status).toEqual({ id: "w", level: 1, cleanReads: 1 });

    // Reaching Familiar again requires cleanReads to hit THRESHOLDS[1]=3,
    // i.e. 2 more clean reads from the floor of 1.
    status = applyCleanRead(status);
    expect(status.level).toBe(1);
    status = applyCleanRead(status);
    expect(status).toEqual({ id: "w", level: 2, cleanReads: 3 });
  });
});

describe("resolvePageFinish (Engine A entry point)", () => {
  it("grants exactly one clean-read credit per unique untapped id, even if repeated on the page", () => {
    const result = resolvePageFinish({}, ["a", "a", "b"], new Set(["b"]));
    expect(result["a"]).toEqual({ id: "a", level: 1, cleanReads: 1 });
  });

  it("does not promote ids tapped anywhere on the page (per-form sharing)", () => {
    // قل appears three times on the page; one occurrence was tapped.
    const result = resolvePageFinish({}, ["قل", "قل", "قل"], new Set(["قل"]));
    expect(result["قل"]).toBeUndefined();
  });

  it("defaults missing statuses before applying the clean read", () => {
    const result = resolvePageFinish({}, ["a"], new Set());
    expect(result["a"]).toEqual({ id: "a", level: 1, cleanReads: 1 });
  });

  it("preserves untouched statuses for ids not on the page", () => {
    const prev: Record<string, WordStatus> = { z: { id: "z", level: 2, cleanReads: 4 } };
    const result = resolvePageFinish(prev, ["a"], new Set());
    expect(result["z"]).toEqual(prev["z"]);
  });

  it("Known is reached only after 12 page-finishes with that word untapped", () => {
    let statuses: Record<string, WordStatus> = {};
    for (let i = 1; i <= 11; i++) {
      statuses = resolvePageFinish(statuses, ["a"], new Set());
      expect(statuses["a"].level).toBeLessThan(4);
    }
    statuses = resolvePageFinish(statuses, ["a"], new Set());
    expect(statuses["a"]).toEqual({ id: "a", level: 4, cleanReads: 12 });
  });
});
