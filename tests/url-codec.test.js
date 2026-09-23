import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeLessonConfig,
  decodeLessonConfig,
  buildShareUrl,
  parseLessonFromParams,
  buildLessonShareLinks,
  resolveLessonShareQuery,
  isCfgPayloadTooLong,
} from '../src/share/url-codec.js';
import { createEmptyLessonConfig, presetToLessonConfig } from '../src/lessons/lesson-config.js';
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

describe('url-codec', () => {
  it('round-trips custom lesson config', () => {
    const config = createEmptyLessonConfig({
      title: 'Sdílená lekce',
      exercises: [
        { exerciseId: 'ex-find-pattern-demo', feedbackMode: 'practice' },
        { exerciseId: 'ex-exit-ticket-demo', feedbackMode: 'assessment' },
      ],
    });
    const encoded = encodeLessonConfig(config);
    const decoded = decodeLessonConfig(encoded);
    assert.equal(decoded.title, config.title);
    assert.equal(decoded.exercises.length, config.exercises.length);
    assert.equal(decoded.exercises[0].exerciseId, config.exercises[0].exerciseId);
    assert.equal(decoded.exercises[0].feedbackMode, config.exercises[0].feedbackMode);
  });

  it('builds hash routes', () => {
    const url = buildShareUrl('student', { lesson: 'les-vowel-teams-demo' }, 'https://school.test/app/');
    assert.equal(url, 'https://school.test/app/#/student?lesson=les-vowel-teams-demo');
  });

  it('parses preset lesson param', async () => {
    const store = await loadDemoStore();
    const params = new URLSearchParams('lesson=les-vowel-teams-demo');
    const parsed = parseLessonFromParams(params, store);
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.config.id, 'les-vowel-teams-demo');
  });

  it('rejects invalid cfg payload', async () => {
    const store = await loadDemoStore();
    const params = new URLSearchParams('cfg=v1.not-valid');
    const parsed = parseLessonFromParams(params, store);
    assert.equal(parsed.ok, false);
  });

  it('uses short preset url when unchanged', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const config = presetToLessonConfig(preset);
    const links = buildLessonShareLinks(config, 'student', 'https://x.test/', store);
    assert.match(links.url, /lesson=les-vowel-teams-demo/);
    assert.equal(links.tooLong, false);
  });

  it('uses cfg url when feedback mode is edited on a preset copy', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const config = {
      ...presetToLessonConfig(preset),
      id: 'custom-edited',
      kind: 'custom',
      sourcePresetId: preset.id,
      exercises: preset.exercises.map((slot, idx) =>
        idx === 0 ? { ...slot, feedbackMode: 'assessment' } : { ...slot }
      ),
    };

    const query = resolveLessonShareQuery(config, store);
    assert.equal(query.lesson, null);
    assert.ok(query.cfg?.startsWith('v1.'));

    const links = buildLessonShareLinks(config, 'student', 'https://x.test/', store);
    assert.match(links.url, /cfg=v1\./);
    assert.doesNotMatch(links.url, /lesson=les-vowel-teams-demo/);
  });

  it('uses cfg url when the last activity is removed from a preset copy', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const config = {
      ...presetToLessonConfig(preset),
      id: 'custom-trimmed',
      kind: 'custom',
      sourcePresetId: preset.id,
      exercises: preset.exercises.slice(0, -1),
    };

    const query = resolveLessonShareQuery(config, store);
    assert.equal(query.lesson, null);
    assert.ok(query.cfg?.startsWith('v1.'));

    const decoded = decodeLessonConfig(query.cfg);
    assert.equal(decoded.exercises.length, preset.exercises.length - 1);
    assert.equal(
      decoded.exercises.at(-1)?.exerciseId,
      preset.exercises.at(-2)?.exerciseId
    );
  });

  it('launch query matches share panel decision for edited presets', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const config = {
      ...presetToLessonConfig(preset),
      id: 'custom-reordered',
      kind: 'custom',
      sourcePresetId: preset.id,
      exercises: [
        preset.exercises[1],
        preset.exercises[0],
        ...preset.exercises.slice(2),
      ],
    };

    const query = resolveLessonShareQuery(config, store);
    const share = buildLessonShareLinks(config, 'teacher', 'https://x.test/app/', store);

    assert.equal(query.lesson, null);
    assert.match(share.url, /cfg=v1\./);
    assert.equal(query.cfg, share.cfg);
  });

  it('detects long cfg payloads', () => {
    const long = 'v1.' + 'a'.repeat(900);
    assert.equal(isCfgPayloadTooLong(long), true);
  });
});
