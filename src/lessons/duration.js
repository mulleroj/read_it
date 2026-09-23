/** @typedef {import('./lesson-config.js').LessonConfig} LessonConfig */

export const PLANNED_MODULE_MINUTES = 30;
export const DEFAULT_INTRO_MINUTES = 3;
export const DEFAULT_CLOSING_MINUTES = 2;
export const DEFAULT_TRANSITION_MINUTES = 1;

/** @type {Record<string, number>} minutes per item */
const MINUTES_PER_ITEM = {
  'find-pattern': 1.5,
  'odd-one-out': 1.2,
  'sort-words': 3,
  'build-word': 2,
  'exit-ticket': 1,
};

/** @type {Record<string, number>} fallback when item count unknown */
const BASE_MINUTES = {
  'find-pattern': 4,
  'odd-one-out': 4,
  'sort-words': 5,
  'build-word': 4,
  'exit-ticket': 4,
};

/**
 * @param {object} exercise
 * @param {{ minutes?: number }} [slot]
 */
export function estimateExerciseMinutes(exercise, slot = {}) {
  if (slot.minutes && slot.minutes > 0) {
    return slot.minutes;
  }

  const itemCount = Array.isArray(exercise.items) ? exercise.items.length : 1;
  const perItem = MINUTES_PER_ITEM[exercise.type] ?? 1.5;
  const base = BASE_MINUTES[exercise.type] ?? 4;
  return Math.max(base, Math.round(itemCount * perItem * 10) / 10);
}

/**
 * @param {LessonConfig} config
 * @param {{ getExercise: (id: string) => object | null }} store
 */
export function estimateLessonDuration(config, store) {
  const activityMinutes = config.exercises.reduce((sum, slot) => {
    const exercise = store.getExercise(slot.exerciseId);
    if (!exercise) return sum;
    return sum + estimateExerciseMinutes(exercise, slot);
  }, 0);

  const transitionMinutes =
    config.exercises.length > 1 ? (config.exercises.length - 1) * DEFAULT_TRANSITION_MINUTES : 0;
  const introMinutes = DEFAULT_INTRO_MINUTES;
  const closingMinutes = DEFAULT_CLOSING_MINUTES;
  const totalEstimated = Math.round((activityMinutes + transitionMinutes + introMinutes + closingMinutes) * 10) / 10;
  const plannedMinutes = config.plannedMinutes ?? PLANNED_MODULE_MINUTES;
  const contentGap = Math.round((plannedMinutes - totalEstimated) * 10) / 10;

  /** @type {'ok' | 'short' | 'long'} */
  let status = 'ok';
  if (totalEstimated < plannedMinutes - 5) status = 'short';
  if (totalEstimated > plannedMinutes + 5) status = 'long';

  return {
    activityMinutes: Math.round(activityMinutes * 10) / 10,
    transitionMinutes,
    introMinutes,
    closingMinutes,
    totalEstimated,
    plannedMinutes,
    contentGap,
    status,
    exerciseCount: config.exercises.length,
  };
}
