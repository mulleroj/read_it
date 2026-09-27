/**
 * @param {string} mode
 * @returns {boolean}
 */
export function shouldHideTeacherNavigation(mode) {
  return mode === 'student';
}
