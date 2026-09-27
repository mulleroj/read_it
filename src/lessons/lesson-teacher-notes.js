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
 * @param {{ title: string, callout?: string, showNotesToggle?: string, hideNotesToggle?: string }} options
 * @returns {string}
 */
export function renderLessonTeacherNotesPanel(notesText, options) {
  const body = formatTeacherNotesParagraphs(notesText);
  if (!body && !options.callout) return '';

  const callout = options.callout
    ? `<p class="teacher-panel__callout teacher-notes-collapsible" hidden>${escapeHtml(options.callout)}</p>`
    : '';

  const showLabel = options.showNotesToggle ?? 'Zobrazit poznámky';
  const hideLabel = options.hideNotesToggle ?? 'Skrýt poznámky';

  return `
    <aside class="teacher-panel teacher-panel--lesson-notes" aria-label="${escapeHtml(options.title)}">
      <div class="teacher-notes__header">
        <h2 class="teacher-panel__title">${escapeHtml(options.title)}</h2>
        <button type="button" class="btn btn-secondary btn-toggle-teacher-notes" aria-expanded="false" data-show-label="${escapeHtml(showLabel)}" data-hide-label="${escapeHtml(hideLabel)}">
          ${escapeHtml(showLabel)}
        </button>
      </div>
      ${callout}
      <div class="teacher-panel__notes-body teacher-notes-collapsible" hidden>${body}</div>
    </aside>`;
}

/**
 * Overview block for teacher notes (full width above sequence).
 * @param {string} notesText
 * @param {string} title
 * @param {{ showNotesToggle?: string, hideNotesToggle?: string }} [labels]
 * @returns {string}
 */
export function renderLessonTeacherNotesOverview(notesText, title, labels = {}) {
  const body = formatTeacherNotesParagraphs(notesText);
  if (!body) return '';

  const showLabel = labels.showNotesToggle ?? 'Zobrazit poznámky';
  const hideLabel = labels.hideNotesToggle ?? 'Skrýt poznámky';

  return `
    <section class="lesson-teacher-notes" aria-labelledby="lesson-teacher-notes-title">
      <div class="teacher-notes__header">
        <h2 id="lesson-teacher-notes-title" class="lesson-teacher-notes__title">${escapeHtml(title)}</h2>
        <button type="button" class="btn btn-secondary btn-toggle-teacher-notes" aria-expanded="false" data-show-label="${escapeHtml(showLabel)}" data-hide-label="${escapeHtml(hideLabel)}">
          ${escapeHtml(showLabel)}
        </button>
      </div>
      <div class="lesson-teacher-notes__body teacher-notes-collapsible" hidden>${body}</div>
    </section>`;
}

/**
 * @param {ParentNode} root
 */
export function bindTeacherNotesToggle(root) {
  root.querySelectorAll('.btn-toggle-teacher-notes').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    const section = btn.closest('.teacher-panel--lesson-notes, .lesson-teacher-notes');
    if (!section) return;

    const panels = section.querySelectorAll('.teacher-notes-collapsible');
    const showLabel = btn.getAttribute('data-show-label') ?? 'Zobrazit poznámky';
    const hideLabel = btn.getAttribute('data-hide-label') ?? 'Skrýt poznámky';

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;
      btn.setAttribute('aria-expanded', String(nextExpanded));
      btn.textContent = nextExpanded ? hideLabel : showLabel;
      panels.forEach((panel) => {
        panel.hidden = !nextExpanded;
      });
    });
  });
}

/**
 * @param {object} exercise
 * @returns {boolean}
 */
export function isAssessmentExercise(exercise) {
  return exercise?.type === 'exit-ticket' || exercise?.feedbackMode === 'assessment';
}
