import { GardenHome } from "@/features/garden/GardenHome";

// Garden home — the hub. app/ stays a thin routing layer; the UI lives in
// features/garden (see CLAUDE.md).
export default function Page() {
  return <GardenHome />;
}
