import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateQrMatrix, getQrModuleCount } from '../src/share/qr.js';
import { buildShareUrl } from '../src/share/url-codec.js';

describe('qr generation', () => {
  it('generates a valid QR matrix for lesson url', () => {
    const url = buildShareUrl('student', { lesson: 'les-vowel-teams-demo' }, 'https://school.test/readit/');
    const count = getQrModuleCount(url);
    assert.ok(count >= 21);
    const qr = generateQrMatrix(url);
    assert.equal(qr.getModuleCount(), count);
    assert.equal(typeof qr.isDark(0, 0), 'boolean');
  });
});
