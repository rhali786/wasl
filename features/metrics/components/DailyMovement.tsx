import { TICK_ON } from "../lib/statusPalette";

/** Diverging promotions/demotions strip. Open-ended; demotions are honest re-checks. */
export function DailyMovement({ days }: { days: { up: number; down: number }[] }) {
  const max = Math.max(1, ...days.flatMap((d) => [d.up, d.down]));
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: TICK_ON }} />
          <span className="text-muted-foreground">promotions</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-sand-300" />
          <span className="text-muted-foreground">demotions</span>
        </span>
      </div>
      <div className="flex h-16 items-stretch justify-between gap-1">
        {days.map((d, i) => (
          <div key={i} data-testid="movement-day" className="flex flex-1 flex-col items-center">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-1.5 rounded-t"
                style={{ height: `${(d.up / max) * 100}%`, background: TICK_ON }}
                title={`${d.up} promotions`}
              />
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex w-full flex-1 items-start justify-center">
              <div
                className="w-1.5 rounded-b bg-sand-300"
                style={{ height: `${(d.down / max) * 100}%` }}
                title={`${d.down} demotions`}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Last {days.length} days · demotions are honest re-checks, not failures
      </p>
    </div>
  );
}
