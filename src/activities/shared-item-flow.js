import { createAnswerSession, getSessionControls } from '../core/evaluation.js';
import {
  getActivityPanelClass,
  renderActivityHeader,
  renderSummaryHtml,
  renderReviewListHtml,
  renderTeacherActionBar,
  renderStudentActionBar,
  renderFeedbackHtml,
} from '../ui/activity-shell.js';
import { iconArrowRight } from '../ui/icons.js';
import { escapeHtml } from '../ui/html-utils.js';

/**
 * @typedef {Object} ItemCheckResult
 * @property {boolean} correct
 * @property {string} userLabel
 * @property {string} correctLabel
 * @property {string} [explanation]
 * @property {string} [prompt]
 */

/**
 * @param {HTMLElement} container
 * @param {object} exercise
 * @param {object} context
 * @param {object} store
 * @param {object} callbacks
 * @param {(item: object, itemIndex: number, ui: HTMLElement) => string} callbacks.renderBody
 * @param {(item: object, userInput: unknown) => ItemCheckResult} callbacks.checkItem
 * @param {(item: object) => string} [callbacks.getPromptLabel]
 * @param {string} [callbacks.extraClass]
 */
export function mountItemFlow(container, exercise, context, store, callbacks) {
  const controls = getSessionControls(exercise, context);
  const enrichedContext = { ...context, controls };
  const session = createAnswerSession(exercise.items.length, controls.feedbackMode);

  let itemIndex = 0;
  let answered = false;
  let revealed = false;
  /** @type {unknown} */
  let userInput = null;
  /** @type {ItemCheckResult|null} */
  let lastResult = null;

  const ui = document.createElement('div');
  ui.className = [getActivityPanelClass(exercise, store), callbacks.extraClass].filter(Boolean).join(' ');
  ui.setAttribute('role', 'region');
  ui.setAttribute('aria-label', exercise.title?.cs ?? 'Cvičení');
  container.replaceChildren(ui);

  renderCurrent();

  return {
    destroy() {
      container.replaceChildren();
    },
  };

  function renderCurrent() {
    if (itemIndex >= exercise.items.length) {
      renderSummaryView();
      return;
    }

    answered = false;
    revealed = false;
    userInput = null;
    lastResult = null;

    const item = exercise.items[itemIndex];
    const current = itemIndex + 1;
    const total = exercise.items.length;
    const isLast = current === total;

    const header = renderActivityHeader({
      exercise,
      store,
      context: enrichedContext,
      current,
      total,
    });

    const body = callbacks.renderBody(item, itemIndex, ui);
    const actions = controls.manualReveal
      ? renderTeacherActionBar(context.t, { revealed, hasSelection: false, isLast })
      : renderStudentActionBar(context.t, { deferFeedback: controls.deferFeedback, answered, isLast });

    ui.innerHTML = `${header}${body}<div class="feedback-slot"></div>${actions}`;
    bindItemEvents(item, isLast);
  }

  /** @param {object} item @param {boolean} isLast */
  function bindItemEvents(item, isLast) {
    callbacks.bindItem?.(ui, item, {
      onSelect(input) {
        userInput = input;
        updateActionState(item);
      },
      onSubmit(input) {
        userInput = input;
        if (controls.showImmediateFeedback) {
          submitAnswer(item);
        } else if (controls.manualReveal) {
          const revealBtn = ui.querySelector('.btn-reveal');
          if (revealBtn) revealBtn.disabled = false;
        } else if (controls.deferFeedback) {
          submitAnswer(item, true);
          answered = true;
          const nextBtn = ui.querySelector('.btn-next');
          if (nextBtn) nextBtn.disabled = false;
        }
      },
    });

    ui.querySelector('.btn-reveal')?.addEventListener('click', () => {
      if (userInput == null) return;
      submitAnswer(item);
      revealed = true;
      const revealBtn = ui.querySelector('.btn-reveal');
      const nextBtn = ui.querySelector('.btn-next');
      if (revealBtn) revealBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = false;
    });

    ui.querySelector('.btn-next')?.addEventListener('click', () => {
      if (controls.deferFeedback && userInput != null && session.records.length <= itemIndex) {
        submitAnswer(item, true);
      }
      itemIndex += 1;
      renderCurrent();
    });

    ui.querySelector('.btn-reset-item')?.addEventListener('click', () => {
      renderCurrent();
    });
  }

  /** @param {object} item */
  function updateActionState(item) {
    const ready = callbacks.canSubmit ? callbacks.canSubmit(item, userInput) : userInput != null;

    if (controls.manualReveal) {
      const revealBtn = ui.querySelector('.btn-reveal');
      if (revealBtn) revealBtn.disabled = !ready;
      return;
    }

    if (controls.showImmediateFeedback && !callbacks.explicitSubmit && ready) {
      submitAnswer(item);
      return;
    }

    if (controls.deferFeedback && ready) {
      answered = true;
      const nextBtn = ui.querySelector('.btn-next');
      if (nextBtn) nextBtn.disabled = false;
    }
  }

  /** @param {object} item @param {boolean} [silent] */
  function submitAnswer(item, silent = false) {
    if (userInput == null) return;
    lastResult = callbacks.checkItem(item, userInput);
    answered = true;

    const prompt =
      lastResult.prompt ??
      callbacks.getPromptLabel?.(item) ??
      exercise.title?.cs ??
      '';

    session.record({
      correct: lastResult.correct,
      userLabel: lastResult.userLabel,
      correctLabel: lastResult.correctLabel,
      explanation: lastResult.explanation,
      prompt,
    });

    if (!silent && (controls.showImmediateFeedback || controls.manualReveal)) {
      showFeedback(lastResult);
      callbacks.applyResult?.(ui, item, lastResult, userInput);
    }

    if (!controls.manualReveal) {
      const nextBtn = ui.querySelector('.btn-next');
      if (nextBtn) nextBtn.disabled = false;
    }
  }

  /** @param {ItemCheckResult} result */
  function showFeedback(result) {
    const slot = ui.querySelector('.feedback-slot');
    if (!slot) return;
    const label = result.correct ? context.t('feedbackLabelCorrect') : context.t('feedbackLabelIncorrect');
    const text = result.correct ? context.t('feedbackCorrect') : context.t('feedbackIncorrect', { answer: result.correctLabel });
    slot.innerHTML = renderFeedbackHtml(result.correct, label, text, result.explanation ?? '');
  }

  function renderSummaryView() {
    if (controls.deferFeedback) {
      for (let i = 0; i < exercise.items.length; i += 1) {
        if (session.records.length <= i) {
          /* fill missing - should not happen if user completed flow */
        }
      }
    }

    const score = session.getScore();
    const reviewHtml =
      controls.deferFeedback || controls.manualReveal
        ? renderReviewListHtml(
            session.records.map((r) => ({
              correct: r.correct,
              prompt: r.prompt ?? '',
              userLabel: r.userLabel,
              correctLabel: r.correctLabel,
              explanation: r.explanation,
            })),
            context.t
          )
        : '';

    ui.innerHTML = renderSummaryHtml({ score, context, reviewHtml });
    ui.querySelector('.btn-restart')?.addEventListener('click', () => {
      session.clear();
      itemIndex = 0;
      renderCurrent();
    });
  }

  /** @param {unknown} input */
  function isAssignmentComplete(input) {
    return input != null && typeof input === 'object';
  }
}
