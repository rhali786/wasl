# Style Guide — Qur'an Review App
### Working name: *Wird* (a daily devotional return)

---

## 1. Design Principles

### 1.1 The Three Laws
These override every other decision.

1. **The Qur'an is the hero.** Nothing competes with the Arabic text. UI recedes. The text advances.
2. **Returning is an exhale.** Every re-open should feel like sakinah, not a performance review. No guilt, no debt, no streak alarm.
3. **Truth over comfort.** The plant grows only when words are genuinely known. Beauty serves honesty.

### 1.2 What This App Is Not
These are not taste preferences — they are identity boundaries.

| Not this | Because |
|---|---|
| XP, levels, laurel wreaths | Vanity. Disconnected from actual comprehension. |
| Guilt-streak flames | Creates return-as-debt. Opposite of sakinah. |
| Cartoon mascots | Childish register. Wrong for Qur'an. |
| Progress bars racing to 100% | Suggests completion. Qur'an review has no ceiling. |
| Dense home screen with many doors | Forces decisions. "Don't make the user think." |
| Loud animations | Breaks the quiet. |

### 1.3 The Living Tree
The app's signature metaphor, grounded in the Qur'an:

> *"A good word is like a good tree — its roots firm, its branches in the sky."*
> — Surah Ibrahim 14:24

The tree grows as words become Known. It does not wilt from missed days.
Returning is always met with calm and a tree exactly where you left it.
This is the **one** gamification element permitted — because it is honest and Qur'anic.

---

## 2. The Two Rooms

The app has two distinct visual environments. Transition between them is the emotional arc of each session.

### Room 1 — The Garden (Home)
**Feeling:** Daytime. Open. Welcome. Exhale.
**Function:** Orientation, return, growth visibility.
**Palette:** Soft sage green, warm white, living earth.

### Room 2 — The Study (Reader)
**Feeling:** Evening. Focused. Quiet. One lamp.
**Function:** Review, measurement, honest work.
**Palette:** Warm near-black, luminous Arabic text, amber tint as fog.

The contrast between rooms is intentional and load-bearing.
Stepping from the Garden into the Study should feel like closing a door to concentrate.
Stepping back is the reward.

---

## 3. Color Tokens

### Garden (Home Screen)
```
--garden-bg:          #F0F5EE   /* soft sage white — daytime open */
--garden-surface:     #E4EDE1   /* card surface — slightly deeper */
--garden-border:      #C8D9C3   /* dividers, hairlines */
--garden-text:        #1C2B1A   /* near-black with green undertone */
--garden-text-soft:   #5A7055   /* secondary labels */
--garden-text-dim:    #96AE90   /* tertiary, hints */
--garden-green:       #3D7A52   /* primary action, tree leaves */
--garden-green-light: #6BAF7E   /* hover, progress */
--garden-gold:        #B8922A   /* surah name, sacred accent — used sparingly */
```

### Study (Reader Screen)
```
--study-bg:           #15110B   /* warm near-black — ink undertone */
--study-surface:      #1E1810   /* reveal panel background */
--study-text:         #F1E8D6   /* known words — luminous, warm white */
--study-text-soft:    #D8C9AE   /* functional words, secondary */
--study-text-dim:     #6E6149   /* non-anchor ayat, context */
--study-gold:         #C9A24B   /* surah header, ayah markers, reveal accent */
--study-gold-soft:    #A98B45   /* basmala, secondary gold */
--study-border:       rgba(241,232,214,0.08)  /* hairlines */

/* Status fog — amber tint on unknown words */
--fog-4:  rgba(201,140,60, 0.17)  /* Unknown — visible tint + dotted underline */
--fog-3:  rgba(201,140,60, 0.12)  /* Seen */
--fog-2:  rgba(201,140,60, 0.075) /* Familiar */
--fog-1:  rgba(201,140,60, 0.035) /* Recognized */
--fog-0:  transparent             /* Known — clear, luminous */
```

### Shared
```
--radius-card:   16px
--radius-pill:   30px
--radius-sm:     8px
--transition-standard: 0.32s cubic-bezier(0.22, 1, 0.28, 1)
--transition-fog:      0.45s ease   /* fog clearing — should feel like lifting */
```

---

## 4. Typography

### Typeface Roles

| Role | Face | Usage |
|---|---|---|
| Qur'anic text | **Amiri Quran** | All Arabic Qur'anic text. Nothing else uses this face. |
| English display | **Cormorant Garamond** (Italic, 500–600) | Word meanings in reveal panel. Contextual gloss. |
| UI / system | **Hanken Grotesk** (400, 500, 600) | All chrome: labels, numbers, buttons, navigation. |

**Why these three:**
- Amiri Quran is open-source, designed for Qur'anic text, renders beautifully at all sizes.
- Cormorant in italic gives the meaning reveal a *translation* register — slightly literary, not clinical.
- Hanken Grotesk is neutral, clean, and legible at small sizes without being cold.

### Type Scale (Study / Reader)

| Token | Size | Weight | Use |
|---|---|---|---|
| `--t-quran-anchor` | 2.05rem | 400 | Active/anchor ayah Arabic |
| `--t-quran-context` | 1.55rem | 400 | Non-anchor ayat |
| `--t-quran-basmala` | 1.35rem | 400 | Basmala — slightly muted |
| `--t-reveal-mean` | 1.55rem | 500 italic | Meaning in reveal panel |
| `--t-label` | 10–11px | 500–600 | Uppercase labels, letter-spacing .24em |
| `--t-body` | 14–15px | 400 | Prose, notes |

### Type Rules
- Arabic text is **always right-to-left**, `direction: rtl`, `text-align: center` in reader.
- English labels are **sentence case** except for ALL-CAPS micro-labels (category eyebrows).
- Numbers in analytics use `font-variant-numeric: tabular-nums`.
- **Never bold the Arabic text.** Weight variation destroys Qur'anic letterform integrity.

---

## 5. Iconography & Imagery

### The Tree
- The app's only illustration.
- SVG, rendered live. Grows by interpolating between growth states based on Known word %.
- Breathes with a gentle ambient animation (slow scale oscillation, ~6s cycle).
- Grows in the Garden, visible in miniature as a session-end reward in the Study.
- No motion when `prefers-reduced-motion: reduce` is set.
- **Never use a dead or wilted state.** The tree pauses growth but never dies.

### Icons
- Line icons only. Stroke weight: 1.5px. Rounded terminals.
- No filled icons except the single active-state indicator.
- Icon set: Phosphor Icons or Lucide (consistent source — never mix).

### No illustrations except the tree.
No cartoon characters, no emoji-as-UI, no thematic stock art.

---

## 6. Motion Principles

### Permitted Animations
| Element | Animation | Duration |
|---|---|---|
| Tree growth | Smooth interpolation on Known count change | 800ms ease |
| Tree ambient breath | Scale 1.0 → 1.012 → 1.0, infinite | 6s ease-in-out |
| Reveal panel | Slide up from bottom | 320ms cubic-bezier(0.22,1,0.28,1) |
| Fog clearing (status change) | Opacity/background transition | 450ms ease |
| Anchor ayah focus | Font-size + opacity | 500ms ease |
| Room transition (Garden → Study) | Cross-fade | 280ms ease |
| "I knew it" word clear | Fog lifts, subtle glow pulse once | 600ms ease |

### Prohibited
- Bounce animations on any tap target.
- Confetti, sparkle burst, or celebration particle effects.
- Progress bar "filling" animations that loop or pulse.
- Any animation that draws attention to a streak or score.

---

## 7. Layout Principles

### Phone-First Constraints
- Maximum width: 440px (centered on wider screens).
- All primary tap targets: minimum 44×44px.
- Thumb zone (bottom 40% of screen): primary actions only.
- Safe area insets respected at bottom (`env(safe-area-inset-bottom)`).

### Garden Home Screen — Structure
```
┌─────────────────────────────────┐
│  greeting (name, time of day)   │  — soft, personal
│─────────────────────────────────│
│  LIVING TREE                    │  — center, breathing
│  [growth state, x% known]       │
│─────────────────────────────────│
│  TODAY'S RECOMMENDATION         │  — one card, one tap
│  "Review Al-Ghāshiyah"          │
│  18 weak words · 6 min est.     │
│─────────────────────────────────│
│  Memorized   Current   Long     │  — 3 category pills
│─────────────────────────────────│
│  Today: 4 sessions · 31 min     │  — quiet stats row
└─────────────────────────────────┘
```

### Study Reader Screen — Structure
```
┌─────────────────────────────────┐
│  ‹  Surah name · number  [mode] │  — minimal chrome
│  ── known progress bar ─────── │  — 2px hairline
│─────────────────────────────────│
│                                 │
│        بِسْمِ ٱللَّهِ ...       │  — basmala, dim
│                                 │
│   [context ayah, dim, 1.55rem]  │
│                                 │
│   [ANCHOR ayah, bright, 2.05]   │  — focused line
│                                 │
│   [context ayah, dim, 1.55rem]  │
│                                 │
│─────────────────────────────────│
│  [REVEAL PANEL — slides up]     │  — bottom, thumb zone
│  word · meaning · "I knew it"   │
└─────────────────────────────────┘
```

### Spacing Scale
```
4px  — micro (icon gap, inline)
8px  — tight (label to value)
14px — base (internal card padding)
20px — comfortable (screen margin)
28px — section gap
40px — major section gap
```

---

## 8. Voice & Copy Tone

The app speaks like a patient teacher or a good companion. Never a coach. Never a judge.

### Principles
- **Direct.** "Review Al-Ghāshiyah now." Not "Why not try reviewing Al-Ghāshiyah?"
- **Calm.** No urgency language. No exclamation marks in system messages.
- **Honest.** Demotions are shown without apology. "3 words demoted" is good news — the system is working.
- **Personal, not intimate.** Uses the user's name sparingly. Not every screen.

### Return Messages (shown on home open)
These replace streak-guilt. Rotate quietly based on time of day / session count.

```
After ṣalāh window (Fajr):     "Good morning. Al-Ghāshiyah is waiting."
After ṣalāh window (ʿAṣr):     "You have a few minutes. Az-Zalzalah, 7 words."
Multi-session day:              "4 sessions today. The tree grew."
After a gap:                    "Welcome back. Your tree is exactly where you left it."
First session of day:           "Where would you like to begin?"
```

### Prohibited Copy Patterns
- "🔥 Keep your streak alive!"
- "You're so close to your goal!"
- "Don't break the chain."
- "Level up!"
- Any message that implies the user has failed by not returning.

---

## 9. Onboarding — Screen Flow

Three questions only. No tutorial. No demo mode.

```
Screen 1: "Which surahs have you memorized?"
          Scrollable surah list. Multi-select. Pre-sorted short → long.
          [ Skip for now ]

Screen 2: "Which are you memorizing now?"
          Same list, already-memorized surahs greyed.
          [ Skip for now ]

Screen 3: "Your long-hike surahs."
          App shows the 10 longest surahs, pre-selected.
          "These are your breadth surahs — long reads for sustained exposure."
          User can deselect any.
          [ Done → Garden ]
```

On first Garden open, the tree is a seedling. Known words = 0.
The first tap in the reader is the first act of growth.

---

## 10. Status Color Reference (Quick)

| Status | Level | Fog | Dotted border |
|---|---|---|---|
| Unknown | 0 | 17% amber | Yes |
| Seen | 1 | 12% amber | No |
| Familiar | 2 | 7.5% amber | No |
| Recognized | 3 | 3.5% amber | No |
| Known | 4 | None — clear | No |
| Solid | 5 | None — subtle glow | No |

Fog is amber. Known is luminous. Solid is luminous + a whisper of warmth.
No green/red status colors. The Qur'an does not grade you.

---

## 11. What Kalam Got Right (Take)
- Warmth in the home — personal greeting, soft colors, rounded cards.
- A sense of a *finished* product — not a prototype.
- Arabic-letter texture used quietly as background pattern.
- Generosity of space — content breathes.

## 12. What Kalam Got Wrong (Leave)
- XP, levels, streaks, laurel crowns → vanity metrics.
- Guilt-flame streak counter → opposite of sakinah.
- Dense multi-door home screen → decision fatigue.
- Gamified 3D level badge → wrong register for sacred text.
- "Complete tasks to unlock rewards" → the Qur'an is not a task list.
