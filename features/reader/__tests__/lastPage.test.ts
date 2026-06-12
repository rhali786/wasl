import { readLastPage, writeLastPage } from "../lib/lastPage";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("lastPage (localStorage boundary)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("defaults to page 1 when nothing has been stored", () => {
    expect(readLastPage()).toBe(1);
  });

  it("round-trips a written page number", () => {
    writeLastPage(42);
    expect(readLastPage()).toBe(42);
  });

  it("falls back to 1 for out-of-range or non-numeric stored values", () => {
    window.localStorage.setItem("wird:lastPage", "0");
    expect(readLastPage()).toBe(1);

    window.localStorage.setItem("wird:lastPage", "605");
    expect(readLastPage()).toBe(1);

    window.localStorage.setItem("wird:lastPage", "not-a-number");
    expect(readLastPage()).toBe(1);
  });
});
