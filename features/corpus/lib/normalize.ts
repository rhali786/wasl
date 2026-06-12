/**
 * normalize() — derives the per-word-form id used as the key for word
 * status (see docs/design-interaction.md). Every occurrence of a form
 * across the muṣḥaf shares one status, so this function must collapse
 * cosmetic/orthographic variants of the "same" word to the same string
 * while keeping genuinely different words distinct.
 *
 * Rules applied (in order):
 *  1. Strip tashkīl/harakāt and Qur'anic annotation marks (waqf signs,
 *     rubʿ-el-ḥizb, sajdah, dagger alif, small Qur'anic marks, tatweel).
 *  2. Unify alif-with-hamza/madda/waṣla (أ إ آ ٱ) to plain alif (ا).
 *  3. Unify alef maksūrah (ى) with yāʾ (ي).
 *  4. Strip all whitespace (waqf marks are often written as a trailing
 *     " ۚ" etc., and a rubʿ-el-ḥizb mark as a leading "۞ ").
 */

// Tashkīl + Qur'anic annotation marks + dagger alif + tatweel:
//  U+0610-U+061A  Qur'anic honorific/annotation signs
//  U+064B-U+065F  tashkīl (fatḥa, ḍamma, kasra, shadda, sukūn, etc.)
//  U+0670         dagger alif (superscript alef)
//  U+0640         tatweel
//  U+06D6-U+06ED  Qur'anic annotation signs (waqf marks, rubʿ-el-ḥizb,
//                 sajdah, end-of-ayah, small high marks)
//  U+08D4-U+08FF  extended Arabic diacritics
export const DIACRITICS =
  /[ؐ-ًؚ-ٰٟـۖ-ۭࣔ-ࣿ]/g;

// Alif-with-hamza-above (U+0623), alif-with-hamza-below (U+0625),
// alif madda (U+0622), alif waṣla (U+0671) -> plain alif (U+0627).
const ALIF_VARIANTS = /[أإآٱ]/g;

// Alef maksūrah (U+0649) -> yāʾ (U+064A).
const ALEF_MAKSURA = /ى/g;

export function normalize(text: string): string {
  return text
    .replace(DIACRITICS, "")
    .replace(ALIF_VARIANTS, "ا")
    .replace(ALEF_MAKSURA, "ي")
    .replace(/\s+/g, "");
}
