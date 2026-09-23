import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  createContentStoreFromData,
  validateContentReferences,
} from '../src/core/content-loader.js';
import {
  presetToLessonConfig,
  resolveLessonConfig,
} from '../src/lessons/lesson-config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path) {
  return JSON.parse(await readFile(join(root, path), 'utf8'));
}

async function loadJsonBundle(paths) {
  const list = Array.isArray(paths) ? paths : [paths];
  const chunks = await Promise.all(list.map((p) => readJson(p)));
  return chunks.flat();
}

async function loadFullContentStore() {
  const index = await readJson('content/index.json');
  const [meta, categories, patterns, words, exercises, lessons] = await Promise.all([
    readJson(index.meta),
    loadJsonBundle(index.categories),
    loadJsonBundle(index.patterns),
    loadJsonBundle(index.words),
    loadJsonBundle(index.exercises),
    loadJsonBundle(index.lessons),
  ]);
  return createContentStoreFromData({ meta, categories, patterns, words, exercises, lessons });
}

const MIXED_EXERCISE_IDS = [
  'ex-find-pattern-mixed',
  'ex-sort-words-mixed',
  'ex-build-word-mixed',
  'ex-exit-ticket-mixed',
];

const CATEGORY_IDS = [
  'cat-vowel-teams',
  'cat-r-controlled',
  'cat-diphthongs',
  'cat-soft-cg',
  'cat-double-consonants',
];

describe('M6B mixed lesson content', () => {
  it('loads full content store with valid cross-references', async () => {
    const store = await loadFullContentStore();
    assert.doesNotThrow(() => validateContentReferences(store));
  });

  it('mixed preset resolves to four exercises with twenty-four pedagogical items', async () => {
    const store = await loadFullContentStore();
    const preset = store.getLessonPreset('les-read-it-30-mixed');
    assert.ok(preset);

    const config = presetToLessonConfig(preset);
    const resolved = resolveLessonConfig(config, store);
    assert.equal(resolved.ok, true);
    if (!resolved.ok) return;

    assert.equal(resolved.resolved.length, 4);

    const pedagogicalCount = resolved.resolved.reduce((sum, entry) => {
      const ex = entry.exercise;
      if (ex.type === 'sort-words') {
        return sum + ex.items.reduce((s, item) => s + item.wordIds.length, 0);
      }
      return sum + ex.items.length;
    }, 0);
    assert.equal(pedagogicalCount, 24);
  });

  it('all five teaching areas are represented in mixed exercises', async () => {
    const store = await loadFullContentStore();
    const represented = new Set();

    for (const exerciseId of MIXED_EXERCISE_IDS) {
      const exercise = store.getExercise(exerciseId);
      assert.ok(exercise, exerciseId);

      for (const item of exercise.items) {
        if (item.wordId) {
          const word = store.getWord(item.wordId);
          for (const pid of word?.patternIds ?? []) {
            const pattern = store.getPattern(pid);
            if (pattern) represented.add(pattern.categoryId);
          }
        }
        for (const wordId of item.wordIds ?? []) {
          const word = store.getWord(wordId);
          for (const pid of word?.patternIds ?? []) {
            const pattern = store.getPattern(pid);
            if (pattern) represented.add(pattern.categoryId);
          }
        }
        if (item.targetWordId) {
          const word = store.getWord(item.targetWordId);
          for (const pid of word?.patternIds ?? []) {
            const pattern = store.getPattern(pid);
            if (pattern) represented.add(pattern.categoryId);
          }
        }
      }
    }

    for (const sortEx of [store.getExercise('ex-sort-words-mixed')]) {
      for (const item of sortEx.items) {
        for (const bin of item.bins) {
          if (bin.patternId === 'bin-vt') represented.add('cat-vowel-teams');
          if (bin.patternId === 'bin-r') represented.add('cat-r-controlled');
          if (bin.patternId === 'bin-diph') represented.add('cat-diphthongs');
          if (bin.patternId === 'bin-soft') represented.add('cat-soft-cg');
          if (bin.patternId === 'bin-dc') represented.add('cat-double-consonants');
        }
      }
    }

    for (const catId of CATEGORY_IDS) {
      assert.ok(represented.has(catId), `Missing category ${catId}`);
    }
  });

  it('gift is labelled as hard-g contrast, not soft-g', async () => {
    const store = await loadFullContentStore();
    const gift = store.getWord('w-gift');
    assert.ok(gift);
    assert.deepEqual(gift.patternIds, ['pat-hard-c-g']);

    const hardPattern = store.getPattern('pat-hard-c-g');
    assert.ok(hardPattern);
    assert.match(hardPattern.label.cs, /kontrast|hard/i);

    const exit = store.getExercise('ex-exit-ticket-mixed');
    const giftItem = exit.items.find((i) => i.wordId === 'w-gift');
    assert.ok(giftItem);
    assert.equal(giftItem.correctPatternId, 'pat-hard-c-g');
    assert.notEqual(giftItem.correctPatternId, 'pat-soft-g');
  });

  it('build-word tiles match approved draft for rain, bell, clock', async () => {
    const store = await loadFullContentStore();
    const build = store.getExercise('ex-build-word-mixed');

    const rain = build.items.find((i) => i.targetWordId === 'w-rain');
    assert.deepEqual(rain.tiles, ['r', 'ai', 'n']);
    assert.deepEqual(rain.correctOrder, ['r', 'ai', 'n']);

    const bell = build.items.find((i) => i.targetWordId === 'w-bell');
    assert.deepEqual(bell.tiles, ['b', 'e', 'll']);
    assert.deepEqual(bell.correctOrder, ['b', 'e', 'll']);

    const clock = build.items.find((i) => i.targetWordId === 'w-clock');
    assert.deepEqual(clock.tiles, ['c', 'l', 'o', 'ck']);
    assert.deepEqual(clock.correctOrder, ['c', 'l', 'o', 'ck']);
  });

  it('word bank has thirty-three candidate words and no production audio', async () => {
    const store = await loadFullContentStore();

    const mixedWordIds = new Set([
      'w-rain', 'w-day', 'w-tree', 'w-boat', 'w-wait', 'w-play', 'w-light', 'w-green',
      'w-car', 'w-bird', 'w-turn', 'w-fork', 'w-her',
      'w-coin', 'w-cow', 'w-boy', 'w-house', 'w-brown',
      'w-city', 'w-gym', 'w-face', 'w-nice', 'w-gift', 'w-get', 'w-girl', 'w-cat', 'w-rice',
      'w-happy', 'w-letter', 'w-bell', 'w-sock', 'w-miss', 'w-clock',
    ]);

    for (const id of mixedWordIds) {
      assert.ok(store.getWord(id), `Missing word ${id}`);
    }
    assert.equal(mixedWordIds.size, 33);

    for (const id of mixedWordIds) {
      assert.equal(store.getWord(id).audioId, null);
    }
  });

  it('demo preset and exercises remain intact', async () => {
    const store = await loadFullContentStore();
    assert.ok(store.getLessonPreset('les-vowel-teams-demo'));
    assert.ok(store.getExercise('ex-find-pattern-demo'));
    assert.equal(store.getWord('w-rain')?.ipa, '/reɪn/');
  });
});
