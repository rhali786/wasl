import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { BottomNav } from "../components/BottomNav";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

const mockUsePathname = usePathname as jest.Mock;

describe("BottomNav", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUsePathname.mockReturnValue("/");
  });

  it.each([
    ["/", "Home", "/"],
    ["/browse", "Browse", "/browse"],
    ["/metrics", "Metrics", "/metrics"],
    ["/settings", "Settings", "/settings"],
  ])("marks %s active and links %s to %s", (pathname, label, href) => {
    mockUsePathname.mockReturnValue(pathname);
    render(<BottomNav />);
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("links every tab with its href even when inactive", () => {
    mockUsePathname.mockReturnValue("/");
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Browse" })).toHaveAttribute("href", "/browse");
    expect(screen.getByRole("link", { name: "Metrics" })).toHaveAttribute("href", "/metrics");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "Browse" })).not.toHaveAttribute("aria-current");
  });

  it("Reader tab defaults to /reader/1 in Study mode when no sūrahs are set up", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Reader" })).toHaveAttribute(
      "href",
      "/reader/1?mode=study"
    );
  });

  it("Reader tab opens the page Home recommends, in Study mode (the sūrah being memorized)", async () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    render(<BottomNav />);
    expect(await screen.findByRole("link", { name: "Reader" })).toHaveAttribute(
      "href",
      "/reader/604?mode=study" // Al-Ikhlas
    );
  });

  it("a /reader/[page] pathname marks the Reader tab active", () => {
    mockUsePathname.mockReturnValue("/reader/12");
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Reader" })).toHaveAttribute("aria-current", "page");
  });
});
