import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeLesson } from '../scripts/analyze-lesson-audio-coverage.mjs';

describe('lesson exercise audio coverage', () => {
  it('covers all words referenced in Vowel Teams demo exercises', async () => {
    const result = await analyzeLesson('les-vowel-teams-demo', 'Vowel Teams demo');
    assert.equal(result.withoutAudioCount, 0, result.withoutAudio.join(', '));
    assert.ok(result.withAudio.includes('w-wait'));
    assert.ok(result.withAudio.includes('w-light'));
  });

  it('covers all words referenced in mixed READ IT! exercises', async () => {
    const result = await analyzeLesson('les-read-it-30-mixed', 'Mixed READ IT! 30min');
    assert.equal(result.uniqueWordCount, 15);
    assert.equal(result.withoutAudioCount, 0, result.withoutAudio.join(', '));
  });
});
