import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCategoryClass, CATEGORY_CLASS } from '../src/ui/category-styles.js';

describe('category-styles', () => {
  it('maps all five category IDs', () => {
    assert.equal(Object.keys(CATEGORY_CLASS).length, 5);
    assert.equal(getCategoryClass('cat-vowel-teams'), 'cat-vowel-teams');
    assert.equal(getCategoryClass('cat-diphthongs'), 'cat-diphthongs');
  });

  it('returns empty string for unknown category', () => {
    assert.equal(getCategoryClass('unknown'), '');
  });
});
