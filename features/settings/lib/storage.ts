// Persistence boundary for user settings (v1 = localStorage). Same guarded
// pattern as features/review/lib/storage.ts. Reads merge over defaults so a
// partial or legacy blob never produces an undefined field.

import { logger } from "@/features/lib/logger";
import { DEFAULT_SETTINGS, type Settings } from "./types";

const STORAGE_KEY = "wird:settings";

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    logger.warn({ err }, "failed to parse stored settings; using defaults");
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    logger.error({ err }, "failed to persist settings");
  }
}
