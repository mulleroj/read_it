import { validateLessonConfig } from '../lessons/lesson-config.js';
import { resolveLessonShareQuery } from '../share/url-codec.js';
import { renderLessonSharePanel } from './lesson-share.js';

/**
 * @typedef {Object} BuilderShareState
 * @property {boolean} valid
 * @property {{ teacher: string, student: string }} launchLinks
 * @property {ReturnType<typeof resolveLessonShareQuery> | null} query
 */

/**
 * Resolves launch links and share query for the current Builder draft.
 * @param {import('../lessons/lesson-config.js').LessonConfig} draft
 * @param {{ getLessonPreset?: (id: string) => object | null }} store
 * @returns {BuilderShareState}
 */
export function resolveBuilderShareState(draft, store) {
  const validation = validateLessonConfig(draft);
  if (!validation.ok) {
    return { valid: false, launchLinks: { teacher: '#', student: '#' }, query: null };
  }

  try {
    const shareConfig = { ...draft, kind: 'custom' };
    const query = resolveLessonShareQuery(shareConfig, store);
    const qs = query.lesson
      ? `lesson=${encodeURIComponent(query.lesson)}`
      : `cfg=${encodeURIComponent(query.cfg ?? '')}`;
    return {
      valid: true,
      launchLinks: {
        teacher: `#/teacher?${qs}`,
        student: `#/student?${qs}`,
      },
      query,
    };
  } catch {
    return { valid: false, launchLinks: { teacher: '#', student: '#' }, query: null };
  }
}

/**
 * Updates visible launch links and QR/share panel to match the current draft.
 * @param {HTMLElement} host Builder root element
 * @param {import('../lessons/lesson-config.js').LessonConfig} draft
 * @param {{ getLessonPreset?: (id: string) => object | null }} store
 * @param {{ t: Function }} context
 * @returns {BuilderShareState}
 */
export function syncBuilderShareOutputs(host, draft, store, context) {
  const state = resolveBuilderShareState(draft, store);

  for (const [selector, href] of [
    ['.btn-launch-teacher', state.launchLinks.teacher],
    ['.btn-launch-student', state.launchLinks.student],
  ]) {
    const link = host.querySelector(selector);
    if (!link) continue;
    link.setAttribute('href', href);
    if (state.valid) {
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
    }
  }

  const shareHost = host.querySelector('.lesson-builder__share-host');
  if (shareHost) {
    if (state.valid) {
      renderLessonSharePanel(shareHost, { ...draft, kind: 'custom' }, context, store);
    } else {
      shareHost.replaceChildren();
    }
  }

  return state;
}
