import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseHashRoute, buildHashRoute, isValidMode } from '../src/router.js';

describe('router', () => {
  it('parses home route', () => {
    const { mode, params } = parseHashRoute('#/home');
    assert.equal(mode, 'home');
    assert.equal(params.toString(), '');
  });

  it('parses student route with query', () => {
    const { mode, params } = parseHashRoute('#/student?ex=ex-find-pattern-demo');
    assert.equal(mode, 'student');
    assert.equal(params.get('ex'), 'ex-find-pattern-demo');
  });

  it('builds hash route with query', () => {
    assert.equal(
      buildHashRoute('teacher', { ex: 'ex-find-pattern-demo' }),
      '#/teacher?ex=ex-find-pattern-demo'
    );
  });

  it('parses lesson query params', () => {
    const { mode, params } = parseHashRoute('#/student?lesson=les-vowel-teams-demo');
    assert.equal(mode, 'student');
    assert.equal(params.get('lesson'), 'les-vowel-teams-demo');
  });

  it('validates known modes', () => {
    assert.equal(isValidMode('teacher'), true);
    assert.equal(isValidMode('builder'), true);
    assert.equal(isValidMode('help'), true);
    assert.equal(isValidMode('unknown'), false);
  });

  it('parses help route with return param', () => {
    const { mode, params } = parseHashRoute('#/help?return=%2Fhome');
    assert.equal(mode, 'help');
    assert.equal(params.get('return'), '/home');
  });
});
