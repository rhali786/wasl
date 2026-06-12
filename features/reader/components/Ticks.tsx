import type { StatusLevel } from "@/features/review/lib/types";

// Status display = undermark (locked 2026-06-10): the word stays crisp ink;
// four short ticks beneath it fill 0-4 as the form is learned. See
// docs/design-interaction.md "Status levels". Colors come from --tick-on /
// --tick-off (app/globals.css) via the bg-tick-on/bg-tick-off Tailwind
// tokens, which brighten under .dark for night legibility.
export const TICK_ON = "var(--tick-on)";
export const TICK_OFF = "var(--tick-off)";

export function Ticks({ level }: { level: StatusLevel }) {
  return (
    <span className="pointer-events-none absolute -bottom-[0.32em] left-1/2 flex -translate-x-1/2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          data-testid="tick"
          className={`h-[2px] w-[5px] rounded-full ${i < level ? "bg-tick-on" : "bg-tick-off"}`}
        />
      ))}
    </span>
  );
}
