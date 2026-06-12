import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Reader, FLASH_FADE_MS, FLASH_MS } from "../components/Reader";
import { demote } from "@/features/review/lib/engine";
import { defaultStatus, type WordStatus } from "@/features/review/lib/types";
import type { CorpusPage } from "@/features/corpus/lib/types";

jest.mock("@/features/review/store", () => ({
  getStatuses: jest.fn(),
  demoteWord: jest.fn(),
  finishPage: jest.fn(),
}));

jest.mock("@/features/session/components/SessionProvider", () => ({
  useSession: jest.fn(),
}));

import { getStatuses, demoteWord, finishPage } from "@/features/review/store";
import { useSession } from "@/features/session/components/SessionProvider";
import type { Session } from "@/features/session/lib/types";

const mockGetStatuses = getStatuses as jest.Mock;
const mockDemoteWord = demoteWord as jest.Mock;
const mockFinishPage = finishPage as jest.Mock;
const mockUseSession = useSession as jest.Mock;

// Default session context: no active session. Individual tests override.
function noSession() {
  return {
    session: null,
    remainingMs: 0,
    nudge: null,
    dismissNudge: jest.fn(),
    advanceStep: jest.fn(),
    startStudySession: jest.fn(),
    endSession: jest.fn(),
  };
}

const ACTIVE_SESSION: Session = {
  id: "s1",
  startedAt: 0,
  durationMs: 300_000,
  movedIds: [],
  plan: [],
  stepIndex: 0,
};

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
    mockUseSession.mockReturnValue(noSession());
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
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
    expect(known.filter((t) => t.className.includes("bg-tick-on"))).toHaveLength(4);
    // "الله" is Unknown (0) -> haze present
    const alif = pageLines().getByText("الله");
    expect(within(alif.parentElement as HTMLElement).getByTestId("unknown-haze")).toBeInTheDocument();
  });

  it("Study: tapping a word reveals its meaning nearby, demotes (Engine B), and updates ticks for every occurrence of that form", () => {
    render(<Reader page={PAGE} />);
    const occurrences = pageLines().getAllByText("بسم");
    fireEvent.click(occurrences[0]);

    expect(mockDemoteWord).toHaveBeenCalledWith("بسم");

    // the meaning card reveals near the tapped occurrence
    expect(screen.getByTestId("word-meaning")).toHaveTextContent("In the name");

    // level 2 -> demote -> level 1 for BOTH occurrences (per-form sharing)
    expect(ticksFor("بسم", 0).filter((t) => t.className.includes("bg-tick-on"))).toHaveLength(1);
    expect(ticksFor("بسم", 1).filter((t) => t.className.includes("bg-tick-on"))).toHaveLength(1);
  });

  it("Mushaf: tapping reveals the meaning but does not demote, and the undermark stays read-only", () => {
    render(<Reader page={PAGE} initialMode="mushaf" />);
    const occurrences = pageLines().getAllByText("بِسْمِ"); // full tashkīl in Mushaf
    fireEvent.click(occurrences[0]);

    expect(mockDemoteWord).not.toHaveBeenCalled();
    expect(screen.getByTestId("word-meaning")).toHaveTextContent("In the name");

    // level unchanged (still 2 -> two ticks filled)
    expect(ticksFor("بِسْمِ", 0).filter((t) => t.className.includes("bg-tick-on"))).toHaveLength(2);
  });

  it("mode slider shows Study and Mushaf labels and switches display", () => {
    render(<Reader page={PAGE} />);
    expect(screen.getByTestId("mode-slider")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Study" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByText("بسم")).toHaveLength(2);
    expect(screen.queryByText("بِسْمِ")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mushaf" }));

    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("بِسْمِ")).toHaveLength(2);
    expect(screen.queryByText("بسم")).not.toBeInTheDocument();
  });

  it("initializes Mushaf from localStorage without flashing Study first", () => {
    window.localStorage.setItem("wird:readerMode", "mushaf");
    render(<Reader page={PAGE} />);
    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switching the slider to Study starts a session", () => {
    const startStudySession = jest.fn();
    mockUseSession.mockReturnValue({ ...noSession(), startStudySession });
    render(<Reader page={PAGE} initialMode="mushaf" />);

    fireEvent.click(screen.getByRole("button", { name: "Study" }));
    expect(startStudySession).toHaveBeenCalledTimes(1);
  });

  it("switching the slider to Mushaf ends an active session without the summary overlay", () => {
    const endSession = jest.fn();
    mockUseSession.mockReturnValue({
      ...noSession(),
      session: ACTIVE_SESSION,
      endSession,
    });
    render(<Reader page={PAGE} initialMode="study" />);

    fireEvent.click(screen.getByRole("button", { name: "Mushaf" }));
    expect(endSession).toHaveBeenCalledWith({ summary: false });
  });

  it("Mushaf mode persists across page navigation (sticky until the slider is used)", () => {
    const { unmount } = render(<Reader page={PAGE} initialMode="mushaf" />);
    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "true");
    unmount();

    // Next page push carries no ?mode= query — initialMode is undefined, as
    // ReaderRoute would pass it on /reader/{n+1}.
    render(<Reader page={PAGE} />);
    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "true");
  });

  it("an explicit ?mode= entry overrides and re-persists the mode", () => {
    const { unmount } = render(<Reader page={PAGE} initialMode="mushaf" />);
    expect(screen.getByRole("button", { name: "Mushaf" })).toHaveAttribute("aria-pressed", "true");
    unmount();

    // Re-entering from Home with ?mode=study wins over the persisted Mushaf.
    render(<Reader page={PAGE} initialMode="study" />);
    expect(screen.getByRole("button", { name: "Study" })).toHaveAttribute("aria-pressed", "true");
  });

  it("tapping a word shows its meaning card; tapping elsewhere dismisses it", () => {
    render(<Reader page={PAGE} />);
    expect(screen.queryByTestId("word-meaning")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText("بسم")[0]);
    expect(screen.getByTestId("word-meaning")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("reader-frame"));
    expect(screen.queryByTestId("word-meaning")).not.toBeInTheDocument();
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

  it("has no top exit/back button (navigation lives at the bottom now)", () => {
    render(<Reader page={PAGE} />);
    expect(screen.queryByLabelText("Exit reader")).not.toBeInTheDocument();
  });

  it("shows surah, juz, and page metadata between the paging arrows", () => {
    render(<Reader page={PAGE} hasNextPage hasPreviousPage />);
    const next = screen.getByLabelText("Next page");
    const prev = screen.getByLabelText("Previous page");
    const meta = screen.getByText(/Al-Fatihah · juz 1/);
    expect(next.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(prev.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(screen.getByText(/page 5/)).toBeInTheDocument();
  });

  it("swiping left on touch advances to the next page", () => {
    const onNextPage = jest.fn();
    render(<Reader page={PAGE} hasNextPage onNextPage={onNextPage} />);

    const frame = screen.getByTestId("reader-frame");
    fireEvent.touchStart(frame, { touches: [{ clientX: 200, clientY: 300 }] });
    fireEvent.touchEnd(frame, { changedTouches: [{ clientX: 120, clientY: 300 }] });

    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it("swiping right on touch goes to the previous page", () => {
    const onPreviousPage = jest.fn();
    render(<Reader page={PAGE} hasPreviousPage onPreviousPage={onPreviousPage} />);

    const frame = screen.getByTestId("reader-frame");
    fireEvent.touchStart(frame, { touches: [{ clientX: 120, clientY: 300 }] });
    fireEvent.touchEnd(frame, { changedTouches: [{ clientX: 200, clientY: 300 }] });

    expect(onPreviousPage).toHaveBeenCalledTimes(1);
  });

  it("shows a slow-fading promotion whisper when finishing a page promotes words", () => {
    jest.useFakeTimers();
    const onNextPage = jest.fn();
    mockFinishPage.mockImplementation(() => ({
      ...backing,
      الله: { id: "الله", level: 1, cleanReads: 1 },
    }));

    try {
      render(<Reader page={PAGE} hasNextPage onNextPage={onNextPage} />);
      fireEvent.click(screen.getByLabelText("Next page"));

      expect(screen.getByTestId("promotion-flash")).toHaveTextContent("+1 word learned");

      act(() => {
        jest.advanceTimersByTime(FLASH_MS - FLASH_FADE_MS - 1);
      });
      expect(screen.getByTestId("promotion-flash").className).not.toContain("opacity-0");

      act(() => {
        jest.advanceTimersByTime(FLASH_FADE_MS + 1);
      });
      expect(screen.queryByTestId("promotion-flash")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("no longer shows a 'Done for now' button", () => {
    render(<Reader page={PAGE} />);
    expect(screen.queryByLabelText("Done for now")).not.toBeInTheDocument();
  });

  it("the time's-up nudge's Done button ends the session and dismisses the nudge", () => {
    const endSession = jest.fn();
    const dismissNudge = jest.fn();
    mockUseSession.mockReturnValue({
      ...noSession(),
      session: ACTIVE_SESSION,
      nudge: { kind: "timeup" },
      endSession,
      dismissNudge,
    });
    render(<Reader page={PAGE} />);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(endSession).toHaveBeenCalledTimes(1);
    expect(dismissNudge).toHaveBeenCalledTimes(1);
  });

  it("shows the session timer bar only while a session is active", () => {
    const { rerender } = render(<Reader page={PAGE} />);
    expect(screen.queryByTestId("session-timer")).not.toBeInTheDocument();

    mockUseSession.mockReturnValue({
      ...noSession(),
      session: ACTIVE_SESSION,
      remainingMs: 150_000,
    });
    rerender(<Reader page={PAGE} />);
    expect(screen.getByTestId("session-timer")).toBeInTheDocument();
  });

  it("a step nudge advances the session and opens that sūrah's page", () => {
    const advanceStep = jest.fn();
    const onGoToPage = jest.fn();
    const step = {
      category: "memorized" as const,
      surah: 67,
      page: 562,
      name: "Al-Mulk",
      weight: 5,
    };
    mockUseSession.mockReturnValue({
      ...noSession(),
      session: { ...ACTIVE_SESSION, plan: [step] },
      nudge: { kind: "step", step },
      advanceStep,
    });
    render(<Reader page={PAGE} onGoToPage={onGoToPage} />);

    expect(screen.getByTestId("session-nudge")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(advanceStep).toHaveBeenCalledTimes(1);
    expect(onGoToPage).toHaveBeenCalledWith(562);
  });
});
