import Link from "next/link";
import { ChevronRight, BarChart3, BookOpen, FlaskConical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, type TreeMood } from "./_components/Tree";
import { Eyebrow } from "./_components/bits";

const METRICS: { href: string; name: string; desc: string }[] = [
  { href: "/prototypes/metrics-overview", name: "Overview", desc: "Everything at a glance — totals, status spread, returns, top surahs." },
  { href: "/prototypes/metrics-returns", name: "Returns", desc: "The return is the practice. Open-ended history, repair tone, no streak." },
  { href: "/prototypes/metrics-surahs", name: "Surahs", desc: "Luminosity ranked per surah. 100% allowed — state, not a race." },
  { href: "/prototypes/metrics-movement", name: "Movement", desc: "Promotions & demotions. Demotions framed as good news." },
];

type Sample = {
  href: string;
  name: string;
  desc: string;
  mood: TreeMood;
  tags: string[];
  metrics: "None" | "Light" | "Moderate";
  chip: string; // gradient classes for the thumbnail
};

const SAMPLES: Sample[] = [
  {
    href: "/prototypes/sakinah",
    name: "Sakinah",
    desc: "The purest reading of the docs. Near-white air, one question, one tap.",
    mood: "mist",
    tags: ["Morning", "Airy"],
    metrics: "None",
    chip: "from-garden-100 to-white",
  },
  {
    href: "/prototypes/garden-day",
    name: "Garden Day",
    desc: "The previews' light energy — misty hero wash, warm sand tiles, finished-product warmth.",
    mood: "day",
    tags: ["Midday", "Lush"],
    metrics: "Light",
    chip: "from-garden-200 to-garden-50",
  },
  {
    href: "/prototypes/night-study",
    name: "Night Study",
    desc: "The dark gamified screen, reinterpreted. Glowing tree, level + XP-to-bloom, day strip.",
    mood: "night",
    tags: ["Night", "Glow"],
    metrics: "Moderate",
    chip: "from-[#0f2c1c] to-[#06120b]",
  },
  {
    href: "/prototypes/mushaf",
    name: "Mushaf-forward",
    desc: "The Qur'an is the hero. Opens on a waiting ayah; Study/Mushaf mode is the one choice.",
    mood: "evening",
    tags: ["Evening", "Reverent"],
    metrics: "None",
    chip: "from-sand-200 to-garden-50",
  },
  {
    href: "/prototypes/canopy",
    name: "Living Canopy",
    desc: "Tree-maximalist. The breathing tree fills the screen; growth is the whole payload.",
    mood: "day",
    tags: ["Afternoon", "Tree-first"],
    metrics: "Light",
    chip: "from-garden-100 to-garden-200",
  },
];

const METRIC_TONE: Record<Sample["metrics"], string> = {
  None: "bg-garden-100 text-garden-700",
  Light: "bg-sand-100 text-sand-800",
  Moderate: "bg-garden-600 text-white",
};

export default function Gallery() {
  return (
    <div className="min-h-full w-full bg-mist px-5 py-12">
      <div className="mx-auto max-w-md">
        <Eyebrow>Wird · home explorations</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">
          Pick a direction
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Five takes on the Garden home — same bones, different mood and different
          amounts of metric. Primary influence: the preview images. Secondary:
          the design docs. Tap any card to open it in a phone frame.
        </p>

        <div className="mt-9 flex flex-col gap-4">
          {SAMPLES.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="flex-row items-center gap-4 p-4 ring-garden-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_44px_-26px_rgba(20,83,45,0.45)]">
                <div
                  className={`grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${s.chip}`}
                >
                  <Sprout mood={s.mood} size={52} />
                </div>
                <CardContent className="flex-1 px-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-forest">{s.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${METRIC_TONE[s.metrics]}`}
                    >
                      {s.metrics} metrics
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{s.desc}</p>
                  <div className="mt-2 flex gap-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-garden-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <ChevronRight className="size-5 shrink-0 text-garden-400 transition-colors group-hover:text-garden-600" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Reader */}
        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-forest">
          Reader
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The heart of the app — real Madani page, real tappable words.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Link href="/prototypes/reader" className="group">
            <Card className="flex-row items-center gap-4 p-4 ring-garden-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_44px_-26px_rgba(20,83,45,0.45)]">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sand-200 to-garden-50 text-garden-700">
                <BookOpen className="size-7" strokeWidth={1.5} />
              </div>
              <CardContent className="flex-1 px-0">
                <h3 className="text-lg font-semibold text-forest">Study / Mushaf</h3>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  Tap any word to reveal its meaning (and demote it — Engine B). Toggle
                  the S/M badge for the ambient mode difference. Page 78–82, real data.
                </p>
              </CardContent>
              <ChevronRight className="size-5 shrink-0 text-garden-400 transition-colors group-hover:text-garden-600" />
            </Card>
          </Link>
          <Link href="/prototypes/reader-lab" className="group">
            <Card className="flex-row items-center gap-4 p-4 ring-garden-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_44px_-26px_rgba(20,83,45,0.45)]">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-garden-100 to-sand-100 text-garden-700">
                <FlaskConical className="size-7" strokeWidth={1.5} />
              </div>
              <CardContent className="flex-1 px-0">
                <h3 className="text-lg font-semibold text-forest">Reader Lab · pick the look</h3>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  Compare 3 fog/status systems and 3 definition-reveal styles side by
                  side. Lines auto-fit the frame. Choose a combo to wire in.
                </p>
              </CardContent>
              <ChevronRight className="size-5 shrink-0 text-garden-400 transition-colors group-hover:text-garden-600" />
            </Card>
          </Link>
        </div>

        {/* Metrics page */}
        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-forest">
          Metrics page
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clean data-viz, four cuts. No streaks anywhere; demotions are good news.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {METRICS.map((m) => (
            <Link key={m.href} href={m.href} className="group">
              <Card className="flex-row items-center gap-4 p-4 ring-garden-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_44px_-26px_rgba(20,83,45,0.45)]">
                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-garden-100 to-garden-50 text-garden-600">
                  <BarChart3 className="size-7" strokeWidth={1.5} />
                </div>
                <CardContent className="flex-1 px-0">
                  <h3 className="text-lg font-semibold text-forest">{m.name}</h3>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{m.desc}</p>
                </CardContent>
                <ChevronRight className="size-5 shrink-0 text-garden-400 transition-colors group-hover:text-garden-600" />
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prototypes only — static mock data, outside the TDD pipeline. The
          winning home direction is now the real <code>app/page.tsx</code>.
        </p>
      </div>
    </div>
  );
}
