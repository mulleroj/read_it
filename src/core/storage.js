/** @typedef {import('../lessons/lesson-config.js').LessonConfig} LessonConfig */

export const CUSTOM_LESSONS_STORAGE_KEY = 'readit-lessons-custom';

/**
 * @returns {LessonConfig[]}
 */
export function listSavedLessons() {
  try {
    const raw = localStorage.getItem(CUSTOM_LESSONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} id
 * @returns {LessonConfig | null}
 */
export function getSavedLesson(id) {
  return listSavedLessons().find((lesson) => lesson.id === id) ?? null;
}

/**
 * @param {LessonConfig} config
 */
export function saveLesson(config) {
  const lessons = listSavedLessons().filter((l) => l.id !== config.id);
  const payload = {
    ...config,
    kind: 'custom',
    updatedAt: new Date().toISOString(),
  };
  lessons.unshift(payload);
  localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(lessons));
  return payload;
}

/**
 * @param {string} id
 */
export function deleteSavedLesson(id) {
  const lessons = listSavedLessons().filter((l) => l.id !== id);
  localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(lessons));
}

/**
 * @param {LessonConfig} config
 */
export function exportLessonJson(config) {
  return JSON.stringify(config, null, 2);
}

/**
 * @param {string} json
 * @returns {unknown}
 */
export function importLessonJson(json) {
  return JSON.parse(json);
}
