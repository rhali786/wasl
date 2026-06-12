// Shared, clean-data-viz pieces + mock data for the metrics prototypes.
// Honest by construction: no streak, demotions are good news, percentages are
// state-of-knowledge (100% is fine), never a race.

// All-green ramp, pale luminous top (the docs' "fog clears to luminous" idea).
// Familiar→Recognized is a deliberately large step so they read as distinct.
export const STATUS = [
  { name: "Unknown", color: "#14402B" }, // deep
  { name: "Seen", color: "#2E7A4E" },
  { name: "Familiar", color: "#57A56F" },
  { name: "Recognized", color: "#93CF8E" }, // distinct lift from Familiar
  { name: "Known", color: "#DDF7CE" }, // luminous pale — no fog
];

// Corpus scale is real: ~14.8k unique word-forms across 114 surahs / 30 juz.
// Every form has a status (Unknown by default), so the spread sums to the total.
export const MOCK = {
  totalSurahs: 114,
  totalJuz: 30,
  totalWords: 14870, // unique word-forms
  fullyLuminousSurahs: 9,
  totals: {
    wordsKnown: 1600,
    wordsEncountered: 9670, // total − Unknown
    sessions: 38,
    minutes: 312,
    onTheCusp: 240, // Recognized → near Known
  },
  spread: [5200, 3800, 2600, 1670, 1600], // per STATUS level, sums to 14,870
  surahs: [
    { name: "Al-Fātiḥah", ar: "الفاتحة", pct: 100 },
    { name: "Al-Ikhlāṣ", ar: "الإخلاص", pct: 100 },
    { name: "An-Nās", ar: "الناس", pct: 100 },
    { name: "Al-Falaq", ar: "الفلق", pct: 96 },
    { name: "Al-Kawthar", ar: "الكوثر", pct: 88 },
    { name: "Az-Zalzalah", ar: "الزلزلة", pct: 64 },
    { name: "Al-Mulk", ar: "الملك", pct: 41 },
    { name: "Maryam", ar: "مريم", pct: 28 },
    { name: "Yā-Sīn", ar: "يس", pct: 22 },
    { name: "Al-Baqarah", ar: "البقرة", pct: 12 },
    { name: "An-Nisāʾ", ar: "النساء", pct: 7 },
  ],
  // 6 weeks of returns (true = returned that day). Open-ended history.
  returns: [
    [true, false, true, true, false, true, false],
    [true, true, false, true, true, false, true],
    [false, false, false, false, false, false, false], // a gap — no guilt
    [false, true, true, false, true, true, true],
    [true, true, true, false, true, true, false],
    [true, false, true, true, true, false, false],
  ],
  returnsTotal: 128, // lifetime, open-ended
  movement: {
    promotions: 47,
    demotions: 12,
    weeks: [
      { up: 9, down: 2 },
      { up: 12, down: 4 },
      { up: 6, down: 1 },
      { up: 11, down: 3 },
      { up: 9, down: 2 },
    ],
    daily: [
      { up: 4, down: 1 }, { up: 6, down: 2 }, { up: 0, down: 0 }, { up: 3, down: 1 },
      { up: 5, down: 0 }, { up: 7, down: 2 }, { up: 2, down: 1 }, { up: 0, down: 0 },
      { up: 4, down: 2 }, { up: 8, down: 1 }, { up: 3, down: 0 }, { up: 5, down: 2 },
      { up: 6, down: 1 }, { up: 4, down: 1 },
    ],
    recent: [
      { word: "ٱلْأَرْض", note: "Recognized → Known", level: 4 },
      { word: "زِلْزَال", note: "Familiar → Recognized", level: 3 },
      { word: "أَثْقَال", note: "demoted — re-checked", level: 1, down: true },
      { word: "أَوْحَىٰ", note: "Seen → Familiar", level: 2 },
    ],
  },
};

export function fmtHours(min: number) {
  return `${(min / 60).toFixed(1)}h`;
}

// Compact large counts: 1600 → "1.6k", 14870 → "14.9k".
export function fmtK(n: number) {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

// ── Big stat ─────────────────────────────────────────────────────────────
export function Stat({
  value,
  label,
  sub,
}: {
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
      <p className="text-[28px] font-semibold leading-none tabular-nums text-forest">{value}</p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-garden-600">{sub}</p> : null}
    </div>
  );
}

// ── Status spread 0–4 (stacked bar + legend) ───────────────────────────────
export function StatusSpread({ counts = MOCK.spread }: { counts?: number[] }) {
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex h-3.5 w-full overflow-hidden rounded-full ring-1 ring-black/5">
        {counts.map((c, i) => (
          <div
            key={i}
            style={{ width: `${(c / total) * 100}%`, background: STATUS[i].color }}
            title={`${STATUS[i].name}: ${c}`}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {STATUS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">{s.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-forest">{fmtK(counts[i])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Surah known % (ranked bars) ────────────────────────────────────────────
export function SurahKnown({ items = MOCK.surahs }: { items?: typeof MOCK.surahs }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <div className="w-28 shrink-0">
            <p className="truncate text-sm font-medium text-forest">{s.name}</p>
          </div>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-garden-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${s.pct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-forest">
            {s.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Returns grid (open-ended; never a streak count) ────────────────────────
export function ReturnsGrid({ weeks = MOCK.returns }: { weeks?: boolean[][] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex gap-1.5">
      <div className="flex flex-col gap-1.5 pr-1 pt-5">
        {/* column spacer to align with day header */}
      </div>
      <div>
        <div className="mb-1.5 flex gap-1.5">
          {days.map((d, i) => (
            <span key={i} className="w-5 text-center text-[10px] font-semibold text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {weeks.map((wk, wi) => (
            <div key={wi} className="flex gap-1.5">
              {wk.map((on, di) => (
                <span
                  key={di}
                  className={`size-5 rounded-md ${
                    on ? "bg-primary" : "bg-garden-100 dark:bg-garden-900/40"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Promotions / demotions twin numbers ────────────────────────────────────
export function Movement({
  promotions = MOCK.movement.promotions,
  demotions = MOCK.movement.demotions,
}: {
  promotions?: number;
  demotions?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-garden-50 p-4 ring-1 ring-garden-100">
        <p className="text-[28px] font-semibold tabular-nums text-garden-700">+{promotions}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Promotions
        </p>
        <p className="mt-0.5 text-xs text-garden-600">words that stuck</p>
      </div>
      <div className="rounded-2xl bg-sand-100 p-4 ring-1 ring-sand-300/50">
        <p className="text-[28px] font-semibold tabular-nums text-sand-800">{demotions}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Demotions
        </p>
        <p className="mt-0.5 text-xs text-sand-700">good news — honestly re-checked</p>
      </div>
    </div>
  );
}

// ── Daily movement strip (14 days, diverging) ──────────────────────────────
// Promotions up, demotions down. Open-ended, no streak; a blank day removes
// nothing.
export function DailyMovement({
  days = MOCK.movement.daily,
}: {
  days?: { up: number; down: number }[];
}) {
  const max = Math.max(1, ...days.flatMap((d) => [d.up, d.down]));
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">promotions</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-sand-300" />
          <span className="text-muted-foreground">demotions</span>
        </span>
      </div>
      <div className="flex h-16 items-stretch justify-between gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-1.5 rounded-t bg-primary"
                style={{ height: `${(d.up / max) * 100}%` }}
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
        Last 14 days · demotions are honest re-checks, not failures
      </p>
    </div>
  );
}
