import { fireEvent, render, screen, within } from "@testing-library/react";
import { Reader } from "../components/Reader";
import { demote } from "@/features/review/lib/engine";
import { defaultStatus, type WordStatus } from "@/features/review/lib/types";
import type { CorpusPage } from "@/features/corpus/lib/types";

jest.mock("@/features/review/store", () => ({
  getStatuses: jest.fn(),
  demoteWord: jest.fn(),
  finishPage: jest.fn(),
}));

import { getStatuses, demoteWord, finishPage } from "@/features/review/store";

const mockGetStatuses = getStatuses as jest.Mock;
const mockDemoteWord = demoteWord as jest.Mock;
const mockFinishPage = finishPage as jest.Mock;

// "بِسْمِ" appears on both lines (per-form sharing); "بسم" is both its
// normalized id (features/corpus/lib/normalize.ts) and its Study-mode
// display text (features/reader/lib/displayText.ts).
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
      words: [
        { t: "بِسْمِ", en: "In the name", type: "word", ayah: 1, key: "1:1", id: "بسم" },
        { t: "اللَّهِ", en: "of Allah", type: "word", ayah: 1, key: "1:1", id: "الله" },
        { t: "١", en: "(1)", type: "end", ayah: 1, key: "1:1", id: "١" },
      ],
    },
    {
      line: 2,
      words: [
        { t: "بِسْمِ", en: "in this name", type: "word", ayah: 2, key: "1:2", id: "بسم" },
        { t: "نَعْبُدُ", en: "we worship", type: "word", ayah: 2, key: "1:2", id: "نعبد" },
      ],
    },
  ],
};

const ALL_WORD_IDS = ["بسم", "الله", "بسم", "نعبد"];

describe("Reader", () => {
  let backing: Record<string, WordStatus>;

  beforeEach(() => {
    backing = {
      بسم: { id: "بسم", level: 2, cleanReads: 4 },
      الله: { id: "الله", level: 0, cleanReads: 0 },
      نعبد: { id: "نعبد", level: 4, cleanReads: 12 },
    };

    mockGetStatuses.mockImplementation((ids: readonly string[]) => {
      const result: Record<string, WordStatus> = {};
      for (const id of ids) result[id] = backing[id] ?? defaultStatus(id);
      return result;
    });

    mockDemoteWord.mockImplementation((id: string) => {
      const next = demote(backing[id] ?? defaultStatus(id));
      backing[id] = next;
      return next;
    });

    mockFinishPage.mockImplementation(() => backing);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function pageLines() {
    return within(screen.getByTestId("page-lines"));
  }

  function ticksFor(text: string, index = 0) {
    const span = pageLines().getAllByText(text)[index];
    return within(span.parentElement as HTMLElement).getAllByTestId("tick");
  }

  it("renders the page (populated state): header, words, end markers", () => {
    render(<Reader page={PAGE} />);
    expect(screen.getByText(/Al-Fatihah/)).toBeInTheDocument();
    expect(screen.getByText(/page 5/)).toBeInTheDocument();
    expect(pageLines().getAllByText("بسم")).toHaveLength(2); // Study mode strips tashkīl
    expect(pageLines().getByText("الله")).toBeInTheDocument();
    expect(pageLines().getByText("نعبد")).toBeInTheDocument();
    expect(pageLines().getByText("1")).toBeInTheDocument(); // end-of-ayah marker
  });

  it("renders an empty page without crashing", () => {
    render(<Reader page={{ ...PAGE, lines: [] }} />);
    expect(screen.getByText(/Al-Fatihah/)).toBeInTheDocument();
    expect(screen.queryAllByTestId("tick")).toHaveLength(0);
  });

  it("shows real status from the store: ticks + Unknown haze (populated)", () => {
    render(<Reader page={PAGE} />);
    // "نعبد" is Known (4) -> all four ticks filled
    const known = ticksFor("نعبد");
    expect(known.filter((t) => t.style.background === "rgb(63, 143, 92)")).toHaveLength(4);
    // "الله" is Unknown (0) -> haze present
    const alif = pageLines().getByText("الله");
    expect(within(alif.parentElement as HTMLElement).getByTestId("unknown-haze")).toBeInTheDocument();
  });

  it("Study: tapping a word opens the ribbon, demotes (Engine B), and updates ticks for every occurrence of that form", () => {
    render(<Reader page={PAGE} />);
    const occurrences = pageLines().getAllByText("بسم");
    fireEvent.click(occurrences[0]);

    expect(mockDemoteWord).toHaveBeenCalledWith("بسم");

    // ribbon reveals the tapped occurrence's gloss
    const ribbon = screen.getByTestId("ribbon");
    expect(within(ribbon).getByText("In the name")).toBeInTheDocument();
    expect(ribbon).toHaveStyle({ opacity: "1" });

    // level 2 -> demote -> level 1 for BOTH occurrences (per-form sharing)
    expect(ticksFor("بسم", 0).filter((t) => t.style.background === "rgb(63, 143, 92)")).toHaveLength(1);
    expect(ticksFor("بسم", 1).filter((t) => t.style.background === "rgb(63, 143, 92)")).toHaveLength(1);
  });

  it("Mushaf: tapping reveals but does not demote, and the undermark stays read-only", () => {
    render(<Reader page={PAGE} initialMode="mushaf" />);
    const occurrences = pageLines().getAllByText("بِسْمِ"); // full tashkīl in Mushaf
    fireEvent.click(occurrences[0]);

    expect(mockDemoteWord).not.toHaveBeenCalled();
    const ribbon = screen.getByTestId("ribbon");
    expect(within(ribbon).getByText("In the name")).toBeInTheDocument();

    // level unchanged (still 2 -> two ticks filled)
    expect(ticksFor("بِسْمِ", 0).filter((t) => t.style.background === "rgb(63, 143, 92)")).toHaveLength(2);
  });

  it("mode toggle switches between Study (stripped) and Mushaf (full tashkīl) display", () => {
    render(<Reader page={PAGE} />);
    expect(screen.getAllByText("بسم")).toHaveLength(2);
    expect(screen.queryByText("بِسْمِ")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Mode: Study/));

    expect(screen.getAllByText("بِسْمِ")).toHaveLength(2);
    expect(screen.queryByText("بسم")).not.toBeInTheDocument();
  });

  it("ribbon is always mounted (never shifts the page) and toggles via opacity", () => {
    render(<Reader page={PAGE} />);
    const ribbon = screen.getByTestId("ribbon");
    expect(ribbon.className).toContain("absolute");
    expect(ribbon).toHaveStyle({ opacity: "0" });

    fireEvent.click(screen.getAllByText("بسم")[0]);
    expect(screen.getByTestId("ribbon")).toBe(ribbon); // same node, not remounted
    expect(ribbon).toHaveStyle({ opacity: "1" });
  });

  it("Engine A: Next page (Study) finishes the page — untapped words get clean-read credit", () => {
    const onNextPage = jest.fn();
    render(<Reader page={PAGE} hasNextPage onNextPage={onNextPage} />);

    fireEvent.click(screen.getByLabelText("Next page"));

    expect(mockFinishPage).toHaveBeenCalledWith(ALL_WORD_IDS, new Set());
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it("Engine A: a tapped word is excluded from its page's clean-read credit", () => {
    const onNextPage = jest.fn();
    render(<Reader page={PAGE} hasNextPage onNextPage={onNextPage} />);

    fireEvent.click(screen.getAllByText("بسم")[0]); // tap one occurrence of بسم
    fireEvent.click(screen.getByLabelText("Next page"));

    expect(mockFinishPage).toHaveBeenCalledWith(ALL_WORD_IDS, new Set(["بسم"]));
  });

  it("Mushaf: Next page does not finish the page (Engine A dormant)", () => {
    const onNextPage = jest.fn();
    render(<Reader page={PAGE} initialMode="mushaf" hasNextPage onNextPage={onNextPage} />);

    fireEvent.click(screen.getByLabelText("Next page"));

    expect(mockFinishPage).not.toHaveBeenCalled();
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it("Previous page never finishes the page, in either mode", () => {
    const onPreviousPage = jest.fn();
    render(<Reader page={PAGE} hasPreviousPage onPreviousPage={onPreviousPage} />);

    fireEvent.click(screen.getByLabelText("Previous page"));

    expect(mockFinishPage).not.toHaveBeenCalled();
    expect(onPreviousPage).toHaveBeenCalledTimes(1);
  });

  it("constrains the page to a mobile-width frame so FitLine doesn't stretch gaps across a desktop viewport", () => {
    render(<Reader page={PAGE} />);
    expect(screen.getByTestId("reader-frame").className).toContain("max-w-[440px]");
  });

  it("disables pagination controls when there is no next/previous page", () => {
    render(<Reader page={PAGE} />);
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("Exit button calls onExit and does not mutate status (Study mode)", () => {
    const onExit = jest.fn();
    render(<Reader page={PAGE} onExit={onExit} />);

    fireEvent.click(screen.getByLabelText("Exit reader"));

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(mockFinishPage).not.toHaveBeenCalled();
    expect(mockDemoteWord).not.toHaveBeenCalled();
  });

  it("Exit button calls onExit and does not mutate status (Mushaf mode)", () => {
    const onExit = jest.fn();
    render(<Reader page={PAGE} initialMode="mushaf" onExit={onExit} />);

    fireEvent.click(screen.getByLabelText("Exit reader"));

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(mockFinishPage).not.toHaveBeenCalled();
    expect(mockDemoteWord).not.toHaveBeenCalled();
  });
});
