import { Frame } from "../_components/Frame";
import { Eyebrow } from "../_components/bits";
import { Movement, STATUS, MOCK } from "../_components/metrics";

// METRICS · MOVEMENT — promotions and demotions as honest signal. Demotions
// are surfaced as good news ("the system working"), never as failure.
export default function MetricsMovement() {
  const weeks = MOCK.movement.weeks;
  const max = Math.max(...weeks.flatMap((w) => [w.up, w.down]));
  return (
    <Frame
      title="Metrics · Movement"
      tags={["Clean", "Demotions = good"]}
      time="3:27"
      active="progress"
      screenClassName="bg-gradient-to-b from-mist to-white"
    >
      <div className="flex flex-col gap-6 px-5 pt-5">
        <header>
          <Eyebrow>The system working</Eyebrow>
          <h2 className="mt-1 text-2xl font-semibold text-forest">Honest movement</h2>
        </header>

        <Movement />

        <section>
          <Eyebrow className="mb-3">Last 5 weeks</Eyebrow>
          <div className="flex h-28 items-end justify-between gap-3">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-[88px] w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t bg-primary"
                    style={{ height: `${(w.up / max) * 100}%` }}
                    title={`${w.up} promotions`}
                  />
                  <div
                    className="w-1/2 rounded-t bg-sand-300"
                    style={{ height: `${(w.down / max) * 100}%` }}
                    title={`${w.down} demotions`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Eyebrow className="mb-3">Recent</Eyebrow>
          <div className="flex flex-col gap-2">
            {MOCK.movement.recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 ring-1 ring-border"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ background: STATUS[r.level].color }}
                />
                <span dir="rtl" className="font-arabic text-lg leading-none text-forest">
                  {r.word}
                </span>
                <span
                  className={`ml-auto text-xs ${"down" in r && r.down ? "text-sand-700" : "text-muted-foreground"}`}
                >
                  {r.note}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Frame>
  );
}
