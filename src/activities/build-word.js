import { checkBuildWordOrder } from '../core/evaluation.js';
import { shuffleTiles } from '../core/shuffle-tiles.js';
import { mountItemFlow } from './shared-item-flow.js';
import { escapeHtml } from '../ui/html-utils.js';
import { renderWordAudioButton } from '../ui/word-audio-control.js';

/** @type {import('./activity-types.js').ActivityModule} */
const buildWord = {
  type: 'build-word',

  supportsMode(mode) {
    return mode === 'teacher' || mode === 'student';
  },

  mount(container, exercise, context, store) {
    return mountItemFlow(container, exercise, context, store, {
      extraClass: 'activity--build-word',
      explicitSubmit: true,

      renderBody(item) {
        const target = store.getWord(item.targetWordId);
        const shuffled = shuffleTiles([...item.tiles]);
        const targetAudio = target ? renderWordAudioButton(target.id, target.spelling, context.t) : '';

        return `
          ${targetAudio ? `<div class="build-word-audio">${targetAudio}</div>` : ''}
          <p class="activity__prompt">${escapeHtml(item.prompt?.cs ?? context.t('buildWordPrompt'))}</p>
          <div class="build-area" aria-live="polite">
            <div class="build-area__slots" data-role="built" aria-label="${escapeHtml(context.t('buildWordBuilt'))}"></div>
            <div class="build-area__tiles" data-role="pool" aria-label="${escapeHtml(context.t('buildWordTiles'))}">
              ${shuffled
                .map(
                  (tile, idx) => `
                <button type="button" class="tile-btn" data-tile="${escapeHtml(tile)}" data-pool-index="${idx}">
                  ${escapeHtml(tile)}
                </button>`
                )
                .join('')}
            </div>
          </div>
          <p class="build-area__hint" data-role="hint">${target ? escapeHtml(context.t('buildWordHint', { ipa: target.ipa })) : ''}</p>
          ${
            context.mode === 'teacher'
              ? ''
              : `<button type="button" class="btn btn-secondary btn-check-build">${escapeHtml(context.t('checkAnswer'))}</button>`
          }`;
      },

      bindItem(ui, item, handlers) {
        /** @type {string[]} */
        const built = [];
        const builtEl = ui.querySelector('[data-role="built"]');
        const poolEl = ui.querySelector('[data-role="pool"]');

        function renderBuilt() {
          if (!builtEl) return;
          builtEl.innerHTML =
            built.length === 0
              ? `<span class="build-area__empty">${escapeHtml(context.t('buildWordEmpty'))}</span>`
              : built
                  .map(
                    (tile, i) => `
              <button type="button" class="tile-btn tile-btn--placed" data-built-index="${i}">
                ${escapeHtml(tile)}
              </button>`
                  )
                  .join('');

          builtEl.querySelectorAll('.tile-btn--placed').forEach((btn) => {
            btn.addEventListener('click', () => {
              const idx = Number(btn.getAttribute('data-built-index'));
              const tile = built.splice(idx, 1)[0];
              if (poolEl && tile) {
                const poolBtn = document.createElement('button');
                poolBtn.type = 'button';
                poolBtn.className = 'tile-btn';
                poolBtn.dataset.tile = tile;
                poolBtn.textContent = tile;
                poolBtn.addEventListener('click', () => addTile(tile, poolBtn));
                poolEl.appendChild(poolBtn);
              }
              renderBuilt();
              notify();
            });
          });
        }

        function addTile(tile, btn) {
          built.push(tile);
          btn.remove();
          renderBuilt();
          notify();
        }

        function notify() {
          handlers.onSelect([...built]);
        }

        function trySubmit() {
          if (built.length !== item.correctOrder.length) return;
          handlers.onSubmit([...built]);
        }

        poolEl?.querySelectorAll('.tile-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            addTile(btn.getAttribute('data-tile') ?? '', btn);
          });
        });

        ui.querySelector('.btn-check-build')?.addEventListener('click', trySubmit);

        renderBuilt();
      },

      checkItem(item, userInput) {
        const order = /** @type {string[]} */ (userInput);
        const result = checkBuildWordOrder(order, item.correctOrder);
        const target = store.getWord(item.targetWordId);
        return {
          correct: result.correct,
          userLabel: order.join(' + ') || '—',
          correctLabel: target?.spelling ?? item.correctOrder.join(''),
          explanation: item.explanation?.cs ?? '',
          prompt: item.prompt?.cs ?? '',
        };
      },

      canSubmit(item, userInput) {
        const order = /** @type {string[]} */ (userInput);
        return Array.isArray(order) && order.length === item.correctOrder.length;
      },

      applyResult(ui, item, result) {
        ui.querySelectorAll('.tile-btn, .btn-check-build').forEach((el) => {
          el.disabled = true;
        });
        const hint = ui.querySelector('[data-role="hint"]');
        if (hint && !result.correct) {
          const target = store.getWord(item.targetWordId);
          hint.textContent = context.t('buildWordReveal', { word: target?.spelling ?? '' });
        }
      },
    });
  },
};

export default buildWord;
