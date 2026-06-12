import { Frame } from "../_components/Frame";
import { Eyebrow } from "../_components/bits";
import { Stat, ReturnsGrid, MOCK } from "../_components/metrics";

// METRICS · RETURNS — the return is the practice. Open-ended history, the
// repair tone made central. A gap is welcomed back, never punished.
export default function MetricsReturns() {
  return (
    <Frame
      title="Metrics · Returns"
      tags={["Clean", "Repair tone"]}
      time="3:27"
      active="progress"
      screenClassName="bg-gradient-to-b from-mist to-white"
    >
      <div className="flex flex-col gap-6 px-5 pt-5">
        <header>
          <Eyebrow>Returning is the practice</Eyebrow>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums text-forest">
              {MOCK.returnsTotal}
            </span>
            <span className="text-lg text-muted-foreground">returns</span>
          </div>
          <p className="mt-1 text-sm text-garden-600">
            since May 2025 · never a streak to break
          </p>
        </header>

        <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <ReturnsGrid />
        </section>

        <div className="grid grid-cols-3 gap-3">
          <Stat value={5} label="This week" />
          <Stat value={18} label="This month" />
          <Stat value="9 days" label="Longest gap" sub="welcome back" />
        </div>

        <p className="rounded-2xl bg-garden-50 p-4 font-display text-base italic leading-relaxed text-garden-700 ring-1 ring-garden-100">
          A gap isn&apos;t a failure. The words are still here whenever you return.
        </p>
      </div>
    </Frame>
  );
}
