/** Maps category IDs to CSS modifier classes for colour coding. */

/** @type {Record<string, string>} */
export const CATEGORY_CLASS = {
  'cat-vowel-teams': 'cat-vowel-teams',
  'cat-r-controlled': 'cat-r-controlled',
  'cat-diphthongs': 'cat-diphthongs',
  'cat-soft-cg': 'cat-soft-cg',
  'cat-double-consonants': 'cat-double-consonants',
};

/**
 * @param {string|null|undefined} categoryId
 * @returns {string}
 */
export function getCategoryClass(categoryId) {
  return CATEGORY_CLASS[categoryId ?? ''] ?? '';
}
