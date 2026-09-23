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
    loadJsonBundle(`${root}`, index.categories, fetchFn),
    loadJsonBundle(`${root}`, index.patterns, fetchFn),
    loadJsonBundle(`${root}`, index.words, fetchFn),
    loadJsonBundle(`${root}`, index.exercises, fetchFn),
  ];
  if (index.lessons) {
    fetches.push(loadJsonBundle(`${root}`, index.lessons, fetchFn));
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

/**
 * Load one JSON bundle path or merge several bundle files (arrays concatenated).
 * @param {string} root
 * @param {string | string[]} pathOrPaths
 * @param {typeof fetch} fetchFn
 */
async function loadJsonBundle(root, pathOrPaths, fetchFn) {
  const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
  const chunks = await Promise.all(paths.map((p) => fetchJson(`${root}${p}`, fetchFn)));
  return chunks.flat();
}

/**
 * Validate cross-references inside a loaded content store (for tests and CI).
 * @param {ReturnType<typeof createContentStoreFromData>} store
 */
export function validateContentReferences(store) {
  const errors = [];

  for (const word of store.wordsById.values()) {
    for (const patternId of word.patternIds) {
      if (!store.patternsById.has(patternId)) {
        errors.push(`Word ${word.id} references missing pattern ${patternId}`);
      }
    }
    if (word.audioId != null) {
      errors.push(`Word ${word.id} has audioId ${word.audioId} but production audio is not shipped`);
    }
  }

  for (const pattern of store.patternsById.values()) {
    if (!store.categoriesById.has(pattern.categoryId)) {
      errors.push(`Pattern ${pattern.id} references missing category ${pattern.categoryId}`);
    }
  }

  for (const exercise of store.exercisesById.values()) {
    if (!store.categoriesById.has(exercise.categoryId)) {
      errors.push(`Exercise ${exercise.id} references missing category ${exercise.categoryId}`);
    }
    for (const item of exercise.items) {
      collectExerciseItemReferenceErrors(exercise, item, store, errors);
    }
  }

  for (const lesson of store.lessonsById.values()) {
    for (const slot of lesson.exercises) {
      if (!store.exercisesById.has(slot.exerciseId)) {
        errors.push(`Lesson ${lesson.id} references missing exercise ${slot.exerciseId}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Content reference validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * @param {object} exercise
 * @param {object} item
 * @param {ReturnType<typeof createContentStoreFromData>} store
 * @param {string[]} errors
 */
function collectExerciseItemReferenceErrors(exercise, item, store, errors) {
  const prefix = `${exercise.id} item`;

  if (item.wordId && !store.wordsById.has(item.wordId)) {
    errors.push(`${prefix}: missing word ${item.wordId}`);
  }

  for (const wordId of item.wordIds ?? []) {
    if (!store.wordsById.has(wordId)) {
      errors.push(`${prefix}: missing word ${wordId}`);
    }
  }

  for (const patternId of item.optionPatternIds ?? []) {
    if (!store.patternsById.has(patternId)) {
      errors.push(`${prefix}: missing option pattern ${patternId}`);
    }
  }

  if (item.correctPatternId && !store.patternsById.has(item.correctPatternId)) {
    errors.push(`${prefix}: missing correct pattern ${item.correctPatternId}`);
  }

  for (const patternId of Object.values(item.correctAssignments ?? {})) {
    if (!store.patternsById.has(patternId) && !String(patternId).startsWith('bin-')) {
      errors.push(`${prefix}: sort assignment references unknown pattern ${patternId}`);
    }
  }

  if (item.targetWordId && !store.wordsById.has(item.targetWordId)) {
    errors.push(`${prefix}: missing target word ${item.targetWordId}`);
  }

  if (item.oddWordId && !store.wordsById.has(item.oddWordId)) {
    errors.push(`${prefix}: missing odd word ${item.oddWordId}`);
  }
}
