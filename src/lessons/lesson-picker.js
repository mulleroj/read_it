export const RECOMMENDED_LESSON_ID = 'les-read-it-30-mixed';

/** @param {{ id: string }} a @param {{ id: string }} b */
export function comparePresetLessons(a, b) {
  if (a.id === RECOMMENDED_LESSON_ID) return -1;
  if (b.id === RECOMMENDED_LESSON_ID) return 1;
  return a.id.localeCompare(b.id);
}

/**
 * @param {string} lessonId
 * @returns {boolean}
 */
export function isRecommendedLesson(lessonId) {
  return lessonId === RECOMMENDED_LESSON_ID;
}
