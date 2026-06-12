"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { FitLine } from "./FitLine";
import { Ticks } from "./Ticks";
import { UnknownHaze } from "./UnknownHaze";
import { stripTashkil } from "../lib/displayText";
import { readReaderMode, writeReaderMode } from "../lib/readerMode";
import type { ReaderMode } from "../lib/types";
import { getStatuses, demoteWord, finishPage } from "@/features/review/store";
import { useSession } from "@/features/session/components/SessionProvider";
import { defaultStatus, type WordStatus } from "@/features/review/lib/types";
import type { CorpusPage, CorpusWord } from "@/features/corpus/lib/types";

const ACCENT: Record<ReaderMode, { name: string; badge: string; color: string; glow: string }> = {
  study: { name: "Study", badge: "S", color: "#2fa85a", glow: "rgba(63,191,104,0.16)" },
  mushaf: { name: "Mushaf", badge: "M", color: "#b9892f", glow: "rgba(201,162,75,0.20)" },
};

function wordIdsOf(page: CorpusPage): string[] {
  const ids: string[] = [];
  for (const line of page.lines) {
    for (const w of line.words) {
      if (w.type === "word") ids.push(w.id);
    }
  }
  return ids;
}

// The promotion whisper shows for FLASH_MS total, fading out over the last
// FLASH_FADE_MS of that — a calm, unhurried close rather than a snap.
export const FLASH_MS = 5500;
export const FLASH_FADE_MS = 1200;

// A horizontal drag past this many px counts as a page-turn swipe.
const SWIPE_THRESHOLD_PX = 50;

function defaultStatuses(ids: readonly string[]): Record<string, WordStatus> {
  const result: Record<string, WordStatus> = {};
  for (const id of ids) result[id] = defaultStatus(id);
  return result;
}

/** Remaining session time as m:ss for the timer label. */
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ModeSlider({
  mode,
  onChange,
}: {
  mode: ReaderMode;
  onChange: (next: ReaderMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Reader mode"
      data-testid="mode-slider"
      className="relative flex w-[10.5rem] rounded-full bg-card p-0.5 ring-1 ring-border"
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full transition-transform duration-200 ease-out"
        style={{
          background: ACCENT[mode].color,
          transform: mode === "study" ? "translateX(0)" : "translateX(100%)",
        }}
      />
      {(["study", "mushaf"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={mode === option}
          className={`relative z-10 flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === option ? "text-white" : "text-muted-foreground"
          }`}
        >
          {ACCENT[option].name}
        </button>
      ))}
    </div>
  );
}

export function Reader({
  page,
  initialMode,
  onNextPage,
  onPreviousPage,
  onGoToPage,
  hasNextPage = false,
  hasPreviousPage = false,
}: {
  page: CorpusPage;
  initialMode?: ReaderMode;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  /** Jump to a sūrah's page (used when accepting a session step nudge). */
  onGoToPage?: (pageNumber: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}) {
  const { session, remainingMs, nudge, dismissNudge, advanceStep, endSession, startStudySession } =
    useSession();
  const [mode, setMode] = useState<ReaderMode>(() => initialMode ?? readReaderMode());
  const wordIds = useMemo(() => wordIdsOf(page), [page]);
  const [statuses, setStatuses] = useState<Record<string, WordStatus>>(() =>
    defaultStatuses(wordIds)
  );
  const [tappedIds, setTappedIds] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<{ key: string; word: CorpusWord; line: number } | null>(
    null
  );
  const [flashCount, setFlashCount] = useState<number | null>(null);
  const [flashFading, setFlashFading] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const accent = ACCENT[mode];

  // Tracks whether the current page has already been "finished" (Engine A),
  // so it is credited exactly once — whether by Next, a step-jump, or by
  // leaving the reader entirely (see finishCurrentPage/unmount cleanup below).
  const finishedRef = useRef(false);
  const wordIdsRef = useRef(wordIds);
  const tappedRef = useRef(tappedIds);
  const statusesRef = useRef(statuses);
  const modeRef = useRef(mode);
  wordIdsRef.current = wordIds;
  tappedRef.current = tappedIds;
  statusesRef.current = statuses;
  modeRef.current = mode;

  // Real statuses come from the store on mount/page-change, client-only —
  // SSR renders defaults (Unknown) to avoid a hydration mismatch, same
  // pattern as features/garden/GardenHome.tsx.
  useEffect(() => {
    setStatuses(getStatuses(wordIds));
    setTappedIds(new Set());
    setSelected(null);
    finishedRef.current = false;
  }, [wordIds]);

  // Credit the page on unmount if it was never explicitly finished (Next or
  // a step-jump) — covers leaving the reader mid-page (nav-away, session
  // end). Mushaf/free reads outside Study mode never mutate status.
  useEffect(() => {
    return () => {
      if (modeRef.current === "study" && !finishedRef.current) {
        finishPage(wordIdsRef.current, tappedRef.current);
        finishedRef.current = true;
      }
    };
  }, []);

  // Brief "+N" whisper when finishing a page promotes word-forms; lingers,
  // then fades out on its own (see FLASH_MS/FLASH_FADE_MS).
  useEffect(() => {
    if (flashCount === null) return;
    setFlashFading(false);
    const fadeTimer = setTimeout(() => setFlashFading(true), FLASH_MS - FLASH_FADE_MS);
    const dismissTimer = setTimeout(() => setFlashCount(null), FLASH_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [flashCount]);

  // An explicit ?mode= on entry (home cards, nav Reader tab) wins and is
  // persisted. Page-to-page navigation carries no query — mode comes from the
  // lazy initializer + localStorage, so the slider never flashes Study first.
  useEffect(() => {
    if (!initialMode) return;
    setMode(initialMode);
    writeReaderMode(initialMode);
  }, [initialMode]);

  function switchMode(next: ReaderMode) {
    setMode(next);
    writeReaderMode(next);
    if (next === "study") {
      startStudySession();
    } else if (session) {
      endSession({ summary: false });
    }
  }

  function tap(key: string, word: CorpusWord, line: number) {
    setSelected({ key, word, line });
    if (mode === "study") {
      const next = demoteWord(word.id);
      setStatuses((prev) => ({ ...prev, [word.id]: next }));
      setTappedIds((prev) => new Set(prev).add(word.id));
    }
  }

  // Engine A — finishing a page is the clean read; Mushaf reading never
  // promotes (Engine A is dormant there). Idempotent per page (finishedRef)
  // so Next, a step-jump, and the unmount cleanup never double-credit.
  function finishCurrentPage() {
    if (mode !== "study" || finishedRef.current) return;
    finishedRef.current = true;
    const before = statuses;
    const after = finishPage(wordIds, tappedIds);
    let promoted = 0;
    for (const id of new Set(wordIds)) {
      if ((after[id]?.level ?? 0) > (before[id]?.level ?? 0)) promoted++;
    }
    if (promoted > 0) setFlashCount(promoted);
  }

  function goNext() {
    finishCurrentPage();
    setSelected(null);
    onNextPage?.();
  }

  function goPrevious() {
    setSelected(null);
    onPreviousPage?.();
  }

  // Accept a session step nudge: credit the page being left, advance the
  // plan, and open that sūrah's page.
  function goToStep(pageNumber: number) {
    finishCurrentPage();
    advanceStep();
    dismissNudge();
    onGoToPage?.(pageNumber);
  }

  // Swipe to turn the page — a horizontal drag past SWIPE_THRESHOLD_PX acts
  // like the Next/Previous buttons. Swiping left advances (matches the
  // right-to-left reading direction, same as the Next chevron); swiping
  // right goes back.
  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = e.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0 && hasNextPage) goNext();
    else if (dx > 0 && hasPreviousPage) goPrevious();
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* mobile-frame width: matches the Garden/Metrics 440px column so
          FitLine measures against a phone-width line, not the full
          desktop viewport (which would otherwise stretch justify-between
          gaps to the full window width). */}
      <div
        data-testid="reader-frame"
        className="relative mx-auto flex h-full w-full max-w-[440px] flex-1 flex-col"
        onClick={() => setSelected(null)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* mode ambient: accent glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(120% 60% at 50% -8%, ${accent.glow} 0%, transparent 60%)`,
          }}
        />

        {/* session timer — present only during a session, the clear "you are
            in a session" signal. Fills right-to-left as the time is spent
            (design-visual.md §session timer bar). */}
        {session ? (
          <div
            className="relative z-20 flex items-center gap-2 px-5 pt-2"
            aria-label="Session in progress"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-gold" />
            <div
              data-testid="session-timer"
              className="flex h-1 flex-1 overflow-hidden rounded-full bg-border/60"
            >
              <div
                className="ml-auto h-full rounded-full bg-gold transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.round((remainingMs / session.durationMs) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {formatRemaining(remainingMs)} left
            </span>
          </div>
        ) : null}

        {/* header — the ribbon hangs just below this, overlaying the page */}
        <div className="relative z-20">
          <div className="relative z-10 flex items-center justify-end px-5 pt-3 pb-2">
            <ModeSlider mode={mode} onChange={switchMode} />
          </div>
        </div>

        {/* session nudge — at a step boundary ("now your memorized sūrah") or
            when the time is up. Calm, dismissable, never blocking. */}
        {nudge ? (
          <div
            data-testid="session-nudge"
            className="relative z-20 mx-4 mt-1 flex items-center gap-3 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border"
          >
            {nudge.kind === "step" ? (
              <>
                <span className="flex-1 text-foreground">
                  Next: your {nudge.step.category} sūrah —{" "}
                  <span className="font-semibold">{nudge.step.name}</span>
                </span>
                <button
                  onClick={() => goToStep(nudge.step.page)}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Go
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">
                  Your time is up. Rest, or keep reading.
                </span>
                <button
                  onClick={() => {
                    endSession();
                    dismissNudge();
                  }}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Done
                </button>
              </>
            )}
            <button
              onClick={dismissNudge}
              aria-label="Dismiss"
              className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* the page — 15 lines as equal vertical bands filling the height, no
            scroll. Mushaf keeps full tashkīl; Study shows bare letters. */}
        <div
          data-testid="page-lines"
          className="relative z-10 flex-1 overflow-hidden px-4 py-2"
        >
          <div className="flex h-full flex-col">
            {page.lines.map((line) => (
              <FitLine
                key={line.line}
                dep={`${page.page}-${mode}`}
                base={mode === "mushaf" ? 21 : 23}
                lineHeight={1.25}
                className="flex-1"
              >
                {line.words.map((word, wi) => {
                  const key = `${page.page}:${line.line}:${wi}`;
                  if (word.type === "end") {
                    return (
                      <span
                        key={key}
                        className="mx-0.5 grid size-[1.35em] shrink-0 place-items-center rounded-full text-[0.6em] font-semibold text-ayah-marker-text ring-1 ring-ayah-marker-ring"
                      >
                        {word.ayah}
                      </span>
                    );
                  }
                  const level = statuses[word.id]?.level ?? 0;
                  const isSelected = selected?.key === key;
                  const text = mode === "study" ? stripTashkil(word.t) : word.t;
                  return (
                    <span
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        tap(key, word, line.line);
                      }}
                      className="relative inline-block cursor-pointer whitespace-nowrap rounded-md px-[0.12em] text-foreground"
                      style={
                        isSelected
                          ? { outline: `2px solid ${accent.color}`, outlineOffset: "2px" }
                          : undefined
                      }
                    >
                      <UnknownHaze level={level} />
                      <span className="relative">{text}</span>
                      <Ticks level={level} />
                      {isSelected ? (
                        <span
                          data-testid="word-meaning"
                          dir="ltr"
                          className={`pointer-events-none absolute left-1/2 z-30 w-max max-w-[12em] -translate-x-1/2 whitespace-normal rounded-lg bg-card/90 px-2.5 py-1 text-center font-display text-xs italic text-muted-foreground shadow-sm ring-1 ring-border/70 ${
                            line.line > page.lines.length / 2
                              ? "bottom-full mb-1.5"
                              : "top-full mt-1.5"
                          }`}
                        >
                          {word.en}
                        </span>
                      ) : null}
                    </span>
                  );
                })}
              </FitLine>
            ))}
          </div>
        </div>

        {/* promotion whisper — a brief "+N" when finishing a page promotes
            word-forms (Engine A). Lingers, then fades on its own (see
            flashCount effect). */}
        {flashCount !== null ? (
          <div
            data-testid="promotion-flash"
            className={`pointer-events-none absolute inset-x-0 bottom-24 z-20 flex items-center justify-center transition-opacity duration-[1200ms] ${
              flashFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
              +{flashCount} word{flashCount === 1 ? "" : "s"} learned
            </span>
          </div>
        ) : null}

        {/* paging — Next is the page-finish trigger (Engine A, Study only).
            Surah/juz/page sits between the arrows; bottom padding clears the
            fixed BottomNav rendered by the route. */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-5 pb-24 pt-2">
          <button
            onClick={goNext}
            disabled={!hasNextPage}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-foreground ring-1 ring-border disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {page.surah} · juz {page.juz}
            </p>
            <p className="text-sm text-muted-foreground">
              page {page.page} · {page.firstVerse}–{page.lastVerse.split(":")[1]}
            </p>
          </div>
          <button
            onClick={goPrevious}
            disabled={!hasPreviousPage}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-foreground ring-1 ring-border disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
