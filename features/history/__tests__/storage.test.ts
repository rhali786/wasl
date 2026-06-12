import { readHistory, writeHistory } from "../lib/storage";
import type { History } from "../lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("history storage (localStorage boundary)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns an empty object when nothing has been stored", () => {
    expect(readHistory()).toEqual({});
  });

  it("round-trips history through localStorage", () => {
    const history: History = {
      "2026-06-11": { promotions: 2, demotions: 1 },
    };
    writeHistory(history);
    expect(readHistory()).toEqual(history);
  });

  it("returns an empty object and logs a warning on malformed JSON", () => {
    const { logger } = jest.requireMock("@/features/lib/logger");
    window.localStorage.setItem("wird:history", "{not json");
    expect(readHistory()).toEqual({});
    expect(logger.warn).toHaveBeenCalled();
  });

  it("overwrites previously stored history", () => {
    writeHistory({ "2026-06-10": { promotions: 1, demotions: 0 } });
    writeHistory({ "2026-06-11": { promotions: 0, demotions: 2 } });
    expect(readHistory()).toEqual({ "2026-06-11": { promotions: 0, demotions: 2 } });
  });
});
