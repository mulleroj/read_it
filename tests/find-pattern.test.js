import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatPatternLabel } from '../src/activities/find-pattern.js';
import { getActivity, getRegisteredTypes } from '../src/activities/registry.js';

describe('find-pattern activity', () => {
  it('is registered in activity registry', () => {
    assert.ok(getRegisteredTypes().includes('find-pattern'));
    const activity = getActivity('find-pattern');
    assert.ok(activity);
    assert.equal(activity.supportsMode('student'), true);
    assert.equal(activity.supportsMode('teacher'), true);
    assert.equal(activity.supportsMode('game'), false);
  });

  it('formats pattern label with grapheme and phoneme', () => {
    const label = formatPatternLabel({
      graphemes: ['ai'],
      phoneme: '/eɪ/',
    });
    assert.equal(label, 'ai /eɪ/');
  });

  it('formats multi-grapheme patterns', () => {
    const label = formatPatternLabel({
      graphemes: ['ai', 'ay'],
      phoneme: '/eɪ/',
    });
    assert.equal(label, 'ai / ay /eɪ/');
  });
});
