/** @typedef {'home' | 'teacher' | 'student'} AppMode */

export const APP_VERSION = '1.0.0-m3';
export const DEMO_EXERCISE_ID = 'ex-find-pattern-demo';

/** @type {Record<string, string>} */
export const ACTIVITY_TYPE_LABELS = {
  'find-pattern': 'Najdi vzor',
  'odd-one-out': 'Co nepatří',
  'sort-words': 'Roztřiď slova',
  'build-word': 'Sestav slovo',
  'exit-ticket': 'Exit ticket',
};

/** @type {Record<AppMode, string>} */
export const MODE_LABELS = {
  home: 'Domů',
  teacher: 'Učitel',
  student: 'Student',
};
