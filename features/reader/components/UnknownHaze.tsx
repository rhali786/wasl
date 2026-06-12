import type { StatusLevel } from "@/features/review/lib/types";

// A faint haze marks only a truly Unknown word (level 0). See
// docs/design-interaction.md "Status levels".
export function UnknownHaze({ level }: { level: StatusLevel }) {
  if (level > 0) return null;
  return (
    <span
      aria-hidden
      data-testid="unknown-haze"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: "calc(100% + 0.6em)",
        height: "1.4em",
        background: "radial-gradient(closest-side, var(--unknown-haze), transparent 75%)",
        filter: "blur(5px)",
      }}
    />
  );
}
