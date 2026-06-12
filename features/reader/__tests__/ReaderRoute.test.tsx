import { render, screen, fireEvent } from "@testing-library/react";
import { ReaderRoute } from "../components/ReaderRoute";
import type { CorpusPage } from "@/features/corpus/lib/types";
import { TOTAL_PAGES } from "@/features/corpus/lib/types";

jest.mock("@/features/review/store", () => ({
  getStatuses: jest.fn(() => ({})),
  demoteWord: jest.fn(),
  finishPage: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockWriteLastPage = jest.fn();
jest.mock("../lib/lastPage", () => ({
  writeLastPage: (page: number) => mockWriteLastPage(page),
}));

import { finishPage } from "@/features/review/store";
const mockFinishPage = finishPage as jest.Mock;

const PAGE: CorpusPage = {
  page: 5,
  surah: "Al-Fatihah",
  surahAr: "الفاتحة",
  juz: 1,
  firstVerse: "1:1",
  lastVerse: "1:2",
  lines: [
    {
      line: 1,
      words: [{ t: "بِسْمِ", en: "In the name", type: "word", ayah: 1, key: "1:1", id: "بسم" }],
    },
  ],
};

describe("ReaderRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("persists the visited page on mount", () => {
    render(<ReaderRoute page={PAGE} pageNumber={5} />);
    expect(mockWriteLastPage).toHaveBeenCalledWith(5);
  });

  it("Next page navigates to /reader/{n+1} and finishes the page (Study)", () => {
    render(<ReaderRoute page={PAGE} pageNumber={5} />);
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(mockPush).toHaveBeenCalledWith("/reader/6");
    expect(mockFinishPage).toHaveBeenCalled();
  });

  it("Previous page navigates to /reader/{n-1} without finishing the page", () => {
    render(<ReaderRoute page={PAGE} pageNumber={5} />);
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(mockPush).toHaveBeenCalledWith("/reader/4");
    expect(mockFinishPage).not.toHaveBeenCalled();
  });

  it("Done for now returns to the Garden home", () => {
    render(<ReaderRoute page={PAGE} pageNumber={5} />);
    fireEvent.click(screen.getByLabelText("Done for now"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("disables Next page on the last page", () => {
    render(<ReaderRoute page={PAGE} pageNumber={TOTAL_PAGES} />);
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("disables Previous page on the first page", () => {
    render(<ReaderRoute page={PAGE} pageNumber={1} />);
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("passes initialMode through to Reader", () => {
    render(<ReaderRoute page={PAGE} pageNumber={5} initialMode="mushaf" />);
    expect(screen.getByLabelText(/Mode: Mushaf/)).toBeInTheDocument();
  });
});
