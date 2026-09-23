import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('mixed find-pattern wording', () => {
  it('uses exercise-specific prompt, not generic vowel team', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const find = exercises.find((e) => e.id === 'ex-find-pattern-mixed');
    assert.ok(find?.prompt?.cs);
    assert.doesNotMatch(find.prompt.cs, /vowel team/i);
    assert.match(find.prompt.cs, /pravopisný vzor/i);
    for (const item of find.items) {
      assert.equal(item.prompt, undefined);
    }
  });

  it('demo find-pattern keeps no exercise-level prompt', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/demo-m2a.json'), 'utf8')
    );
    const demo = exercises.find((e) => e.id === 'ex-find-pattern-demo');
    assert.equal(demo.prompt, undefined);
  });
});
