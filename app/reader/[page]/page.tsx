import { notFound } from "next/navigation";
import { loadPage } from "@/features/corpus/lib/pages";
import { TOTAL_PAGES } from "@/features/corpus/lib/types";
import { ReaderRoute } from "@/features/reader/components/ReaderRoute";
import type { ReaderMode } from "@/features/reader/lib/types";

function parseMode(value: string | undefined): ReaderMode | undefined {
  return value === "study" || value === "mushaf" ? value : undefined;
}

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { page } = await params;
  const { mode } = await searchParams;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    notFound();
  }
  return (
    <div className="h-dvh">
      <ReaderRoute
        page={loadPage(pageNumber)}
        pageNumber={pageNumber}
        initialMode={parseMode(mode)}
      />
    </div>
  );
}
