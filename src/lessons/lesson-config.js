/** @typedef {'practice' | 'assessment'} FeedbackModeOverride */

/**
 * @typedef {Object} LessonExerciseSlot
 * @property {string} exerciseId
 * @property {FeedbackModeOverride} [feedbackMode]
 * @property {string} [difficulty]
 * @property {number} [minutes]
 */

/**
 * @typedef {Object} LessonConfig
 * @property {number} v
 * @property {'custom' | 'preset'} kind
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {number} [plannedMinutes]
 * @property {string} [difficulty]
 * @property {LessonExerciseSlot[]} exercises
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {string} [sourcePresetId]
 */

/**
 * @typedef {Object} PresetLesson
 * @property {string} id
 * @property {boolean} preset
 * @property {{ cs: string }} title
 * @property {{ cs: string }} [description]
 * @property {number} plannedMinutes
 * @property {string} [difficulty]
 * @property {LessonExerciseSlot[]} exercises
 * @property {{ cs: string }} [teacherNotes]
 */

export const LESSON_CONFIG_VERSION = 1;

/** @param {string} [prefix] */
export function generateLessonId(prefix = 'custom') {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${stamp}-${rand}`;
}

/**
 * @param {Partial<LessonConfig>} [overrides]
 * @returns {LessonConfig}
 */
export function createEmptyLessonConfig(overrides = {}) {
  const now = new Date().toISOString();
  return {
    v: LESSON_CONFIG_VERSION,
    kind: 'custom',
    id: generateLessonId(),
    title: '',
    description: '',
    plannedMinutes: 30,
    exercises: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * @param {PresetLesson} preset
 * @returns {LessonConfig}
 */
export function presetToLessonConfig(preset) {
  return {
    v: LESSON_CONFIG_VERSION,
    kind: 'preset',
    id: preset.id,
    title: preset.title?.cs ?? preset.id,
    description: preset.description?.cs ?? '',
    plannedMinutes: preset.plannedMinutes ?? 30,
    difficulty: preset.difficulty,
    exercises: preset.exercises.map((slot) => ({ ...slot })),
    sourcePresetId: preset.id,
  };
}

/**
 * @param {unknown} raw
 * @returns {{ ok: true, config: LessonConfig } | { ok: false, code: string, message: string }}
 */
export function validateLessonConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, code: 'malformed', message: 'Konfigurace lekce není platný objekt.' };
  }

  const cfg = /** @type {Record<string, unknown>} */ (raw);

  if (cfg.v !== LESSON_CONFIG_VERSION) {
    return {
      ok: false,
      code: 'unsupported_version',
      message: `Nepodporovaná verze konfigurace (očekáváno v${LESSON_CONFIG_VERSION}).`,
    };
  }

  if (cfg.kind !== 'custom' && cfg.kind !== 'preset') {
    return { ok: false, code: 'invalid_kind', message: 'Neplatný typ konfigurace lekce.' };
  }

  if (typeof cfg.id !== 'string' || !cfg.id.trim()) {
    return { ok: false, code: 'missing_id', message: 'Konfiguraci chybí identifikátor lekce.' };
  }

  if (typeof cfg.title !== 'string') {
    return { ok: false, code: 'missing_title', message: 'Konfiguraci chybí název lekce.' };
  }

  if (!Array.isArray(cfg.exercises)) {
    return { ok: false, code: 'missing_exercises', message: 'Konfiguraci chybí seznam cvičení.' };
  }

  if (cfg.exercises.length === 0) {
    return { ok: false, code: 'empty_lesson', message: 'Lekce neobsahuje žádné cvičení.' };
  }

  const seen = new Set();
  /** @type {LessonExerciseSlot[]} */
  const exercises = [];

  for (const entry of cfg.exercises) {
    if (!entry || typeof entry !== 'object') {
      return { ok: false, code: 'invalid_slot', message: 'Neplatná položka cvičení v lekci.' };
    }

    const slot = /** @type {Record<string, unknown>} */ (entry);
    if (typeof slot.exerciseId !== 'string' || !slot.exerciseId.trim()) {
      return { ok: false, code: 'invalid_exercise_id', message: 'Chybí identifikátor cvičení.' };
    }

    if (seen.has(slot.exerciseId)) {
      return {
        ok: false,
        code: 'duplicate_exercise',
        message: `Cvičení „${slot.exerciseId}“ je v lekci uvedeno vícekrát.`,
      };
    }
    seen.add(slot.exerciseId);

    if (slot.feedbackMode != null && slot.feedbackMode !== 'practice' && slot.feedbackMode !== 'assessment') {
      return { ok: false, code: 'invalid_feedback', message: 'Neplatné nastavení zpětné vazby u cvičení.' };
    }

    exercises.push({
      exerciseId: slot.exerciseId,
      feedbackMode: /** @type {FeedbackModeOverride | undefined} */ (slot.feedbackMode),
      difficulty: typeof slot.difficulty === 'string' ? slot.difficulty : undefined,
      minutes: typeof slot.minutes === 'number' && slot.minutes > 0 ? slot.minutes : undefined,
    });
  }

  /** @type {LessonConfig} */
  const config = {
    v: LESSON_CONFIG_VERSION,
    kind: /** @type {'custom' | 'preset'} */ (cfg.kind),
    id: cfg.id.trim(),
    title: cfg.title.trim(),
    description: typeof cfg.description === 'string' ? cfg.description : '',
    plannedMinutes:
      typeof cfg.plannedMinutes === 'number' && cfg.plannedMinutes > 0 ? cfg.plannedMinutes : 30,
    difficulty: typeof cfg.difficulty === 'string' ? cfg.difficulty : undefined,
    exercises,
    createdAt: typeof cfg.createdAt === 'string' ? cfg.createdAt : undefined,
    updatedAt: typeof cfg.updatedAt === 'string' ? cfg.updatedAt : undefined,
    sourcePresetId: typeof cfg.sourcePresetId === 'string' ? cfg.sourcePresetId : undefined,
  };

  return { ok: true, config };
}

/**
 * @param {LessonConfig} config
 * @param {{ getExercise: (id: string) => object | null, exercisesById?: Map<string, object> }} store
 * @returns {{ ok: true, config: LessonConfig, resolved: Array<{ slot: LessonExerciseSlot, exercise: object }> } | { ok: false, code: string, message: string }}
 */
export function resolveLessonConfig(config, store) {
  const validation = validateLessonConfig(config);
  if (!validation.ok) return validation;

  /** @type {Array<{ slot: LessonExerciseSlot, exercise: object }>} */
  const resolved = [];
  /** @type {string[]} */
  const missing = [];

  for (const slot of validation.config.exercises) {
    const exercise = store.getExercise(slot.exerciseId);
    if (!exercise) {
      missing.push(slot.exerciseId);
      continue;
    }
    resolved.push({ slot, exercise });
  }

  if (missing.length > 0) {
    return {
      ok: false,
      code: 'missing_exercises',
      message: `Lekce obsahuje nedostupná cvičení: ${missing.join(', ')}.`,
    };
  }

  return { ok: true, config: validation.config, resolved };
}

/**
 * @param {object} exercise
 * @param {LessonExerciseSlot} slot
 */
export function applySlotOverrides(exercise, slot) {
  const copy = { ...exercise, items: [...exercise.items] };
  if (slot.feedbackMode) {
    copy.feedbackMode = slot.feedbackMode;
  }
  if (slot.difficulty) {
    copy.difficulty = slot.difficulty;
  }
  return copy;
}

/**
 * Normalizes optional slot fields for preset/share comparison.
 * @param {LessonExerciseSlot} slot
 */
function normalizeExerciseSlot(slot) {
  return {
    exerciseId: slot.exerciseId,
    feedbackMode: slot.feedbackMode ?? undefined,
    difficulty: slot.difficulty ?? undefined,
    minutes: slot.minutes ?? undefined,
  };
}

/**
 * True when two exercise slots share the same student-facing overrides.
 * @param {LessonExerciseSlot} a
 * @param {LessonExerciseSlot} b
 */
export function exerciseSlotsMatchPreset(a, b) {
  const left = normalizeExerciseSlot(a);
  const right = normalizeExerciseSlot(b);
  return (
    left.exerciseId === right.exerciseId &&
    left.feedbackMode === right.feedbackMode &&
    left.difficulty === right.difficulty &&
    left.minutes === right.minutes
  );
}

/**
 * True when `config` matches the effective preset lesson (order, count, timing,
 * difficulty and other student-facing settings). Metadata-only edits still
 * require a custom cfg URL.
 * @param {LessonConfig} config
 * @param {PresetLesson} preset
 */
export function lessonConfigMatchesPreset(config, preset) {
  const baseline = presetToLessonConfig(preset);

  if (config.title !== baseline.title) return false;
  if ((config.description ?? '') !== (baseline.description ?? '')) return false;
  if (config.plannedMinutes !== baseline.plannedMinutes) return false;
  if ((config.difficulty ?? undefined) !== (baseline.difficulty ?? undefined)) {
    return false;
  }
  if (config.exercises.length !== baseline.exercises.length) return false;

  return config.exercises.every((slot, idx) =>
    exerciseSlotsMatchPreset(slot, baseline.exercises[idx])
  );
}
