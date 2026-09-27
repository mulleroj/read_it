import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkSingleChoice } from '../src/core/evaluation.js';
import { shuffleChoiceIds } from '../src/core/shuffle-choices.js';
import { buildLessonShareLinks } from '../src/share/url-codec.js';
import { presetToLessonConfig } from '../src/lessons/lesson-config.js';
import { shouldHideTeacherNavigation } from '../src/ui/student-nav.js';
import {
  renderLessonTeacherNotesOverview,
  renderLessonTeacherNotesPanel,
} from '../src/lessons/lesson-teacher-notes.js';
import { createContentStoreFromData } from '../src/core/content-loader.js';

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

describe('P0 choice shuffle and scoring', () => {
  it('scores by pattern id, not display index', () => {
    const correctId = 'pat-ai';
    assert.equal(checkSingleChoice('pat-ay', correctId).correct, false);
    assert.equal(checkSingleChoice(correctId, correctId).correct, true);
  });

  it('shuffles stored option order when another arrangement exists', () => {
    const ids = ['pat-ai', 'pat-ay', 'pat-ee', 'pat-oa'];
    for (let i = 0; i < 20; i += 1) {
      const shuffled = shuffleChoiceIds(ids);
      assert.notDeepEqual(shuffled, ids);
    }
  });

  it('keeps stable order for the same item session map entry', () => {
    const first = shuffleChoiceIds(['a', 'b', 'c', 'd'], () => 0.25);
    const second = shuffleChoiceIds(['a', 'b', 'c', 'd'], () => 0.25);
    assert.deepEqual(first, second);
  });
});

describe('P0 student isolation helpers', () => {
  it('hides teacher-only navigation in student mode', () => {
    assert.equal(shouldHideTeacherNavigation('student'), true);
    assert.equal(shouldHideTeacherNavigation('teacher'), false);
  });

  it('student share link targets student mode with preset lesson id', async () => {
    const lessons = JSON.parse(await readFile(join(root, 'content/lessons/mixed-preset.json'), 'utf8'));
    const preset = lessons.find((l) => l.id === 'les-read-it-30-mixed');
    const config = presetToLessonConfig(preset);
    const links = buildLessonShareLinks(config, 'student', 'https://example.test/app/', {
      getLessonPreset: (id) => lessons.find((l) => l.id === id) ?? null,
    });
    assert.match(links.url, /#\/student\?lesson=les-read-it-30-mixed/);
    assert.doesNotMatch(links.url, /#\/teacher/);
  });
});

describe('P0 teacher notes default hidden', () => {
  it('overview notes start collapsed', () => {
    const html = renderLessonTeacherNotesOverview('Skrytý text.', 'Poznámky');
    assert.match(html, /aria-expanded="false"/);
    assert.match(html, /teacher-notes-collapsible" hidden/);
  });

  it('delivery panel notes start collapsed', () => {
    const html = renderLessonTeacherNotesPanel('Metodika gift.', { title: 'Poznámky' });
    assert.match(html, /aria-expanded="false"/);
    assert.match(html, /teacher-panel__notes-body teacher-notes-collapsible" hidden/);
  });
});

describe('P0 build-word prompt audit', () => {
  it('mixed build-word prompts do not reveal English target spellings', async () => {
    const store = await loadFullContentStore();
    const exercise = store.getExercise('ex-build-word-mixed');
    assert.ok(exercise);

    for (const item of exercise.items) {
      const word = store.getWord(item.targetWordId);
      assert.ok(word);
      const prompt = item.prompt?.cs ?? '';
      assert.doesNotMatch(prompt, new RegExp(`\\b${word.spelling}\\b`, 'i'), prompt);
      assert.doesNotMatch(prompt, /\bdešť\b/);
    }
  });
});
