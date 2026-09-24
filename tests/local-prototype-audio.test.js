import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCAL_PROTOTYPE_WORD_FILES,
  getLocalPrototypeAudioUrl,
  probeLocalPrototypeAudio,
  hasLocalPrototypeAudio,
  resetLocalPrototypeAudioForTests,
  markLocalPrototypeAudioAvailable,
  setLocalPrototypeAudioEnabledForTests,
  syncLocalPrototypeAudioFromLocation,
  isLocalPrototypeAudioEnabled,
  isLocalDevHostname,
} from '../src/audio/local-prototype-audio.js';
import { renderWordAudioButton } from '../src/ui/word-audio-control.js';
import { t } from '../src/i18n.js';

describe('local prototype audio', () => {
  beforeEach(() => {
    resetLocalPrototypeAudioForTests();
  });

  it('maps ten reviewed word IDs to prototype WAV basenames', () => {
    assert.equal(Object.keys(LOCAL_PROTOTYPE_WORD_FILES).length, 10);
    assert.equal(getLocalPrototypeAudioUrl('w-rain'), 'tools/audio-prototype/output/rain.wav');
    assert.equal(getLocalPrototypeAudioUrl('w-letter'), 'tools/audio-prototype/output/letter.wav');
    assert.equal(getLocalPrototypeAudioUrl('w-green'), null);
  });

  it('does not expose audio button before local probe succeeds', () => {
    assert.equal(hasLocalPrototypeAudio('w-rain'), false);
    assert.equal(renderWordAudioButton('w-rain', 'rain', t), '');
  });

  it('shows audio button only for probed-available words', () => {
    setLocalPrototypeAudioEnabledForTests(true);
    markLocalPrototypeAudioAvailable(['w-car']);
    assert.equal(hasLocalPrototypeAudio('w-car'), true);
    assert.equal(hasLocalPrototypeAudio('w-bird'), false);

    const html = renderWordAudioButton('w-car', 'car', t);
    assert.match(html, /data-audio-word-id="w-car"/);
    assert.match(html, /Poslech/);
  });

  it('probe marks only reachable WAV files', async () => {
    setLocalPrototypeAudioEnabledForTests(true);
    const available = new Set(['w-rain', 'w-day', 'w-car']);
    const fetchFn = async (url) => {
      const basename = url.split('/').pop()?.replace('.wav', '');
      const wordId = Object.entries(LOCAL_PROTOTYPE_WORD_FILES).find(([, file]) => file === basename)?.[0];
      const ok = wordId ? available.has(wordId) : false;
      return { ok, status: ok ? 200 : 404 };
    };

    const probed = await probeLocalPrototypeAudio('', fetchFn);
    assert.equal(probed.size, 3);
    assert.equal(hasLocalPrototypeAudio('w-rain'), true);
    assert.equal(hasLocalPrototypeAudio('w-green'), false);
  });

  it('does not probe when local prototype mode is disabled', async () => {
    setLocalPrototypeAudioEnabledForTests(false);
    let fetchCalls = 0;
    const fetchFn = async () => {
      fetchCalls += 1;
      return { ok: true, status: 200 };
    };

    const probed = await probeLocalPrototypeAudio('', fetchFn);
    assert.equal(probed.size, 0);
    assert.equal(fetchCalls, 0);
    assert.equal(hasLocalPrototypeAudio('w-rain'), false);
  });

  it('defaults to disabled on public hostnames', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: 'read-it.example.net', search: '' });
    assert.equal(isLocalPrototypeAudioEnabled(), false);
  });

  it('defaults to enabled on localhost', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: 'localhost', search: '' });
    assert.equal(isLocalPrototypeAudioEnabled(), true);
  });

  it('honours ?localAudio=0 on localhost', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: 'localhost', search: '?localAudio=0' });
    assert.equal(isLocalPrototypeAudioEnabled(), false);
  });

  it('ignores ?localAudio=1 on public hostnames', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: 'read-it.netlify.app', search: '?localAudio=1' });
    assert.equal(isLocalPrototypeAudioEnabled(), false);
  });

  it('defaults to disabled on private LAN hostnames (pilot server)', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: '192.168.1.50', search: '' });
    assert.equal(isLocalPrototypeAudioEnabled(), false);
    assert.equal(isLocalDevHostname('192.168.1.50'), true);
  });

  it('ignores ?localAudio=1 on private LAN hostnames', () => {
    resetLocalPrototypeAudioForTests();
    syncLocalPrototypeAudioFromLocation({ hostname: '192.168.1.50', search: '?localAudio=1' });
    assert.equal(isLocalPrototypeAudioEnabled(), false);
  });
});
