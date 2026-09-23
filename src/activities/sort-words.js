import { checkSortAssignments } from '../core/evaluation.js';
import { mountItemFlow } from './shared-item-flow.js';
import { escapeHtml } from '../ui/html-utils.js';

/** @type {import('./activity-types.js').ActivityModule} */
const sortWords = {
  type: 'sort-words',

  supportsMode(mode) {
    return mode === 'teacher' || mode === 'student';
  },

  mount(container, exercise, context, store) {
    return mountItemFlow(container, exercise, context, store, {
      extraClass: 'activity--sort-words',
      explicitSubmit: true,

      renderBody(item) {
        const words = item.wordIds.map((id) => store.getWord(id)).filter(Boolean);

        return `
          <p class="activity__prompt">${escapeHtml(item.prompt?.cs ?? context.t('sortWordsPrompt'))}</p>
          <p class="sort-help" id="sort-help-text">${escapeHtml(context.t('sortWordsHelp'))}</p>
          <div class="sort-pool" data-role="pool" aria-label="${escapeHtml(context.t('sortWordsPool'))}" aria-describedby="sort-help-text">
            ${words
              .map(
                (w) => `
              <button type="button" class="word-chip" data-word-id="${escapeHtml(w.id)}" aria-pressed="false">
                <span lang="en">${escapeHtml(w.spelling)}</span>
              </button>`
              )
              .join('')}
          </div>
          <div class="sort-bins" role="group" aria-label="${escapeHtml(context.t('sortWordsBins'))}">
            ${item.bins
              .map(
                (bin) => `
              <div class="sort-bin" data-bin-id="${escapeHtml(bin.patternId)}">
                <div class="sort-bin__head">
                  <span class="sort-bin__label" id="bin-label-${escapeHtml(bin.patternId)}">${escapeHtml(bin.label)}</span>
                  <button type="button" class="btn btn-secondary btn-bin-assign" data-bin-id="${escapeHtml(bin.patternId)}" aria-labelledby="bin-label-${escapeHtml(bin.patternId)}">
                    ${escapeHtml(context.t('sortWordsAssign'))}
                  </button>
                </div>
                <div class="sort-bin__words" data-bin-words="${escapeHtml(bin.patternId)}" aria-live="polite"></div>
              </div>`
              )
              .join('')}
          </div>
          ${
            context.mode === 'teacher'
              ? ''
              : `<button type="button" class="btn btn-secondary btn-check-sort">${escapeHtml(context.t('checkAnswer'))}</button>`
          }`;
      },

      bindItem(ui, item, handlers) {
        /** @type {string|null} */
        let selectedWordId = null;
        /** @type {Record<string, string>} */
        const assignments = {};

        const pool = ui.querySelector('[data-role="pool"]');

        function syncAssignments() {
          handlers.onSelect({ ...assignments });
        }

        function clearSelection() {
          selectedWordId = null;
          ui.querySelectorAll('.word-chip').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-pressed', 'false');
          });
        }

        function selectWord(wordId, btn) {
          selectedWordId = wordId;
          ui.querySelectorAll('.word-chip').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-selected');
          btn.setAttribute('aria-pressed', 'true');
          syncAssignments();
        }

        function assignSelectedToBin(binId) {
          if (!selectedWordId) return;

          assignments[selectedWordId] = binId;

          const chip = pool?.querySelector(`[data-word-id="${selectedWordId}"]`);
          if (chip) {
            chip.disabled = true;
            chip.hidden = true;
            chip.classList.remove('is-selected');
            chip.setAttribute('aria-pressed', 'false');
          }

          const binWords = ui.querySelector(`[data-bin-words="${binId}"]`);
          const word = store.getWord(selectedWordId);
          if (binWords && word) {
            const tag = document.createElement('span');
            tag.className = 'sort-bin__tag';
            tag.textContent = word.spelling;
            tag.setAttribute('data-word-id', selectedWordId);
            binWords.appendChild(tag);
          }

          selectedWordId = null;
          syncAssignments();

          const nextChip = pool?.querySelector('.word-chip:not([disabled])');
          if (nextChip) nextChip.focus();
        }

        pool?.querySelectorAll('.word-chip').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            selectWord(btn.getAttribute('data-word-id') ?? '', btn);
          });
        });

        ui.querySelectorAll('.btn-bin-assign').forEach((btn) => {
          btn.addEventListener('click', () => {
            assignSelectedToBin(btn.getAttribute('data-bin-id') ?? '');
          });
        });

        ui.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && selectedWordId) {
            e.preventDefault();
            clearSelection();
          }
        });

        ui.querySelector('.btn-check-sort')?.addEventListener('click', () => {
          handlers.onSubmit({ ...assignments });
        });
      },

      canSubmit(item, userInput) {
        const assignments = /** @type {Record<string, string>} */ (userInput);
        return Object.keys(item.correctAssignments).every((id) => assignments[id]);
      },

      checkItem(item, userInput) {
        const assignments = /** @type {Record<string, string>} */ (userInput);
        const result = checkSortAssignments(assignments, item.correctAssignments);
        return {
          correct: result.correct,
          userLabel: context.t('sortWordsResult', {
            correct: String(result.details.filter((d) => d.correct).length),
            total: String(result.details.length),
          }),
          correctLabel: context.t('sortWordsAllCorrect'),
          explanation: result.correct ? item.explanation?.cs ?? '' : context.t('sortWordsRetry'),
          prompt: item.prompt?.cs ?? '',
        };
      },

      applyResult(ui, _item, result) {
        ui.querySelectorAll('.word-chip, .btn-bin-assign, .btn-check-sort').forEach((el) => {
          el.disabled = true;
        });
        if (!result.correct) {
          ui.querySelectorAll('.sort-bin').forEach((bin) => {
            bin.classList.add('sort-bin--wrong');
          });
        }
      },
    });
  },
};

export default sortWords;
