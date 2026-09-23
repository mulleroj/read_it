import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shuffleTiles, hasAlternativeOrder } from '../src/core/shuffle-tiles.js';

describe('shuffleTiles', () => {
  it('detects when alternative order is possible', () => {
    assert.equal(hasAlternativeOrder(['r', 'ai', 'n']), true);
    assert.equal(hasAlternativeOrder(['a', 'a', 'a']), false);
    assert.equal(hasAlternativeOrder(['x']), false);
  });

  it('never returns original order when another arrangement exists', () => {
    const original = ['r', 'ai', 'n'];
    for (let i = 0; i < 30; i += 1) {
      const shuffled = shuffleTiles(original);
      assert.notDeepEqual(shuffled, original);
      assert.deepEqual([...shuffled].sort(), [...original].sort());
    }
  });

  it('returns identity shuffle for single tile', () => {
    assert.deepEqual(shuffleTiles(['ai']), ['ai']);
  });

  it('adjusts when random preserves order (deterministic mock)', () => {
    const original = ['r', 'ai', 'n'];
    const alwaysZero = () => 0;
    const shuffled = shuffleTiles(original, alwaysZero);
    assert.notDeepEqual(shuffled, original);
  });
});
