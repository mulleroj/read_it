import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLessonConfig,
  resolveLessonConfig,
  presetToLessonConfig,
  createEmptyLessonConfig,
} from '../src/lessons/lesson-config.js';
import { createContentStoreFromData } from '../src/core/content-loader.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadDemoStore() {
  const [meta, categories, patterns, words, exercises, lessons] = await Promise.all([
    readFile(join(root, 'content/meta/version.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'content/categories/index.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'content/patterns/vowel-teams.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'content/words/demo-vowel-teams.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'content/exercises/demo-m2a.json'), 'utf8').then(JSON.parse),
    readFile(join(root, 'content/lessons/demo-preset.json'), 'utf8').then(JSON.parse),
  ]);
  return createContentStoreFromData({ meta, categories, patterns, words, exercises, lessons });
}

describe('lesson-config', () => {
  it('validates a correct custom config', () => {
    const config = createEmptyLessonConfig({
      title: 'Test',
      exercises: [{ exerciseId: 'ex-find-pattern-demo' }],
    });
    const result = validateLessonConfig(config);
    assert.equal(result.ok, true);
  });

  it('rejects empty lesson', () => {
    const config = createEmptyLessonConfig({ title: 'Prázdná', exercises: [] });
    const result = validateLessonConfig(config);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, 'empty_lesson');
  });

  it('rejects duplicate exercise ids', () => {
    const config = createEmptyLessonConfig({
      title: 'Dup',
      exercises: [{ exerciseId: 'ex-find-pattern-demo' }, { exerciseId: 'ex-find-pattern-demo' }],
    });
    const result = validateLessonConfig(config);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, 'duplicate_exercise');
  });

  it('rejects unsupported version', () => {
    const result = validateLessonConfig({ v: 99, kind: 'custom', id: 'x', title: 'x', exercises: [] });
    assert.equal(result.ok, false);
  });

  it('resolves preset against store', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    assert.ok(preset);
    const config = presetToLessonConfig(preset);
    const resolved = resolveLessonConfig(config, store);
    assert.equal(resolved.ok, true);
    if (resolved.ok) assert.equal(resolved.resolved.length, 5);
  });

  it('preserves teacherNotes through validateLessonConfig', async () => {
    const index = JSON.parse(await readFile(join(root, 'content/index.json'), 'utf8'));
    const loadBundle = async (paths) => {
      const list = Array.isArray(paths) ? paths : [paths];
      const chunks = await Promise.all(
        list.map((p) => readFile(join(root, p), 'utf8').then(JSON.parse))
      );
      return chunks.flat();
    };
    const store = createContentStoreFromData({
      meta: JSON.parse(await readFile(join(root, index.meta), 'utf8')),
      categories: await loadBundle(index.categories),
      patterns: await loadBundle(index.patterns),
      words: await loadBundle(index.words),
      exercises: await loadBundle(index.exercises),
      lessons: await loadBundle(index.lessons),
    });
    const preset = store.getLessonPreset('les-read-it-30-mixed');
    assert.ok(preset);
    const config = presetToLessonConfig(preset);
    const resolved = resolveLessonConfig(config, store);
    assert.equal(resolved.ok, true);
    if (resolved.ok) {
      assert.ok(resolved.config.teacherNotes?.includes('gift'));
    }
  });

  it('fails on missing exercise ids', async () => {
    const store = await loadDemoStore();
    const config = createEmptyLessonConfig({
      title: 'Chybějící',
      exercises: [{ exerciseId: 'ex-does-not-exist' }],
    });
    const resolved = resolveLessonConfig(config, store);
    assert.equal(resolved.ok, false);
  });
});
