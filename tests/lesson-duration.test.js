import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateLessonDuration, estimateExerciseMinutes } from '../src/lessons/duration.js';
import { presetToLessonConfig } from '../src/lessons/lesson-config.js';
import { createContentStoreFromData } from '../src/core/content-loader.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('lesson duration', () => {
  it('estimates exercise minutes deterministically', async () => {
    const exercises = JSON.parse(await readFile(join(root, 'content/exercises/demo-m2a.json'), 'utf8'));
    const findPattern = exercises.find((e) => e.id === 'ex-find-pattern-demo');
    const minutes = estimateExerciseMinutes(findPattern);
    assert.ok(minutes > 0);
    assert.equal(minutes, estimateExerciseMinutes(findPattern));
  });

  it('demo preset activity time alone does not fill a 30min module', async () => {
    const [meta, categories, patterns, words, exercises, lessons] = await Promise.all([
      readFile(join(root, 'content/meta/version.json'), 'utf8').then(JSON.parse),
      readFile(join(root, 'content/categories/index.json'), 'utf8').then(JSON.parse),
      readFile(join(root, 'content/patterns/vowel-teams.json'), 'utf8').then(JSON.parse),
      readFile(join(root, 'content/words/demo-vowel-teams.json'), 'utf8').then(JSON.parse),
      readFile(join(root, 'content/exercises/demo-m2a.json'), 'utf8').then(JSON.parse),
      readFile(join(root, 'content/lessons/demo-preset.json'), 'utf8').then(JSON.parse),
    ]);
    const store = createContentStoreFromData({ meta, categories, patterns, words, exercises, lessons });
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const config = presetToLessonConfig(preset);
    const estimate = estimateLessonDuration(config, store);
    assert.equal(estimate.plannedMinutes, 30);
    assert.ok(estimate.activityMinutes < 25);
    assert.ok(estimate.totalEstimated <= estimate.plannedMinutes + 5);
  });
});
