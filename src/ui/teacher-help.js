import { getTeacherHelpSections } from '../help/teacher-help-content.js';
import { buildReturnHref } from '../help/help-navigation.js';
import { escapeHtml, escapeAttr } from './html-utils.js';

/**
 * @param {HTMLElement} container
 * @param {{ t: Function, returnPath: string }} context
 */
export function mountTeacherHelp(container, context) {
  const sections = getTeacherHelpSections();
  const returnHref = buildReturnHref(context.returnPath);
  const isTeacherReturn = !context.returnPath.startsWith('/student');

  const toc = sections
    .map(
      (s) =>
        `<li><a class="teacher-help__toc-link" href="#help-${escapeAttr(s.id)}" data-toc="${escapeAttr(s.id)}">${escapeHtml(s.title)}</a></li>`
    )
    .join('');

  const body = sections
    .map(
      (s) => `
      <section class="teacher-help__section" id="help-${escapeAttr(s.id)}" data-section-id="${escapeAttr(s.id)}" data-keywords="${escapeAttr(s.keywords ?? '')}">
        <h2 class="teacher-help__section-title">${escapeHtml(s.title)}</h2>
        ${s.html}
      </section>`
    )
    .join('');

  container.innerHTML = `
    <article class="teacher-help" aria-labelledby="teacher-help-title">
      <header class="teacher-help__header">
        <div class="teacher-help__header-row">
          <h1 id="teacher-help-title" class="teacher-help__title">${escapeHtml(context.t('helpTitle'))}</h1>
          <a href="${escapeAttr(returnHref)}" class="btn btn-secondary teacher-help__back">${escapeHtml(
            isTeacherReturn ? context.t('helpBackToLesson') : context.t('helpBackHome')
          )}</a>
        </div>
        <p class="teacher-help__intro">${escapeHtml(context.t('helpIntro'))}</p>
        <label class="teacher-help__search-label">
          <span class="visually-hidden">${escapeHtml(context.t('helpSearchLabel'))}</span>
          <input type="search" class="teacher-help__search" placeholder="${escapeAttr(context.t('helpSearchPlaceholder'))}" autocomplete="off" />
        </label>
      </header>
      <div class="teacher-help__layout">
        <nav class="teacher-help__toc" aria-label="${escapeAttr(context.t('helpTocLabel'))}">
          <h2 class="teacher-help__toc-title">${escapeHtml(context.t('helpTocLabel'))}</h2>
          <ol class="teacher-help__toc-list">${toc}</ol>
        </nav>
        <div class="teacher-help__content">${body}</div>
      </div>
    </article>`;

  const searchInput = container.querySelector('.teacher-help__search');
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    container.querySelectorAll('.teacher-help__section').forEach((section) => {
      if (!query) {
        section.hidden = false;
        return;
      }
      const text = section.textContent?.toLowerCase() ?? '';
      const keywords = section.getAttribute('data-keywords')?.toLowerCase() ?? '';
      section.hidden = !(text.includes(query) || keywords.includes(query));
    });
  });

  return {
    destroy() {
      container.replaceChildren();
    },
  };
}

/**
 * Minimal blocked view for students who reach help during a lesson.
 * @param {HTMLElement} container
 * @param {{ t: Function, returnPath: string }} context
 */
export function mountStudentHelpBlocked(container, context) {
  container.innerHTML = `
    <section class="teacher-help teacher-help--blocked">
      <h1 class="teacher-help__title">${escapeHtml(context.t('helpStudentBlockedTitle'))}</h1>
      <p>${escapeHtml(context.t('helpStudentBlockedText'))}</p>
      <a href="${escapeAttr(buildReturnHref(context.returnPath))}" class="btn btn-primary">${escapeHtml(context.t('helpBackToLesson'))}</a>
    </section>`;

  return {
    destroy() {
      container.replaceChildren();
    },
  };
}
