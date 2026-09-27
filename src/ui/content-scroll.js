/**
 * Move viewport so new main content is visible below the sticky header.
 * @param {ParentNode | null} [scope]
 */
export function scrollToContentStart(scope = document.getElementById('main-content')) {
  if (!scope || !(scope instanceof HTMLElement)) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  const header = document.querySelector('.app-header');
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const offset = headerHeight + 8;

  const focusTarget =
    scope.querySelector(
      '#lesson-title, .activity__word, .activity__prompt, .lesson-overview__title, .activity__title, h1'
    ) ?? scope;

  if (focusTarget instanceof HTMLElement) {
    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
    const top = focusTarget.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    return;
  }

  scope.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/**
 * @param {() => void} updateDom
 * @param {ParentNode | null} [scope]
 */
export function afterContentSwap(updateDom, scope = document.getElementById('main-content')) {
  updateDom();
  requestAnimationFrame(() => {
    scrollToContentStart(scope);
  });
}
