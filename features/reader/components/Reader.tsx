"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { FitLine } from "./FitLine";
import { Ticks } from "./Ticks";
import { UnknownHaze } from "./UnknownHaze";
import { stripTashkil } from "../lib/displayText";
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

export function Reader({
  page,
  initialMode = "study",
  onNextPage,
  onPreviousPage,
  onExit,
  onGoToPage,
  hasNextPage = false,
  hasPreviousPage = false,
}: {
  page: CorpusPage;
  initialMode?: ReaderMode;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  /** "Done for now" — leaves the reader (and the session) for the Garden. */
  onExit?: () => void;
  /** Jump to a sūrah's page (used when accepting a session step nudge). */
  onGoToPage?: (pageNumber: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}) {
  const { session, remainingMs, nudge, dismissNudge, advanceStep, endSession } =
    useSession();
  const [mode, setMode] = useState<ReaderMode>(initialMode);
  const wordIds = useMemo(() => wordIdsOf(page), [page]);
  const [statuses, setStatuses] = useState<Record<string, WordStatus>>(() =>
    defaultStatuses(wordIds)
  );
  const [tappedIds, setTappedIds] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<{ key: string; word: CorpusWord } | null>(null);

  const accent = ACCENT[mode];

  // Real statuses come from the store on mount/page-change, client-only —
  // SSR renders defaults (Unknown) to avoid a hydration mismatch, same
  // pattern as features/garden/GardenHome.tsx.
  useEffect(() => {
    setStatuses(getStatuses(wordIds));
    setTappedIds(new Set());
    setSelected(null);
  }, [wordIds]);

  function tap(key: string, word: CorpusWord) {
    setSelected({ key, word });
    if (mode === "study") {
      const next = demoteWord(word.id);
      setStatuses((prev) => ({ ...prev, [word.id]: next }));
      setTappedIds((prev) => new Set(prev).add(word.id));
    }
  }

  function goNext() {
    // Engine A — finishing a page (advancing to the next one) is the clean
    // read; Mushaf reading never promotes (Engine A is dormant there).
    if (mode === "study") {
      finishPage(wordIds, tappedIds);
    }
    setSelected(null);
    onNextPage?.();
  }

  function goPrevious() {
    setSelected(null);
    onPreviousPage?.();
  }

  // "Done for now" — close the session and return to the Garden (the reward).
  function done() {
    endSession();
    onExit?.();
  }

  // Accept a session step nudge: advance the plan and open that sūrah's page.
  function goToStep(pageNumber: number) {
    advanceStep();
    dismissNudge();
    onGoToPage?.(pageNumber);
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
          <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {page.surah} · juz {page.juz}
              </p>
              <p className="text-sm text-muted-foreground">
                page {page.page} · {page.firstVerse}–{page.lastVerse.split(":")[1]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={done}
                aria-label="Done for now"
                className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border"
              >
                Done for now
              </button>
              <button
                onClick={() => setMode((m) => (m === "study" ? "mushaf" : "study"))}
                className="flex items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3 ring-1 ring-border"
                aria-label={`Mode: ${accent.name} (tap to switch)`}
              >
                <span
                  className="grid size-7 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ background: accent.color }}
                >
                  {accent.badge}
                </span>
                <span className="text-sm font-medium text-foreground">{accent.name}</span>
              </button>
            </div>
          </div>

          {/* the ribbon — always mounted so it never shifts the page; opacity
              + pointer-events toggle visibility */}
          <div
            data-testid="ribbon"
            className="absolute inset-x-0 top-full z-30 flex items-center gap-3 border-t border-border bg-card px-4 py-2 shadow-sm transition-all duration-300"
            style={{
              transform: selected ? "translateY(0)" : "translateY(-6px)",
              opacity: selected ? 1 : 0,
              pointerEvents: selected ? "auto" : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selected ? (
              <>
                <span dir="rtl" className="font-arabic text-xl text-foreground">
                  {selected.word.t}
                </span>
                <span className="font-display text-base italic text-muted-foreground">
                  {selected.word.en}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="ml-auto grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                  aria-label="Clear"
                >
                  <X className="size-3.5" />
                </button>
              </>
            ) : null}
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
                  onClick={done}
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
          onClick={() => setSelected(null)}
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
                        className="mx-0.5 grid size-[1.35em] shrink-0 place-items-center rounded-full text-[0.6em] font-semibold text-garden-600 ring-1 ring-garden-400/60"
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
                        tap(key, word);
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
                    </span>
                  );
                })}
              </FitLine>
            ))}
          </div>
        </div>

        {/* paging — Next is the page-finish trigger (Engine A, Study only).
            Page number lives in the header now; bottom padding clears the
            fixed BottomNav rendered by the route. */}
        <div className="relative z-10 flex items-center justify-center gap-10 px-5 pb-24 pt-2">
          <button
            onClick={goNext}
            disabled={!hasNextPage}
            className="grid size-9 place-items-center rounded-full bg-card text-foreground ring-1 ring-border disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={goPrevious}
            disabled={!hasPreviousPage}
            className="grid size-9 place-items-center rounded-full bg-card text-foreground ring-1 ring-border disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
