import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  createContentStoreFromData,
  validateMeta,
  validateExerciseBundle,
} from '../src/core/content-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function readJson(relativePath) {
  const text = await readFile(join(root, relativePath), 'utf8');
  return JSON.parse(text);
}

describe('content-loader', () => {
  it('validates meta structure', () => {
    assert.doesNotThrow(() =>
      validateMeta({ schemaVersion: '1.0.0', contentVersion: '2026.1-demo' })
    );
    assert.throws(() => validateMeta({ contentVersion: 'x' }));
  });

  it('loads demo content bundles from disk', async () => {
    const meta = await readJson('content/meta/version.json');
    const categories = await readJson('content/categories/index.json');
    const patterns = await readJson('content/patterns/vowel-teams.json');
    const words = await readJson('content/words/demo-vowel-teams.json');
    const exercises = await readJson('content/exercises/demo-m2a.json');

    validateExerciseBundle(exercises);

    const store = createContentStoreFromData({
      meta,
      categories,
      patterns,
      words,
      exercises,
    });

    assert.equal(store.categoriesById.size, 5);
    assert.equal(store.getCategory('cat-vowel-teams')?.available, true);
    assert.equal(store.getCategory('cat-diphthongs')?.available, true);
    assert.equal(store.getWord('w-rain')?.ipa, '/reɪn/');
    assert.equal(store.getExercise('ex-find-pattern-demo')?.type, 'find-pattern');
    assert.equal(store.exercisesById.size, 5);
    assert.equal(store.getExercise('ex-exit-ticket-demo')?.feedbackMode, 'assessment');
  });

  it('demo vowel-team words map audioId across the full fifteen-word lesson bank', async () => {
    const words = await readJson('content/words/demo-vowel-teams.json');
    assert.equal(words.length, 15);
    for (const word of words) {
      assert.equal(word.audioId, word.id, `expected audio on ${word.id}`);
    }
    assert.equal(words.find((w) => w.spelling === 'wait')?.audioId, 'w-wait');
    assert.equal(words.find((w) => w.spelling === 'light')?.audioId, 'w-light');
  });

  it('demo words with audioId must exist in the audio manifest (26 bank)', async () => {
    const words = await readJson('content/words/demo-vowel-teams.json');
    const manifest = await readJson('content/meta/audio-manifest.json');
    const ids = new Set(manifest.entries.map((e) => e.wordId));
    for (const word of words) {
      if (word.audioId) assert.ok(ids.has(word.audioId), `${word.audioId} missing from manifest`);
    }
  });
});
