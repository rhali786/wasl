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

// Brief, calm transitions that bookend a session (design-voice.md tone) —
// auto-dismiss on their own, mirroring each other.
const INTRO_MESSAGE =
  "Your session is starting now. May Allah accept it, and make it heavy on your scales.";
const SUMMARY_MESSAGE =
  "Your session has ended. May Allah accept it, and make it heavy on your scales.";
const INTRO_MS = 1500;
const SUMMARY_MS = 1800;

export type SessionNudge =
  | { kind: "step"; step: SessionStep }
  | { kind: "timeup" };

export type SessionPhase = "intro" | "summary" | null;

interface SessionContextValue {
  session: Session | null;
  /** ms left in the planned session (0 once elapsed). */
  remainingMs: number;
  nudge: SessionNudge | null;
  dismissNudge: () => void;
  /** Advance to the next plan step; returns the step to navigate to (or null). */
  advanceStep: () => SessionStep | null;
  /** Begin a Study session if none is active (slider, nav, home entry). */
  startStudySession: () => void;
  /** End the session now. Summary overlay only when leaving the reader. */
  endSession: (opts?: { summary?: boolean }) => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  remainingMs: 0,
  nudge: null,
  dismissNudge: () => {},
  advanceStep: () => null,
  startStudySession: () => {},
  endSession: () => {},
});

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}

function beginStudySession(): Session {
  const settings = getSettings();
  const plan = buildSessionPlan(settings, surahs);
  return storeStartSession(plan, settings.sessionMinutes * 60_000);
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
  const [phase, setPhase] = useState<SessionPhase>(null);
  const [fading, setFading] = useState(false);
  const firedRef = useRef<Set<string>>(new Set());

  // Start on reader entry; end on leave. Reader-to-reader navigation keeps
  // `inReader` true, so the session (and its movedIds) persists across pages.
  // A session (timer/plan/nudges) only begins on a deliberate "Enter as
  // Study" — from Home's Study card, or the bottom-nav Reader tab
  // (both append ?mode=study). Mushaf and Browse→open are free reads with no
  // session chrome. Tab/focus loss never ends a session; only navigating away
  // from /reader does.
  useEffect(() => {
    if (inReader) {
      const existing = storeGetSession();
      if (existing) {
        setSession(existing);
      } else if (new URLSearchParams(window.location.search).get("mode") === "study") {
        setSession(beginStudySession());
        setPhase("intro");
      } else {
        setSession(null);
      }
    } else {
      if (storeGetSession()) {
        storeEndSession();
        setPhase("summary");
      }
      setSession(null);
      setNudge(null);
    }
  }, [inReader]);

  // Each phase appears, then fades out over its full duration (see
  // INTRO_MS/SUMMARY_MS) before unmounting.
  useEffect(() => {
    if (!phase) return;
    setFading(false);
    const ms = phase === "intro" ? INTRO_MS : SUMMARY_MS;
    const fadeTimer = setTimeout(() => setFading(true), 0);
    const dismissTimer = setTimeout(() => setPhase(null), ms);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [phase]);

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

  const startStudySession = useCallback(() => {
    if (storeGetSession()) {
      setSession(storeGetSession());
      return;
    }
    setSession(beginStudySession());
    setPhase("intro");
  }, []);

  const endSession = useCallback((opts?: { summary?: boolean }) => {
    const showSummary = opts?.summary !== false;
    if (storeGetSession()) {
      storeEndSession();
      if (showSummary) {
        setPhase("summary");
      }
    }
    setSession(null);
    setNudge(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        remainingMs,
        nudge,
        dismissNudge,
        advanceStep,
        startStudySession,
        endSession,
      }}
    >
      {children}
      {phase ? (
        <div
          data-testid={phase === "intro" ? "session-intro" : "session-summary"}
          className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-10 text-center backdrop-blur-sm transition-opacity ${
            phase === "intro" ? "duration-[1500ms]" : "duration-[1800ms]"
          } ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <p className="font-display text-lg italic leading-relaxed text-foreground">
            {phase === "intro" ? INTRO_MESSAGE : SUMMARY_MESSAGE}
          </p>
        </div>
      ) : null}
    </SessionContext.Provider>
  );
}
