import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderActivityWordBlock } from '../src/ui/word-audio-control.js';
import { markPublicWordAudioAvailable, resetWordAudioForTests } from '../src/audio/word-audio.js';
import { t } from '../src/i18n.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('assessment audio safety', () => {
  it('exit-ticket word block shows spelling but not the correct pattern label', async () => {
    resetWordAudioForTests();
    markPublicWordAudioAvailable(['w-gift']);

    const exercises = JSON.parse(await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8'));
    const giftItem = exercises
      .find((e) => e.id === 'ex-exit-ticket-mixed')
      .items.find((i) => i.wordId === 'w-gift');

    const html = renderActivityWordBlock(
      { id: 'w-gift', spelling: 'gift', ipa: '/ɡɪft/' },
      t,
      { compact: true }
    );

    assert.match(html, />gift</);
    assert.match(html, /data-audio-word-id="w-gift"/);
    assert.doesNotMatch(html, /pat-hard-c-g/);
    assert.doesNotMatch(html, /hard g/i);
    assert.doesNotMatch(giftItem.prompt.cs, /hard g/i);
  });
});
