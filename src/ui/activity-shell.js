import { getCategoryClass } from './category-styles.js';
import { escapeHtml, escapeAttr } from './html-utils.js';
import { iconCheck, iconX, iconArrowRight, iconRefresh, iconTrophy } from './icons.js';

/**
 * @param {object} exercise
 * @param {object} store
 */
export function getActivityPanelClass(exercise, store) {
  const catClass = getCategoryClass(exercise.categoryId);
  return `activity ${catClass}`.trim();
}

/**
 * @param {object} params
 */
export function renderActivityHeader({ exercise, store, context, current, total }) {
  const category = store.getCategory(exercise.categoryId);
  const progressPct = total > 0 ? Math.round((current / total) * 100) : 0;
  const progressText = context.t('progressItem', {
    current: String(current),
    total: String(total),
  });

  return `
    <header class="activity__header">
      <div class="activity__title-row">
        <h1 class="activity__title">${escapeHtml(exercise.title?.cs ?? '')}</h1>
        ${
          category
            ? `<span class="category-badge">
          <span class="category-badge__dot" aria-hidden="true"></span>
          ${escapeHtml(category.label.en)}
        </span>`
            : ''
        }
      </div>
      ${renderModeChip(context)}
      <div class="progress-block">
        <div class="progress-block__label">
          <span>${escapeHtml(context.t('progressLabel'))}</span>
          <span class="progress-block__count">${escapeHtml(progressText)}</span>
        </div>
        <div class="progress-bar" role="progressbar" aria-valuenow="${current}" aria-valuemin="1" aria-valuemax="${total}" aria-label="${escapeAttr(progressText)}">
          <div class="progress-bar__fill" style="width: ${progressPct}%"></div>
        </div>
      </div>
    </header>`;
}

/** @param {{ mode: string, controls: object, t: Function }} context */
function renderModeChip(context) {
  if (context.controls.isTeacher) {
    return `<p class="session-chip session-chip--teacher">${escapeHtml(context.t('sessionTeacher'))}</p>`;
  }
  if (context.controls.deferFeedback) {
    return `<p class="session-chip session-chip--assessment">${escapeHtml(context.t('sessionAssessment'))}</p>`;
  }
  return `<p class="session-chip session-chip--practice">${escapeHtml(context.t('sessionPractice'))}</p>`;
}

/**
 * @param {boolean} correct
 * @param {string} label
 * @param {string} text
 * @param {string} [explanation]
 */
export function renderFeedbackHtml(correct, label, text, explanation = '') {
  const icon = correct ? iconCheck : iconX;
  const modifier = correct ? 'feedback--correct' : 'feedback--incorrect';
  const explanationHtml = explanation
    ? `<span class="feedback__explanation">${escapeHtml(explanation)}</span>`
    : '';

  return `
    <div class="feedback ${modifier}" role="status" aria-live="polite">
      <span class="feedback__icon">${icon}</span>
      <span class="feedback__body">
        <span class="feedback__label">${escapeHtml(label)}</span>
        <span class="feedback__text">${escapeHtml(text)}</span>
        ${explanationHtml}
      </span>
    </div>`;
}

/**
 * @param {object} params
 */
export function renderSummaryHtml({ score, context, reviewHtml = '' }) {
  return `
    <div class="activity__summary">
      <div class="summary-icon">${iconTrophy}</div>
      <h2 class="activity__title">${escapeHtml(context.t('summaryTitle'))}</h2>
      <div class="score-ring" role="img" aria-label="${score.correct} z ${score.total} správně">
        <span class="score-ring__value">${score.percent} %</span>
        <span class="score-ring__label">${score.correct} / ${score.total}</span>
      </div>
      <p class="activity__summary-message">${escapeHtml(context.t('summaryMessage'))}</p>
      ${reviewHtml}
      <div class="activity__actions">
        <button type="button" class="btn btn-primary btn-restart">
          ${iconRefresh}
          ${escapeHtml(context.t('restart'))}
        </button>
        <a href="#/home" class="btn btn-secondary">${escapeHtml(context.t('backHome'))}</a>
      </div>
    </div>`;
}

/**
 * @param {Array<{ correct: boolean, prompt: string, userLabel: string, correctLabel: string, explanation?: string }>} items
 * @param {Function} t
 */
export function renderReviewListHtml(items, t) {
  if (!items.length) return '';

  const rows = items
    .map(
      (item, i) => `
    <li class="review-item ${item.correct ? 'review-item--correct' : 'review-item--incorrect'}">
      <span class="review-item__status" aria-hidden="true">${item.correct ? '✓' : '✗'}</span>
      <div class="review-item__body">
        <strong>${i + 1}. ${escapeHtml(item.prompt)}</strong>
        <span class="review-item__answer">${escapeHtml(t('reviewYourAnswer'))}: ${escapeHtml(item.userLabel)}</span>
        ${item.correct ? '' : `<span class="review-item__correct">${escapeHtml(t('reviewCorrectAnswer'))}: ${escapeHtml(item.correctLabel)}</span>`}
        ${item.explanation ? `<span class="review-item__explanation">${escapeHtml(item.explanation)}</span>` : ''}
      </div>
    </li>`
    )
    .join('');

  return `
    <section class="review-list" aria-label="${escapeAttr(t('reviewTitle'))}">
      <h3 class="review-list__title">${escapeHtml(t('reviewTitle'))}</h3>
      <ol class="review-list__items">${rows}</ol>
    </section>`;
}

/** @param {Function} t */
export function renderTeacherActionBar(t, { revealed, hasSelection, isLast }) {
  return `
    <div class="activity__actions activity__actions--teacher">
      <button type="button" class="btn btn-secondary btn-reveal" ${hasSelection ? '' : 'disabled'}>
        ${escapeHtml(t('teacherReveal'))}
      </button>
      <button type="button" class="btn btn-primary btn-next" ${revealed ? '' : 'disabled'}>
        ${iconArrowRight}
        ${escapeHtml(isLast ? t('finish') : t('next'))}
      </button>
      <button type="button" class="btn btn-secondary btn-reset-item">${escapeHtml(t('resetItem'))}</button>
    </div>`;
}

/** @param {Function} t @param {object} options */
export function renderStudentActionBar(t, { deferFeedback, answered, isLast }) {
  const label = deferFeedback
    ? isLast
      ? t('finish')
      : t('next')
    : isLast
      ? t('finish')
      : t('nextQuestion');

  return `
    <div class="activity__actions">
      <button type="button" class="btn btn-primary btn-next" ${answered ? '' : 'disabled'}>
        ${iconArrowRight}
        ${escapeHtml(label)}
      </button>
    </div>`;
}
