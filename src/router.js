/**
 * Parse hash route: #/student, #/teacher?ex=...
 * @param {string} hash
 * @returns {{ mode: string, params: URLSearchParams }}
 */
export function parseHashRoute(hash) {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const pathPart = raw.startsWith('/') ? raw.slice(1) : raw;
  const [pathSegment = 'home', queryString = ''] = pathPart.split('?');
  const mode = pathSegment || 'home';
  const params = new URLSearchParams(queryString);
  return { mode, params };
}

/**
 * @param {string} mode
 * @param {Record<string, string>} [query]
 */
export function buildHashRoute(mode, query = {}) {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  return `#/${mode}${qs ? `?${qs}` : ''}`;
}

/**
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidMode(mode) {
  return ['home', 'teacher', 'student', 'builder', 'help'].includes(mode);
}
