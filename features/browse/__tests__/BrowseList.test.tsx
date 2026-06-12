import { render, screen } from "@testing-library/react";
import { BrowseList } from "../components/BrowseList";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

const SURAHS: SurahIndexEntry[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", page: 1, juz: 1 },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", page: 2, juz: 1 },
  { number: 114, name: "An-Nas", arabic: "الناس", page: 604, juz: 30 },
];

describe("BrowseList", () => {
  it("explains what the list is for", () => {
    render(<BrowseList surahs={SURAHS} />);
    expect(screen.getByRole("heading", { name: /find a sūrah/i })).toBeInTheDocument();
    expect(screen.getByText(/tap any sūrah to open the reader/i)).toBeInTheDocument();
  });

  it("links each surah to its starting page in the reader", () => {
    render(<BrowseList surahs={SURAHS} />);
    expect(screen.getByRole("link", { name: /Al-Fatihah/ })).toHaveAttribute("href", "/reader/1");
    expect(screen.getByRole("link", { name: /An-Nas/ })).toHaveAttribute("href", "/reader/604");
  });

  it("shows the arabic name and juz for each surah", () => {
    render(<BrowseList surahs={SURAHS} />);
    expect(screen.getByText("الفاتحة")).toBeInTheDocument();
    expect(screen.getAllByText(/juz 1$/i)).toHaveLength(2);
    expect(screen.getByText(/juz 30/i)).toBeInTheDocument();
  });
});
