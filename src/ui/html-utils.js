/** @param {string} str */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {string} str */
export function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
