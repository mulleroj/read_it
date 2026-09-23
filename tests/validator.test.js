import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkPatternAnswer, calculateScorePercent } from '../src/core/validator.js';

describe('validator', () => {
  it('marks matching pattern as correct', () => {
    const result = checkPatternAnswer('pat-ai', 'pat-ai');
    assert.equal(result.correct, true);
    assert.equal(result.feedbackKey, 'correct');
  });

  it('marks different pattern as incorrect', () => {
    const result = checkPatternAnswer('pat-ay', 'pat-ai');
    assert.equal(result.correct, false);
    assert.equal(result.feedbackKey, 'incorrect');
  });

  it('calculates score percent', () => {
    assert.equal(calculateScorePercent(4, 5), 80);
    assert.equal(calculateScorePercent(0, 0), 0);
  });
});
