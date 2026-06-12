// Study-mode display text. Strips tashkīl/Qur'anic annotation marks so the
// bare letters read more analytically; Mushaf mode shows w.t unchanged.
//
// Unlike normalize() (features/corpus/lib/normalize.ts), this does NOT unify
// alif variants or alef maksūrah — those collapse word-form *identity* for
// status, not what's shown on screen.

import { DIACRITICS } from "@/features/corpus/lib/normalize";

export function stripTashkil(text: string): string {
  return text.replace(DIACRITICS, "").trim();
}
