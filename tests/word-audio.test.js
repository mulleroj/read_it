import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  probeWordAudio,
  hasWordAudio,
  getWordAudioUrl,
  playWordAudio,
  usesPublicWordAudio,
  resetWordAudioForTests,
  markPublicWordAudioAvailable,
} from '../src/audio/word-audio.js';
import {
  setLocalPrototypeAudioEnabledForTests,
  markLocalPrototypeAudioAvailable,
  resetLocalPrototypeAudioForTests,
} from '../src/audio/local-prototype-audio.js';
import { renderWordAudioButton } from '../src/ui/word-audio-control.js';
import { t } from '../src/i18n.js';

describe('word audio integration', () => {
  beforeEach(() => {
    resetWordAudioForTests();
    resetLocalPrototypeAudioForTests();
    setLocalPrototypeAudioEnabledForTests(false);
  });

  it('prefers public assets/audio paths over localhost intake', async () => {
    markPublicWordAudioAvailable(['w-rain']);
    markLocalPrototypeAudioAvailable(['w-rain']);
    setLocalPrototypeAudioEnabledForTests(true);

    assert.equal(hasWordAudio('w-rain'), true);
    assert.equal(usesPublicWordAudio('w-rain'), true);
    assert.equal(getWordAudioUrl('w-rain'), 'assets/audio/w-rain.mp3');
    assert.doesNotMatch(getWordAudioUrl('w-rain'), /tools\/audio-prototype\/output/);
  });

  it('falls back to localhost intake when public file is unavailable', async () => {
    setLocalPrototypeAudioEnabledForTests(true);
    markLocalPrototypeAudioAvailable(['w-car']);

    assert.equal(hasWordAudio('w-car'), true);
    assert.equal(usesPublicWordAudio('w-car'), false);
    assert.equal(getWordAudioUrl('w-car'), 'tools/audio-prototype/ttsmaker-2402/car.mp3');
  });

  it('probe marks public files without requesting Piper paths', async () => {
    const requested = [];
    const fetchFn = async (url, opts) => {
      requested.push(url);
      const ok = url.includes('assets/audio/w-rain.mp3');
      return { ok, status: ok ? 200 : 404 };
    };

    await probeWordAudio('', fetchFn);
    assert.equal(hasWordAudio('w-rain'), true);
    assert.equal(requested.some((u) => u.includes('output/') && u.endsWith('.wav')), false);
    assert.equal(requested.some((u) => u.includes('assets/audio/w-rain.mp3')), true);
  });

  it('does not expose button when audio is unavailable', () => {
    assert.equal(hasWordAudio('w-rain'), false);
    assert.equal(renderWordAudioButton('w-rain', 'rain', t), '');
  });

  it('shows button when public audio is available', () => {
    markPublicWordAudioAvailable(['w-gift']);
    const html = renderWordAudioButton('w-gift', 'gift', t);
    assert.match(html, /data-audio-word-id="w-gift"/);
  });

  it('returns false from playWordAudio when url missing without throwing', async () => {
    const played = await playWordAudio('w-missing');
    assert.equal(played, false);
  });
});
