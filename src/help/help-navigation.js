/** @typedef {import('../lessons/lesson-config.js').LessonConfig} LessonConfig */

export const HELP_RETURN_KEY = 'readit-help-return';
export const BUILDER_DRAFT_RESTORE_KEY = 'readit-builder-draft-restore';

/**
 * @param {string} [hash]
 */
export function getCurrentReturnPath(hash = window.location.hash) {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return raw.startsWith('/') ? raw : `/${raw || 'home'}`;
}

/**
 * @param {string} returnPath
 */
export function saveHelpReturn(returnPath) {
  try {
    sessionStorage.setItem(HELP_RETURN_KEY, returnPath);
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * @returns {string}
 */
export function consumeHelpReturn() {
  try {
    const stored = sessionStorage.getItem(HELP_RETURN_KEY);
    sessionStorage.removeItem(HELP_RETURN_KEY);
    if (stored) return stored.startsWith('/') ? stored : `/${stored}`;
  } catch {
    // ignore
  }
  return '/home';
}

/**
 * @param {string} returnPath
 */
export function buildHelpHref(returnPath) {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  return `#/help?return=${encodeURIComponent(path)}`;
}

/**
 * Full page URL for opening help in a new tab without leaving the current view.
 * @param {string} returnPath
 * @param {Pick<Location, 'origin' | 'pathname'>} [location]
 */
export function buildHelpPageUrl(returnPath, location = globalThis.location) {
  const hash = buildHelpHref(returnPath);
  const pathname = location?.pathname || '/';
  const origin = location?.origin || '';
  return `${origin}${pathname}${hash}`;
}

/**
 * @param {URLSearchParams} params
 */
export function resolveHelpReturnPath(params) {
  const encoded = params.get('return');
  if (encoded) {
    try {
      const decoded = decodeURIComponent(encoded);
      if (decoded.startsWith('/')) return decoded;
      return `/${decoded}`;
    } catch {
      // fall through
    }
  }
  return consumeHelpReturn();
}

/**
 * @param {string} returnPath
 */
export function buildReturnHref(returnPath) {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  return `#${path}`;
}

/**
 * Student must not see teacher help during an active lesson.
 * @param {string} returnPath
 */
export function isStudentActiveLessonReturn(returnPath) {
  if (!returnPath.startsWith('/student')) return false;
  const query = returnPath.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  return Boolean(params.get('lesson') || params.get('cfg'));
}

/**
 * @param {LessonConfig} draft
 */
export function snapshotBuilderDraft(draft) {
  try {
    sessionStorage.setItem(BUILDER_DRAFT_RESTORE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota errors
  }
}

/**
 * @returns {LessonConfig | null}
 */
export function readBuilderDraftRestore() {
  try {
    const raw = sessionStorage.getItem(BUILDER_DRAFT_RESTORE_KEY);
    sessionStorage.removeItem(BUILDER_DRAFT_RESTORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
