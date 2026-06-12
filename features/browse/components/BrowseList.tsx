import Link from "next/link";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

// Browse / fihris — surah + juz list, each row opens the reader at the
// surah's starting page. See docs/design-build-plan.md "/browse".
export function BrowseList({ surahs }: { surahs: SurahIndexEntry[] }) {
  return (
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
  );
}
