import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('mixed exit-ticket wording', () => {
  it('each mixed item has an area-specific prompt, not generic vowel team', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const exit = exercises.find((e) => e.id === 'ex-exit-ticket-mixed');
    assert.ok(exit);

    const expected = {
      'w-bird': /r-controlled/i,
      'w-cow': /dvojhlásk/i,
      'w-gym': /g v gym/i,
      'w-gift': /gift/i,
      'w-boat': /vowel team/i,
    };

    for (const item of exit.items) {
      const prompt = item.prompt?.cs ?? '';
      assert.ok(prompt.length > 0, `Missing prompt for ${item.wordId}`);
      assert.doesNotMatch(
        prompt,
        /Vyber správný vowel team/i,
        `Generic vowel-team prompt on ${item.wordId}`
      );
      assert.match(prompt, expected[item.wordId], `Unexpected prompt for ${item.wordId}: ${prompt}`);
    }
  });

  it('gift student prompt does not reveal the answer', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const gift = exercises
      .find((e) => e.id === 'ex-exit-ticket-mixed')
      .items.find((i) => i.wordId === 'w-gift');

    assert.doesNotMatch(gift.prompt.cs, /není příklad měkkého g/i);
    assert.doesNotMatch(gift.prompt.cs, /hard g/i);
    assert.doesNotMatch(gift.prompt.cs, /měkké g/i);
    assert.equal(gift.correctPatternId, 'pat-hard-c-g');
    assert.match(gift.explanation.cs, /výjimka|hard g|Není to měkké g/i);
  });

  it('exit-ticket prompts do not leak answers in question text', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/mixed-m6b.json'), 'utf8')
    );
    const exit = exercises.find((e) => e.id === 'ex-exit-ticket-mixed');

    const leakPatterns = [
      /není příklad/i,
      /výjimka/i,
      /hard g/i,
      /měkké g.*gift/i,
      /→/,
    ];

    for (const item of exit.items) {
      const prompt = item.prompt?.cs ?? '';
      for (const pattern of leakPatterns) {
        assert.doesNotMatch(prompt, pattern, `Leak in ${item.wordId}: ${prompt}`);
      }
    }
  });

  it('demo exit ticket keeps items without per-item prompts', async () => {
    const exercises = JSON.parse(
      await readFile(join(root, 'content/exercises/demo-m2a.json'), 'utf8')
    );
    const demo = exercises.find((e) => e.id === 'ex-exit-ticket-demo');
    for (const item of demo.items) {
      assert.equal(item.prompt, undefined);
    }
  });
});
