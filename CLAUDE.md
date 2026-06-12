# Wird — development guide

Qur'an review app (Next.js App Router, React, TypeScript, Tailwind). See
[`docs/design.md`](docs/design.md) for the full design reference: design
principles, the "Garden / Study" palette and interaction model, and the
tap → reveal → status word-tracking logic. Business logic and UI should live
under `features/`; `app/` stays a thin routing layer.

**v1 is local-first.** The Qur'an corpus, glosses, and word statuses live in
local JSON / browser storage — no database required to build or run the core
review loop. **Postgres + Drizzle + Auth.js (`db/schema.ts`,
`drizzle.config.ts`) is scaffolded for a future sync feature only** — treat it
as dormant until that work begins. See `docs/design.md` §4 (Architecture).

> **Next.js 16 note:** this project was scaffolded on Next.js 16 / React 19,
> which has breaking changes vs. older training data. See
> [`AGENTS.md`](AGENTS.md) and `node_modules/next/dist/docs/` before relying
> on patterns from memory.

---

## Obligatory

**Do these before anything else. They are not optional and do not appear again below.**

- **`npm install`** — required before dev, build, or test.
- **No `.env.local` setup needed for v1 work.** The reader/garden loop is
  local-first — don't import `db/` or `next-auth` from feature code unless
  you're explicitly building the future sync feature. If/when that work
  starts, copy `.env.example` to `.env.local` and set `AUTH_SECRET` and
  `DATABASE_URL` first (see `docs/design.md` §4).
- **Test-driven development (TDD):** Write a failing test first, implement
  until it passes, then refactor. Unit tests for components and local-data
  utilities; mock browser storage (localStorage/IndexedDB) at the boundary.
- **`npm run build` and `npm test` must pass before merging.**
- **Never commit secrets.** `.env.local`, deploy hook URLs, API keys. Rotate
  immediately if any were ever exposed.
- **Env files:** Next.js loads `.env` then `.env.local` (later overrides).
  Keep real secrets out of git — `.env.local` and `.env` are gitignored;
  `.env.example` stays committed as the template.

---

## Planning requirements (obligatory for every feature plan)

Before writing any code, every plan must cover:

1. **Integration test plan** — for each new component: which contexts does it
   consume, what interactions does it expose, what states does it render
   (loading/empty/error/populated)? Each must have a named test.
2. **Data flow trace** — where are IDs generated, do they match at every layer
   boundary (store → API → UI), is the new page reachable from navigation,
   does the UI appear without extra clicks on first load?
3. **Honesty model invariants** — any change touching word status must
   preserve the rules in `docs/design-interaction.md`. There is **no "I knew
   it" button** — status moves only from reading behavior. **Status is keyed
   per normalized word-form** (tashkīl stripped), so a change to one occurrence
   applies to every occurrence of that form. **Engine A (promotion)**: a clean
   read = *finishing a page*; words on that page you did not tap earn a
   clean-read credit and promote at the thresholds, ceiling = Known. **Engine B
   (demotion)**: tapping to reveal demotes one level — **in Study mode only**.
   **Mushaf mode never mutates status** (no demote, no promote); its undermark
   is read-only.

If any layer boundary is unverified, do not proceed to implementation.

---

## Pre-implementation audit (obligatory before writing any code)

1. **Read the actual type files** — open every type you plan to use and read
   the exact field names. Do not rely on session memory or grep snippets.
2. **Check import paths** — grep for how existing code imports the module you
   plan to use. Use the same path.
3. **Trace the data path** — identify the existing service function that
   returns each piece of data you need. Do not reach into another feature's
   store from a route handler.
4. **Read every file before editing it** — state what you found and exactly
   what you will change and why.

---

## Commands

| Command | Purpose |
|--------|---------|
| `npm install` | Dependencies |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build (must pass before merge) |
| `npm run start` | Production server after build |
| `npm test` | Jest unit + integration tests (`jsdom` for UI) |
| `npm run test:watch` | Jest in watch mode |

The `db:*` scripts (`generate`/`migrate`/`studio`) operate on the dormant
Postgres/Drizzle boilerplate for the future sync feature — not needed for
v1 local-first work.

---

## Repository layout

```
app/                      # thin routing layer — route declarations + metadata only
  layout.tsx              # generic: html/body/providers only — never grows
  page.tsx                # → Garden (home)
features/                 # business logic + UI per domain
  lib/                    # shared types, logger, local-storage utilities
db/                        # dormant — Drizzle schema for the future sync feature only
  schema.ts               # Drizzle table definitions
  migrations/             # generated by db:generate
docs/
  design.md               # design reference (start here)
  archive/                # superseded design docs (kept for reference)
instrumentation.ts         # Next.js server startup hook — registers pino file logging
```

New features should follow the sheath-academy convention: each domain owns
its API router, server service, repository, context provider, and tests
under `features/<feature>/`.

---

## Logging

**Stack: `consola` (interface) + `pino` (server file transport)**

- **One import everywhere:** `import { logger } from '@/features/lib/logger'`
- `features/lib/logger.ts` — exports the shared `consola` instance. Safe to
  import in server code, client components, and shared utilities. Do not
  create logger instances inline in individual files.
- `instrumentation.ts` (project root) — Next.js server startup hook.
  Registers the pino file reporter once. All logging behavior (level, output
  file, format) is controlled here, not at call sites.
- **Server:** logs to both console and `logs/app.log` (JSON via pino). File
  is gitignored.
- **Browser:** consola default pretty reporter (no file output).
- **Tests:** mock `@/features/lib/logger` at the module level — do not let
  tests write to disk.
- Use structured args: `logger.info({ userId, wordId }, 'word promoted')` not
  string interpolation.
- Log levels: `logger.error` for caught exceptions, `logger.warn` for
  recoverable issues, `logger.info` for significant events, `logger.debug`
  for dev-only detail.

---

## Conventions

**TypeScript**

- `'use client'` where hooks or browser-only APIs are used.
- Avoid unused imports (build/lint).
- Cast after fallback: `(x || fallback) as T`, not `(x as T) || fallback`.
- Do not shadow TS utilities (e.g. use a domain-specific name, not `Record`).

**API responses**

```ts
{ status: 'success' | 'error', data: T, message: string, timestamp: string }
```

**Tailwind**

- Tailwind v4 — config lives in `app/globals.css` via `@theme`, not a
  `tailwind.config.js`. Add design tokens (colors, fonts, radii from
  `docs/design.md` §6–9) there.
- Shared `@layer` / `@apply` live in `app/globals.css`. Feature-only CSS:
  modules or plain CSS without duplicating Tailwind directives.

**Shell, git, and `gh` ergonomics (Windows / PowerShell — primary dev env)**

The default shell here is **PowerShell**, not bash. Apply these:

- **No heredocs / `$(cat <<EOF …)`** — PowerShell does not support them. For
  multi-line `gh` PR/issue bodies, write a temp file and use `--body-file`:
  ```
  Set-Content -Path .pr-body.txt -Value $body
  gh pr create --base main --head <branch> --title "<title>" --body-file .pr-body.txt
  Remove-Item .pr-body.txt
  ```
- **Idempotent PR creation** — `gh pr create` errors if a PR already exists
  for the branch. Check first: `gh pr list --head <branch> --json number`; if
  non-empty, `gh pr edit <number> --body-file …` instead.
- **Merges must not open an editor or create surprise merge commits** — use
  `git merge --ff-only origin/main` (stop and report on failure) or
  `--no-edit` when a merge commit is intended.
- **Branches:** create with `git checkout -b <branch>` on first creation only.
  On resume/re-run use plain `git checkout <branch>` — **never**
  `git checkout -B`, which resets the branch to its base and destroys
  in-progress work.
- **Never `--no-verify`** on commits — if a hook fails, fix the issue.
- **Check exit codes explicitly** — PowerShell does not chain like bash; read
  `$LASTEXITCODE` after a subprocess rather than assuming success.

**Database side effects (migrations) — future sync feature only**

`db/` is dormant for v1. If/when the sync feature starts: `db:migrate` /
`db:generate` and any change touching `db/schema.ts` mutate whatever
**`DATABASE_URL`** points at — there is no local-only sandbox by default.
Confirm which database is targeted before running migrations.

---

## Testing

- Tests live under `features/<feature>/__tests__/` (`api/`, `integration/`, etc.).
- UI tests use `jsdom`.
- **`mockImplementation`** not `mockReturnValueOnce` for context hooks —
  components re-render multiple times in Strict Mode. Reset to defaults in
  `afterEach`.

---

## CI and deploy

- Run `npm ci` → `npm run build` → `npm test` before pushing.
- Do **not** commit deploy hook URLs or secrets.

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|--------|----------------|------------|
| `/_next/static/...` 404 in dev | Stale or mixed `.next` | Stop servers, delete `.next`, restart `npm run dev`, hard refresh |
| Type / import errors | Path aliases or wrong feature folder | Use `@/` consistently; check `tsconfig` `paths` |

**Future sync feature only** (`db/`, Auth.js — dormant for v1):

| Symptom | Likely cause | What to do |
|--------|----------------|------------|
| All routes redirect to `/login` | `AUTH_SECRET` not set | Add `AUTH_SECRET` to `.env.local` |
| `[auth][error] MissingSecret` | No Auth.js secret | Set `AUTH_SECRET` in `.env.local`, restart dev server |
| App throws `DATABASE_URL is not configured` | Missing env var | Add `DATABASE_URL` to `.env.local`, restart |
| Google sign-in → `redirect_uri_mismatch` | `AUTH_URL` set incorrectly | Set `AUTH_URL` to match the URL you're testing from |

---

## Known product gaps (not bugs)

This project is at the boilerplate stage. No features are implemented yet —
see `docs/design.md` for the design intent before building the first
feature.
