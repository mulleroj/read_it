/**
 * M8.1 – Local-only mapping from word IDs to TTSMaker MP3 files (voice 2402 Robert).
 * Separate from M6A.2 Piper/Alba WAV bank in tools/audio-prototype/output/.
 * Not part of public content JSON. PUBLIC AUDIO RELEASE remains BLOCKED.
 *
 * MP3 files live at tools/audio-prototype/ttsmaker-2402/{spelling}.mp3 (gitignored).
 */

/** @type {Readonly<Record<string, string>>} wordId → MP3 basename (spelling) */
export const LOCAL_PROTOTYPE_WORD_FILES = Object.freeze({
  'w-rain': 'rain',
  'w-day': 'day',
  'w-car': 'car',
  'w-bird': 'bird',
  'w-coin': 'coin',
  'w-cow': 'cow',
  'w-city': 'city',
  'w-gym': 'gym',
  'w-happy': 'happy',
  'w-letter': 'letter',
  'w-tree': 'tree',
  'w-bell': 'bell',
  'w-clock': 'clock',
  'w-gift': 'gift',
  'w-boat': 'boat',
  'w-wait': 'wait',
  'w-chain': 'chain',
  'w-play': 'play',
  'w-grey': 'grey',
  'w-see': 'see',
  'w-bee': 'bee',
  'w-coat': 'coat',
  'w-road': 'road',
  'w-light': 'light',
  'w-night': 'night',
  'w-high': 'high',
});

export const LOCAL_PROTOTYPE_AUDIO_DIR = 'tools/audio-prototype/ttsmaker-2402';
export const LOCAL_PROTOTYPE_AUDIO_EXT = '.mp3';

const LOCAL_AUDIO_SESSION_KEY = 'readit-local-audio';

/**
 * Strict localhost only – prototype audio is never enabled on LAN pilot hosts.
 * @param {string} hostname
 */
export function isLocalhostAudioHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/**
 * Localhost or private LAN – used for share/QR hints, not for serving prototype audio.
 * @param {string} hostname
 */
export function isLocalDevHostname(hostname) {
  return (
    isLocalhostAudioHost(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/** @type {Set<string>} */
let availableWordIds = new Set();

/** @type {boolean | null} */
let enabled = null;

/** @type {boolean | null} */
let enabledOverride = null;

/** @type {HTMLAudioElement | null} */
let audioElement = null;

/**
 * @param {string} wordId
 * @param {string} [root] URL prefix (e.g. '' or '/subdir')
 */
export function getLocalPrototypeAudioUrl(wordId, root = '') {
  const basename = LOCAL_PROTOTYPE_WORD_FILES[wordId];
  if (!basename) return null;

  const normalizedRoot = root.replace(/\/$/, '');
  const relativePath = `${LOCAL_PROTOTYPE_AUDIO_DIR}/${basename}${LOCAL_PROTOTYPE_AUDIO_EXT}`;
  return normalizedRoot ? `${normalizedRoot}/${relativePath}` : relativePath;
}

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

/**
 * Resolve local prototype mode from URL (?localAudio=1|0) and sessionStorage.
 * Default: enabled on localhost/127.0.0.1 only; disabled on public hosts.
 * @param {Pick<Location, 'hostname' | 'search'>} [location]
 */
export function syncLocalPrototypeAudioFromLocation(location = globalThis.location) {
  if (!location) {
    enabled = false;
    return false;
  }

  const onLocalhost = isLocalhostAudioHost(location.hostname);
  const params = new URLSearchParams(location.search);
  if (params.has('localAudio')) {
    const requestedOn = params.get('localAudio') !== '0';
    const nextEnabled = requestedOn && onLocalhost;
    enabled = nextEnabled;
    try {
      sessionStorage.setItem(LOCAL_AUDIO_SESSION_KEY, nextEnabled ? '1' : '0');
    } catch {
      // sessionStorage may be unavailable
    }
    return nextEnabled;
  }

  if (enabled !== null) {
    return isLocalPrototypeAudioEnabled();
  }

  try {
    const stored = sessionStorage.getItem(LOCAL_AUDIO_SESSION_KEY);
    if (stored === '1') {
      enabled = onLocalhost;
      return enabled;
    }
    if (stored === '0') {
      enabled = false;
      return false;
    }
  } catch {
    // ignore
  }

  enabled = onLocalhost;
  return enabled;
}

/** Whether local prototype audio is active for this browser session. */
export function isLocalPrototypeAudioEnabled() {
  if (enabledOverride !== null) return enabledOverride;
  if (enabled === null) syncLocalPrototypeAudioFromLocation();
  return enabled === true;
}

/**
 * Probe which TTSMaker MP3 files are reachable from the current origin.
 * No network requests when local prototype mode is disabled.
 * @param {string} [root]
 * @param {typeof fetch} [fetchFn]
 */
export async function probeLocalPrototypeAudio(root = '', fetchFn = fetch) {
  availableWordIds = new Set();
  if (!isLocalPrototypeAudioEnabled()) {
    return availableWordIds;
  }

  await Promise.all(
    Object.keys(LOCAL_PROTOTYPE_WORD_FILES).map(async (wordId) => {
      const url = getLocalPrototypeAudioUrl(wordId, root);
      if (!url) return;
      if (await probeAudioUrl(url, fetchFn)) {
        availableWordIds.add(wordId);
      }
    })
  );

  return availableWordIds;
}

/** @param {string} wordId */
export function hasLocalPrototypeAudio(wordId) {
  return isLocalPrototypeAudioEnabled() && availableWordIds.has(wordId);
}

/** @returns {ReadonlySet<string>} */
export function getAvailableLocalPrototypeWordIds() {
  return availableWordIds;
}

/**
 * @param {string} wordId
 * @param {string} [root]
 */
export async function playLocalPrototypeAudio(wordId, root = '') {
  if (!hasLocalPrototypeAudio(wordId)) return false;

  const url = getLocalPrototypeAudioUrl(wordId, root);
  if (!url) return false;

  if (!audioElement) {
    audioElement = new Audio();
  }

  audioElement.pause();
  audioElement.src = url;

  try {
    await audioElement.play();
    return true;
  } catch {
    return false;
  }
}

/** @internal test helper */
export function resetLocalPrototypeAudioForTests() {
  availableWordIds = new Set();
  enabled = null;
  enabledOverride = null;
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute('src');
  }
}

/** @internal test helper */
export function markLocalPrototypeAudioAvailable(wordIds) {
  availableWordIds = new Set(wordIds);
}

/** @internal test helper */
export function setLocalPrototypeAudioEnabledForTests(value) {
  enabledOverride = value;
  if (!value) {
    availableWordIds = new Set();
  }
}
