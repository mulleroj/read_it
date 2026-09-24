import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { isValidMode, parseHashRoute, buildHashRoute } from '../src/router.js';
import {
  buildHelpHref,
  buildHelpPageUrl,
  buildReturnHref,
  resolveHelpReturnPath,
  isStudentActiveLessonReturn,
  snapshotBuilderDraft,
  readBuilderDraftRestore,
  BUILDER_DRAFT_RESTORE_KEY,
  HELP_RETURN_KEY,
} from '../src/help/help-navigation.js';
import { getTeacherHelpSections } from '../src/help/teacher-help-content.js';
import { resolvePilotFilePath } from '../scripts/pilot-server.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('teacher help routing', () => {
  it('registers help mode in router', () => {
    assert.equal(isValidMode('help'), true);
    const { mode, params } = parseHashRoute('#/help?return=%2Fbuilder%3Fpreset%3Dles-read-it-30-mixed');
    assert.equal(mode, 'help');
    assert.equal(decodeURIComponent(params.get('return') ?? ''), '/builder?preset=les-read-it-30-mixed');
  });

  it('builds help and return links', () => {
    assert.equal(buildHelpHref('/teacher?lesson=les-read-it-30-mixed'), '#/help?return=%2Fteacher%3Flesson%3Dles-read-it-30-mixed');
    assert.equal(buildReturnHref('/builder?preset=les-read-it-30-mixed'), '#/builder?preset=les-read-it-30-mixed');
    assert.equal(buildHashRoute('help', { return: '/home' }), '#/help?return=%2Fhome');
    assert.equal(
      buildHelpPageUrl('/teacher?lesson=les-read-it-30-mixed', { origin: 'http://192.168.1.42:3000', pathname: '/index.html' }),
      'http://192.168.1.42:3000/index.html#/help?return=%2Fteacher%3Flesson%3Dles-read-it-30-mixed',
    );
  });

  it('resolves help return path from query params', () => {
    const params = new URLSearchParams('return=%2Fteacher%3Flesson%3Dles-read-it-30-mixed');
    assert.equal(resolveHelpReturnPath(params), '/teacher?lesson=les-read-it-30-mixed');
  });
});

describe('teacher help student separation', () => {
  it('detects active student lesson return paths', () => {
    assert.equal(isStudentActiveLessonReturn('/student?lesson=les-read-it-30-mixed'), true);
    assert.equal(isStudentActiveLessonReturn('/student?cfg=v1.test'), true);
    assert.equal(isStudentActiveLessonReturn('/student'), false);
    assert.equal(isStudentActiveLessonReturn('/teacher?lesson=les-read-it-30-mixed'), false);
  });
});

describe('builder draft preservation for help', () => {
  /** @type {Map<string, string>} */
  let storage;

  beforeEach(() => {
    storage = new Map();
    globalThis.sessionStorage = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => {
        storage.set(key, value);
      },
      removeItem: (key) => {
        storage.delete(key);
      },
      clear: () => storage.clear(),
    };
  });

  it('snapshots and restores builder draft once', () => {
    const draft = {
      id: 'custom-test',
      kind: 'custom',
      title: 'Test draft from help',
      exercises: [{ exerciseId: 'ex-find-pattern-mixed' }],
      plannedMinutes: 30,
    };

    snapshotBuilderDraft(draft);
    const restored = readBuilderDraftRestore();
    assert.deepEqual(restored, draft);
    assert.equal(readBuilderDraftRestore(), null);
  });
});

describe('teacher help content', () => {
  it('includes required sections A–I', () => {
    const sections = getTeacherHelpSections();
    const ids = sections.map((s) => s.id);
    assert.ok(ids.includes('what-is'));
    assert.ok(ids.includes('quick-lesson'));
    assert.ok(ids.includes('modes'));
    assert.ok(ids.includes('builder'));
    assert.ok(ids.includes('activities'));
    assert.ok(ids.includes('pilot-30'));
    assert.ok(ids.includes('sharing'));
    assert.ok(ids.includes('pilot-admin'));
    assert.ok(ids.includes('audio'));
    assert.ok(ids.includes('faq'));
    assert.match(sections.find((s) => s.id === 'audio')?.html ?? '', /Hotové studentské audio/);
    assert.match(sections.find((s) => s.id === 'pilot-admin')?.html ?? '', /serve:pilot/);
    assert.doesNotMatch(sections.find((s) => s.id === 'start')?.html ?? '', /npm run serve:pilot/);
  });

  it('mentions five activity types and four in mixed lesson', () => {
    const activities = getTeacherHelpSections().find((s) => s.id === 'activities');
    assert.match(activities?.html ?? '', /5 typů/);
    assert.match(activities?.html ?? '', /4 typy/);
    assert.match(activities?.html ?? '', /Přiřadit sem/);
  });
});

describe('teacher help pilot-server compatibility', () => {
  it('serves help modules through pilot allowlist', () => {
    assert.ok(resolvePilotFilePath('/src/ui/teacher-help.js', repoRoot));
    assert.ok(resolvePilotFilePath('/src/help/help-navigation.js', repoRoot));
    assert.ok(resolvePilotFilePath('/src/help/teacher-help-content.js', repoRoot));
    assert.equal(resolvePilotFilePath('/docs/CLASSROOM_PILOT_RUNSHEET.cs.md', repoRoot), null);
  });
});
