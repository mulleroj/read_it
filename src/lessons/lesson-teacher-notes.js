import { escapeHtml } from '../ui/html-utils.js';

/**
 * @param {string} notesText
 * @returns {string}
 */
export function formatTeacherNotesParagraphs(notesText) {
  if (!notesText?.trim()) return '';
  return notesText
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p class="teacher-panel__note-p">${escapeHtml(paragraph)}</p>`)
    .join('');
}

/**
 * Teacher-only aside panel for lesson delivery.
 * @param {string} notesText
 * @param {{ title: string, callout?: string }} options
 * @returns {string}
 */
export function renderLessonTeacherNotesPanel(notesText, options) {
  const body = formatTeacherNotesParagraphs(notesText);
  if (!body && !options.callout) return '';

  const callout = options.callout
    ? `<p class="teacher-panel__callout" role="note">${escapeHtml(options.callout)}</p>`
    : '';

  return `
    <aside class="teacher-panel teacher-panel--lesson-notes" aria-label="${escapeHtml(options.title)}">
      <h2 class="teacher-panel__title">${escapeHtml(options.title)}</h2>
      ${callout}
      <div class="teacher-panel__notes-body">${body}</div>
    </aside>`;
}

/**
 * Overview block for teacher notes (full width above sequence).
 * @param {string} notesText
 * @param {string} title
 * @returns {string}
 */
export function renderLessonTeacherNotesOverview(notesText, title) {
  const body = formatTeacherNotesParagraphs(notesText);
  if (!body) return '';

  return `
    <section class="lesson-teacher-notes" aria-labelledby="lesson-teacher-notes-title">
      <h2 id="lesson-teacher-notes-title" class="lesson-teacher-notes__title">${escapeHtml(title)}</h2>
      <div class="lesson-teacher-notes__body">${body}</div>
    </section>`;
}

/**
 * @param {object} exercise
 * @returns {boolean}
 */
export function isAssessmentExercise(exercise) {
  return exercise?.type === 'exit-ticket' || exercise?.feedbackMode === 'assessment';
}
