import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  SessionProvider,
  useSession,
  INTRO_FADE_IN_MS,
  INTRO_FADE_OUT_MS,
  INTRO_HOLD_MS,
  INTRO_MS,
  SUMMARY_MS,
} from "../components/SessionProvider";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

let mockPath = "/reader/5";
let mockMode: string | null = "study";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPath,
  useSearchParams: () => ({
    get: (key: string) => (key === "mode" ? mockMode : null),
  }),
}));

function Probe() {
  const { session, remainingMs, nudge } = useSession();
  return (
    <div>
      <span data-testid="active">{session ? "yes" : "no"}</span>
      <span data-testid="remaining">{remainingMs}</span>
      <span data-testid="nudge">{nudge?.kind ?? "none"}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <SessionProvider>
      <Probe />
    </SessionProvider>
  );
}

describe("SessionProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPath = "/reader/5";
    mockMode = "study";
  });

  it("starts a session on a deliberate Study entry (?mode=study)", () => {
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
  });

  it("does not start a session for a free read (no ?mode=study)", () => {
    mockMode = null;
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("no");
  });

  it("does not start a session entering Mushaf (?mode=mushaf)", () => {
    mockMode = "mushaf";
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("no");
  });

  it("starts a session and shows intro when ?mode=study arrives while already in the reader", () => {
    mockMode = null;
    const { rerender } = renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("no");

    mockMode = "study";
    rerender(
      <SessionProvider>
        <Probe />
      </SessionProvider>
    );

    expect(screen.getByTestId("active").textContent).toBe("yes");
    expect(screen.getByTestId("session-intro")).toBeInTheDocument();
  });

  it("shows intro that fades in, holds, then fades out", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      const intro = screen.getByTestId("session-intro");
      expect(intro.className).toContain("opacity-0");

      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(screen.getByTestId("session-intro").className).toContain("opacity-100");

      act(() => {
        jest.advanceTimersByTime(INTRO_FADE_IN_MS + INTRO_HOLD_MS - 1);
      });
      expect(screen.getByTestId("session-intro").className).toContain("opacity-100");

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(screen.getByTestId("session-intro").className).toContain("opacity-0");

      act(() => {
        jest.advanceTimersByTime(INTRO_FADE_OUT_MS);
      });
      expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("dismisses the intro when tapped", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(screen.getByTestId("session-intro")).toBeInTheDocument();
      act(() => {
        screen.getByTestId("session-intro").click();
      });
      expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("dismisses the summary when tapped", () => {
    jest.useFakeTimers();
    try {
      const { rerender } = renderProvider();
      act(() => {
        jest.advanceTimersByTime(INTRO_MS);
      });

      mockPath = "/browse";
      rerender(
        <SessionProvider>
          <Probe />
        </SessionProvider>
      );

      expect(screen.getByTestId("session-summary")).toBeInTheDocument();
      act(() => {
        screen.getByTestId("session-summary").click();
      });
      expect(screen.queryByTestId("session-summary")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("does not show an intro for a free read (no ?mode=study)", () => {
    mockMode = null;
    renderProvider();
    expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
  });

  it("shows a summary when leaving the reader ends a session, then dismisses itself", () => {
    jest.useFakeTimers();
    try {
      const { rerender } = renderProvider();
      expect(screen.getByTestId("active").textContent).toBe("yes");
      act(() => {
        jest.advanceTimersByTime(INTRO_MS);
      });

      mockPath = "/browse";
      rerender(
        <SessionProvider>
          <Probe />
        </SessionProvider>
      );

      expect(screen.getByTestId("session-summary")).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(SUMMARY_MS);
      });
      expect(screen.queryByTestId("session-summary")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("ends the session when leaving the reader for a hub", () => {
    const { rerender } = renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
    mockPath = "/browse";
    rerender(
      <SessionProvider>
        <Probe />
      </SessionProvider>
    );
    expect(screen.getByTestId("active").textContent).toBe("no");
  });

  it("keeps the session active when the app is backgrounded (tab/focus loss)", () => {
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByTestId("active").textContent).toBe("yes");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  it("counts the remaining time down as the session runs", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      expect(Number(screen.getByTestId("remaining").textContent)).toBe(300_000);
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      expect(Number(screen.getByTestId("remaining").textContent)).toBe(240_000);
    } finally {
      jest.useRealTimers();
    }
  });

  it("startStudySession begins a session and shows the intro", () => {
    mockMode = null;
    function Starter() {
      const { startStudySession, session } = useSession();
      return (
        <div>
          <span data-testid="active">{session ? "yes" : "no"}</span>
          <button type="button" onClick={startStudySession}>
            Start
          </button>
        </div>
      );
    }
    render(
      <SessionProvider>
        <Starter />
      </SessionProvider>
    );
    expect(screen.getByTestId("active").textContent).toBe("no");
    act(() => {
      screen.getByRole("button", { name: "Start" }).click();
    });
    expect(screen.getByTestId("active").textContent).toBe("yes");
    expect(screen.getByTestId("session-intro")).toBeInTheDocument();
  });

  it("nudges the user when the session time elapses", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      expect(screen.getByTestId("nudge").textContent).toBe("none");
      act(() => {
        jest.advanceTimersByTime(300_000);
      });
      expect(screen.getByTestId("nudge").textContent).toBe("timeup");
    } finally {
      jest.useRealTimers();
    }
  });
});
