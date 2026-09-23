import { calculateScorePercent } from './validator.js';

export const FEEDBACK_PRACTICE = 'practice';
export const FEEDBACK_ASSESSMENT = 'assessment';
export const FEEDBACK_TEACHER = 'teacher';

/**
 * @param {{ feedbackMode?: string }} exercise
 * @param {{ mode: string }} context
 */
export function resolveFeedbackMode(exercise, context) {
  if (context.mode === 'teacher') return FEEDBACK_TEACHER;
  return exercise.feedbackMode === FEEDBACK_ASSESSMENT ? FEEDBACK_ASSESSMENT : FEEDBACK_PRACTICE;
}

/**
 * @param {{ feedbackMode?: string }} exercise
 * @param {{ mode: string }} context
 */
export function getSessionControls(exercise, context) {
  const feedbackMode = resolveFeedbackMode(exercise, context);
  const isTeacher = context.mode === 'teacher';
  const isStudent = context.mode === 'student';

  return {
    feedbackMode,
    isTeacher,
    isStudent,
    showImmediateFeedback: isStudent && feedbackMode === FEEDBACK_PRACTICE,
    deferFeedback: isStudent && feedbackMode === FEEDBACK_ASSESSMENT,
    manualReveal: isTeacher,
  };
}

/**
 * @param {number} itemCount
 * @param {string} feedbackMode
 */
export function createAnswerSession(itemCount, feedbackMode) {
  /** @type {Array<{ correct: boolean, userLabel: string, correctLabel: string, explanation?: string }>} */
  const records = [];

  return {
    feedbackMode,
    itemCount,
    records,
    record(entry) {
      records.push(entry);
    },
    getScore() {
      const correct = records.filter((r) => r.correct).length;
      return {
        correct,
        total: records.length,
        expected: itemCount,
        percent: calculateScorePercent(correct, records.length),
      };
    },
    clear() {
      records.length = 0;
    },
  };
}

/** @param {string} selected @param {string} correct */
export function checkSingleChoice(selected, correct) {
  return { correct: selected === correct };
}

/**
 * @param {Record<string, string>} userAssignments
 * @param {Record<string, string>} correctAssignments
 */
export function checkSortAssignments(userAssignments, correctAssignments) {
  const keys = Object.keys(correctAssignments);
  if (keys.length === 0) return { correct: false, details: [] };

  const details = keys.map((wordId) => ({
    wordId,
    correct: userAssignments[wordId] === correctAssignments[wordId],
  }));

  return {
    correct: details.every((d) => d.correct),
    details,
  };
}

/**
 * @param {string[]} userOrder
 * @param {string[]} correctOrder
 */
export function checkBuildWordOrder(userOrder, correctOrder) {
  if (userOrder.length !== correctOrder.length) {
    return { correct: false };
  }
  const correct = userOrder.every((tile, i) => tile === correctOrder[i]);
  return { correct };
}

/**
 * @param {string} oddWordId
 * @param {string} selectedWordId
 */
export function checkOddOneOut(selectedWordId, oddWordId) {
  return { correct: selectedWordId === oddWordId };
}
