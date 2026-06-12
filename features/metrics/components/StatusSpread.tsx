import { STATUS_COLORS, STATUS_LABELS } from "../lib/statusPalette";
import { fmtK } from "../lib/computeStats";

export function StatusSpread({ counts }: { counts: number[] }) {
  const total = counts.reduce((sum, c) => sum + c, 0) || 1;
  return (
    <div>
      <div className="flex h-3.5 w-full overflow-hidden rounded-full ring-1 ring-black/5">
        {counts.map((c, i) => (
          <div
            key={STATUS_LABELS[i]}
            style={{ width: `${(c / total) * 100}%`, background: STATUS_COLORS[i] }}
            title={`${STATUS_LABELS[i]}: ${c}`}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {STATUS_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: STATUS_COLORS[i] }}
            />
            <span className="text-muted-foreground">{label}</span>
            <span className="ml-auto font-semibold tabular-nums text-forest">{fmtK(counts[i])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
