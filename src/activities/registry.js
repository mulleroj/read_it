import findPattern from './find-pattern.js';
import oddOneOut from './odd-one-out.js';
import sortWords from './sort-words.js';
import buildWord from './build-word.js';
import exitTicket from './exit-ticket.js';

/** @type {Map<string, import('./activity-types.js').ActivityModule>} */
const registry = new Map();

/**
 * @param {import('./activity-types.js').ActivityModule} module
 */
export function registerActivity(module) {
  registry.set(module.type, module);
}

/**
 * @param {string} type
 * @returns {import('./activity-types.js').ActivityModule | undefined}
 */
export function getActivity(type) {
  return registry.get(type);
}

/**
 * @returns {string[]}
 */
export function getRegisteredTypes() {
  return [...registry.keys()];
}

registerActivity(findPattern);
registerActivity(oddOneOut);
registerActivity(sortWords);
registerActivity(buildWord);
registerActivity(exitTicket);
