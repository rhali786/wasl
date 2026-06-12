# Wird — Architecture

**v1 is local-first. No backend, no auth, no API for the core review loop.**

- The Qur'an is a fixed corpus of ~77,400 words / 6,236 ayāt across **604
  Madani pages** — a few MB of JSON that never changes, for one user. It ships
  with the app (snapshotted at build time, never fetched at runtime).
- **Source of truth: the quran.com API v4** (decided 2026-06-11 over Tanzil and
  over LingQ). One endpoint gives everything the reader needs per page:
  `text_uthmani` (display), `line_number` (the exact 15-line Madani layout),
  `char_type_name` (word vs ayah-end), and a per-word **English gloss**
  (`word_translation_language=en`). `chapters` gives surah names. Free, open,
  Qur'an-specific, offline-snapshottable. The snapshot script is
  `app/prototypes/_data/fetch.mjs` (proven on pages 78–82; widen `PAGES` to
  1–604). See [[quran-data-source]].
- **Word identity — per word-form.** Store **both** forms: the diacritized
  Uthmani text for display, and a **normalized key** (tashkīl stripped;
  alif/hamza/yāʾ and alif-waṣla unified) used as the **wordId for status
  lookups**. Status is keyed by this normalized form, so every occurrence of
  `قل` shares one status. (No morphology/lemma — out of scope.)
- **Glosses (MVP): quran.com per-word English translations**, snapshotted with
  the text. A build-time AI pass for richer *contextual* (per-occurrence)
  glosses is a **post-MVP** enhancement, not required for v1.
- Word statuses and session history live in local storage / IndexedDB
  on-device, keyed by the normalized wordId.
- **LingQ import is optional and post-MVP** — *not* the data foundation. A
  one-time migration script (user `rhali786` only) could seed initial statuses
  from a LingQ vocabulary export (tashkīl-stripped forms + `extended_status` so
  "known" words aren't collapsed; verify LingQ API v2 vs v3). It does not affect
  the local-first reader/garden loop and is built only if/when wanted.

**Postgres + Drizzle + Auth.js is scaffolded in this repo (see
`db/schema.ts`, `drizzle.config.ts`) for a future state** — cross-device
sync, multi-device backup, account recovery. **It is not required to build
or run v1.** Don't block the local-first reader/garden loop on the
database; treat the DB boilerplate as dormant until sync work begins.
