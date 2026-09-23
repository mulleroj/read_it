import { checkSingleChoice } from '../core/evaluation.js';
import { mountItemFlow } from './shared-item-flow.js';
import { escapeHtml, escapeAttr } from '../ui/html-utils.js';

/** @type {import('./activity-types.js').ActivityModule} */
const findPattern = {
  type: 'find-pattern',

  supportsMode(mode) {
    return mode === 'teacher' || mode === 'student';
  },

  mount(container, exercise, context, store) {
    return mountItemFlow(container, exercise, context, store, {
      extraClass: 'activity--find-pattern',

      renderBody(item) {
        const word = store.getWord(item.wordId);
        if (!word) return `<p class="status-message status-message--error">Chybí slovo</p>`;

        const options = item.optionPatternIds.map((id) => store.getPattern(id)).filter(Boolean);

        return `
          <div class="activity__word">
            <p class="activity__spelling" lang="en">${escapeHtml(word.spelling)}</p>
            <p class="activity__ipa" aria-label="IPA">${escapeHtml(word.ipa)}</p>
          </div>
          <p class="activity__prompt">${escapeHtml(context.t('findPatternPrompt'))}</p>
          <div class="activity__options" role="group" aria-label="${escapeAttr(context.t('findPatternOptions'))}">
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
          prompt: word?.spelling ?? '',
        };
      },

      applyResult(ui, item, result, userInput) {
        markOptionButtons(ui, String(userInput), item.correctPatternId);
      },
    });
  },
};

/**
 * @param {HTMLElement} ui
 * @param {string} selectedId
 * @param {string} correctId
 */
export function markOptionButtons(ui, selectedId, correctId) {
  ui.querySelectorAll('.option-btn').forEach((btn) => {
    btn.disabled = true;
    const val = btn.getAttribute('data-value');
    if (val === correctId) btn.classList.add('is-correct');
    else if (val === selectedId) btn.classList.add('is-incorrect');
  });
}

export function formatPatternLabel(pattern) {
  if (!pattern) return '?';
  return `${pattern.graphemes.join(' / ')} ${pattern.phoneme}`;
}

export default findPattern;
