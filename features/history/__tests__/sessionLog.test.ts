import {
  getTotalSessions,
  readCompletedSessions,
  recordSessionComplete,
  writeCompletedSessions,
} from "../lib/sessionLog";

describe("sessionLog", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records each completed session separately, even on the same day", () => {
    recordSessionComplete(1_000);
    recordSessionComplete(2_000);
    expect(getTotalSessions()).toBe(2);
    expect(readCompletedSessions()).toEqual([1_000, 2_000]);
  });

  it("round-trips through localStorage", () => {
    writeCompletedSessions([5, 9]);
    expect(getTotalSessions()).toBe(2);
  });
});
