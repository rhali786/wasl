# Wird — Interaction Model: Tap → Reveal → Status

Reading is measurement. Every gesture the user makes — or doesn't make —
tells the app something true about what they know. No grading required, no
buttons required. The user reads. The app listens.

The single key activity is **the tap**. With meanings hidden by default,
tapping a word is the user honestly admitting "I need to check." That
gesture is how the app learns what you know — every metric flows from it.

## Status levels (0–4)

| Level | Name       | Code | How reached |
|-------|------------|------|--------------------------------------|
| 0     | Unknown    | U    | Default on import |
| 1     | Seen       | S    | Passed over once without tapping |
| 2     | Familiar   | F    | Passed over multiple times |
| 3     | Recognized | R    | Passed over consistently |
| 4     | Known      | K    | Reached via sustained clean reads; the ceiling |

**Identity — status is per word-form.** Each word's status is keyed by its
**normalized form** (tashkīl stripped; alif/hamza/yāʾ unified). So every
occurrence of the same form shares one status: learn `قل` once and it is
Recognized in Ikhlāṣ, Falaq, and Kāfirūn alike. (No morphology/lemma — out of
scope per design-principles §3.)

**Status is visual via the undermark.** The word itself always stays crisp ink
— the Qurʾan is never fogged or faded. Status 0–4 is shown by **four short ticks
beneath the word** that fill as it is learned (countable), with a faint grey
haze only on a truly Unknown word. (This supersedes the old "green shade + fog
on the word" treatment.)

## Engine A — Silent Promotion (the clean read = finishing a page)

**A clean read is finishing a page.** When the page is completed, every word on
it that was **not tapped** during the session earns one clean-read credit and
promotes at the thresholds below. (Earlier this was counted per session window;
the unit is now the page-finish.)

| Clean reads | Status movement |
|-------------|----------------------------------|
| 1 | Unknown → Seen (0 → 1) |
| 3 | Seen → Familiar (1 → 2) |
| 6 | Familiar → Recognized (2 → 3) |
| 12 | Recognized → Known (3 → 4) |

A form tapped anywhere on the page is not clean for that page-finish, even if
another instance of it went untapped.

## Engine B — Tap Demotion (the honest check) — **Study mode only**

In **Study mode**, tapping a word to reveal its meaning = "I needed to check,"
and the word steps down one level immediately (live; the undermark updates).
No override button.

| Current status | After tap (Study) |
|----------------|-------------------------|
| Unknown (0)    | Stays Unknown |
| Seen (1)       | Back to Unknown (0) |
| Familiar (2)   | Back to Seen (1) |
| Recognized (3) | Back to Familiar (2) |
| Known (4)      | Back to Recognized (3) |

## Mushaf mode — reverent, never mutates status

Mushaf mode (exact Madani page layout, full tashkīl) is the reverent reading
mode. In Mushaf mode:
- Words can be tapped to reveal meanings — but **tapping does not demote**
  (Engine B is off) and the undermark does **not** change during reading.
- Clean reads do **not** promote (Engine A is dormant).
- Net: **Mushaf reading changes no word status at all.** Reveal freely; the
  undermark is read-only, reflecting whatever Study has earned. Only **Study**
  drives the honesty loop.

## The reveal panel

**Shows:**
- The contextual meaning for this specific occurrence (AI-generated,
  stored locally).

**Never shows:** "I knew it" button, root, lemma, grammar label, status
number, promote/demote controls, dictionary source selector, share/
bookmark, "click for more."

**Layout — a floating meaning card.** A meaning card appears directly
**above or below the tapped word** (whichever keeps it on-screen — words in
the page's lower half open the card above, others below), holding just the
word's meaning in Cormorant italic. It **overlays** the page — the 15 lines
beneath never shift or resize. The tapped word is outlined. Tap anywhere on
the page to dismiss. (This supersedes the earlier below-header ribbon; placing
the card at the point of attention follows the eye down the page and reads as
less obtrusive than a fixed strip.)

**Contrast — the card inverts against the time-of-day mood.** Because the page
background shifts across the day (light at dawn/midday/evening, dark at night),
the card must not borrow the page's own surface tone or it camouflages. So it
flips to the *opposite* tone of the mood: a deep forest surface with cream text
on the light daytime moods, and a warm sand surface with ink text at night
(`.dark`). A faint gold hairline ring carries the signature thread. The meaning
sits at `text-base` (not a whisper) — legibility wins over recession here,
since the card only appears on a deliberate tap.

## Full flow (review mode)

```
User reads a page (Study mode)
        │
        │   tap a word →  meaning card shows nearby · Engine B demotes it one level (live)
        │   (untapped words just stay as they are during the read)
        ▼
   User finishes the page  ── the clean read ──────────────────┐
        │                                                       │
        ▼                                                       │
   Every word NOT tapped this page → +1 clean-read credit       │
   Engine A promotes any that crossed a threshold (ceiling K)   │
   └─────────────────────────────────────────────────────────────┘
```

In **Mushaf mode**: tapping reveals the meaning but **nothing changes** —
Engine B is off and Engine A is dormant. No status moves.

## What this means for analytics

- **Known Words** = word-forms read clean (untapped) across enough page-finishes
  to cross all four thresholds. Earned by reading behavior, not self-reported.
- **Promotions** = real threshold crossings, not tap-happy sessions.
- **Demotions** = honest re-encounters with forgotten words — shown to the
  user without apology ("3 words demoted" is good news: the system is
  working).
- **Anomaly signal:** if a user "promotes" 30 words in 60 seconds, that's
  impossible under this model. Integrity is structural, not policed.

## Session window

A session = time spent in the reader, and begins only on a deliberate "Enter
as Study" — from Home's Study card, or the bottom-nav Reader tab. Mushaf and
Browse→open are free reads — Engines A/B still apply (status tracking is keyed
on Study mode, not on a session), but there is no timer, plan, or nudges. A
session ends when the user
navigates away from the reader (back to a hub) — **tab/focus loss does not end
it**, so the timer keeps running in the background. A brief, self-dismissing
message bookends the session: one on start, one (mirrored) on end.
