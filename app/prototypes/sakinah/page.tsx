"use client";

import { User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Frame } from "../_components/Frame";
import { Tree } from "../_components/Tree";
import { Eyebrow, ReturnDots, Pill } from "../_components/bits";

// SAKINAH — the purest reading of the docs. Near-white air, one question,
// one tap. No streak, no XP, no count. Maximum calm. (design-principles §2)
export default function Sakinah() {
  return (
    <Frame
      title="Sakinah"
      tags={["Morning", "No metrics"]}
      time="6:18"
      screenClassName="bg-gradient-to-b from-white via-white to-garden-50"
    >
      <div className="flex flex-col gap-9 px-6 pt-6">
        {/* greeting */}
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-secondary text-garden-700">
            <User className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <Eyebrow>Tuesday · morning</Eyebrow>
            <h2 className="text-[22px] font-semibold leading-tight text-forest">
              Good morning, Rasheed
            </h2>
          </div>
        </div>

        {/* the living tree */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Tree mood="mist" knownPct={0.5} size={244} className="wird-rise" />
          <p className="font-display text-lg italic text-garden-700/80">
            The words are still here.
          </p>
        </div>

        {/* one invitation */}
        <Card className="cursor-pointer ring-garden-200/80 transition-shadow hover:shadow-[0_18px_40px_-22px_rgba(20,83,45,0.4)]">
          <CardContent className="flex items-center gap-4">
            <div>
              <Eyebrow>Your next five minutes</Eyebrow>
              <p className="mt-1 text-xl font-semibold text-forest">Az-Zalzalah is near</p>
              <p className="mt-0.5 text-sm text-muted-foreground">9 words near known · ~5 min</p>
            </div>
            <ChevronRight className="ml-auto size-6 shrink-0 text-garden-500" strokeWidth={1.75} />
          </CardContent>
        </Card>

        {/* category pills */}
        <div className="flex flex-wrap gap-2">
          <Pill active>Memorized</Pill>
          <Pill>Current</Pill>
          <Pill>Longer</Pill>
        </div>

        {/* returns today — soft dots, never a streak */}
        <div className="flex items-center justify-between">
          <Eyebrow>Returns today</Eyebrow>
          <ReturnDots filled={3} total={4} />
        </div>
      </div>
    </Frame>
  );
}
