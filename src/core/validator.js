/**
 * @param {string} selectedPatternId
 * @param {string} correctPatternId
 * @returns {{ correct: boolean, feedbackKey: 'correct' | 'incorrect' }}
 */
export function checkPatternAnswer(selectedPatternId, correctPatternId) {
  const correct = selectedPatternId === correctPatternId;
  return {
    correct,
    feedbackKey: correct ? 'correct' : 'incorrect',
  };
}

/**
 * @param {number} correctCount
 * @param {number} total
 * @returns {number}
 */
export function calculateScorePercent(correctCount, total) {
  if (total <= 0) return 0;
  return Math.round((correctCount / total) * 100);
}
