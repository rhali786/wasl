"use client";

import { User, Leaf, Play, Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Frame } from "../_components/Frame";
import { Tree } from "../_components/Tree";
import { Eyebrow } from "../_components/bits";

const WEEK = [
  { d: "M", n: 8, done: true },
  { d: "T", n: 9, today: true },
  { d: "W", n: 10 },
  { d: "T", n: 11 },
  { d: "F", n: 12 },
  { d: "S", n: 13 },
  { d: "S", n: 14 },
];

// NIGHT STUDY — the preview's dark, gamified screen, reinterpreted. Deep
// forest, a glowing tree, twinkling accents. Deliberately the MOST gamified
// sample (level + XP-to-bloom bar + day strip) so the rejected path is
// visible in dark beside the calmer takes.
export default function NightStudy() {
  return (
    <Frame
      title="Night Study"
      tags={["Night", "Moderate metrics"]}
      time="9:41"
      dark
      screenClassName="bg-[radial-gradient(120%_90%_at_70%_-10%,#10301d_0%,#0a1c12_42%,#06120b_100%)]"
    >
      {/* faint twinkles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <span className="wird-twinkle absolute left-[18%] top-[12%] size-1 rounded-full bg-garden-300" />
        <span className="wird-twinkle absolute left-[72%] top-[8%] size-1.5 rounded-full bg-garden-200" style={{ animationDelay: "1.2s" }} />
        <span className="wird-twinkle absolute left-[44%] top-[20%] size-1 rounded-full bg-garden-400" style={{ animationDelay: "2.1s" }} />
        <span className="wird-twinkle absolute left-[86%] top-[26%] size-1 rounded-full bg-garden-300" style={{ animationDelay: "0.6s" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-5 px-5 pt-4 text-[#dbeede]">
        {/* greeting + returns chip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#14361f] text-garden-300 ring-1 ring-garden-500/25">
              <User className="size-5" strokeWidth={1.75} />
            </div>
            <div>
              <Eyebrow className="text-garden-400">Tuesday · night</Eyebrow>
              <h2 className="text-lg font-semibold">Merhaba, Rasheed</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#14361f] px-3 py-1.5 ring-1 ring-garden-500/30">
            <Leaf className="size-4 text-garden-400" strokeWidth={2} />
            <span className="text-sm font-semibold tabular-nums">7</span>
          </div>
        </div>

        {/* level hero card with glowing tree + XP-to-bloom */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#0f2c1c] to-[#091a10] p-5 ring-1 ring-garden-500/20">
          <div className="pointer-events-none absolute -right-6 -top-6 size-44 rounded-full bg-garden-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <Eyebrow className="text-garden-400">Your garden</Eyebrow>
              <p className="mt-1 text-[40px] font-semibold leading-none tabular-nums">Lvl&nbsp;1</p>
              <p className="mt-1.5 text-sm text-garden-300/70">Sapling</p>
            </div>
            <Tree mood="night" knownPct={0.42} size={150} />
          </div>
          <div className="relative mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-garden-300/80">
              <span>15 words known</span>
              <span>30 to next bloom</span>
            </div>
            <Progress value={50} className="[&_[data-slot=progress-track]]:bg-[#143524] [&_[data-slot=progress-indicator]]:bg-garden-400" />
          </div>
        </div>

        {/* week strip */}
        <div className="flex justify-between">
          {WEEK.map((w) => (
            <div key={w.n} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-semibold text-garden-300/60">{w.d}</span>
              <span
                className={`grid size-9 place-items-center rounded-full text-sm font-semibold tabular-nums ${
                  w.today
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_-2px_var(--garden-500)]"
                    : w.done
                      ? "bg-[#14361f] text-garden-300"
                      : "bg-[#0e2417] text-garden-300/40"
                }`}
              >
                {w.n}
              </span>
            </div>
          ))}
        </div>

        {/* invitation */}
        <Card className="border-0 bg-[#0e2417] ring-1 ring-garden-500/15">
          <CardContent className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[#14361f] text-garden-300">
              <Mic className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-semibold text-[#dbeede]">Names of Allah</p>
              <p className="text-sm text-garden-300/70">Continue · 0% reviewed</p>
            </div>
            <span className="ml-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Play className="size-5 translate-x-px fill-current" strokeWidth={1.5} />
            </span>
          </CardContent>
        </Card>
      </div>
    </Frame>
  );
}
