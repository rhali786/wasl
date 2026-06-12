import { getRecommendedPage } from "../lib/recommendedPage";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("getRecommendedPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to page 1 when no sūrahs are set up", () => {
    expect(getRecommendedPage()).toBe(1);
  });

  it("recommends the first memorizing sūrah's page", () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    expect(getRecommendedPage()).toBe(604); // Al-Ikhlas
  });

  it("falls back to the first memorized sūrah's page when nothing is memorizing", () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [2], memorizing: [], sessionMinutes: 5 })
    );
    expect(getRecommendedPage()).toBe(2); // Al-Baqarah
  });

  it("prefers memorizing over memorized when both are set", () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [2], memorizing: [112], sessionMinutes: 5 })
    );
    expect(getRecommendedPage()).toBe(604);
  });
});
