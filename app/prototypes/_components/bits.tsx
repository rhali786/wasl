import { cn } from "@/lib/utils";

// Uppercase micro-label / category eyebrow (design-visual.md type scale --t-label)
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em] text-garden-600", className)}>
      {children}
    </p>
  );
}

// "Returns today" — soft dots that light up. Never a streak (design-principles §3).
export function ReturnDots({
  filled,
  total = 4,
  className,
}: {
  filled: number;
  total?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-label={`${filled} of ${total} returns today`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-2.5 rounded-full transition-colors",
            i < filled
              ? "bg-primary shadow-[0_0_8px_-1px_var(--garden-500)]"
              : "bg-garden-200 dark:bg-garden-800/60"
          )}
        />
      ))}
    </div>
  );
}

// Soft category / mode pill.
export function Pill({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--garden-500)]"
          : "bg-secondary text-garden-800 dark:text-garden-100",
        className
      )}
    >
      {children}
    </span>
  );
}
