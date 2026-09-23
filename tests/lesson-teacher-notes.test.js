import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { presetToLessonConfig } from '../src/lessons/lesson-config.js';
import {
  formatTeacherNotesParagraphs,
  isAssessmentExercise,
  renderLessonTeacherNotesOverview,
  renderLessonTeacherNotesPanel,
} from '../src/lessons/lesson-teacher-notes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('lesson teacher notes', () => {
  it('presetToLessonConfig copies teacherNotes from mixed preset', async () => {
    const lessons = JSON.parse(await readFile(join(root, 'content/lessons/mixed-preset.json'), 'utf8'));
    const preset = lessons.find((l) => l.id === 'les-read-it-30-mixed');
    assert.ok(preset?.teacherNotes?.cs);

    const config = presetToLessonConfig(preset);
    assert.ok(config.teacherNotes?.includes('gift'));
    assert.ok(config.teacherNotes.includes('hard g'));
    assert.ok(config.teacherNotes.includes('digraf'));
  });

  it('formatTeacherNotesParagraphs escapes HTML and splits paragraphs', () => {
    const html = formatTeacherNotesParagraphs('Soft G: gym\n\nHard-g: <gift>');
    assert.match(html, /<p class="teacher-panel__note-p">Soft G: gym<\/p>/);
    assert.match(html, /Hard-g: &lt;gift&gt;/);
  });

  it('renderLessonTeacherNotesPanel includes assessment callout when requested', () => {
    const html = renderLessonTeacherNotesPanel('Note body.', {
      title: 'Poznámky',
      callout: 'Před exit ticketem',
    });
    assert.match(html, /teacher-panel--lesson-notes/);
    assert.match(html, /Před exit ticketem/);
    assert.match(html, /Note body/);
  });

  it('renderLessonTeacherNotesOverview returns empty for blank notes', () => {
    assert.equal(renderLessonTeacherNotesOverview('', 'Title'), '');
  });

  it('isAssessmentExercise detects exit ticket', () => {
    assert.equal(isAssessmentExercise({ type: 'exit-ticket', feedbackMode: 'assessment' }), true);
    assert.equal(isAssessmentExercise({ type: 'find-pattern', feedbackMode: 'practice' }), false);
  });
});
