import { loadPage } from "../lib/pages";

describe("loadPage", () => {
  it("loads page 1 (Al-Fatihah)", () => {
    const page = loadPage(1);
    expect(page.page).toBe(1);
    expect(page.surah).toBe("Al-Fatihah");
    expect(page.lines.length).toBeGreaterThan(0);
  });

  it("loads page 604 (last page)", () => {
    const page = loadPage(604);
    expect(page.page).toBe(604);
    expect(page.lines.length).toBeGreaterThan(0);
  });
});
