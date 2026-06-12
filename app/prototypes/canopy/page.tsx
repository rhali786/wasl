"use client";

import { User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Frame } from "../_components/Frame";
import { Tree } from "../_components/Tree";
import { Eyebrow, ReturnDots } from "../_components/bits";

// LIVING CANOPY — tree-maximalist. The breathing tree fills the screen and the
// growth IS the emotional payload (Forest's intrinsic metaphor, done right).
// Light gamification: a single luminous-% number, no points, no streak.
export default function Canopy() {
  return (
    <Frame
      title="Living Canopy"
      tags={["Afternoon", "Light metrics"]}
      time="3:27"
      active="home"
      screenClassName="bg-gradient-to-b from-garden-50 via-garden-100 to-garden-50"
    >
      <div className="flex min-h-full flex-col px-6 pt-5">
        {/* minimal greeting */}
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Tuesday · afternoon</Eyebrow>
            <h2 className="text-xl font-semibold text-forest">Your garden, Rasheed</h2>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-white/70 text-garden-700 ring-1 ring-garden-200">
            <User className="size-5" strokeWidth={1.75} />
          </div>
        </div>

        {/* the tree — hero, fills the space */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <Tree mood="day" knownPct={0.72} size={300} className="wird-rise" />
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums text-forest">64%</span>
          </p>
          <p className="text-sm text-muted-foreground">of your garden is luminous</p>
        </div>

        {/* single invitation */}
        <Card className="mb-3 cursor-pointer ring-garden-200/80 transition-shadow hover:shadow-[0_18px_40px_-22px_rgba(20,83,45,0.4)]">
          <CardContent className="flex items-center gap-4">
            <div>
              <Eyebrow>Tend next</Eyebrow>
              <p className="mt-1 text-lg font-semibold text-forest">Az-Zalzalah</p>
              <p className="text-sm text-muted-foreground">9 words near known · ~5 min</p>
            </div>
            <ChevronRight className="ml-auto size-6 shrink-0 text-garden-500" strokeWidth={1.75} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pb-2">
          <Eyebrow>Returns today</Eyebrow>
          <ReturnDots filled={3} total={4} />
        </div>
      </div>
    </Frame>
  );
}
