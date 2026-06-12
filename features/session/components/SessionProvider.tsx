"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

const INTRO_MESSAGE =
  "Your session is starting now. May Allah accept it, and make it heavy on your scales.";
const SUMMARY_MESSAGE =
  "Your session has ended. May Allah accept it, and make it heavy on your scales.";

// Intro/summary overlays: fade in → hold (readable) → fade out. Tap anywhere to dismiss.
export const INTRO_FADE_IN_MS = 500;
export const INTRO_HOLD_MS = 1800;
export const INTRO_FADE_OUT_MS = 700;
export const INTRO_MS = INTRO_FADE_IN_MS + INTRO_HOLD_MS + INTRO_FADE_OUT_MS;

export const SUMMARY_FADE_IN_MS = 500;
export const SUMMARY_HOLD_MS = 1800;
export const SUMMARY_FADE_OUT_MS = 700;
export const SUMMARY_MS = SUMMARY_FADE_IN_MS + SUMMARY_HOLD_MS + SUMMARY_FADE_OUT_MS;

export type SessionNudge =
  | { kind: "step"; step: SessionStep }
  | { kind: "timeup" };

export type SessionPhase = "intro" | "summary" | null;

interface SessionContextValue {
  session: Session | null;
  remainingMs: number;
  nudge: SessionNudge | null;
  dismissNudge: () => void;
  advanceStep: () => SessionStep | null;
  startStudySession: () => void;
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

function phaseTiming(phase: SessionPhase) {
  if (phase === "intro") {
    return {
      fadeIn: INTRO_FADE_IN_MS,
      hold: INTRO_HOLD_MS,
      fadeOut: INTRO_FADE_OUT_MS,
      total: INTRO_MS,
    };
  }
  return {
    fadeIn: SUMMARY_FADE_IN_MS,
    hold: SUMMARY_HOLD_MS,
    fadeOut: SUMMARY_FADE_OUT_MS,
    total: SUMMARY_MS,
  };
}

function SessionProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inReader = !!pathname && pathname.startsWith("/reader");
  const wantsStudy = searchParams.get("mode") === "study";

  const [session, setSession] = useState<Session | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [nudge, setNudge] = useState<SessionNudge | null>(null);
  const [phase, setPhase] = useState<SessionPhase>(null);
  const [phaseVisible, setPhaseVisible] = useState(false);
  const [phaseLeaving, setPhaseLeaving] = useState(false);
  const firedRef = useRef<Set<string>>(new Set());

  // Start on any deliberate Study entry — home card, nav Reader tab, or
  // ?mode=study while already in the reader. Re-run when pathname or query
  // changes so the bottom-nav Reader tab works mid-read.
  useEffect(() => {
    if (inReader) {
      const existing = storeGetSession();
      if (existing) {
        setSession(existing);
      } else if (wantsStudy) {
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
  }, [inReader, pathname, wantsStudy]);

  useEffect(() => {
    if (!phase) return;
    const { fadeIn, hold, fadeOut, total } = phaseTiming(phase);
    setPhaseLeaving(false);
    setPhaseVisible(false);
    const showTimer = setTimeout(() => setPhaseVisible(true), 0);
    const fadeOutTimer = setTimeout(() => setPhaseLeaving(true), fadeIn + hold);
    const dismissTimer = setTimeout(() => setPhase(null), total);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(dismissTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session?.id]);

  useEffect(() => {
    firedRef.current = new Set();
  }, [session?.id]);

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

  const dismissPhase = useCallback(() => setPhase(null), []);

  const overlayTiming = phase ? phaseTiming(phase) : null;

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
      {phase && overlayTiming ? (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Dismiss"
          data-testid={phase === "intro" ? "session-intro" : "session-summary"}
          onClick={dismissPhase}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") dismissPhase();
          }}
          className={`fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-background/90 px-10 text-center backdrop-blur-sm transition-opacity ease-in-out ${
            phaseLeaving || !phaseVisible ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transitionDuration: phaseLeaving
              ? `${overlayTiming.fadeOut}ms`
              : `${overlayTiming.fadeIn}ms`,
          }}
        >
          <p className="font-display text-lg italic leading-relaxed text-foreground">
            {phase === "intro" ? INTRO_MESSAGE : SUMMARY_MESSAGE}
          </p>
        </div>
      ) : null}
    </SessionContext.Provider>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SessionProviderInner>{children}</SessionProviderInner>
    </Suspense>
  );
}
