# Interaction Model: Tap → Reveal → Status

## Core Philosophy

Reading is measurement. Every gesture the user makes — or doesn't make — tells the app
something true about what they know. No grading required. No buttons required.
The user reads. The app listens.

---

## Status Levels

| Level | Name       | Code | How Reached                          |
|-------|------------|------|--------------------------------------|
| 0     | Unknown    | U    | Default on import                    |
| 1     | Seen       | S    | Passed over once without tapping     |
| 2     | Familiar   | F    | Passed over multiple times           |
| 3     | Recognized | R    | Passed over consistently             |
| 4     | Known      | K    | Meaning confirmed at least once AND  |
|       |            |      | consistently passed over             |
| 5     | Solid      | ✓    | Known + strong repeat confirmation   |

**The ceiling rule:**
Reading without tapping can only reach Recognized (3).
Known (4) and Solid (5) require at least one honest meaning-reveal with "I knew it."
This protects the 12-week headline metric from memorization fluency inflation.

---

## The Two Engines

### Engine A — Silent Promotion (the clean read)

The user reads an ayah without tapping a word.
That word is counted as a "clean read" for that session.

| Clean reads | Status movement                  |
|-------------|----------------------------------|
| 1           | Unknown → Seen (0 → 1)           |
| 3           | Seen → Familiar (1 → 2)          |
| 6           | Familiar → Recognized (2 → 3)    |
| —           | Recognized → Known: BLOCKED      |

Clean reads are counted per unique session window, not per ayah repeat
within the same session. Re-reading the same ayah 10 times in one sitting
counts as 1 clean read for that session.

---

### Engine B — Tap Demotion (the honest check)

The user taps a word. The meaning reveals. That tap is the signal.

| Current status | After tap (default)     |
|----------------|-------------------------|
| Unknown (0)    | Stays Unknown           |
| Seen (1)       | Back to Unknown (0)     |
| Familiar (2)   | Back to Seen (1)        |
| Recognized (3) | Back to Familiar (2)    |
| Known (4)      | Back to Recognized (3)  |
| Solid (5)      | Back to Known (4)       |

Demotion is automatic on tap dismiss. No button required.
The user just reads on. The engine handles it.

---

## The Override: "I Knew It"

For the curiosity tap — when the user knew a word but tapped anyway
(to hear audio, confirm, or out of habit).

- The reveal shows one optional button: **"I knew it"**
- Tapping it cancels the automatic demotion
- If the word was Recognized (3), "I knew it" also unlocks progress toward Known (4)
- The button is never required. Closing the reveal = default demotion applies.

This is the only manual user action in the entire status system.

---

## The Reveal Panel

### What it shows
- The contextual meaning for this specific occurrence (AI-generated, stored locally)
- One optional button: "I knew it"

### What it does NOT show
- Root
- Lemma
- Grammar label (Verb / Noun etc.)
- Status number
- Promote / demote controls
- Dictionary source selector
- Share / bookmark
- "Click for more"

### Layout
- Thin bar pinned to bottom of screen (thumb zone)
- Does NOT cover the ayah being read
- The tapped word is lightly highlighted in the text above
- Dismiss by tapping anywhere on the ayah text, or swiping the bar down
- Spring animation, zero network latency (all local data)

### Audio (post-MVP)
- Auto-plays the word pronunciation on reveal
- Ties recognition to recitation, serves memorization use case

---

## Full Tap → Reveal → Status Flow

```
User reads ayah
        │
        ▼
   Tap a word?
   ┌─────────────────────────────────────────────┐
   │ NO — clean read                              │
   │ Word gets +1 clean read credit               │
   │ Engine A silently promotes if threshold met  │
   │ (max ceiling: Recognized / level 3)          │
   └─────────────────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────────────────┐
   │ YES — tap                                    │
   │ Reveal panel appears at bottom               │
   │ Shows: contextual meaning                    │
   │ Shows: optional "I knew it" button           │
   └─────────────────────────────────────────────┘
        │
        ▼
   User presses "I knew it"?
   ┌─────────────────────────────────────────────┐
   │ YES                                          │
   │ Demotion cancelled                           │
   │ If status was Recognized (3):                │
   │   → Unlocks Known (4) pathway               │
   │ If status was Known (4)+:                    │
   │   → Contributes toward Solid (5)            │
   └─────────────────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────────────────┐
   │ NO — user dismisses or reads on              │
   │ Engine B applies automatic demotion          │
   │ Status drops one level                       │
   └─────────────────────────────────────────────┘
```

---

## Memorized Surah Edge Case

**Problem:** A user can recite Al-Ikhlas flawlessly but have zero
understanding of what يُولَد means. Without protection, clean reads
would silently inflate the Known count on memorized surahs — the
highest-value category in the whole app.

**Rule:** A word in a memorized surah follows identical status logic.
Recitation fluency earns Recognized (3) at most.
Known (4) is unlocked only after at least one "I knew it" confirmation.

This means a fully-memorized surah with zero comprehension work
correctly shows ~0% Known on first open. That's the honest baseline.
Progress from there is real.

---

## AI Usage in This Layer

**Build-time (offline, one-pass):**
Run an AI pass over all ~77,000 tokens in the Qur'an corpus to generate
a short contextual gloss per occurrence. Stored in local JSON.
Runtime is instant. Meaning is sharper than generic dictionary glosses.

Example:
- يُولَد in Al-Ikhlas 112:3 → "He is begotten" (passive, specific to this ayah)
- يَلِد in Al-Ikhlas 112:3 → "He begets" (active, contrasted in same ayah)

**Runtime (optional, post-MVP):**
Adaptive weak-word hints: faint dotted underline on words the model
predicts are weak for this user specifically, based on session history.
The user sees where to slow down without seeing the meaning.

---

## What This Means for Analytics

Because status is driven by reading behavior (not button presses), every
metric in the analytics dashboard is grounded in actual behavior:

- **Known Words** = words the user has encountered, recognized
  consistently, AND confirmed at least once. Not self-reported.
- **Promotions** = real threshold crossings, not tap-happy sessions.
- **Demotions** = honest re-encounters with forgotten words.
- **Anomaly signal** = if a user "promotes" 30 words in 60 seconds,
  that's impossible under this model. Integrity is structural.

---

## Open Questions for Implementation

1. What counts as "one session window" for clean read counting?
   Suggestion: any continuous foreground period. App goes to background → new
   session on return. Matches the "session = app in focus" decision.

2. Should the clean read threshold be configurable or fixed?
   Suggestion: fixed for MVP (values above), tunable after real usage data.

3. Should "I knew it" require a minimum display time before appearing?
   Suggestion: yes, ~800ms delay before button activates. Prevents
   accidental taps that corrupt the honesty model.

4. Should demotions be visible to the user in session summary?
   Suggestion: yes — "3 words demoted" is honest data, not discouraging.
   Shows the system is working.
