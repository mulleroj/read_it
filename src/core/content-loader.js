/**
 * @typedef {Object} ContentMeta
 * @property {string} schemaVersion
 * @property {string} contentVersion
 * @property {string} minAppVersion
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {{ cs: string, en: string }} label
 * @property {boolean} [available]
 */

/**
 * @typedef {Object} Pattern
 * @property {string} id
 * @property {string} categoryId
 * @property {{ cs: string, en: string }} label
 * @property {string[]} graphemes
 * @property {string} phoneme
 */

/**
 * @typedef {Object} Word
 * @property {string} id
 * @property {string} spelling
 * @property {string} ipa
 * @property {string[]} patternIds
 * @property {string|null} audioId
 * @property {string} difficulty
 */

/**
 * @typedef {Object} FindPatternItem
 * @property {string} wordId
 * @property {string[]} optionPatternIds
 * @property {string} correctPatternId
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} type
 * @property {{ cs: string }} title
 * @property {string} categoryId
 * @property {string} difficulty
 * @property {FindPatternItem[]} items
 * @property {boolean} autoCheck
 */

/**
 * @param {string} baseUrl
 * @param {typeof fetch} fetchFn
 */
export async function loadContentStore(baseUrl = '', fetchFn = fetch) {
  const root = baseUrl.replace(/\/?$/, '/');
  const indexRes = await fetchFn(`${root}content/index.json`);
  if (!indexRes.ok) {
    throw new Error(`Nepodařilo se načíst content/index.json (${indexRes.status})`);
  }
  const index = await indexRes.json();

  const fetches = [
    fetchJson(`${root}${index.meta}`, fetchFn),
    fetchJson(`${root}${index.categories}`, fetchFn),
    fetchJson(`${root}${index.patterns}`, fetchFn),
    fetchJson(`${root}${index.words}`, fetchFn),
    fetchJson(`${root}${index.exercises}`, fetchFn),
  ];
  if (index.lessons) {
    fetches.push(fetchJson(`${root}${index.lessons}`, fetchFn));
  }

  const results = await Promise.all(fetches);
  const [meta, categories, patterns, words, exercises, lessons = []] = results;

  validateMeta(meta);
  validateExerciseBundle(exercises);
  validateLessonBundle(lessons);

  /** @type {Map<string, Category>} */
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  /** @type {Map<string, Pattern>} */
  const patternsById = new Map(patterns.map((p) => [p.id, p]));
  /** @type {Map<string, Word>} */
  const wordsById = new Map(words.map((w) => [w.id, w]));
  /** @type {Map<string, Exercise>} */
  const exercisesById = new Map(exercises.map((e) => [e.id, e]));
  /** @type {Map<string, object>} */
  const lessonsById = new Map(lessons.map((l) => [l.id, l]));

  return {
    meta,
    categoriesById,
    patternsById,
    wordsById,
    exercisesById,
    lessonsById,
    getCategory(id) {
      return categoriesById.get(id) ?? null;
    },
    getPattern(id) {
      return patternsById.get(id) ?? null;
    },
    getWord(id) {
      return wordsById.get(id) ?? null;
    },
    getExercise(id) {
      return exercisesById.get(id) ?? null;
    },
    getLessonPreset(id) {
      return lessonsById.get(id) ?? null;
    },
  };
}

/**
 * Build store from parsed JSON (for tests and offline bundling).
 * @param {object} bundles
 */
export function createContentStoreFromData(bundles) {
  const { meta, categories, patterns, words, exercises, lessons = [] } = bundles;
  validateMeta(meta);
  validateExerciseBundle(exercises);
  validateLessonBundle(lessons);

  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const patternsById = new Map(patterns.map((p) => [p.id, p]));
  const wordsById = new Map(words.map((w) => [w.id, w]));
  const exercisesById = new Map(exercises.map((e) => [e.id, e]));
  const lessonsById = new Map(lessons.map((l) => [l.id, l]));

  return {
    meta,
    categoriesById,
    patternsById,
    wordsById,
    exercisesById,
    lessonsById,
    getCategory: (id) => categoriesById.get(id) ?? null,
    getPattern: (id) => patternsById.get(id) ?? null,
    getWord: (id) => wordsById.get(id) ?? null,
    getExercise: (id) => exercisesById.get(id) ?? null,
    getLessonPreset: (id) => lessonsById.get(id) ?? null,
  };
}

/**
 * @param {ContentMeta} meta
 */
export function validateMeta(meta) {
  if (!meta || typeof meta.schemaVersion !== 'string') {
    throw new Error('Neplatný meta soubor: chybí schemaVersion');
  }
  if (typeof meta.contentVersion !== 'string') {
    throw new Error('Neplatný meta soubor: chybí contentVersion');
  }
}

/**
 * @param {Exercise[]} exercises
 */
export function validateExerciseBundle(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error('Exercise bundle musí obsahovat alespoň jedno cvičení');
  }
  for (const ex of exercises) {
    if (!ex.id || !ex.type || !Array.isArray(ex.items)) {
      throw new Error(`Neplatné cvičení: ${ex.id ?? 'unknown'}`);
    }
  }
}

/**
 * @param {object[]} lessons
 */
export function validateLessonBundle(lessons) {
  if (!Array.isArray(lessons)) {
    throw new Error('Lesson bundle musí být pole');
  }
  for (const lesson of lessons) {
    if (!lesson.id || !lesson.preset || !Array.isArray(lesson.exercises)) {
      throw new Error(`Neplatná preset lekce: ${lesson.id ?? 'unknown'}`);
    }
  }
}

/**
 * @param {string} url
 * @param {typeof fetch} fetchFn
 */
async function fetchJson(url, fetchFn) {
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Chyba načítání ${url} (${res.status})`);
  }
  return res.json();
}
