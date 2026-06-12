import React from "react";
import { render, screen, act } from "@testing-library/react";
import { SessionProvider, useSession } from "../components/SessionProvider";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

// Controllable pathname for the start/end-on-route lifecycle.
let mockPath = "/reader/5";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPath,
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
    window.history.pushState({}, "", "/reader/5?mode=study");
  });

  it("starts a session on a deliberate Study entry (?mode=study)", () => {
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
  });

  it("does not start a session for a free read (no ?mode=study)", () => {
    window.history.pushState({}, "", "/reader/5");
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("no");
  });

  it("does not start a session entering Mushaf (?mode=mushaf)", () => {
    window.history.pushState({}, "", "/reader/5?mode=mushaf");
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("no");
  });

  it("shows a brief intro when a session starts, then dismisses itself", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      expect(screen.getByTestId("session-intro")).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("shows the intro overlay, then fades it out over its 1500ms duration", () => {
    jest.useFakeTimers();
    try {
      renderProvider();
      const intro = screen.getByTestId("session-intro");
      expect(intro.className).toContain("opacity-100");
      expect(intro.className).toContain("duration-[1500ms]");
      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(screen.getByTestId("session-intro").className).toContain("opacity-0");
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("does not show an intro for a free read (no ?mode=study)", () => {
    window.history.pushState({}, "", "/reader/5");
    renderProvider();
    expect(screen.queryByTestId("session-intro")).not.toBeInTheDocument();
  });

  it("shows a brief summary when leaving the reader ends a session, then dismisses itself", () => {
    jest.useFakeTimers();
    try {
      const { rerender } = renderProvider();
      expect(screen.getByTestId("active").textContent).toBe("yes");
      act(() => {
        jest.advanceTimersByTime(1500); // clear the intro first
      });

      mockPath = "/browse";
      rerender(
        <SessionProvider>
          <Probe />
        </SessionProvider>
      );

      expect(screen.getByTestId("session-summary")).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(1800);
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
      // Default 5-minute session.
      expect(Number(screen.getByTestId("remaining").textContent)).toBe(300_000);
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      expect(Number(screen.getByTestId("remaining").textContent)).toBe(240_000);
    } finally {
      jest.useRealTimers();
    }
  });

  it("startStudySession begins a session when none is active", () => {
    window.history.pushState({}, "", "/reader/5");
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
