import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExerciseBundle } from '../src/core/content-loader.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path) {
  return JSON.parse(await readFile(join(root, path), 'utf8'));
}

describe('exercise validation', () => {
  it('validates M2A demo exercise bundle', async () => {
    const exercises = await readJson('content/exercises/demo-m2a.json');
    assert.doesNotThrow(() => validateExerciseBundle(exercises));
  });

  it('each exercise has required fields and stable IDs', async () => {
    const exercises = await readJson('content/exercises/demo-m2a.json');
    const ids = new Set();

    for (const ex of exercises) {
      assert.ok(ex.id.startsWith('ex-'));
      assert.ok(!ids.has(ex.id));
      ids.add(ex.id);
      assert.ok(['find-pattern', 'odd-one-out', 'sort-words', 'build-word', 'exit-ticket'].includes(ex.type));
      assert.equal(ex.categoryId, 'cat-vowel-teams');
      assert.ok(ex.items.length >= 1);
    }
  });

  it('odd-one-out items reference valid odd word in set', async () => {
    const exercises = await readJson('content/exercises/demo-m2a.json');
    const odd = exercises.find((e) => e.type === 'odd-one-out');
    for (const item of odd.items) {
      assert.ok(item.wordIds.includes(item.oddWordId));
      assert.ok(item.explanation?.cs);
    }
  });
});
