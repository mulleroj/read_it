import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBuilderShareState } from '../src/ui/builder-share-sync.js';
import { buildLessonShareLinks } from '../src/share/url-codec.js';
import { presetToLessonConfig } from '../src/lessons/lesson-config.js';
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

describe('builder-share-sync', () => {
  it('reflects title edit in launch links without a full Builder rerender', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const draft = {
      ...presetToLessonConfig(preset),
      id: 'custom-title-edit',
      kind: 'custom',
      sourcePresetId: preset.id,
    };

    const initial = resolveBuilderShareState(draft, store);
    assert.match(initial.launchLinks.student, /lesson=les-vowel-teams-demo/);

    draft.title = 'Upravený název lekce';
    const updated = resolveBuilderShareState(draft, store);

    assert.equal(updated.query?.lesson, null);
    assert.ok(updated.query?.cfg?.startsWith('v1.'));
    assert.match(updated.launchLinks.student, /cfg=v1\./);
    assert.doesNotMatch(updated.launchLinks.student, /lesson=les-vowel-teams-demo/);
  });

  it('reflects feedback mode edit in share decision immediately', async () => {
    const store = await loadDemoStore();
    const preset = store.getLessonPreset('les-vowel-teams-demo');
    const draft = {
      ...presetToLessonConfig(preset),
      id: 'custom-feedback-edit',
      kind: 'custom',
      sourcePresetId: preset.id,
    };

    assert.match(resolveBuilderShareState(draft, store).launchLinks.teacher, /lesson=/);

    draft.exercises[0].feedbackMode = 'assessment';
    const updated = resolveBuilderShareState(draft, store);
    const share = buildLessonShareLinks(
      { ...draft, kind: 'custom' },
      'student',
      'https://x.test/',
      store
    );

    assert.match(updated.launchLinks.student, /cfg=v1\./);
    assert.equal(updated.query?.cfg, share.cfg);
  });
});
