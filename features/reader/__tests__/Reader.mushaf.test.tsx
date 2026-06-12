import { fireEvent, render, screen } from "@testing-library/react";
import { Reader } from "../components/Reader";
import { defaultStatus, type WordStatus } from "@/features/review/lib/types";
import type { CorpusPage } from "@/features/corpus/lib/types";

// Mushaf mode is read-only: no occurrence of demoteWord (Engine B) or
// finishPage (Engine A) may ever be called while in Mushaf, regardless of
// how many words are tapped or how the page is turned.
// docs/design-interaction.md "Mushaf mode never mutates status".

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

const mockGetStatuses = getStatuses as jest.Mock;
const mockDemoteWord = demoteWord as jest.Mock;
const mockFinishPage = finishPage as jest.Mock;
const mockUseSession = useSession as jest.Mock;

function noSession() {
  return {
    session: null,
    remainingMs: 0,
    nudge: null,
    dismissNudge: jest.fn(),
    advanceStep: jest.fn(),
    endSession: jest.fn(),
  };
}

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

describe("Reader — Mushaf mode never mutates status", () => {
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

    mockUseSession.mockReturnValue(noSession());
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("tapping every word on the page never demotes any word-form", () => {
    render(<Reader page={PAGE} initialMode="mushaf" />);

    // Tap every occurrence of every word, including the repeated form.
    for (const text of ["بِسْمِ", "اللَّهِ", "نَعْبُدُ"]) {
      for (const el of screen.getAllByText(text)) {
        fireEvent.click(el);
      }
    }

    expect(mockDemoteWord).not.toHaveBeenCalled();
  });

  it("turning the page (Next/Previous) never finishes the page (Engine A)", () => {
    const onNextPage = jest.fn();
    const onPreviousPage = jest.fn();
    render(
      <Reader
        page={PAGE}
        initialMode="mushaf"
        hasNextPage
        hasPreviousPage
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
    );

    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByLabelText("Previous page"));

    expect(mockFinishPage).not.toHaveBeenCalled();
    expect(onNextPage).toHaveBeenCalledTimes(1);
    expect(onPreviousPage).toHaveBeenCalledTimes(1);
  });

  it("tapping words and then turning the page leaves status untouched end-to-end", () => {
    const onNextPage = jest.fn();
    render(<Reader page={PAGE} initialMode="mushaf" hasNextPage onNextPage={onNextPage} />);

    fireEvent.click(screen.getAllByText("بِسْمِ")[0]);
    fireEvent.click(screen.getByText("اللَّهِ"));
    fireEvent.click(screen.getByLabelText("Next page"));

    expect(mockDemoteWord).not.toHaveBeenCalled();
    expect(mockFinishPage).not.toHaveBeenCalled();
  });

  it("leaving the reader (unmount) from Mushaf does not finish the page", () => {
    const { unmount } = render(<Reader page={PAGE} initialMode="mushaf" />);
    fireEvent.click(screen.getAllByText("بِسْمِ")[0]);
    unmount();

    expect(mockFinishPage).not.toHaveBeenCalled();
  });
});
