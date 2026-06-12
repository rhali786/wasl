"use client";

import { ReturnDots, Eyebrow } from "../_components/bits";
import { Frame } from "../_components/Frame";
import { Tree } from "../_components/Tree";

// MUSHAF-FORWARD — "the Qur'an is the hero." The home opens on a waiting ayah
// in Amiri Quran, not a dashboard. Mode (Study / Mushaf) is the one choice.
// Minimal color, no metrics. Closest to design-principles Law 1.
export default function Mushaf() {
  return (
    <Frame
      title="Mushaf-forward"
      tags={["Evening", "No metrics"]}
      time="7:46"
      active="reader"
      screenClassName="bg-gradient-to-b from-sand-100 via-white to-garden-50"
    >
      <div className="flex min-h-full flex-col px-6 pt-6">
        <Eyebrow>Evening · before Maghrib</Eyebrow>

        {/* the waiting ayah — the hero */}
        <div className="flex flex-col items-center gap-6 pt-12 text-center">
          <p
            dir="rtl"
            className="font-arabic text-[2.1rem] leading-[2.5] text-forest"
          >
            إِذَا زُلْزِلَتِ ٱلْأَرْضُ زِلْزَالَهَا
          </p>
          <p className="font-display text-lg italic leading-relaxed text-garden-700/80">
            When the earth is shaken with its quaking.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Az-Zalzalah</span>
          <span className="text-garden-300">·</span>
          <span>sūrah 99</span>
          <span className="text-garden-300">·</span>
          <span>~5 min</span>
        </div>

        {/* mode selection — Study vs Mushaf (design-visual §mode selection) */}
        <div className="mt-10">
          <Eyebrow className="text-center">Enter as</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="flex flex-col items-start gap-2 rounded-2xl bg-primary px-4 py-3.5 text-left text-primary-foreground shadow-[0_16px_32px_-18px_var(--garden-500)]">
              <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm font-bold">
                S
              </span>
              <span className="font-semibold">Study</span>
              <span className="text-xs opacity-80">Reads track your words</span>
            </button>
            <button className="flex flex-col items-start gap-2 rounded-2xl bg-white px-4 py-3.5 text-left text-forest ring-1 ring-garden-200">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm font-bold text-garden-700">
                M
              </span>
              <span className="font-semibold">Mushaf</span>
              <span className="text-xs text-muted-foreground">Read freely, no tracking</span>
            </button>
          </div>
        </div>

        {/* understated footer — tree small, returns quiet */}
        <div className="mt-auto flex items-end justify-between pt-8">
          <Tree mood="evening" knownPct={0.55} size={92} />
          <div className="flex flex-col items-end gap-2 pb-2">
            <Eyebrow>Returns today</Eyebrow>
            <ReturnDots filled={2} total={4} />
          </div>
        </div>
      </div>
    </Frame>
  );
}
