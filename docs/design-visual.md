# Wird — Visual Design & Environment

## One Unified Environment — The Garden

**Feeling:** Calm, welcoming, shifts with time of day.
**Function:** Navigation, return, review, measurement, growth visibility.

One unified garden-like visual environment for home and reading. The page
shifts with time of day: morning is sunrise (bright, golden); afternoon is
midday (full light); evening is sunset (warm, golden); night is dark with
soft twinkling accents. All status is shown through green shades and fog.

### The home screen (Garden)

- **Time-of-day visuals:** background and tree appearance shift to match the hour:
  - Morning (sunrise): golden light, bright open feeling.
  - Afternoon (midday): full daylight, clear visibility.
  - Evening (sunset): warm golden-orange light, quieter tone.
  - Night (dark): dark background with soft twinkling accents; tree has a
    gentle glow to remain visible.
- **The greeting** shifts with time of day and tone, inviting and warm with
  a sense of repair ("Good morning, Al-Ghāshiyah is waiting" / "Welcome
  back, the words are still here" / "After a long gap: You belong here").
- **Session model:** a session has three optional steps (no pressure to
  complete; the timer keeps running on tab/focus loss — only navigating away
  from the reader ends it, with a brief mirrored intro/summary message):
  1. Memorizing surahs (ratio: 5) — leads, since this is what's being worked on
  2. Memorized surahs (ratio: 3)
  3. Longer surahs for breadth (ratio: 2)
  - Average full session: ~10 minutes (user adjusts ratios in settings in
    5-min increments).
  - After completing a step, app nudges user to begin the next step. User
    can confirm (navigate to a surah from that category) or ignore (stay in
    current category or end session).
  - **Sessions are Study-only:** the steps/timer/nudges above begin only via
    a deliberate "Enter as Study" — from Home's Study card, or the bottom-nav
    Reader tab. Mushaf and Browse→open are free reads with no session chrome.
  - **Mode selection:** before entering a surah, user chooses **Study** or
    **Mushaf** mode (visual differentiator: Study shows an "S" badge,
    Mushaf shows an "M" badge). Both display the exact Madani mushaf-page
    layout; the difference is in status tracking:
    - Study mode: Engine A (clean reads promote) + Engine B (taps demote).
    - Mushaf mode: Engine B only (taps demote; clean reads are silent,
      no promotion).
  - Timer bar shown during review, fills right-to-left as session progresses,
    resets on new session.
- **The hero is the waiting ayah** (Mushaf-forward direction). The home opens
  on a single ayah in Amiri Quran with its meaning beneath — not a dashboard.
  Nothing competes with it.
- **The Living Tree** is a **faint, atmospheric backdrop** behind the ayah —
  identity and calm, not a live meter. It breathes (~6s, one breath) but does
  **not** encode Known-word % (growth moved to the vine, below). High-definition
  painterly illustration; a placeholder sprout stands in until the art lands.
  Never dies, never wilts.
- **Growth = a growing vine.** In the top status area, a small branch sprouts
  one leaf per return — open-ended, accumulating, **no "out of N"**, never a
  streak. (Replaces the old returns-dots.)

### The reader (Study & Mushaf modes)

- **Exact Madani mushaf-page layout:** all ayat display at uniform size and
  weight, matching traditional page memory.
- Tap any word to reveal its contextual meaning.
- Each word displays with a status-based green shade and fog intensity.
- **Study mode:** clean reads trigger silent Engine A promotion; taps trigger
  automatic Engine B demotion.
- **Mushaf mode:** taps trigger automatic Engine B demotion; clean reads are
  silent with no promotion (Engine A dormant).
- A session ends by navigating away from the reader (back to a hub); a brief
  mirrored message marks the start and end of a Study session.

### Status color scale (0–4)

Each status level has a distinct visual appearance on the page:

| Status | Level | Color + Fog | Visual effect |
|---|---|---|---|
| 0 | Unknown | Deep green + heavy fog | Word hard to read, warm green tint |
| 1 | Seen | Lighter green + mid fog | Moderate green tint, slightly readable |
| 2 | Familiar | Lighter green + light fog | Light green tint, mostly readable |
| 3 | Recognized | White text + cloudy fog | Nearly clear, soft green undertone |
| 4 | Known | No fog, clear luminous | Sharp, fully legible, no green tint |

**Fog clears as words are learned.** The page gradually clears from green to
luminous white as your known-words percentage increases.

Color palette (to be finalized):
```
--bg-light:           #DCE8D2    /* daytime background */
--bg-evening:         #D4DFD0    /* evening shift (warmer) */
--text-primary:       #1E3A2C    /* primary text */
--text-soft:          #5A7055    /* secondary labels */
--text-dim:           #96AE90    /* tertiary, hints */

/* Status colors (green shades + fog) — to be finalized */
--status-0-green:     #2D5F47    /* Unknown: deep green */
--status-1-green:     #5A8C6F    /* Seen: lighter green */
--status-2-green:     #7FA988    /* Familiar: lighter green */
--status-3-green:     #A8C8A0    /* Recognized: very light green */
--status-4-white:     #F1E8D6    /* Known: luminous off-white */

--accent-gold:        #C9A24B    /* tree accents, sacred markers */
```

### Session timer bar

A faint horizontal bar at the top of the reader, fills right-to-left as the
session progresses. Provides gentle time awareness without urgency. Resets
on new session. User adjusts session duration in 5-minute increments in
settings.

---

## Typography

| Role | Face | Usage |
|---|---|---|
| Qur'anic text | **Amiri Quran** | All Arabic Qur'anic text. Nothing else uses this face. |
| English display | **Cormorant Garamond** (Italic, 500–600) | Word meanings in the reveal panel; calm pull-quote lines. |
| UI / system | **Hanken Grotesk** (400, 500, 600) | All chrome: labels, numbers, buttons, navigation. |

**Why these three:** Amiri Quran is open-source, designed for Qur'anic
text, renders beautifully at all sizes. Cormorant in italic gives the
meaning reveal a *translation* register — slightly literary, not clinical.
Hanken Grotesk is neutral, clean, and legible at small sizes without being
cold.

### Type scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `--t-quran-anchor` | 2.05rem | 400 | Active/anchor ayah Arabic |
| `--t-quran-context` | 1.55rem | 400 | Non-anchor ayat |
| `--t-quran-basmala` | 1.35rem | 400 | Basmala — slightly muted |
| `--t-reveal-mean` | 1.55rem | 500 italic | Meaning in reveal panel |
| `--t-label` | 10–11px | 500–600 | Uppercase labels, letter-spacing .24em |
| `--t-body` | 14–15px | 400 | Prose, notes |

### Type rules

- Arabic text is **always right-to-left**, `direction: rtl`,
  `text-align: center` in the reader.
- English labels are sentence case except ALL-CAPS micro-labels (category
  eyebrows).
- Numbers in analytics use `font-variant-numeric: tabular-nums`.
- **Never bold the Arabic text.** Weight variation destroys Qur'anic
  letterform integrity.

---

## Iconography & motion

### The Tree

- The app's only illustration, used as a **faint atmospheric backdrop** on the
  home (behind the ayah). High-definition **painterly** asset; a placeholder
  sprout stands in until it lands.
- It **no longer encodes Known-word %** — growth is carried by the **vine**
  indicator below. The tree is identity and calm, not a meter.
- Breathes with a gentle ambient animation (~6s — "one breath").
- No motion when `prefers-reduced-motion: reduce`.
- **Never a dead or wilted state.** Never dies, never wilts.

### The growth vine

- A small branch in the home's top status area. Sprouts **one leaf per return**,
  accumulating. **Open-ended — no denominator, no ceiling, never a streak**
  (design-principles §3). Leaves ease in (~320ms) as they appear.
- This is the home's single growth signal. It counts *returns*, not days; a
  missed day removes nothing.

### Icons

- Line icons only. Stroke weight 1.5px, rounded terminals.
- No filled icons except the single active-state indicator.
- One icon set only (Phosphor or Lucide) — never mix.
- No illustrations except the tree. No cartoon characters, emoji-as-UI, or
  thematic stock art.

### Permitted animations

| Element | Animation | Duration |
|---|---|---|
| Tree growth | Smooth interpolation on Known-word % change | 800ms ease |
| Tree ambient breath/sway | Subtle scale/rotate oscillation, infinite | ~6s ease-in-out |
| Reveal panel | Slide up from bottom | 320ms cubic-bezier(0.22,1,0.28,1) |
| Fog clearing (status change) | Opacity/background transition | 400–450ms ease |
| Session timer bar | Smooth right-to-left fill | Linear (timed with session) |
| Anchor ayah focus | Font-size + opacity | 500ms ease |

### Prohibited

- Bounce animations on any tap target.
- Confetti, sparkle burst, or celebration particle effects.
- Progress bar "filling" animations that loop or pulse.
- Any animation that draws attention to a streak or score.

---

## Layout principles

### Phone-first constraints

- Maximum width: 440px (centered on wider screens).
- All primary tap targets: minimum 44×44px.
- Thumb zone (bottom 40% of screen): primary actions only.
- Safe area insets respected at bottom (`env(safe-area-inset-bottom)`).

### Garden home — structure (Mushaf-forward)

```
┌─────────────────────────────────┐
│ greeting · time of day   🌿➛🍃  │  — vine: one leaf per return
│─────────────────────────────────│
│        (faint tree backdrop)    │  — low-opacity, atmospheric
│     إِذَا زُلْزِلَتِ ٱلْأَرْضُ …      │  — THE HERO: waiting ayah
│     "When the earth is shaken"  │  — meaning, Cormorant italic
│        Az-Zalzalah · 99 · ~5m   │
│─────────────────────────────────│
│  [ Study (S) ]   [ Mushaf (M) ] │  — mode pick = the one choice
│─────────────────────────────────│
│         floating bud nav        │
└─────────────────────────────────┘
```

Background/environment shifts across four times of day (morning, midday,
evening, night); the tree backdrop stays mood-neutral. The single session
invitation and category steps move into the reader entry flow, keeping the
home reverent and uncluttered.

### Reader — structure

```
┌─────────────────────────────────┐
│  ‹  Surah name · number  [mode] │  — minimal chrome
│  ▬▬▬▬▬▬▬▬▬ session timer ─ │  — fills right-to-left
│─────────────────────────────────│
│                                 │
│        بِسْمِ ٱللَّهِ ...       │  — basmala
│                                 │
│   [context ayah, 1.55rem]       │
│                                 │
│   [ANCHOR ayah, bright, 2.05]   │  — focused line
│                                 │
│   [context ayah, 1.55rem]       │
│   (status-based green tint)      │
│                                 │
│─────────────────────────────────│
│  [REVEAL PANEL — slides up]     │  — bottom, thumb zone
│  word · meaning                 │
└─────────────────────────────────┘
```

In mushaf mode, the layout matches the exact Madani page. All ayat show
with status-based coloring; the anchor concept does not apply.

### Spacing scale

```
4px  — micro (icon gap, inline)
8px  — tight (label to value)
14px — base (internal card padding)
20px — comfortable (screen margin)
28px — section gap
40px — major section gap
```

### Shared tokens

```
--radius-card:   16px
--radius-pill:   30px
--radius-sm:     8px
--transition-standard: 0.32s cubic-bezier(0.22, 1, 0.28, 1)
--transition-fog:      0.45s ease   /* fog clearing — should feel like lifting */
```
