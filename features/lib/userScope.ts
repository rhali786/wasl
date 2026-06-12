// Per-account localStorage namespacing. Multiple local "accounts" (passwordless
// email identities, see features/settings/store.ts) can share one device —
// review/history data must not bleed between them. Keys are namespaced as
// `wird:<scope>:<baseKey>`, where scope is the signed-in email or "guest" for
// a signed-out/never-signed-up user.

import { logger } from "@/features/lib/logger";
import { readSettings } from "@/features/settings/lib/storage";

const GUEST_SCOPE = "guest";

/** The current account's storage scope: its email, or "guest" if none. */
export function getUserScope(): string {
  return readSettings().email ?? GUEST_SCOPE;
}

/** Namespaces a base key (e.g. "wordStatuses") under the current account's scope. */
export function scopedKey(baseKey: string): string {
  return `wird:${getUserScope()}:${baseKey}`;
}

/**
 * One-time migration of a pre-scoping unscoped key (e.g. "wird:wordStatuses")
 * into the current scope's namespaced key. No-op if the legacy key is absent
 * or the scoped key already has data.
 */
export function migrateLegacyKey(legacyKey: string, baseKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const target = scopedKey(baseKey);
    if (window.localStorage.getItem(target) !== null) return;
    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy === null) return;
    window.localStorage.setItem(target, legacy);
    window.localStorage.removeItem(legacyKey);
  } catch (err) {
    logger.error({ err }, "failed to migrate legacy storage key");
  }
}
