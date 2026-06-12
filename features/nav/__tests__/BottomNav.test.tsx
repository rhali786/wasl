import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { BottomNav } from "../components/BottomNav";
import { writeLastPage } from "@/features/reader/lib/lastPage";

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

  it("Reader tab defaults to /reader/1 when no page has been visited", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Reader" })).toHaveAttribute("href", "/reader/1");
  });

  it("Reader tab opens the last-visited page", () => {
    writeLastPage(42);
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Reader" })).toHaveAttribute("href", "/reader/42");
  });

  it("a /reader/[page] pathname marks the Reader tab active", () => {
    mockUsePathname.mockReturnValue("/reader/12");
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Reader" })).toHaveAttribute("aria-current", "page");
  });
});
