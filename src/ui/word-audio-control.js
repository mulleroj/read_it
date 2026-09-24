import { hasWordAudio, playWordAudio } from '../audio/word-audio.js';
import { escapeHtml, escapeAttr } from './html-utils.js';

/**
 * @param {string} wordId
 * @param {string} spelling
 * @param {Function} t
 */
export function renderWordAudioButton(wordId, spelling, t) {
  if (!hasWordAudio(wordId)) return '';

  return `<button type="button" class="word-audio-btn" data-audio-word-id="${escapeAttr(wordId)}" aria-label="${escapeAttr(t('audioPlay', { word: spelling }))}">
    <span class="word-audio-btn__icon" aria-hidden="true">▶</span>
    <span class="word-audio-btn__label">${escapeHtml(t('audioListen'))}</span>
  </button>`;
}

/**
 * @param {object} word
 * @param {Function} t
 * @param {{ compact?: boolean }} [options]
 */
export function renderActivityWordBlock(word, t, options = {}) {
  const compactClass = options.compact ? ' activity__word--compact' : '';
  const audio = renderWordAudioButton(word.id, word.spelling, t);

  return `
    <div class="activity__word${compactClass}">
      <div class="activity__word-main">
        <p class="activity__spelling" lang="en">${escapeHtml(word.spelling)}</p>
        <p class="activity__ipa" aria-label="IPA">${escapeHtml(word.ipa)}</p>
      </div>
      ${audio}
    </div>`;
}

/**
 * @param {ParentNode} container
 * @param {string} [root]
 */
export function bindWordAudioButtons(container, root = '') {
  container.querySelectorAll('[data-audio-word-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const wordId = button.getAttribute('data-audio-word-id');
      if (!wordId) return;

      void playWordAudio(wordId, root, button);
    });
  });
}
