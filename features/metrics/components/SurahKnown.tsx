export interface SurahKnownItem {
  number: number;
  name: string;
  arabic: string;
  /** Fraction (0-1) of this surah's word-forms at level 4 (Known). */
  pct: number;
}

export function SurahKnown({ items }: { items: SurahKnownItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((s) => (
        <div key={s.number} className="flex items-center gap-3">
          <div className="w-28 shrink-0">
            <p className="truncate text-sm font-medium text-forest">{s.name}</p>
          </div>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-garden-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${s.pct * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-forest">
            {Math.round(s.pct * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
