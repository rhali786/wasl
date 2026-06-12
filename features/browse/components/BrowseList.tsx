import Link from "next/link";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

// Browse / fihris — surah + juz list, each row opens the reader at the
// surah's starting page. See docs/design-build-plan.md "/browse".
export function BrowseList({ surahs }: { surahs: SurahIndexEntry[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
      <header className="px-6 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600">
          Index
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Find a sūrah</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any sūrah to open the reader at its first page.
        </p>
      </header>
      <ul className="flex-1 overflow-y-auto px-4 py-3">
        {surahs.map((surah) => (
          <li key={surah.number}>
            <Link
              href={`/reader/${surah.page}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-garden-50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-garden-700">
                {surah.number}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-foreground">{surah.name}</span>
                <span className="block text-xs text-muted-foreground">juz {surah.juz}</span>
              </span>
              <span dir="rtl" className="font-arabic text-lg text-forest">
                {surah.arabic}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
