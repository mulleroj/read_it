import { checkOddOneOut } from '../core/evaluation.js';
import { mountItemFlow } from './shared-item-flow.js';
import { markOptionButtons } from './find-pattern.js';
import { escapeHtml } from '../ui/html-utils.js';

/** @type {import('./activity-types.js').ActivityModule} */
const oddOneOut = {
  type: 'odd-one-out',

  supportsMode(mode) {
    return mode === 'teacher' || mode === 'student';
  },

  mount(container, exercise, context, store) {
    return mountItemFlow(container, exercise, context, store, {
      extraClass: 'activity--odd-one-out',

      renderBody(item) {
        const words = item.wordIds.map((id) => store.getWord(id)).filter(Boolean);

        return `
          <p class="activity__prompt activity__prompt--strong">${escapeHtml(item.prompt?.cs ?? '')}</p>
          <div class="activity__options activity__options--words" role="group" aria-label="${escapeHtml(context.t('oddOneOutOptions'))}">
            ${words
              .map(
                (w) => `
              <button type="button" class="option-btn option-btn--word" data-value="${escapeHtml(w.id)}">
                <span class="option-btn__word" lang="en">${escapeHtml(w.spelling)}</span>
                <span class="option-btn__ipa">${escapeHtml(w.ipa)}</span>
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
        const wordId = String(userInput);
        const result = checkOddOneOut(wordId, item.oddWordId);
        const selected = store.getWord(wordId);
        const odd = store.getWord(item.oddWordId);
        return {
          correct: result.correct,
          userLabel: selected?.spelling ?? wordId,
          correctLabel: odd?.spelling ?? item.oddWordId,
          explanation: item.explanation?.cs ?? '',
          prompt: item.prompt?.cs ?? '',
        };
      },

      applyResult(ui, item, _result, userInput) {
        markOptionButtons(ui, String(userInput), item.oddWordId);
      },
    });
  },
};

export default oddOneOut;
