/**
 * M8.5 – Analyze audio coverage for words actually used in lesson exercises.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest from '../content/meta/audio-manifest.json' with { type: 'json' };
import { createContentStoreFromData } from '../src/core/content-loader.js';
import { presetToLessonConfig } from '../src/lessons/lesson-config.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

/** @param {unknown} value */
function collectWordIds(value, out = new Set()) {
  if (value == null) return out;
  if (typeof value === 'string' && value.startsWith('w-')) out.add(value);
  if (Array.isArray(value)) {
    for (const item of value) collectWordIds(item, out);
  } else if (typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (key === 'wordId' || key === 'targetWordId' || key === 'audioId') {
        if (typeof v === 'string' && v.startsWith('w-')) out.add(v);
      }
      collectWordIds(v, out);
    }
  }
  return out;
}

const approvedAudioIds = new Set(
  manifest.entries.filter((e) => e.publicReleaseApproved === true).map((e) => e.wordId)
);

async function analyzeLesson(presetId, label) {
  const meta = readJson('content/meta/version.json');
  const categories = readJson('content/categories/index.json');
  const patterns = [readJson('content/patterns/vowel-teams.json'), readJson('content/patterns/mixed-patterns.json')].flat();
  const words = [
    readJson('content/words/demo-vowel-teams.json'),
    readJson('content/words/mixed-read-it.json'),
  ].flat();
  const exercises = [readJson('content/exercises/demo-m2a.json'), readJson('content/exercises/mixed-m6b.json')].flat();
  const lessons = [readJson('content/lessons/demo-preset.json'), readJson('content/lessons/mixed-preset.json')].flat();

  const store = createContentStoreFromData({ meta, categories, patterns, words, exercises, lessons });
  const preset = store.getLessonPreset(presetId);
  if (!preset) throw new Error(`Missing preset ${presetId}`);
  const config = presetToLessonConfig(preset);

  /** @type {Set<string>} */
  const referenced = new Set();
  for (const slot of config.exercises) {
    const exercise = store.getExercise(slot.exerciseId);
    if (!exercise) continue;
    collectWordIds(exercise.items, referenced);
  }

  /** @type {string[]} */
  const withAudio = [];
  /** @type {string[]} */
  const withoutAudio = [];

  for (const wordId of [...referenced].sort()) {
    const word = store.getWord(wordId);
    const hasManifest = approvedAudioIds.has(wordId);
    const hasAudioId = word?.audioId === wordId;
    if (hasManifest && hasAudioId) withAudio.push(wordId);
    else withoutAudio.push(wordId);
  }

  return {
    label,
    presetId,
    uniqueWordCount: referenced.size,
    withAudioCount: withAudio.length,
    withoutAudioCount: withoutAudio.length,
    withAudio,
    withoutAudio,
  };
}

const results = [
  await analyzeLesson('les-vowel-teams-demo', 'Vowel Teams demo'),
  await analyzeLesson('les-read-it-30-mixed', 'Mixed READ IT! 30min'),
];

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('analyze-lesson-audio-coverage.mjs')) {
  console.log(JSON.stringify(results, null, 2));
}

export { analyzeLesson, approvedAudioIds };
