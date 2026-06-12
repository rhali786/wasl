import surahs from "@/features/corpus/data/surahs.json";
import { BrowseList } from "@/features/browse/components/BrowseList";
import { BottomNav } from "@/features/nav/components/BottomNav";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

export default function BrowsePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <BrowseList surahs={surahs as SurahIndexEntry[]} />
      <BottomNav />
    </div>
  );
}
