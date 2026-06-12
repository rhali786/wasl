import { readStatuses, writeStatuses } from "../lib/storage";
import type { WordStatus } from "../lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("review storage (localStorage boundary)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns an empty object when nothing has been stored", () => {
    expect(readStatuses()).toEqual({});
  });

  it("round-trips statuses through localStorage", () => {
    const statuses: Record<string, WordStatus> = {
      قل: { id: "قل", level: 3, cleanReads: 9 },
    };
    writeStatuses(statuses);
    expect(readStatuses()).toEqual(statuses);
  });

  it("returns an empty object and logs a warning on malformed JSON", () => {
    const { logger } = jest.requireMock("@/features/lib/logger");
    window.localStorage.setItem("wird:wordStatuses", "{not json");
    expect(readStatuses()).toEqual({});
    expect(logger.warn).toHaveBeenCalled();
  });

  it("overwrites previously stored statuses", () => {
    writeStatuses({ a: { id: "a", level: 1, cleanReads: 1 } });
    writeStatuses({ b: { id: "b", level: 2, cleanReads: 3 } });
    expect(readStatuses()).toEqual({ b: { id: "b", level: 2, cleanReads: 3 } });
  });
});
