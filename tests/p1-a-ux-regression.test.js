import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkSortAssignments } from '../src/core/evaluation.js';
import { calculateScorePercent } from '../src/core/validator.js';
import { createSortWordsCheckResult, formatSortRevealLabel } from '../src/activities/sort-words.js';
import { renderFeedbackHtml } from '../src/ui/activity-shell.js';
import {
  MIXED_30_CLASSROOM_FLOW,
  MIXED_30_LESSON_ID,
  getLessonClassroomFlow,
  renderLessonClassroomFlowSection,
} from '../src/lessons/lesson-classroom-flow.js';
import { comparePresetLessons, isRecommendedLesson, RECOMMENDED_LESSON_ID } from '../src/lessons/lesson-picker.js';
import { renderActivityWordBlock } from '../src/ui/word-audio-control.js';
import { t } from '../src/i18n.js';
import {
  createContentStoreFromData,
} from '../src/core/content-loader.js';

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

describe('P1-A exit ticket', () => {
  it('hideIpa omits IPA from word block (gym would leak /dʒɪm/)', () => {
    const html = renderActivityWordBlock(
      { id: 'w-gym', spelling: 'gym', ipa: '/dʒɪm/' },
      t,
      { compact: true, hideIpa: true }
    );
    assert.match(html, />gym</);
    assert.doesNotMatch(html, /dʒɪm/);
    assert.doesNotMatch(html, /activity__ipa/);
  });

  it('mixed exit ticket distractors stay in sensible pattern sets', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const exit = exercises.find((e) => e.id === 'ex-exit-ticket-mixed');

    const gym = exit.items.find((i) => i.wordId === 'w-gym');
    assert.ok(gym.optionPatternIds.includes('pat-soft-g'));
    assert.ok(gym.optionPatternIds.includes(gym.correctPatternId));
    assert.ok(!gym.optionPatternIds.includes('pat-oi'), 'oi is unrelated to gym /g/ question');

    const gift = exit.items.find((i) => i.wordId === 'w-gift');
    assert.ok(!gift.optionPatternIds.includes('pat-oi'));
    assert.ok(gift.optionPatternIds.includes('pat-hard-c-g'));
  });

  it('each exit item has correctPatternId in optionPatternIds', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const exit = exercises.find((e) => e.id === 'ex-exit-ticket-mixed');
    for (const item of exit.items) {
      assert.ok(
        item.optionPatternIds.includes(item.correctPatternId),
        `${item.wordId} missing correct option`
      );
    }
  });
});

describe('P1-A sort words scoring', () => {
  it('9/10 assignments yields 90%', async () => {
    const store = await loadFullContentStore();
    const ex = store.getExercise('ex-sort-words-mixed');
    const item = ex.items[0];
    const assignments = { ...item.correctAssignments };
    const wordIds = Object.keys(assignments);
    const correctBin = assignments[wordIds[0]];
    assignments[wordIds[0]] = item.bins.find((b) => b.patternId !== correctBin)?.patternId ?? 'bin-r';

    const result = checkSortAssignments(assignments, item.correctAssignments);
    const correctCount = result.details.filter((d) => d.correct).length;
    assert.equal(correctCount, 9);
    assert.equal(calculateScorePercent(correctCount, 10), 90);
    assert.equal(result.correct, false);
  });

  it('10/10 yields 100%', async () => {
    const store = await loadFullContentStore();
    const ex = store.getExercise('ex-sort-words-mixed');
    const item = ex.items[0];
    const result = checkSortAssignments(item.correctAssignments, item.correctAssignments);
    assert.equal(result.details.filter((d) => d.correct).length, 10);
    assert.equal(calculateScorePercent(10, 10), 100);
    assert.equal(result.correct, true);
  });

  it('teacher reveal lists concrete word → category mapping', async () => {
    const store = await loadFullContentStore();
    const ex = store.getExercise('ex-sort-words-mixed');
    const label = formatSortRevealLabel(ex.items[0], store);
    assert.match(label, /rain/i);
    assert.match(label, /→/);
    assert.doesNotMatch(label, /Všechna slova/i);
  });

  it('teacher Zobrazit odpověď feedback renders all word → category lines', async () => {
    const store = await loadFullContentStore();
    const item = store.getExercise('ex-sort-words-mixed').items[0];
    const ctx = { mode: 'teacher', t };

    const result = createSortWordsCheckResult(item, item.correctAssignments, ctx, store);
    assert.ok(result.feedbackText);
    assert.equal(result.feedbackText, result.correctLabel);
    assert.equal(result.feedbackText.split(';').length, 10);

    const feedbackText =
      result.feedbackText ??
      (result.correct ? t('feedbackCorrect') : t('feedbackIncorrect', { answer: result.correctLabel }));
    const html = renderFeedbackHtml(
      result.correct,
      t('feedbackLabelCorrect'),
      feedbackText,
      result.explanation ?? ''
    );

    assert.doesNotMatch(html, /Všechna slova ve správných kategoriích/);
    assert.match(html, /rain.*Vowel Teams/);
    assert.match(html, /gym.*Soft C \/ G/);
    assert.match(html, /letter.*Double Consonants/);
    for (const wordId of item.wordIds) {
      const spelling = store.getWord(wordId)?.spelling;
      assert.ok(spelling, wordId);
      assert.match(html, new RegExp(spelling, 'i'), `feedback HTML missing ${spelling}`);
    }
  });

  it('student incorrect feedback does not render full teacher reveal string', async () => {
    const store = await loadFullContentStore();
    const item = store.getExercise('ex-sort-words-mixed').items[0];
    const assignments = { ...item.correctAssignments };
    const first = Object.keys(assignments)[0];
    assignments[first] = 'bin-r';

    const result = createSortWordsCheckResult(item, assignments, { mode: 'student', t }, store);
    assert.equal(result.feedbackText, result.userLabel);
    assert.match(result.feedbackText ?? '', /9 z 10/);
    assert.notEqual(result.feedbackText, result.correctLabel);
  });
});

describe('P1-A lesson overview & picker', () => {
  it('mixed 30 lesson has classroom flow steps matching help plan totals', () => {
    const steps = getLessonClassroomFlow(MIXED_30_LESSON_ID);
    assert.equal(steps.length, 7);
    const minutes = steps.reduce((s, step) => s + step.minutes, 0);
    assert.equal(minutes, 28);
    assert.deepEqual(
      steps.map((s) => s.phase),
      MIXED_30_CLASSROOM_FLOW.map((s) => s.phase)
    );
  });

  it('teacher overview HTML includes Průběh hodiny and exit ticket note', () => {
    const html = renderLessonClassroomFlowSection(MIXED_30_LESSON_ID, { t, mode: 'teacher' });
    assert.match(html, /Průběh hodiny/);
    assert.match(html, /Exit ticket/);
    assert.match(html, /get \/ girl/i);
    assert.match(html, /Roztřiď slova/);
  });

  it('recommended lesson sorts first and is flagged', () => {
    const lessons = [
      { id: 'les-demo' },
      { id: RECOMMENDED_LESSON_ID },
    ].sort(comparePresetLessons);
    assert.equal(lessons[0].id, RECOMMENDED_LESSON_ID);
    assert.equal(isRecommendedLesson(RECOMMENDED_LESSON_ID), true);
    assert.equal(isRecommendedLesson('les-demo'), false);
  });
});

describe('P1-A mobile student header CSS', () => {
  it('main.css defines compact student header rules at 480px', async () => {
    const css = await readFile(join(root, 'styles/main.css'), 'utf8');
    assert.match(css, /body\.mode-student \.app-header__inner/);
    assert.match(css, /@media \(max-width: 480px\)/);
    assert.match(css, /body\.mode-student \.app-nav__link\[data-route='student'\]/);
  });
});
