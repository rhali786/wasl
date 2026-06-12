"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRecommendedPage } from "@/features/reader/lib/recommendedPage";

// Bare /reader redirects to the page Home recommends (the sūrah being
// memorized, or page 1 if none is set up yet).
export default function ReaderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/reader/${getRecommendedPage()}`);
  }, [router]);

  return null;
}
