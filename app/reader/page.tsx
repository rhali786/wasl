"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readLastPage } from "@/features/reader/lib/lastPage";

// Bare /reader redirects to the last-visited page (or page 1 by default).
export default function ReaderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/reader/${readLastPage()}`);
  }, [router]);

  return null;
}
