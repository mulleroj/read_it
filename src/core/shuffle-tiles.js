/**
 * @param {string[]} a
 * @param {string[]} b
 */
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

/**
 * True when at least one permutation differs from the original order.
 * @param {string[]} tiles
 */
export function hasAlternativeOrder(tiles) {
  if (tiles.length < 2) return false;
  for (let i = 1; i < tiles.length; i += 1) {
    if (tiles[i] !== tiles[0]) return true;
  }
  return false;
}

/**
 * Fisher-Yates shuffle; if result matches original and another order exists, adjust once.
 * @param {string[]} tiles
 * @param {() => number} [random] injectable for tests (returns 0..1)
 */
export function shuffleTiles(tiles, random = Math.random) {
  if (tiles.length <= 1) return [...tiles];

  const copy = [...tiles];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  if (arraysEqual(copy, tiles) && hasAlternativeOrder(tiles)) {
    return ensureDifferentOrder(copy, tiles);
  }

  return copy;
}

/**
 * @param {string[]} shuffled
 * @param {string[]} original
 */
function ensureDifferentOrder(shuffled, original) {
  for (let i = 0; i < shuffled.length - 1; i += 1) {
    if (shuffled[i] !== shuffled[i + 1]) {
      const result = [...shuffled];
      [result[i], result[i + 1]] = [result[i + 1], result[i]];
      if (!arraysEqual(result, original)) return result;
    }
  }

  return [...shuffled.slice(1), shuffled[0]];
}
