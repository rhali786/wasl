---
name: ui-style-guide
description: Use before changing any user-facing UI in Wird. Defines the Two Rooms model (Garden/Study), canonical color tokens, typography, the status fog scale, motion rules (permitted/prohibited), layout constraints, and voice/copy tone. Do not invent a new visual pattern when an approved one exists — see docs/design.md for full detail.
---

# UI style guide

Approved visual and interaction patterns for Wird. Before changing any
UI, identify which rules below apply. Full rationale and the complete
design reference live in [`docs/design.md`](../../../docs/design.md) —
this skill is the condensed, enforceable subset for day-to-day UI work.

**The Qur'an is the hero.** Nothing competes with the Arabic text. When in
doubt, recede the UI and let the text advance.

---

## 1. The Two Rooms — Garden & Study

The app has exactly two visual environments. Every screen belongs to one
of them — do not blend their palettes or moods.

- **Garden (home)** — daytime, open, light/sage palette. Orientation,
  return, growth visibility. No dashboard, no tab bar of games, no level
  badges.
- **Study (reader)** — evening, focused, warm-dark palette. Review and
  honest measurement. Reads like a real mushaf.

The transition between rooms is the emotional arc of a session — Garden →
Study should feel like closing a door to concentrate; Study → Garden is
the reward. A single gold accent (`#C9A24B`) is the signature thread that
appears in both rooms.

---

## 2. Color tokens (canonical)

Use these tokens — defined via Tailwind v4 `@theme` in `app/globals.css`,
not a `tailwind.config.js`. Do not introduce new colors outside this set
without updating `docs/design.md` §6 first.

```
/* Garden */
--garden-bg:          #DCE8D2
--garden-surface:     #C7DAC5
--garden-border:      #B6CCB4
--garden-text:        #1E3A2C
--garden-text-soft:   #5A7055
--garden-text-dim:    #96AE90
--garden-green:       #4E8C5F
--garden-green-deep:  #3F7A52
--garden-green-light: #A7CE86
--garden-gold:        #C9A24B

/* Study */
--study-bg:           #14110B
--study-surface:      #1C1710
--study-text:         #F1E8D6
--study-text-soft:    #B6A88C
--study-text-dim:     #7C6F57
--study-gold:         #C9A24B
--study-gold-bright:  #E7C878
--study-border:       rgba(241,232,214,0.09)
--study-tint:         #C98C37   /* amber fog base */
```

**No green/red status colors anywhere.** The Qur'an does not grade the
user — status is communicated only via the fog scale (§4), never via
traffic-light colors.

---

## 3. Typography

| Role | Face | Usage |
|---|---|---|
| Qur'anic text | **Amiri Quran** | All Arabic Qur'anic text. Nothing else uses this face. Never bold it. |
| English display | **Cormorant Garamond** (Italic, 500–600) | Word meanings in the reveal panel; calm pull-quote lines. |
| UI / system | **Hanken Grotesk** (400, 500, 600) | All chrome: labels, numbers, buttons, navigation. |

Type scale (Study/Reader):

| Token | Size | Weight | Use |
|---|---|---|---|
| `--t-quran-anchor` | 2.05rem | 400 | Active/anchor ayah Arabic |
| `--t-quran-context` | 1.55rem | 400 | Non-anchor ayat |
| `--t-quran-basmala` | 1.35rem | 400 | Basmala — slightly muted |
| `--t-reveal-mean` | 1.55rem | 500 italic | Meaning in reveal panel |
| `--t-label` | 10–11px | 500–600 | Uppercase labels, letter-spacing .24em |
| `--t-body` | 14–15px | 400 | Prose, notes |

Rules: Arabic is always `direction: rtl`, `text-align: center` in the
reader. English labels are sentence case except ALL-CAPS micro-labels.
Numbers in analytics use `font-variant-numeric: tabular-nums`.

---

## 4. The fog scale (word status 0–5)

Status is shown **only** as an amber fog tint (`--study-tint`) over Study
text — never as a badge, color-coded label, or number.

| Status | Level | Fog opacity | Dotted border |
|---|---|---|---|
| Unknown | 0 | 19% | Yes |
| Seen | 1 | 13% | No |
| Familiar | 2 | 8% | No |
| Recognized | 3 | 4% | No |
| Known | 4 | none — clear | No |
| Solid | 5 | none — subtle warm glow (`--study-gold-bright` text-shadow, ~5s pulse) | No |

"Knowing is the absence of color." Fog clears like fog lifting — never an
abrupt color swap.

---

## 5. The reveal panel

The reveal panel (tap → reveal) is a single approved pattern — do not
build alternate modals/sheets for word meanings.

**Shows:** the contextual meaning for this occurrence; one optional
button, **"I knew it."**

**Never shows:** root, lemma, grammar label, status number, promote/demote
controls, dictionary source selector, share/bookmark, "click for more."

**Layout:** thin bar pinned to the bottom of the screen (thumb zone).
Does not cover the ayah being read. The tapped word is lightly highlighted
above. Dismiss by tapping the ayah text or swiping the bar down. Slide up,
320ms cubic-bezier(0.22,1,0.28,1), zero network latency.

---

## 6. Motion

| Element | Animation | Duration |
|---|---|---|
| Tree growth | Smooth interpolation on Known count change | 800ms ease |
| Tree ambient breath/sway | Subtle scale/rotate oscillation, infinite | ~6s ease-in-out |
| Reveal panel | Slide up from bottom | 320ms cubic-bezier(0.22,1,0.28,1) |
| Fog clearing (status change) | Opacity/background transition | 400–450ms ease |
| Anchor ayah focus | Font-size + opacity | 500ms ease |
| Room transition (Garden → Study) | Cross-fade | 280ms ease |
| Solid glow | Subtle text-shadow pulse | ~5s ease-in-out |
| "I knew it" word clear | Fog lifts, subtle glow pulse once | 600ms ease |

**Prohibited:** bounce animations on tap targets; confetti, sparkle burst,
or celebration particles; looping/pulsing progress-bar fills; any
animation drawing attention to a streak or score. All motion respects
`prefers-reduced-motion: reduce` — the tree simply stops breathing, it
never disappears.

---

## 7. Layout

- Max width 440px, centered on wider screens. Phone-first.
- All primary tap targets: minimum 44×44px.
- Thumb zone (bottom 40% of screen): primary actions only.
- Respect `env(safe-area-inset-bottom)`.
- Shared radii: `--radius-card: 16px`, `--radius-pill: 30px`,
  `--radius-sm: 8px`.
- Spacing scale: 4 / 8 / 14 / 20 / 28 / 40px (micro → major section gap).

Garden home is a single column: greeting → living tree → one invitation
card → category pills → returns-today dots. Never add a dashboard grid,
tab bar of games, or level badge to the Garden.

---

## 8. Iconography

- Line icons only, stroke weight 1.5px, rounded terminals.
- No filled icons except the single active-state indicator.
- One icon set only (Phosphor or Lucide) — never mix.
- No illustrations except the Living Tree (SVG, the app's only
  illustration). No mascots, emoji-as-UI, or stock art.

---

## 9. Voice & copy tone

The app speaks like a patient teacher or companion — never a coach, never
a judge.

- **Direct:** "Review Al-Ghāshiyah now," not "Why not try reviewing
  Al-Ghāshiyah?"
- **Calm:** no urgency language, no exclamation marks in system messages.
- **Honest:** demotions shown without apology — "3 words demoted" is good
  news, the system is working.
- **Personal, not intimate:** use the user's name sparingly.

**Prohibited copy patterns:** "🔥 Keep your streak alive!", "You're so
close to your goal!", "Don't break the chain.", "Level up!", or any
message implying the user failed by not returning. Never replace the
fog/status system with XP, levels, badges, or progress bars racing to
100%.

---

## 10. UI audit

Before modifying UI, confirm: which room (Garden/Study) the screen
belongs to and that its palette matches §2; status is shown only via the
fog scale (§4), not color/badges; the reveal panel (§5) is reused rather
than rebuilt; motion stays within §6's permitted list; copy avoids the
prohibited patterns in §9. For anything not covered here, consult
`docs/design.md` before inventing a new pattern.
