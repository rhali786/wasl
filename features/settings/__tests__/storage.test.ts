import { readSettings, writeSettings } from "../lib/storage";
import { DEFAULT_SETTINGS, type Settings } from "../lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("settings storage (localStorage boundary)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("returns defaults when nothing has been stored", () => {
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("round-trips settings through localStorage", () => {
    const settings: Settings = {
      memorized: [112, 113, 114],
      memorizing: [67],
      sessionMinutes: 10,
    };
    writeSettings(settings);
    expect(readSettings()).toEqual(settings);
  });

  it("fills missing fields from defaults (tolerates partial/legacy data)", () => {
    window.localStorage.setItem("wird:settings", JSON.stringify({ memorized: [1] }));
    expect(readSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      memorized: [1],
    });
  });

  it("returns defaults and logs a warning on malformed JSON", () => {
    const { logger } = jest.requireMock("@/features/lib/logger");
    window.localStorage.setItem("wird:settings", "{not json");
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
    expect(logger.warn).toHaveBeenCalled();
  });
});
