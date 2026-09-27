import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('footer human-in-the-loop notice', () => {
  it('index.html contains exact HITL copy in shared footer', async () => {
    const html = await readFile(join(root, 'index.html'), 'utf8');
    assert.match(html, /AI \+ 👤 \| HUMAN IN THE LOOP/);
    assert.match(html, /Vytvořeno s podporou AI\. Ověřeno a schváleno člověkem\./);
    assert.match(html, /class="app-footer"/);
  });
});
