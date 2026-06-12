# Wird — Design Reference

**A Qur'an review companion.** Working title and product name: **Wird**
("a daily devotional return").

> **Platform:** iPhone, mobile-first. **For:** intermediate Qur'an
> learners who already read Arabic and have memorized surahs. **Posture:**
> review, not content.

---

## Design documentation

This reference is split into seven focused documents:

1. **[Design Principles](design-principles.md)** — Thesis, Three Laws, and what's out of scope
2. **[Architecture](design-architecture.md)** — Local-first data, Tanzil corpus, LingQ import
3. **[Interaction Model](design-interaction.md)** — Tap → reveal, Engines A & B, status levels
4. **[Visual Design & Environment](design-visual.md)** — Garden aesthetic, time-of-day shifts, color, typography, motion, layout
5. **[Voice & Onboarding](design-voice.md)** — Copy tone, return messages, 2-screen onboarding
6. **[Design Influences](design-influences.md)** — What we take and leave from Kalam, Forest, LingQ
7. **[Build Plan & Route Map](design-build-plan.md)** — 5 sprints, open questions, route architecture

Each document is self-contained and focused on a single domain. Start with
principles (1), then architecture (2) for foundations. Move to interaction (3)
and visual (4) to understand the core experience. Read voice (5), influences (6),
and build plan (7) for implementation.

---

## Status of this redesign

This architecture reflects a major redesign from previous iterations:

**Major changes:**

- **One unified environment** (not two rooms): garden-like, shifts with time of day.
- **Home = Mushaf-forward:** the home opens on a waiting ayah (the hero); the
  Living Tree is a faint atmospheric backdrop (not a live meter); growth shows
  as a growing vine (one leaf per return, open-ended, no streak).
- **Status display = the undermark:** the word stays crisp ink; status 0–4 is
  shown by four ticks beneath the word (faint haze only on Unknown). Supersedes
  the old "green shade + fog on the word."
- **Simplified interaction:** no "I Knew It" button; status changes via Engines A & B only.
- **Identity = per word-form:** status keyed by the tashkīl-stripped normalized
  form; every occurrence of a form shares one status.
- **Engine A = finishing a page** (the clean read): untapped words on a finished
  page earn a clean-read credit and promote at thresholds.
- **Engine B = Study only:** tapping demotes one level live in Study mode;
  **Mushaf mutates no status at all** (reverent; reveal is free, undermark read-only).
- **Reveal = a floating meaning card** near the tapped word (above or below it
  depending on its line, to stay on-screen); tap anywhere to dismiss. Replaces
  the earlier below-header ribbon.
- **Session timer:** faint right-to-left bar; adjustable in 5-min increments;
  keeps running on tab/focus loss — only in-app navigation away ends a session.
- **Clearer session model:** three steps per return (memorizing, memorized, longer).
- **Sessions are Study-only:** the timer/plan/nudges begin only on a deliberate
  "Enter as Study" — from Home's Study card, or the bottom-nav Reader tab.
  Mushaf and Browse→open are free reads with no session chrome. A brief
  intro/summary message bookends each session, fading out over its display
  duration before it dismisses.
- **Onboarding:** 2 screens (memorized + memorizing); longer surahs calculated automatically.
- **Return messages:** warm, inviting, emphasize repair over performance.
- **Tree:** high-definition artistic illustration.
- **Status levels:** 0–4 (removed level 5).
- **Corpus source:** **quran.com API v4** (text + Madani layout + per-word
  glosses), snapshotted offline. Replaces Tanzil. **LingQ import is optional /
  post-MVP**, not the foundation.
- **Navigation:** 5-slot bottom nav — **Home · Browse/Index · Reader (center) ·
  Metrics · Settings.** Browse is the fihris (surah + juz) that opens the reader
  to any page. The reader is no longer a dead end.
- **Reader page:** faithful 15-line Madani page that **fills the height with no
  scroll**; lines auto-fit the frame width; Mushaf shows full tashkīl, Study
  shows bare letters.
- **No audio:** removed from MVP.

**Previous docs (archived):**
- `docs/archive/style-guide.md`
- `docs/archive/interaction-model.md`
- `docs/archive/design-dossier.html`
- `docs/archive/wird-app.jsx`
