import { Home, BookOpen, Leaf, BarChart3, User } from "lucide-react";

type NavKey = "home" | "reader" | "review" | "progress" | "profile";

const ITEMS: { key: NavKey; icon: typeof Home; label: string }[] = [
  { key: "home", icon: Home, label: "Garden" },
  { key: "reader", icon: BookOpen, label: "Read" },
  { key: "review", icon: Leaf, label: "Review" }, // center bud
  { key: "progress", icon: BarChart3, label: "Growth" },
  { key: "profile", icon: User, label: "You" },
];

// The floating pill nav from the preview images: glass pill, a glowing green
// bud at center for the primary action (begin review).
export function Nav({ active = "home" }: { active?: NavKey }) {
  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[max(18px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/[0.04] bg-white/85 px-2.5 py-2 shadow-[0_14px_34px_-12px_rgba(20,83,45,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c2016]/85">
        {ITEMS.map(({ key, icon: Icon, label }) => {
          const isCenter = key === "review";
          const isActive = key === active;
          if (isCenter) {
            return (
              <button
                key={key}
                aria-label={label}
                className="mx-0.5 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_22px_-4px_var(--garden-500)] ring-4 ring-white/60 dark:ring-[#0c2016]/70"
              >
                <Icon className="size-6" strokeWidth={1.75} />
              </button>
            );
          }
          return (
            <button
              key={key}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`grid size-11 place-items-center rounded-full transition-colors ${
                isActive
                  ? "bg-secondary text-garden-700 dark:text-garden-200"
                  : "text-garden-700/45 hover:text-garden-700/80 dark:text-garden-200/45"
              }`}
            >
              <Icon className="size-[22px]" strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
