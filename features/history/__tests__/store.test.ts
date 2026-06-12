import {
  recordReturn,
  recordMovement,
  getTotalReturns,
  getMonthlyMovement,
  getReturnGrid,
  getDailyMovement,
} from "../store";
import type { History } from "../lib/types";

jest.mock("../lib/storage", () => ({
  readHistory: jest.fn(),
  writeHistory: jest.fn(),
}));

import { readHistory, writeHistory } from "../lib/storage";

const mockRead = readHistory as jest.Mock;
const mockWrite = writeHistory as jest.Mock;

describe("history store", () => {
  let backing: History;
  const now = new Date(2026, 5, 11);

  beforeEach(() => {
    backing = {};
    mockRead.mockImplementation(() => backing);
    mockWrite.mockImplementation((next: History) => {
      backing = next;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("recordReturn persists a return for the given day", () => {
    recordReturn(now);
    expect(backing).toEqual({ "2026-06-11": { promotions: 0, demotions: 0 } });
    expect(getTotalReturns()).toBe(1);
  });

  it("recordMovement persists and accumulates promotions/demotions", () => {
    recordMovement(2, 1, now);
    recordMovement(1, 0, now);
    expect(backing).toEqual({ "2026-06-11": { promotions: 3, demotions: 1 } });
  });

  it("getMonthlyMovement reflects recorded movement for the current month", () => {
    recordMovement(4, 2, now);
    expect(getMonthlyMovement(now)).toEqual({ promotions: 4, demotions: 2 });
  });

  it("getReturnGrid marks today as a return after recordReturn", () => {
    recordReturn(now);
    const grid = getReturnGrid(now);
    expect(grid[5][6]).toBe(true);
  });

  it("getDailyMovement reflects today's recorded movement", () => {
    recordMovement(5, 0, now);
    const days = getDailyMovement(now);
    expect(days[13]).toEqual({ up: 5, down: 0 });
  });
});
