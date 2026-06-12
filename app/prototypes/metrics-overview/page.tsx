import { Frame } from "../_components/Frame";
import { Eyebrow } from "../_components/bits";
import {
  Stat,
  StatusSpread,
  SurahKnown,
  ReturnsGrid,
  MOCK,
  fmtHours,
} from "../_components/metrics";

// METRICS · OVERVIEW — the comprehensive dashboard. Everything at a glance,
// clean data-viz, Garden palette. No streak anywhere.
export default function MetricsOverview() {
  return (
    <Frame
      title="Metrics · Overview"
      tags={["Clean", "No streak"]}
      time="3:27"
      active="progress"
      screenClassName="bg-gradient-to-b from-mist to-white"
    >
      <div className="flex flex-col gap-6 px-5 pt-5">
        <header>
          <Eyebrow>Your growth</Eyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-forest">Where you are</h2>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Stat value={MOCK.totals.wordsKnown} label="Words known" sub={`${MOCK.totals.onTheCusp} on the cusp`} />
          <Stat value={MOCK.totals.wordsEncountered.toLocaleString()} label="Words met" />
          <Stat value={MOCK.totals.sessions} label="Sessions" />
          <Stat value={fmtHours(MOCK.totals.minutes)} label="Time reviewed" />
        </div>

        <section>
          <Eyebrow className="mb-3">Status spread</Eyebrow>
          <StatusSpread />
        </section>

        <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Returns</Eyebrow>
            <span className="text-sm text-muted-foreground">
              <b className="font-semibold tabular-nums text-forest">{MOCK.returnsTotal}</b> in all
            </span>
          </div>
          <ReturnsGrid />
        </section>

        <section>
          <Eyebrow className="mb-3">Most luminous surahs</Eyebrow>
          <SurahKnown items={MOCK.surahs.slice(0, 4)} />
        </section>
      </div>
    </Frame>
  );
}
