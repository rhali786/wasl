import {
  startSession,
  endSession,
  getSession,
  hasMoved,
  markMoved,
  advanceStep,
} from "../store";
import type { SessionStep } from "../lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

const PLAN: SessionStep[] = [
  { category: "memorized", surah: 1, page: 1, name: "Al-Fatihah", weight: 5 },
  { category: "longer", surah: 2, page: 2, name: "Al-Baqarah", weight: 2 },
];

describe("session store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("has no active session until one is started", () => {
    expect(getSession()).toBeNull();
  });

  it("starts and persists a session with the given plan and duration", () => {
    const s = startSession(PLAN, 300_000);
    expect(s.plan).toEqual(PLAN);
    expect(s.durationMs).toBe(300_000);
    expect(s.stepIndex).toBe(0);
    expect(getSession()?.id).toBe(s.id);
  });

  it("ends (clears) the session", () => {
    startSession(PLAN, 300_000);
    endSession();
    expect(getSession()).toBeNull();
  });

  it("tracks moved ids once per session (the throttle)", () => {
    startSession(PLAN, 300_000);
    expect(hasMoved("قل")).toBe(false);
    markMoved(["قل", "هو"]);
    expect(hasMoved("قل")).toBe(true);
    expect(hasMoved("هو")).toBe(true);
    // idempotent — no duplicates
    markMoved(["قل"]);
    expect(getSession()?.movedIds.filter((id) => id === "قل")).toHaveLength(1);
  });

  it("markMoved/hasMoved are inert when no session is active", () => {
    expect(hasMoved("قل")).toBe(false);
    markMoved(["قل"]);
    expect(getSession()).toBeNull();
  });

  it("advances the step index, clamped to the last step", () => {
    startSession(PLAN, 300_000);
    expect(advanceStep()?.stepIndex).toBe(1);
    expect(advanceStep()?.stepIndex).toBe(1); // clamped
  });
});
