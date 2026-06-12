import surahs from "@/features/corpus/data/surahs.json";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";
import { SettingsView } from "@/features/settings/components/SettingsView";
import { BottomNav } from "@/features/nav/components/BottomNav";

export default function SettingsPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24">
      <SettingsView surahs={surahs as SurahIndexEntry[]} />
      <BottomNav />
    </div>
  );
}
