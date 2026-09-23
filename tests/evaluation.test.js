import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveFeedbackMode,
  getSessionControls,
  createAnswerSession,
  checkSingleChoice,
  checkOddOneOut,
  checkSortAssignments,
  checkBuildWordOrder,
  FEEDBACK_PRACTICE,
  FEEDBACK_ASSESSMENT,
  FEEDBACK_TEACHER,
} from '../src/core/evaluation.js';

describe('evaluation', () => {
  it('resolves feedback modes by context', () => {
    const practiceEx = { feedbackMode: FEEDBACK_PRACTICE };
    const assessEx = { feedbackMode: FEEDBACK_ASSESSMENT };

    assert.equal(resolveFeedbackMode(practiceEx, { mode: 'student' }), FEEDBACK_PRACTICE);
    assert.equal(resolveFeedbackMode(assessEx, { mode: 'student' }), FEEDBACK_ASSESSMENT);
    assert.equal(resolveFeedbackMode(assessEx, { mode: 'teacher' }), FEEDBACK_TEACHER);
  });

  it('session controls reflect practice vs assessment', () => {
    const practice = getSessionControls({ feedbackMode: FEEDBACK_PRACTICE }, { mode: 'student' });
    assert.equal(practice.showImmediateFeedback, true);
    assert.equal(practice.deferFeedback, false);

    const assessment = getSessionControls({ feedbackMode: FEEDBACK_ASSESSMENT }, { mode: 'student' });
    assert.equal(assessment.deferFeedback, true);
    assert.equal(assessment.showImmediateFeedback, false);
  });

  it('tracks score in answer session', () => {
    const session = createAnswerSession(3, FEEDBACK_PRACTICE);
    session.record({ correct: true, userLabel: 'a', correctLabel: 'a' });
    session.record({ correct: false, userLabel: 'b', correctLabel: 'c' });
    const score = session.getScore();
    assert.equal(score.correct, 1);
    assert.equal(score.total, 2);
    assert.equal(score.percent, 50);
  });

  it('checks single choice and odd one out', () => {
    assert.equal(checkSingleChoice('pat-ai', 'pat-ai').correct, true);
    assert.equal(checkOddOneOut('w-day', 'w-day').correct, true);
    assert.equal(checkOddOneOut('w-rain', 'w-day').correct, false);
  });

  it('checks sort assignments', () => {
    const result = checkSortAssignments(
      { 'w-rain': 'pat-ai', 'w-day': 'pat-ay' },
      { 'w-rain': 'pat-ai', 'w-day': 'pat-ay' }
    );
    assert.equal(result.correct, true);

    const wrong = checkSortAssignments({ 'w-rain': 'pat-ay' }, { 'w-rain': 'pat-ai' });
    assert.equal(wrong.correct, false);
    assert.equal(wrong.details[0].correct, false);
  });

  it('checks build word order', () => {
    assert.equal(checkBuildWordOrder(['r', 'ai', 'n'], ['r', 'ai', 'n']).correct, true);
    assert.equal(checkBuildWordOrder(['r', 'n', 'ai'], ['r', 'ai', 'n']).correct, false);
  });
});
