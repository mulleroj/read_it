import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveShareAccessContext, resolveShareQrHint } from '../src/ui/lesson-share.js';
import { t } from '../src/i18n.js';

describe('lesson share access hints', () => {
  it('detects localhost vs LAN vs public hostnames', () => {
    assert.equal(resolveShareAccessContext('localhost'), 'localhost');
    assert.equal(resolveShareAccessContext('127.0.0.1'), 'localhost');
    assert.equal(resolveShareAccessContext('192.168.0.15'), 'lan');
    assert.equal(resolveShareAccessContext('read-it.netlify.app'), 'public');
  });

  it('returns context-specific QR hints', () => {
    assert.match(resolveShareQrHint(t, 'localhost'), /localhost/i);
    assert.match(resolveShareQrHint(t, '192.168.1.50'), /Wi-Fi/i);
    assert.match(resolveShareQrHint(t, 'readit-stsul.netlify.app'), /veřejnou adresu READ IT!/i);
    assert.match(resolveShareQrHint(t, '192.168.1.50'), /LAN pilot/i);
  });
});
