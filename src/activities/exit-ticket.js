import { checkSingleChoice } from '../core/evaluation.js';
import { mountItemFlow } from './shared-item-flow.js';
import { markOptionButtons, formatPatternLabel } from './find-pattern.js';
import { escapeHtml, escapeAttr } from '../ui/html-utils.js';

/** @type {import('./activity-types.js').ActivityModule} */
const exitTicket = {
  type: 'exit-ticket',

  supportsMode(mode) {
    return mode === 'teacher' || mode === 'student';
  },

  mount(container, exercise, context, store) {
    const exerciseWithAssessment = { ...exercise, feedbackMode: 'assessment' };

    return mountItemFlow(container, exerciseWithAssessment, context, store, {
      extraClass: 'activity--exit-ticket',

      renderBody(item) {
        const word = store.getWord(item.wordId);
        if (!word) return `<p class="status-message status-message--error">Chybí slovo</p>`;

        const options = item.optionPatternIds.map((id) => store.getPattern(id)).filter(Boolean);

        return `
          <div class="activity__word activity__word--compact">
            <p class="activity__spelling" lang="en">${escapeHtml(word.spelling)}</p>
            <p class="activity__ipa" aria-label="IPA">${escapeHtml(word.ipa)}</p>
          </div>
          <p class="activity__prompt">${escapeHtml(item.prompt?.cs ?? context.t('exitTicketPrompt'))}</p>
          <div class="activity__options" role="group">
            ${options
              .map(
                (pat) => `
              <button type="button" class="option-btn" data-value="${escapeAttr(pat.id)}">
                ${escapeHtml(formatPatternLabel(pat))}
              </button>`
              )
              .join('')}
          </div>`;
      },

      bindItem(ui, _item, handlers) {
        ui.querySelectorAll('.option-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            ui.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            handlers.onSelect(btn.getAttribute('data-value'));
          });
        });
      },

      checkItem(item, userInput) {
        const patternId = String(userInput);
        const result = checkSingleChoice(patternId, item.correctPatternId);
        const word = store.getWord(item.wordId);
        return {
          correct: result.correct,
          userLabel: formatPatternLabel(store.getPattern(patternId)),
          correctLabel: formatPatternLabel(store.getPattern(item.correctPatternId)),
          explanation: item.explanation?.cs ?? '',
          prompt: item.prompt?.cs ?? word?.spelling ?? '',
        };
      },

      applyResult() {
        /* Assessment mode – no per-item visual reveal */
      },
    });
  },
};

export default exitTicket;
