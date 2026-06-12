"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, BookOpen, BarChart3, Settings } from "lucide-react";
import { readLastPage } from "@/features/reader/lib/lastPage";

type NavKey = "home" | "browse" | "reader" | "metrics" | "settings";

const ITEMS: { key: NavKey; href: string; icon: typeof Home; label: string }[] = [
  { key: "home", href: "/", icon: Home, label: "Home" },
  { key: "browse", href: "/browse", icon: List, label: "Browse" },
  { key: "reader", href: "/reader/1", icon: BookOpen, label: "Reader" },
  { key: "metrics", href: "/metrics", icon: BarChart3, label: "Metrics" },
  { key: "settings", href: "/settings", icon: Settings, label: "Settings" },
];

function activeKey(pathname: string): NavKey {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/browse")) return "browse";
  if (pathname.startsWith("/reader")) return "reader";
  if (pathname.startsWith("/metrics")) return "metrics";
  if (pathname.startsWith("/settings")) return "settings";
  return "home";
}

// Bottom nav — the spine of the hub screens (Home, Browse, Metrics,
// Settings). The Reader runs immersive and isn't part of this nav; its
// "current/last page" target is read from localStorage on mount.
export function BottomNav() {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const [readerHref, setReaderHref] = useState("/reader/1");

  useEffect(() => {
    setReaderHref(`/reader/${readLastPage()}`);
  }, []);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(18px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/[0.04] bg-white/85 px-2.5 py-2 shadow-[0_14px_34px_-12px_rgba(20,83,45,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c2016]/85">
        {ITEMS.map(({ key, href, icon: Icon, label }) => {
          const isCenter = key === "reader";
          const isActive = key === active;
          const linkHref = isCenter ? readerHref : href;
          if (isCenter) {
            return (
              <Link
                key={key}
                href={linkHref}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className="mx-0.5 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_22px_-4px_var(--garden-500)] ring-4 ring-white/60 dark:ring-[#0c2016]/70"
              >
                <Icon className="size-6" strokeWidth={1.75} />
              </Link>
            );
          }
          return (
            <Link
              key={key}
              href={linkHref}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`grid size-11 place-items-center rounded-full transition-colors ${
                isActive
                  ? "bg-secondary text-garden-700 dark:text-garden-200"
                  : "text-garden-700/45 hover:text-garden-700/80 dark:text-garden-200/45"
              }`}
            >
              <Icon className="size-[22px]" strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
