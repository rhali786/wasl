// Session store — start/end the active session and apply the once-per-session
// movement throttle. Wraps the localStorage boundary (lib/storage.ts). Read by
// SessionProvider (UI lifecycle/timer) and by features/review/store.ts
// (hasMoved/markMoved guard promotions and demotions).

import type { Session, SessionStep } from "./lib/types";
import { clearSession, readSession, writeSession } from "./lib/storage";

function newId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getSession(): Session | null {
  return readSession();
}

/** Begin a session with the given plan and planned duration; replaces any prior one. */
export function startSession(plan: SessionStep[], durationMs: number): Session {
  const session: Session = {
    id: newId(),
    startedAt: Date.now(),
    durationMs,
    movedIds: [],
    plan,
    stepIndex: 0,
  };
  writeSession(session);
  return session;
}

export function endSession(): void {
  clearSession();
}

/** True once the word-form has already been promoted or demoted this session. */
export function hasMoved(id: string): boolean {
  const session = readSession();
  return session ? session.movedIds.includes(id) : false;
}

/** Record word-forms as moved this session (deduped). No-op without an active session. */
export function markMoved(ids: readonly string[]): void {
  const session = readSession();
  if (!session) return;
  const set = new Set(session.movedIds);
  for (const id of ids) set.add(id);
  writeSession({ ...session, movedIds: [...set] });
}

/** Move to the next plan step (clamped to the last). No-op without an active session. */
export function advanceStep(): Session | null {
  const session = readSession();
  if (!session) return null;
  const stepIndex = Math.min(session.stepIndex + 1, Math.max(0, session.plan.length - 1));
  const next = { ...session, stepIndex };
  writeSession(next);
  return next;
}
