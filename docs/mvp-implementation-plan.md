# Wird — MVP Implementation Plan & Task List

> Written 2026-06-11. This doc is **self-contained** so work can resume after a
> context clear. It turns the locked design (see `design.md`,
> `design-interaction.md`, `design-architecture.md`, `design-build-plan.md`)
> into a build order, with a checkbox task list at the end.

---

## 0. Locked decisions (the contract)

- **Identity = per word-form.** `wordId = normalize(uthmani)` — strip tashkīl,
  unify alif/hamza/yāʾ/waṣla. Every occurrence of a form shares ONE status.
- **Status display = undermark.** Word is always crisp ink; status 0–4 = four
  ticks beneath it; faint haze only on Unknown. No fog/tint on the word.
- **Reveal = ribbon** below the header; overlays, never shifts the page.
- **Engine A (promote) = finishing a page** is the clean read. Untapped words on
  a finished page earn +1 clean-read credit; thresholds **1/3/6/12** → levels
  1/2/3/4 (Known = ceiling).
- **Engine B (demote) = Study mode only.** Tap demotes one level live (undermark
  updates). **Mushaf mutates no status at all** (reveal free; undermark read-only).
- **No "I knew it"** anywhere. No streaks. Demotions framed as good news.
- **Corpus = quran.com API v4**, snapshotted offline for all 604 pages. LingQ
  import + AI contextual glosses = post-MVP.
- **Nav = 5 tabs:** Home · Browse/Index · Reader (center) · Metrics · Settings.
- **Stack rules:** local-first (localStorage/IndexedDB), TDD, business logic +
  UI under `features/<feature>/`, `app/` thin. Do NOT touch `db/`/Auth.js.

---

## 1. Build order (foundation first)

### Phase 0 — Data snapshot  (`features/corpus/` + `data/`)
**Goal:** real, offline corpus for all 604 pages, with normalized wordIds.
- Generalize `app/prototypes/_data/fetch.mjs` → snapshot pages 1–604 (batch,
  polite rate-limit, resumable). Output canonical JSON under the feature (not
  prototypes).
- Per word store: `t` (uthmani), `en` (gloss), `type` (word|end), `ayah`,
  `line`, and `id = normalize(t)`.
- Implement `normalize(form)` as a pure, tested function. Starting rules: strip
  the tashkīl ranges; `أإآٱ → ا`; `ى → ي`; collapse tatweel. Refine against real
  data. **This is the load-bearing function — test it hard** (Ikhlāṣ/Falaq/
  Kāfirūn `قل` must collapse to one id).
- **Tests:** `normalize` unit tests; snapshot integrity (every page has 15 lines,
  ids present, gloss present).

### Phase 1 — Status store + honesty engine  (`features/review/`)
**Goal:** the real data model. Pure functions + persisted store. No UI yet.
- **Types:** `WordStatus = { id: string; level: 0|1|2|3|4; cleanReads: number }`.
- **Pure engine (fully unit-tested first — TDD):**
  - `THRESHOLDS = [1,3,6,12]` (cleanReads needed to be at level 1/2/3/4).
  - `levelFor(cleanReads)` → step function over THRESHOLDS.
  - **Engine A** `applyCleanRead(status)` → `cleanReads+1`, recompute level.
  - **Engine B** `demote(status)` → `level = max(0, level-1)`; set `cleanReads`
    to the new level's threshold floor (so re-climb costs the right amount).
  - `resolvePageFinish(prev, pageWordIds, tappedIds)` → for each unique id on the
    page NOT in tappedIds, applyCleanRead. (Engine A entry point.)
- **Store (persisted):** `features/review/store.ts` over a mocked
  localStorage/IndexedDB boundary. `getStatus(id)`, `setStatus`, `bulk` reads.
  Default missing = `{level:0, cleanReads:0}`.
- **Honesty invariants as tests** (CLAUDE.md planning §3): Known is reachable
  only via 12 clean reads; demote only ever fires in Study; Mushaf path mutates
  nothing; per-form sharing (tapping one `قل` affects all).

### Phase 2 — Reader feature  (`features/reader/`)
**Goal:** lift the prototype reader into a real, persistent feature.
- Move `Reader` + `FitLine` + tick/haze/ribbon out of `app/prototypes/` into
  `features/reader/`. Page renders from the Phase-0 corpus; statuses come from the
  Phase-1 store (NOT the mock hash).
- Wire the loop: Study tap → ribbon + `demote` (persisted); track tapped ids for
  the session; on **finish page** → `resolvePageFinish` (persisted). Mushaf tap →
  reveal only.
- Undermark reflects stored level; updates live on Study demote and on page
  finish; never in Mushaf.
- **Integration tests:** consumes review store + corpus; renders states
  (loading/empty/populated); tap demotes in Study but not Mushaf; finishing a
  page promotes untapped; ribbon opens/closes without layout shift.

### Phase 3 — Navigation shell  (`features/nav/` + `app/` routes)
**Goal:** no dead ends; the 5-tab spine.
- 5-tab bottom nav (Home · Browse · Reader · Metrics · Settings); center = Reader.
- `/browse` fihris: surah + juz list → opens `/reader/[page]`. Search optional.
- Reader gets a deliberate exit affordance back to the nav.
- **Data-flow trace (CLAUDE.md §planning 2):** Browse selection → page id → reader
  route → corpus lookup; every screen reachable from the nav on first load.
- **Tests:** nav renders/active states; Browse → Reader routing; reader exit.

### Phase 4 — Metrics + Home consistency  (`features/metrics/`, `features/garden/`)
**Goal:** progress shown is TRUE, and speaks the reader's visual language.
- Lift the chosen **Surahs** metrics view into `features/metrics/`, fed by the
  real review store (status spread, % Known by surah, returns, demotions).
- Restyle status spread + home growth vine to the **undermark/tick + green-on-ink**
  language (the consistency pass the reader implies).
- **Tests:** metrics read real store; numbers reconcile with store contents.

### Phase 5 — Post-MVP (not now)
Onboarding (2 screens), LingQ one-time import (`rhali786`), AI contextual glosses,
Postgres/Auth sync (the dormant `db/`).

---

## 2. Task list

### Phase 0 — Data
- [x] Write & unit-test `normalize(form)` (the per-word-form key)
- [x] Generalize `fetch.mjs` to snapshot pages 1–604 (resumable, rate-limited)
- [x] Emit canonical corpus JSON with `id` per word, under `features/corpus/`
- [x] Snapshot integrity tests (15 lines/page, ids + glosses present)

### Phase 1 — Status store + engine
- [x] Types: `WordStatus`, level union, store interface
- [x] TDD `levelFor`, `applyCleanRead`, `demote`, `resolvePageFinish`
- [x] Persisted store over mocked localStorage/IndexedDB boundary
- [x] Honesty-invariant tests (Known needs 12; demote Study-only; Mushaf no-op;
      per-form sharing) — Study-only/Mushaf-no-op enforcement is a Phase 2
      (reader) integration concern; the engine itself is mode-agnostic.

### Phase 2 — Reader
- [x] Move Reader/FitLine/ticks/ribbon into `features/reader/`
- [x] Render page from corpus; read statuses from store (drop mock hash)
- [x] Study: tap → ribbon + persisted demote; track tapped ids
- [x] Page finish → `resolvePageFinish` persisted (Engine A) — only on
      "Next page" (forward); "Previous page" never finishes, in either mode
- [x] Mushaf: reveal only, zero mutation, read-only undermark
- [x] Reader integration tests (all states + both modes + no-shift ribbon) —
      `app/reader/page.tsx` is a temporary 3-page harness pending Phase 3's
      `/reader/[page]` routing

### Phase 3 — Navigation
- [x] 5-tab bottom nav component + active states
- [x] `/browse` fihris (surah + juz) → `/reader/[page]`
- [x] Reader deliberate exit back to nav
- [x] Routing + reachability tests

### Phase 4 — Metrics + Home
- [x] Lift Surahs metrics view into `features/metrics/`, fed by store
- [x] Restyle status spread + home growth to undermark/tick language
- [x] Metrics-read-real-store tests

### Cross-cutting (every phase)
- [x] `npm run build` + `npm test` green before merge
- [x] No imports from `db/` or `next-auth` in feature code
- [x] Pre-implementation audit per CLAUDE.md before each phase

---

## 3. Open knobs (safe to defer)
- Clean-read thresholds 1/3/6/12 — tune after real use.
- Exact `normalize()` collapse rules — pin against real data in Phase 0.
- Reader entry model: page-based for MVP; surah "session invitation (5:3:2)" may
  return later.
- Home/Metrics consistency depth — scope in Phase 4.
- **Phase 4 perf:** generate `features/corpus/data/index.json` (the ~14,697
  unique word-form ids corpus-wide, plus per-surah index lists into that
  array) when Phase 4 starts — avoids reading all 604 page files per metrics
  computation. Not built yet; derivable from the existing snapshot in minutes.
  **Done:** built as `features/corpus/data/wordIndex.json` via
  `features/corpus/scripts/build-word-index.ts` (`npm run corpus:word-index`)
  — 14,697 unique word-forms across 114 surahs.
- **Time-series metrics** (returns over time, sessions, demotion counts) need
  an append-only event log (`{type, id, ts}` on page-finish/demote) — not
  derivable from `WordStatus` alone (no history field). Design when Phase 4
  starts.
  **Done:** built as `features/history/` (date-keyed `{promotions, demotions}`
  log, `wird:history` in localStorage), wired into
  `features/review/store.ts`'s `demoteWord`/`finishPage`.
- Future per-user sync: `db/schema.ts` already has a documented (dormant,
  non-activated) `word_statuses(user_id, word_id, level, cleanReads,
  updatedAt)` sketch. Activating it only touches
  `features/review/lib/storage.ts`; `features/review/store.ts`'s API is
  already user-agnostic and won't need to change.
