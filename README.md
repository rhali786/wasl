# Wird

**A daily Qur'an review app.**

Reading is measurement. Wird tracks word familiarity from how a reader moves
through the Qur'an — clean reads silently promote, taps reveal a contextual
meaning and demote — with no XP, streaks, or scores. The only growth metaphor
is a tree that fills in as words become genuinely known.

See [`docs/design.md`](docs/design.md) for the full design reference: design
principles, the Garden/Study visual model, and the tap → reveal → status
logic that drives it.

---

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4

**v1 is local-first** — the Qur'an corpus, glosses, and word statuses live in
local JSON / browser storage. Postgres (Drizzle ORM) + Auth.js (NextAuth v5)
are scaffolded in this repo for a *future* cross-device sync feature only —
not required to build or run v1. See `docs/design.md` §4.

> Developer guide: conventions, TDD rules, and architecture notes live in
> [`CLAUDE.md`](./CLAUDE.md).

---

## Quick start

```bash
npm install
npm run dev                  # http://localhost:3000
```

```bash
npm test                     # Jest unit + integration
npm run build && npm run start
```

---

## Status

Boilerplate stage — no features implemented yet.
