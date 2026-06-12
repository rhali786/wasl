"use client";

import { Play, Sprout as SproutIcon, BookMarked, Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Frame } from "../_components/Frame";
import { Tree } from "../_components/Tree";
import { Eyebrow, ReturnDots } from "../_components/bits";

const TILES = [
  { label: "Memorized", count: "5 surahs", tone: "green", icon: BookMarked },
  { label: "Memorizing", count: "3 surahs", tone: "green", icon: SproutIcon },
  { label: "Longer surahs", count: "for breadth", tone: "sand", icon: Library },
  { label: "Browse all", count: "114 surahs", tone: "sand", icon: Library },
];

// GARDEN DAY — the preview images' light energy. Lush misty-green hero wash,
// warm sand accent tiles, a "finished product" warmth. Light gamification:
// a weekly rhythm of returns + a luminous-words count (no streak, no XP).
export default function GardenDay() {
  return (
    <Frame
      title="Garden Day"
      tags={["Midday", "Light metrics"]}
      time="1:04"
      active="home"
      screenClassName="bg-gradient-to-b from-garden-100 via-white to-white"
    >
      <div className="flex flex-col gap-6 px-5 pt-4">
        {/* hero wash */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-garden-200 via-garden-100 to-garden-50 p-5">
          <Eyebrow>Tuesday · midday</Eyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-forest">Merhaba, Rasheed</h2>
          <p className="mt-1 max-w-[58%] text-sm leading-relaxed text-garden-700/85">
            Welcome back — the garden kept growing while you were away.
          </p>
          <div className="pointer-events-none absolute -bottom-4 -right-3 opacity-95">
            <Tree mood="day" knownPct={0.62} size={148} />
          </div>
        </div>

        {/* light gamification: weekly rhythm + luminous words */}
        <div className="flex items-center justify-between rounded-3xl bg-white px-5 py-4 ring-1 ring-garden-100">
          <div>
            <Eyebrow>This week</Eyebrow>
            <ReturnDots filled={5} total={7} className="mt-2.5" />
          </div>
          <div className="h-10 w-px bg-garden-100" />
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-forest">124</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              words luminous
            </p>
          </div>
        </div>

        {/* invitation — primary */}
        <Card className="cursor-pointer border-0 bg-primary text-primary-foreground ring-0 shadow-[0_18px_36px_-18px_var(--garden-500)]">
          <CardContent className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                Continue where you left
              </p>
              <p className="mt-1 text-xl font-semibold">Az-Zalzalah</p>
              <p className="mt-0.5 text-sm opacity-85">9 words near known · ~5 min</p>
            </div>
            <span className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-white/20">
              <Play className="size-5 translate-x-px fill-current" strokeWidth={1.5} />
            </span>
          </CardContent>
        </Card>

        {/* surah tiles */}
        <div>
          <Eyebrow className="mb-3">Your surahs</Eyebrow>
          <div className="grid grid-cols-2 gap-3">
            {TILES.map(({ label, count, tone, icon: Icon }) => (
              <Card
                key={label}
                className={`cursor-pointer gap-2 ${
                  tone === "sand"
                    ? "bg-sand-100 ring-sand-300/50"
                    : "bg-garden-50 ring-garden-200/60"
                }`}
              >
                <CardContent className="flex flex-col gap-2">
                  <span
                    className={`grid size-9 place-items-center rounded-full ${
                      tone === "sand" ? "bg-white text-sand-700" : "bg-white text-garden-600"
                    }`}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className={`font-semibold ${tone === "sand" ? "text-sand-800" : "text-forest"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
