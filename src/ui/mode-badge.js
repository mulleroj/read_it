import { iconTeacher, iconStudent } from './icons.js';

/**
 * @param {'teacher' | 'student' | 'home'} mode
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function renderModeBadgeHtml(mode, t) {
  if (mode === 'home') return '';

  const isTeacher = mode === 'teacher';
  const icon = isTeacher ? iconTeacher : iconStudent;
  const label = isTeacher ? t('modeBadgeTeacher') : t('modeBadgeStudent');
  const modifier = isTeacher ? 'mode-badge--teacher' : 'mode-badge--student';

  return `<span class="mode-badge ${modifier}">${icon}<span>${label}</span></span>`;
}

/**
 * @param {'teacher' | 'student' | 'home'} mode
 * @param {(key: string) => string} t
 */
export function updateHeaderModeBadge(mode, t) {
  const el = document.getElementById('mode-badge');
  if (!el) return;

  if (mode === 'home' || mode === 'builder') {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }

  el.hidden = false;
  el.innerHTML = renderModeBadgeHtml(mode, t);
}
