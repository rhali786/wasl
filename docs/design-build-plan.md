# Wird — Build Plan & Route Map

## Build order (smallest honest thing first)

1. **Sprint 0 — Data.** Snapshot the **quran.com API v4** corpus into local JSON
   for all **604 Madani pages** (`fetch.mjs`, widen `PAGES`). Per word: Uthmani
   text, line number, ayah-end flag, English gloss. Derive and store the
   **normalized wordId** (tashkīl stripped, alif/hamza/yāʾ/waṣla unified). No AI
   gloss pass for MVP (quran.com glosses suffice; contextual AI glosses are
   post-MVP). Onboarding data (memorize + memorizing lists) and LingQ import are
   **post-MVP / optional**.

2. **Sprint 1 — Review reader (Study).** The faithful 15-line Madani page that
   **fills the height, no scroll**; lines auto-fit the frame; Study shows bare
   letters. Status via the **undermark ticks** (crisp ink word). Tap → **ribbon**
   reveal (below header) → **live demote** (Engine B, Study only). Finishing a
   page = the clean read → untapped words promote (Engine A). Session timer bar
   (right-to-left fill). This alone is a usable product for a week.

3. **Sprint 2 — Garden home.** Greeting (shifts with time of day, warm +
   repair tone). Living Tree (breathes, never dies). Session invitation
   (three steps, ratio 5:3:2). Returns-today dots. Settings route
   for session duration adjustments.

4. **Sprint 3 — Mushaf mode.** Full tashkīl page. Undermark shown **read-only**.
   **No status mutation at all** — Engine B off (tapping reveals but does not
   demote), Engine A dormant (clean reads do not promote). Mode is toggled in the
   reader (the S/M badge). Everything else from Sprint 1 applies.

5. **Sprint 4 — Metrics page (MVP).** Returns over time (open-ended, **no
   streak** — design-principles §3), percentage Known by surah, word count by
   status level (0–4) vs. total app words, total sessions count. Demotions
   shown as good news (the system working), not failure.

6. **Sprint 5 — Fast-follows.** Weak-word mode, adaptive hints, deeper
   analytics, historical breakdowns.

The biggest risk is **building replaces studying**. Ship Sprint 1, use it
for a real week, and let what's actually missed dictate Sprint 2. Resist
building all sprints before opening the app once.

---

## Open questions & decisions

**Decided:**
- No "I Knew It" button; status changes via reading behavior only.
- Status levels: 0–4. No level 5.
- **Status display = undermark ticks** (crisp ink word + 4 ticks; haze on Unknown).
- **Identity = per word-form** (normalized tashkīl-stripped key; status shared
  across all occurrences). No morphology/lemma.
- **Corpus source = quran.com API v4**, snapshotted offline (text + 15-line
  layout + per-word glosses). LingQ import optional / post-MVP.
- **Engine A = finishing a page** is the clean read; thresholds 1/3/6/12.
- **Engine B = Study mode only** (live demote on tap). **Mushaf mutates nothing.**
- **Reveal = the ribbon** below the header (overlays, no page shift).
- **Navigation = 5 tabs:** Home · Browse/Index · Reader (center) · Metrics ·
  Settings. The reader has a deliberate exit back to the nav.
- Session timer: 5-min default, user-adjustable in 5-min increments.
- One unified garden-like environment; shifts with time of day.

**Still to settle:**
1. **Clean-read thresholds:** values (1/3/6/12) fixed for MVP; tunable
   after real usage data.
2. **Tokenization / normalization:** exact normalize() rules (which
   alif/hamza/yāʾ/waṣla forms collapse) — pin down with real data in Sprint 0.
3. **Session length defaults:** 5/3/2 min suggested; confirm if different.
4. **Reader entry model:** page-based (`/reader/[page]`, via Browse) for MVP;
   the older surah "session invitation (5:3:2)" from the Garden may be revisited.
5. **Home + Metrics consistency pass:** restyle the metrics status spread and the
   home growth indicator to speak the undermark/tick + green-on-ink language the
   reader established (scope TBD).

---

## Page / route map

`app/` stays a thin routing layer — each route below
maps to a feature page component under `features/<feature>/`. The reveal
panel is **never** a route; it's an overlay state within the reader.

```
                  first run, no saved word-status data
   ┌──────────────┐ ─────────────────────────────────▶ ┌──────────────┐
   │ /onboarding  │                                     │      /       │
   │ (2 screens)  │ ◀──────────── skip / done ──────────│   Garden     │
   └──────────────┘                                     │   (home)     │
                                                         └──────┬───────┘
                                "session invitation"
                         (step 1, 2, or 3 surah)
                                                                │
                                                                ▼
                                                ┌────────────────────────────┐
                        [mode selection: Review or Mushaf]     │
                                                │               │
                                                ▼               ▼
                                        /read/[surahId]
                                        (Review or Mushaf)
                         [session timer · session flow · reveal overlay]
                                        │
                                   session end / back
                                        │
                                        ▼
                                    ┌──────────────┐
                                    │      /       │
                                    │   Garden     │
                                    └──────┬───────┘
                                           │
                                    [Settings icon]
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  /settings   │
                                    │ (Session durations)
                                    └──────────────┘
```

**Bottom nav (5 tabs):** Home · Browse/Index · **Reader** (center) · Metrics ·
Settings. The nav is present on the hub screens; the reader runs immersive but
offers a deliberate exit back to the nav.

| Route | Screen | Entry points | Notes |
|---|---|---|---|
| `/onboarding` | Onboarding (2 screens) | First app open when no local word-status data exists | "Skip for now" or "Done" both route to `/`. Post-MVP. |
| `/` | Garden (home) | App launch; Home tab; exit from reader/metrics | The hub: waiting-ayah hero, faint tree backdrop, growth vine, Study/Mushaf entry. |
| `/browse` | Browse / Index (fihris) | Browse tab; "open the mushaf" | Surah + juz list (and search) → opens the reader at the chosen page. How you navigate all 604 pages. |
| `/reader/[page]` | Reader (Study / Mushaf) | Browse selection; Reader (center) tab → current/last page | 15-line Madani page (no scroll, auto-fit). S/M badge toggles mode. Study = undermark + ribbon reveal + live demote; finishing the page = clean read (Engine A). Mushaf = read-only. Deliberate exit back to the nav. |
| `/metrics` | Metrics | Metrics tab | Returns over time (open-ended, **no streak**), % Known by surah, word count by status (0–4) vs. total, total sessions. Demotions framed as good news. Restyled to the undermark/tick language. MVP. |
| `/settings` | Settings | Settings tab | Session duration adjustments (5-min increments). |

**Rules:**

- The bottom nav is the spine; the reader is the only immersive surface and must
  provide a clear way back to it (no dead ends).
- `/reader/[page]` serves both Study and Mushaf; mode toggles in-reader (S/M badge).
- A "clean read" fires on **finishing a page**, not on leaving the reader.
- `/onboarding` is a one-time gate, not reachable after initial setup (post-MVP).
- Session has no time pressure — the user controls pace and when to end.
