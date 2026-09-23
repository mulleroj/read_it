import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getActivity, getRegisteredTypes } from '../src/activities/registry.js';

describe('activity registry', () => {
  it('registers all five M2A activity types', () => {
    const types = getRegisteredTypes().sort();
    assert.deepEqual(types, [
      'build-word',
      'exit-ticket',
      'find-pattern',
      'odd-one-out',
      'sort-words',
    ]);
  });

  it('each activity supports teacher and student modes', () => {
    for (const type of getRegisteredTypes()) {
      const activity = getActivity(type);
      assert.ok(activity);
      assert.equal(activity.supportsMode('teacher'), true);
      assert.equal(activity.supportsMode('student'), true);
      assert.equal(activity.supportsMode('game'), false);
    }
  });
});
