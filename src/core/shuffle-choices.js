import { shuffleTiles } from './shuffle-tiles.js';

/**
 * Stable shuffle for multiple-choice option IDs (same rules as tile shuffle).
 * @param {string[]} choiceIds
 * @param {() => number} [random]
 */
export function shuffleChoiceIds(choiceIds, random = Math.random) {
  return shuffleTiles(choiceIds, random);
}
