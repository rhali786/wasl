import { render, screen } from "@testing-library/react";
import { MetricsView } from "../components/MetricsView";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

jest.mock("@/features/review/store", () => ({
  getAllStatuses: jest.fn(),
}));

jest.mock("@/features/history/store", () => ({
  getTotalReturns: jest.fn(),
  getTotalSessions: jest.fn(),
  getMonthlyMovement: jest.fn(),
  getReturnGrid: jest.fn(),
  getDailyMovement: jest.fn(),
}));

import { getAllStatuses } from "@/features/review/store";
import {
  getDailyMovement,
  getMonthlyMovement,
  getReturnGrid,
  getTotalReturns,
  getTotalSessions,
} from "@/features/history/store";

const mockGetAllStatuses = getAllStatuses as jest.Mock;
const mockGetTotalReturns = getTotalReturns as jest.Mock;
const mockGetTotalSessions = getTotalSessions as jest.Mock;
const mockGetMonthlyMovement = getMonthlyMovement as jest.Mock;
const mockGetReturnGrid = getReturnGrid as jest.Mock;
const mockGetDailyMovement = getDailyMovement as jest.Mock;

const surahs: SurahIndexEntry[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", page: 1, juz: 1 },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", page: 2, juz: 1 },
  { number: 3, name: "Ali 'Imran", arabic: "آل عمران", page: 50, juz: 4 },
];

const wordIndex = {
  totalWords: 4,
  allIds: ["a", "b", "c", "d"],
  bySurah: {
    "1": ["a", "b"],
    "2": ["c"],
    "3": ["d"],
  },
};

const EMPTY_GRID = Array.from({ length: 6 }, () => Array(7).fill(false));
const EMPTY_DAILY = Array.from({ length: 14 }, () => ({ up: 0, down: 0 }));

describe("MetricsView", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("empty state: no statuses or history yet", () => {
    mockGetAllStatuses.mockReturnValue({});
    mockGetTotalReturns.mockReturnValue(0);
    mockGetTotalSessions.mockReturnValue(0);
    mockGetMonthlyMovement.mockReturnValue({ promotions: 0, demotions: 0 });
    mockGetReturnGrid.mockReturnValue(EMPTY_GRID);
    mockGetDailyMovement.mockReturnValue(EMPTY_DAILY);

    render(<MetricsView surahs={surahs} wordIndex={wordIndex} />);

    // first-run: a warm invitation, not a discouraging "0 of N" count
    expect(screen.getByText(/starts in the fog/i)).toBeInTheDocument();
    expect(screen.queryByText(/0 of 3 surahs/)).not.toBeInTheDocument();
    expect(screen.getByText(/0 study sessions completed/i)).toBeInTheDocument();
    expect(screen.getByText(/0 sessions · 0 days/i)).toBeInTheDocument();
    // all 4 ids default to Unknown (level 0)
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    const unknownCount = screen.getAllByText("4");
    expect(unknownCount.length).toBeGreaterThan(0);
  });

  it("populated state: numbers reconcile with the mocked store contents", () => {
    mockGetAllStatuses.mockReturnValue({
      a: { id: "a", level: 4, cleanReads: 12 },
      b: { id: "b", level: 4, cleanReads: 12 },
    });
    mockGetTotalReturns.mockReturnValue(7);
    mockGetTotalSessions.mockReturnValue(12);
    mockGetMonthlyMovement.mockReturnValue({ promotions: 5, demotions: 2 });
    mockGetReturnGrid.mockReturnValue(EMPTY_GRID);
    mockGetDailyMovement.mockReturnValue(EMPTY_DAILY);

    render(<MetricsView surahs={surahs} wordIndex={wordIndex} />);

    // Al-Fatihah (a, b both Known) is fully luminous; the others are not.
    expect(screen.getByText(/1 of 3 surahs/)).toBeInTheDocument();
    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByText("Al-Baqarah").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);

    // sessions, return-days, and movement come straight from the history store
    expect(screen.getByText(/12 study sessions completed/i)).toBeInTheDocument();
    expect(screen.getByText(/12 sessions · 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/\+5 \/ −2 this month/)).toBeInTheDocument();
  });
});
