import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listSavedLessons,
  saveLesson,
  getSavedLesson,
  deleteSavedLesson,
  exportLessonJson,
  importLessonJson,
  CUSTOM_LESSONS_STORAGE_KEY,
} from '../src/core/storage.js';
import { validateLessonConfig, createEmptyLessonConfig } from '../src/lessons/lesson-config.js';

/** @type {Record<string, string>} */
const memory = {};

beforeEach(() => {
  for (const key of Object.keys(memory)) delete memory[key];
  globalThis.localStorage = {
    getItem(key) {
      return memory[key] ?? null;
    },
    setItem(key, value) {
      memory[key] = String(value);
    },
    removeItem(key) {
      delete memory[key];
    },
  };
});

describe('lesson storage', () => {
  it('saves and reopens lesson config', () => {
    const config = createEmptyLessonConfig({
      id: 'custom-test-1',
      title: 'Uložená',
      exercises: [{ exerciseId: 'ex-find-pattern-demo' }],
    });
    saveLesson(config);
    const loaded = getSavedLesson('custom-test-1');
    assert.ok(loaded);
    assert.equal(loaded.title, 'Uložená');
    assert.equal(listSavedLessons().length, 1);
  });

  it('deletes saved lesson', () => {
    saveLesson(
      createEmptyLessonConfig({
        id: 'custom-del',
        title: 'Smazat',
        exercises: [{ exerciseId: 'ex-find-pattern-demo' }],
      })
    );
    deleteSavedLesson('custom-del');
    assert.equal(getSavedLesson('custom-del'), null);
  });

  it('imports exported json', () => {
    const config = createEmptyLessonConfig({
      title: 'Export',
      exercises: [{ exerciseId: 'ex-find-pattern-demo' }],
    });
    const json = exportLessonJson(config);
    const parsed = importLessonJson(json);
    const validation = validateLessonConfig(parsed);
    assert.equal(validation.ok, true);
    assert.equal(memory[CUSTOM_LESSONS_STORAGE_KEY], undefined);
  });
});
