"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import surahsData from "@/features/corpus/data/surahs.json";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";
import { getSettings } from "@/features/settings/store";
import { buildSessionPlan, stepDurations } from "../lib/plan";
import type { Session, SessionStep } from "../lib/types";
import {
  advanceStep as storeAdvanceStep,
  endSession as storeEndSession,
  getSession as storeGetSession,
  startSession as storeStartSession,
} from "../store";

const surahs = surahsData as SurahIndexEntry[];

export type SessionNudge =
  | { kind: "step"; step: SessionStep }
  | { kind: "timeup" };

interface SessionContextValue {
  session: Session | null;
  /** ms left in the planned session (0 once elapsed). */
  remainingMs: number;
  nudge: SessionNudge | null;
  dismissNudge: () => void;
  /** Advance to the next plan step; returns the step to navigate to (or null). */
  advanceStep: () => SessionStep | null;
  /** End the session now (e.g. "done for now"). */
  endSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  remainingMs: 0,
  nudge: null,
  dismissNudge: () => {},
  advanceStep: () => null,
  endSession: () => {},
});

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}

// Owns the session lifecycle: a session = time spent in the reader. It starts
// on entering /reader/*, ends on leaving (nav to a hub) or backgrounding, and
// drives the timer + step nudges. Mounted once in app/layout.tsx.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inReader = !!pathname && pathname.startsWith("/reader");

  const [session, setSession] = useState<Session | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [nudge, setNudge] = useState<SessionNudge | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  // Start on reader entry; end on leave. Reader-to-reader navigation keeps
  // `inReader` true, so the session (and its movedIds) persists across pages.
  useEffect(() => {
    if (inReader) {
      const existing = storeGetSession();
      if (existing) {
        setSession(existing);
      } else {
        const settings = getSettings();
        const plan = buildSessionPlan(settings, surahs);
        setSession(storeStartSession(plan, settings.sessionMinutes * 60_000));
      }
    } else {
      if (storeGetSession()) storeEndSession();
      setSession(null);
      setNudge(null);
    }
  }, [inReader]);

  // Background → end the session (design-interaction.md §session window).
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "hidden" && storeGetSession()) {
        storeEndSession();
        setSession(null);
        setNudge(null);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // 1s heartbeat drives the timer bar while a session is active.
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session?.id]);

  // Reset the one-shot nudge tracking when a new session begins.
  useEffect(() => {
    firedRef.current = new Set();
  }, [session?.id]);

  // Fire step-boundary nudges (5:3:2 budgets) and the final "time's up" nudge,
  // each at most once per session.
  useEffect(() => {
    if (!session) return;
    const elapsed = nowTick - session.startedAt;
    const budgets = stepDurations(session.plan, session.durationMs);
    let cumulative = 0;
    for (let i = 0; i < budgets.length - 1; i++) {
      cumulative += budgets[i];
      const key = `step-${i}`;
      if (elapsed >= cumulative && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        setNudge({ kind: "step", step: session.plan[i + 1] });
      }
    }
    if (elapsed >= session.durationMs && !firedRef.current.has("timeup")) {
      firedRef.current.add("timeup");
      setNudge({ kind: "timeup" });
    }
  }, [nowTick, session]);

  const remainingMs = session
    ? Math.max(0, session.startedAt + session.durationMs - nowTick)
    : 0;

  const dismissNudge = useCallback(() => setNudge(null), []);

  const advanceStep = useCallback(() => {
    const next = storeAdvanceStep();
    setSession(next);
    setNudge(null);
    return next ? (next.plan[next.stepIndex] ?? null) : null;
  }, []);

  const endSession = useCallback(() => {
    storeEndSession();
    setSession(null);
    setNudge(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, remainingMs, nudge, dismissNudge, advanceStep, endSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}
