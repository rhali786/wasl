"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { needsLogin, needsOnboarding } from "@/features/settings/store";

const BYPASS_PREFIXES = ["/onboarding", "/login", "/prototypes"];

function shouldBypass(pathname: string): boolean {
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Redirects first-time users to /onboarding and signed-out users to /login
// before any hub screen loads.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (shouldBypass(pathname)) return;
    if (needsOnboarding()) {
      router.replace("/onboarding");
      return;
    }
    if (needsLogin()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return children;
}
