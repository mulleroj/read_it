import { checkSortAssignments } from '../core/evaluation.js';
import { calculateScorePercent } from '../core/validator.js';
import { mountItemFlow } from './shared-item-flow.js';
import { escapeHtml, escapeAttr } from '../ui/html-utils.js';
import { renderWordAudioButton } from '../ui/word-audio-control.js';

/**
 * @param {object} item
 * @param {object} store
 */
export function formatSortRevealLabel(item, store) {
  return Object.entries(item.correctAssignments)
    .map(([wordId, binId]) => {
      const word = store.getWord(wordId);
      const bin = item.bins.find((b) => b.patternId === binId);
      return `${word?.spelling ?? wordId} → ${bin?.label ?? binId}`;
    })
    .join('; ');
}

/**
 * @param {object} item
 * @param {Record<string, string>} userInput
 * @param {{ mode: string, t: Function }} context
 * @param {object} store
 */
export function createSortWordsCheckResult(item, userInput, context, store) {
  const assignments = userInput;
  const result = checkSortAssignments(assignments, item.correctAssignments);
  const correctCount = result.details.filter((d) => d.correct).length;
  const total = result.details.length;
  const percent = calculateScorePercent(correctCount, total);

  const userLabel = context.t('sortWordsScoreSummary', {
    correct: String(correctCount),
    total: String(total),
    percent: String(percent),
  });
  const revealLabel = formatSortRevealLabel(item, store);

  return {
    correct: result.correct,
    scoreOverride: { correct: correctCount, total, percent },
    userLabel,
    correctLabel: revealLabel,
    feedbackText:
      context.mode === 'teacher'
        ? revealLabel
        : result.correct
          ? undefined
          : userLabel,
    explanation: result.correct ? item.explanation?.cs ?? '' : context.t('sortWordsRetry'),
    prompt: item.prompt?.cs ?? '',
    sortDetails: result.details,
  };
}

/**
 * @param {HTMLElement} poolItem
 * @param {'correct' | 'incorrect' | null} status
 * @param {Function} t
 */
function setPoolItemStatus(poolItem, status, t) {
  let statusEl = poolItem.querySelector('.sort-word-status');
  if (!status) {
    statusEl?.remove();
    poolItem.classList.remove('sort-pool-item--correct', 'sort-pool-item--incorrect');
    return;
  }

  if (!statusEl) {
    statusEl = document.createElement('span');
    statusEl.className = 'sort-word-status';
    poolItem.appendChild(statusEl);
  }

  poolItem.classList.toggle('sort-pool-item--correct', status === 'correct');
  poolItem.classList.toggle('sort-pool-item--incorrect', status === 'incorrect');
  statusEl.textContent =
    status === 'correct' ? t('sortWordsWordCorrect') : t('sortWordsWordIncorrect');
}

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
              .map((w) => {
                const audio = renderWordAudioButton(w.id, w.spelling, context.t);
                return `
              <div class="sort-pool-item" data-word-id="${escapeAttr(w.id)}">
                <button type="button" class="word-chip" data-word-id="${escapeAttr(w.id)}" aria-pressed="false">
                  <span lang="en">${escapeHtml(w.spelling)}</span>
                </button>
                ${audio}
              </div>`;
              })
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
        const { t } = context;

        function syncAssignments() {
          handlers.onSelect({ ...assignments });
        }

        function clearSelection() {
          selectedWordId = null;
          ui.querySelectorAll('.word-chip:not(.word-chip--locked)').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-pressed', 'false');
          });
        }

        function selectWord(wordId, btn) {
          if (btn.classList.contains('word-chip--locked')) return;
          selectedWordId = wordId;
          ui.querySelectorAll('.word-chip:not(.word-chip--locked)').forEach((c) => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-selected');
          btn.setAttribute('aria-pressed', 'true');
          syncAssignments();
        }

        function getPoolItem(wordId) {
          return ui.querySelector(`.sort-pool-item[data-word-id="${wordId}"]`);
        }

        function assignSelectedToBin(binId) {
          if (!selectedWordId) return;

          assignments[selectedWordId] = binId;
          const poolItem = getPoolItem(selectedWordId);
          const binWords = ui.querySelector(`[data-bin-words="${binId}"]`);
          if (poolItem && binWords) {
            setPoolItemStatus(poolItem, null, t);
            poolItem.dataset.assignedBin = binId;
            binWords.appendChild(poolItem);
          }

          selectedWordId = null;
          syncAssignments();

          const nextChip = pool?.querySelector('.word-chip:not(.word-chip--locked):not([disabled])');
          if (nextChip instanceof HTMLElement) nextChip.focus();
        }

        function returnWordToPool(wordId) {
          const poolItem = getPoolItem(wordId);
          if (!poolItem || poolItem.classList.contains('sort-pool-item--locked')) return;

          delete assignments[wordId];
          delete poolItem.dataset.assignedBin;
          setPoolItemStatus(poolItem, null, t);
          pool?.appendChild(poolItem);
          syncAssignments();
        }

        pool?.querySelectorAll('.word-chip').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const wordId = btn.getAttribute('data-word-id') ?? '';
            const poolItem = btn.closest('.sort-pool-item');
            if (poolItem?.dataset.assignedBin) {
              returnWordToPool(wordId);
              return;
            }
            selectWord(wordId, btn);
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
        return createSortWordsCheckResult(
          item,
          /** @type {Record<string, string>} */ (userInput),
          context,
          store
        );
      },

      applyResult(ui, item, result) {
        const details = result.sortDetails ?? [];
        markWordResults(ui, details, context.t);

        if (result.correct) {
          ui.querySelectorAll('.word-chip, .btn-bin-assign, .btn-check-sort').forEach((el) => {
            el.disabled = true;
          });
          return;
        }

        const checkBtn = ui.querySelector('.btn-check-sort');
        if (checkBtn instanceof HTMLButtonElement) {
          checkBtn.disabled = false;
        }
      },
    });
  },
};

/**
 * @param {HTMLElement} ui
 * @param {Array<{ wordId: string, correct: boolean }>} details
 * @param {Function} t
 */
function markWordResults(ui, details, t) {
  details.forEach(({ wordId, correct }) => {
    const poolItem = ui.querySelector(`.sort-pool-item[data-word-id="${wordId}"]`);
    if (!poolItem) return;

    let statusEl = poolItem.querySelector('.sort-word-status');
    if (!statusEl) {
      statusEl = document.createElement('span');
      statusEl.className = 'sort-word-status';
      poolItem.appendChild(statusEl);
    }

    poolItem.classList.toggle('sort-pool-item--correct', correct);
    poolItem.classList.toggle('sort-pool-item--incorrect', !correct);
    statusEl.textContent = correct ? t('sortWordsWordCorrect') : t('sortWordsWordIncorrect');

    const chip = poolItem.querySelector('.word-chip');
    if (correct) {
      poolItem.classList.add('sort-pool-item--locked');
      chip?.classList.add('word-chip--locked');
      if (chip instanceof HTMLButtonElement) chip.disabled = true;
    } else {
      poolItem.classList.remove('sort-pool-item--locked');
      chip?.classList.remove('word-chip--locked');
      if (chip instanceof HTMLButtonElement) chip.disabled = false;
    }
  });
}

export default sortWords;
