import surahs from "@/features/corpus/data/surahs.json";
import wordIndex from "@/features/corpus/data/wordIndex.json";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";
import { MetricsView } from "@/features/metrics/components/MetricsView";
import { BottomNav } from "@/features/nav/components/BottomNav";

export default function MetricsPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <MetricsView surahs={surahs as SurahIndexEntry[]} wordIndex={wordIndex} />
      <BottomNav />
    </div>
  );
}
