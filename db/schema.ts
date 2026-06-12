import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Auth.js adapter tables ──────────────────────────────────────────────────

export const accounts = pgTable(
  'auth_accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
  ],
)

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.identifier, t.token] }),
  ],
)

// ─── App tables ──────────────────────────────────────────────────────────────
// Add Wird's domain tables here (e.g. word status per user) as the data
// model is designed.
//
// Sketch for the future sync feature (NOT activated — v1 is local-first,
// see features/review/lib/storage.ts and CLAUDE.md). When this work starts,
// the shape mirrors WordStatus (features/review/lib/types.ts) plus a user
// dimension and timestamp:
//
//   export const wordStatuses = pgTable(
//     'word_statuses',
//     {
//       userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//       wordId: text('word_id').notNull(), // normalized form id, see features/corpus/lib/normalize.ts
//       level: integer('level').notNull(),
//       cleanReads: integer('clean_reads').notNull(),
//       updatedAt: timestamp('updated_at').notNull().defaultNow(),
//     },
//     (t) => [primaryKey({ columns: [t.userId, t.wordId] })],
//   )
//
// Activating this only requires changing features/review/lib/storage.ts
// (the persistence boundary) — getStatus/getStatuses/demoteWord/finishPage
// in features/review/store.ts stay the same.
