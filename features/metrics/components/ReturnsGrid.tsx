import { TICK_OFF, TICK_ON } from "../lib/statusPalette";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** 6x7 grid (oldest -> newest), filled = a return that day. Open-ended — no streak. */
export function ReturnsGrid({ weeks }: { weeks: boolean[][] }) {
  return (
    <div>
      <div className="mb-1.5 flex gap-1.5">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="w-5 text-center text-[10px] font-semibold text-muted-foreground">
            {d}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((on, di) => (
              <span
                key={di}
                data-testid="return-cell"
                data-filled={on}
                className="size-5 rounded-md"
                style={{ background: on ? TICK_ON : TICK_OFF }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
