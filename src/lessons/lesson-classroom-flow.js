import { escapeHtml } from '../ui/html-utils.js';

/** @typedef {{ phase: string, minutes: number, content: string }} ClassroomFlowStep */

/** @type {ClassroomFlowStep[]} */
export const MIXED_30_CLASSROOM_FLOW = [
  { phase: 'Úvod', minutes: 2, content: 'Cíl, QR/odkaz, stručně 5 oblastí' },
  { phase: 'Najdi vzor', minutes: 8, content: 'rain, car, coin, city, happy, tree' },
  { phase: 'Roztřiď slova', minutes: 4, content: '10 slov do 5 kategorií' },
  { phase: 'Sestav slovo', minutes: 5, content: 'rain, bell, clock' },
  { phase: 'Poslech', minutes: 3, content: 'rain, car, coin, city, happy – tlačítko Poslech nebo ústně učitele' },
  { phase: 'Exit ticket', minutes: 5, content: 'bird, cow, gym, gift, boat' },
  { phase: 'Závěr', minutes: 1, content: 'Shrnutí – gift = hard g' },
];

export const MIXED_30_LESSON_ID = 'les-read-it-30-mixed';

/**
 * @param {string} [sourcePresetId]
 * @returns {ClassroomFlowStep[]}
 */
export function getLessonClassroomFlow(sourcePresetId) {
  if (sourcePresetId === MIXED_30_LESSON_ID) {
    return MIXED_30_CLASSROOM_FLOW;
  }
  return [];
}

/**
 * @param {string} [sourcePresetId]
 * @param {{ t: Function, mode?: 'teacher' | 'student' }} context
 * @returns {string}
 */
export function renderLessonClassroomFlowSection(sourcePresetId, context) {
  const steps = getLessonClassroomFlow(sourcePresetId);
  if (!steps.length) return '';

  const rows = steps
    .map(
      (step) => `
      <tr>
        <th scope="row">${escapeHtml(step.phase)}</th>
        <td>${step.minutes} min</td>
        <td>${escapeHtml(step.content)}</td>
      </tr>`
    )
    .join('');

  const exitNote =
    context.mode === 'teacher'
      ? `<p class="lesson-classroom-flow__note">${escapeHtml(context.t('lessonExitTicketClassroomNote'))}</p>`
      : '';

  const hardGNote = `<p class="lesson-classroom-flow__tip">${escapeHtml(context.t('lessonClassroomHardGTip'))}</p>`;

  return `
    <section class="lesson-classroom-flow" aria-labelledby="lesson-classroom-flow-title">
      <h2 id="lesson-classroom-flow-title" class="lesson-classroom-flow__title">${escapeHtml(context.t('lessonClassroomFlowTitle'))}</h2>
      <table class="lesson-classroom-flow__table">
        <thead>
          <tr><th scope="col">${escapeHtml(context.t('lessonClassroomPhase'))}</th><th scope="col">${escapeHtml(context.t('lessonClassroomTime'))}</th><th scope="col">${escapeHtml(context.t('lessonClassroomContent'))}</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${hardGNote}
      ${exitNote}
    </section>`;
}
