import { ChevronRight } from "lucide-react";
import { Frame } from "../_components/Frame";
import { Eyebrow } from "../_components/bits";
import {
  SurahKnown,
  StatusSpread,
  DailyMovement,
  MOCK,
  fmtK,
} from "../_components/metrics";

// METRICS · SURAHS — the lead metrics view. Highlights + "view all" so 114
// surahs / 30 juz stay calm; daily promotions/demotions; status spread at
// real corpus scale (~14.8k unique words). All-green pale-top palette.
export default function MetricsSurahs() {
  const top = MOCK.surahs.slice(0, 4);
  const tend = MOCK.surahs.slice(-3).reverse(); // least luminous, framed as invitation

  return (
    <Frame
      title="Metrics · Surahs"
      tags={["Lead view", "No streak"]}
      time="3:27"
      active="progress"
      screenClassName="bg-gradient-to-b from-mist to-white"
    >
      <div className="flex flex-col gap-6 px-5 pt-5">
        <header>
          <Eyebrow>Luminosity by surah</Eyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-forest">How clear each one is</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <b className="font-semibold text-forest">{MOCK.fullyLuminousSurahs}</b> of{" "}
            {MOCK.totalSurahs} surahs fully luminous
          </p>
        </header>

        <section>
          <Eyebrow className="mb-3">Most luminous</Eyebrow>
          <SurahKnown items={top} />
        </section>

        <section>
          <Eyebrow className="mb-1">Tend next</Eyebrow>
          <p className="mb-3 text-xs text-muted-foreground">
            where the fog is thickest — an invitation, not a score
          </p>
          <SurahKnown items={tend} />
        </section>

        <button className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border transition-colors hover:bg-garden-50">
          <span className="text-sm font-medium text-forest">
            View all {MOCK.totalSurahs} surahs · {MOCK.totalJuz} juz
          </span>
          <ChevronRight className="size-5 text-garden-400" strokeWidth={1.75} />
        </button>

        <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Daily movement</Eyebrow>
            <span className="text-xs tabular-nums text-muted-foreground">
              +{MOCK.movement.promotions} / −{MOCK.movement.demotions} this month
            </span>
          </div>
          <DailyMovement />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Across all words</Eyebrow>
            <span className="text-xs tabular-nums text-muted-foreground">
              {fmtK(MOCK.totalWords)} unique words
            </span>
          </div>
          <StatusSpread />
        </section>
      </div>
    </Frame>
  );
}
