"use client";

import { useState } from "react";
import { Frame } from "./Frame";
import { Reader, type RevealKind } from "./Reader";

const OPTS: { key: RevealKind; label: string; hint: string }[] = [
  { key: "docked", label: "R1 · Docked", hint: "Always-there card at the bottom — calmest, no motion." },
  { key: "caret", label: "R2 · Caret", hint: "Card floats above the tapped word." },
  { key: "sheet", label: "R3 · Sheet", hint: "Slides up over the page bottom — most room for tafsīr." },
  { key: "ribbon", label: "R4 · Ribbon", hint: "Slim strip drops from the top — quietest." },
];

export function ReaderRevealsDemo() {
  const [reveal, setReveal] = useState<RevealKind>("docked");
  const active = OPTS.find((o) => o.key === reveal)!;

  return (
    <div className="flex min-h-full w-full flex-col items-center bg-mist px-4 py-8">
      <div className="mb-4 w-full max-w-[420px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-garden-700/70">
          Wird · reveal in context
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-forest">
          The real reader — flip the reveal
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Full 15-line page, ticks, S/M, paging. Tap words — <strong>none of these
          move the page</strong>. Switch the mechanism:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => setReveal(o.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                reveal === o.key
                  ? "bg-forest text-white"
                  : "bg-white text-forest ring-1 ring-garden-200 hover:bg-garden-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs italic text-muted-foreground">{active.hint}</p>
      </div>

      <Frame
        title="Reader · reveal in context"
        tags={["Real page", "Tap a word"]}
        hideNav
        screenClassName="bg-[#f5efe1]"
      >
        <Reader initialMode="study" reveal={reveal} />
      </Frame>
    </div>
  );
}
