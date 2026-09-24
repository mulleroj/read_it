/**
 * M8.3 – Unified word audio: public TTSMaker MP3 (primary) + localhost intake fallback.
 * Piper/Alba paths are never requested.
 */
import {
  getPublicAudioUrl,
  APPROVED_PUBLIC_AUDIO_BY_WORD_ID,
  PUBLIC_AUDIO_RELEASE_ENABLED,
} from './public-audio-manifest.js';
import {
  probeLocalPrototypeAudio,
  hasLocalPrototypeAudio,
  getLocalPrototypeAudioUrl,
  isLocalPrototypeAudioEnabled,
} from './local-prototype-audio.js';

/** @type {Set<string>} */
let publicAvailableWordIds = new Set();

/** @type {HTMLAudioElement | null} */
let audioElement = null;

/** @type {HTMLElement | null} */
let activeButton = null;

/**
 * @param {string} url
 * @param {typeof fetch} fetchFn
 */
async function probeAudioUrl(url, fetchFn) {
  try {
    let response = await fetchFn(url, { method: 'HEAD' });
    if (response.status === 405 || response.status === 501) {
      response = await fetchFn(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    }
    return response.ok;
  } catch {
    return false;
  }
}

function resetActiveButton() {
  if (activeButton) {
    activeButton.classList.remove('is-playing');
    activeButton.removeAttribute('aria-busy');
    activeButton = null;
  }
}

/**
 * Probe public manifest MP3 and optional localhost intake fallback.
 * @param {string} [root]
 * @param {typeof fetch} [fetchFn]
 */
export async function probeWordAudio(root = '', fetchFn = fetch) {
  publicAvailableWordIds = new Set();

  if (PUBLIC_AUDIO_RELEASE_ENABLED) {
    await Promise.all(
      [...APPROVED_PUBLIC_AUDIO_BY_WORD_ID.keys()].map(async (wordId) => {
        const url = getPublicAudioUrl(wordId, root);
        if (!url) return;
        if (await probeAudioUrl(url, fetchFn)) {
          publicAvailableWordIds.add(wordId);
        }
      })
    );
  }

  if (isLocalPrototypeAudioEnabled()) {
    await probeLocalPrototypeAudio(root, fetchFn);
  }

  return getAvailableWordAudioIds();
}

/** @returns {ReadonlySet<string>} */
export function getAvailableWordAudioIds() {
  const ids = new Set(publicAvailableWordIds);
  if (isLocalPrototypeAudioEnabled()) {
    for (const wordId of Object.keys(LOCAL_PROTOTYPE_WORD_FILES)) {
      if (!ids.has(wordId) && hasLocalPrototypeAudio(wordId)) {
        ids.add(wordId);
      }
    }
  }
  return ids;
}

/** @param {string} wordId */
export function hasWordAudio(wordId) {
  if (publicAvailableWordIds.has(wordId)) return true;
  if (isLocalPrototypeAudioEnabled() && hasLocalPrototypeAudio(wordId)) return true;
  return false;
}

/**
 * @param {string} wordId
 * @param {string} [root]
 */
export function getWordAudioUrl(wordId, root = '') {
  if (publicAvailableWordIds.has(wordId)) {
    return getPublicAudioUrl(wordId, root);
  }
  if (isLocalPrototypeAudioEnabled() && hasLocalPrototypeAudio(wordId)) {
    return getLocalPrototypeAudioUrl(wordId, root);
  }
  return null;
}

/** @param {string} wordId */
export function usesPublicWordAudio(wordId) {
  return publicAvailableWordIds.has(wordId);
}

/**
 * @param {string} wordId
 * @param {string} [root]
 * @param {HTMLElement} [button]
 */
export async function playWordAudio(wordId, root = '', button = null) {
  const url = getWordAudioUrl(wordId, root);
  if (!url) return false;

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener('ended', resetActiveButton);
    audioElement.addEventListener('error', resetActiveButton);
  }

  resetActiveButton();
  if (button) {
    activeButton = button;
    button.classList.add('is-playing');
    button.setAttribute('aria-busy', 'true');
  }

  audioElement.pause();
  audioElement.src = url;

  try {
    await audioElement.play();
    return true;
  } catch {
    resetActiveButton();
    return false;
  }
}

/** @internal */
export function resetWordAudioForTests() {
  publicAvailableWordIds = new Set();
  resetActiveButton();
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute('src');
  }
}

/** @internal */
export function markPublicWordAudioAvailable(wordIds) {
  publicAvailableWordIds = new Set(wordIds);
}
