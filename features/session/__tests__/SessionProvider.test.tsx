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
  });

  it("starts a session when entering the reader", () => {
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
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

  it("ends the session when the app is backgrounded", () => {
    renderProvider();
    expect(screen.getByTestId("active").textContent).toBe("yes");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByTestId("active").textContent).toBe("no");
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
