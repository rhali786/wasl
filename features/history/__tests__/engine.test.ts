import {
  dateKey,
  withReturn,
  withMovement,
  totalReturns,
  monthlyMovement,
  returnGrid,
  dailyMovement,
} from "../lib/engine";
import type { History } from "../lib/types";

describe("dateKey", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2026, 5, 11))).toBe("2026-06-11");
    expect(dateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("withReturn", () => {
  it("creates a zeroed entry for an unseen date", () => {
    const result = withReturn({}, new Date(2026, 5, 11));
    expect(result).toEqual({ "2026-06-11": { promotions: 0, demotions: 0 } });
  });

  it("is idempotent — does not reset an existing entry", () => {
    const history: History = { "2026-06-11": { promotions: 2, demotions: 1 } };
    const result = withReturn(history, new Date(2026, 5, 11));
    expect(result).toEqual(history);
  });
});

describe("withMovement", () => {
  it("creates an entry with the given counts", () => {
    const result = withMovement({}, new Date(2026, 5, 11), 2, 1);
    expect(result).toEqual({ "2026-06-11": { promotions: 2, demotions: 1 } });
  });

  it("accumulates across calls on the same day", () => {
    let history = withMovement({}, new Date(2026, 5, 11), 2, 1);
    history = withMovement(history, new Date(2026, 5, 11), 1, 0);
    expect(history).toEqual({ "2026-06-11": { promotions: 3, demotions: 1 } });
  });

  it("implies a return (the entry existing is the return signal)", () => {
    const history = withMovement({}, new Date(2026, 5, 11), 0, 1);
    expect(totalReturns(history)).toBe(1);
  });
});

describe("totalReturns", () => {
  it("counts unique recorded days regardless of their values", () => {
    const history: History = {
      "2026-06-09": { promotions: 0, demotions: 0 },
      "2026-06-10": { promotions: 5, demotions: 2 },
      "2026-06-11": { promotions: 0, demotions: 0 },
    };
    expect(totalReturns(history)).toBe(3);
  });
});

describe("monthlyMovement", () => {
  it("sums only entries within the same calendar month as `now`", () => {
    const history: History = {
      "2026-05-30": { promotions: 10, demotions: 10 }, // previous month
      "2026-06-01": { promotions: 2, demotions: 1 },
      "2026-06-11": { promotions: 3, demotions: 0 },
    };
    expect(monthlyMovement(history, new Date(2026, 5, 11))).toEqual({
      promotions: 5,
      demotions: 1,
    });
  });

  it("returns zeros when nothing was recorded this month", () => {
    expect(monthlyMovement({}, new Date(2026, 5, 11))).toEqual({
      promotions: 0,
      demotions: 0,
    });
  });
});

describe("returnGrid", () => {
  it("returns a weeks x 7 grid with today as the last cell", () => {
    const now = new Date(2026, 5, 11);
    const history = withReturn({}, now);
    const grid = returnGrid(history, now, 6);
    expect(grid).toHaveLength(6);
    expect(grid[5]).toHaveLength(7);
    expect(grid[5][6]).toBe(true); // today
    expect(grid[5][5]).toBe(false); // yesterday
    expect(grid[0][0]).toBe(false); // 41 days ago
  });

  it("is all-false for an empty history", () => {
    const grid = returnGrid({}, new Date(2026, 5, 11), 6);
    expect(grid.flat().every((cell) => cell === false)).toBe(true);
  });
});

describe("dailyMovement", () => {
  it("returns `days` entries oldest -> newest, zero-filled when absent", () => {
    const now = new Date(2026, 5, 11);
    const history = withMovement({}, now, 3, 1);
    const days = dailyMovement(history, now, 14);
    expect(days).toHaveLength(14);
    expect(days[13]).toEqual({ up: 3, down: 1 }); // today
    expect(days[12]).toEqual({ up: 0, down: 0 }); // yesterday, no entry
  });
});
