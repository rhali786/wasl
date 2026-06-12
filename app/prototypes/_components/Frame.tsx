import Link from "next/link";
import { ArrowLeft, Signal, Wifi, BatteryFull } from "lucide-react";
import { Nav } from "./Nav";

type NavKey = "home" | "reader" | "review" | "progress" | "profile";

function StatusBar({ time = "9:41", dark = false }: { time?: string; dark?: boolean }) {
  const tone = dark ? "text-[#dbeede]" : "text-forest";
  return (
    <div className={`flex shrink-0 items-center justify-between px-7 pt-3.5 pb-1 text-[15px] font-semibold ${tone}`}>
      <span className="tabular-nums tracking-tight">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="size-[15px]" strokeWidth={2.4} />
        <Wifi className="size-[15px]" strokeWidth={2.4} />
        <BatteryFull className="size-[18px]" strokeWidth={1.8} />
      </div>
    </div>
  );
}

export function Frame({
  title,
  tags = [],
  time,
  dark = false,
  active = "home",
  screenClassName = "",
  galleryClassName = "bg-mist",
  hideNav = false,
  children,
}: {
  title: string;
  tags?: string[];
  time?: string;
  dark?: boolean;
  active?: NavKey;
  screenClassName?: string;
  galleryClassName?: string;
  hideNav?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-h-full w-full flex-col items-center px-4 py-8 ${galleryClassName}`}>
      {/* Toolbar — not part of the mockup */}
      <div className="mb-6 flex w-full max-w-[420px] flex-col gap-3">
        <Link
          href="/prototypes"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-forest shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          All prototypes
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-xl font-semibold text-forest">{title}</h1>
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-garden-700 ring-1 ring-garden-200"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div className="rounded-[46px] bg-black/85 p-2.5 shadow-[0_40px_80px_-30px_rgba(20,83,45,0.55)]">
        <div
          className={`relative flex h-[812px] w-[378px] flex-col overflow-hidden rounded-[38px] ${
            dark ? "dark" : ""
          } ${screenClassName}`}
        >
          {/* dynamic island */}
          <div className="absolute left-1/2 top-2.5 z-30 h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
          <StatusBar time={time} dark={dark} />
          <div className={`relative flex-1 overflow-y-auto overflow-x-hidden ${hideNav ? "" : "pb-28"}`}>
            {children}
          </div>
          {hideNav ? null : <Nav active={active} />}
        </div>
      </div>
    </div>
  );
}
