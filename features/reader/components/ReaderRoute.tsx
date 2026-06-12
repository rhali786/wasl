"use client";

import { useRouter } from "next/navigation";
import { Reader } from "./Reader";
import { TOTAL_PAGES } from "@/features/corpus/lib/types";
import type { CorpusPage } from "@/features/corpus/lib/types";
import type { ReaderMode } from "../lib/types";

// Routes Reader's pagination/exit callbacks to /reader/[page] and /browse.
export function ReaderRoute({
  page,
  pageNumber,
  initialMode,
}: {
  page: CorpusPage;
  pageNumber: number;
  initialMode?: ReaderMode;
}) {
  const router = useRouter();

  return (
    <Reader
      page={page}
      initialMode={initialMode}
      hasNextPage={pageNumber < TOTAL_PAGES}
      hasPreviousPage={pageNumber > 1}
      onNextPage={() => router.push(`/reader/${pageNumber + 1}`)}
      onPreviousPage={() => router.push(`/reader/${pageNumber - 1}`)}
      onGoToPage={(p) => router.push(`/reader/${p}`)}
    />
  );
}
