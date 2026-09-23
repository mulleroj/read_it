import { getActivity } from '../activities/registry.js';
import { applySlotOverrides } from './lesson-config.js';
import { estimateLessonDuration } from './duration.js';
import {
  isAssessmentExercise,
  renderLessonTeacherNotesOverview,
  renderLessonTeacherNotesPanel,
} from './lesson-teacher-notes.js';
import { escapeHtml } from '../ui/html-utils.js';
import { iconArrowRight, iconCheck, iconTrophy } from '../ui/icons.js';

/**
 * @param {HTMLElement} container
 * @param {import('./lesson-config.js').LessonConfig} config
 * @param {Array<{ slot: import('./lesson-config.js').LessonExerciseSlot, exercise: object }>} resolved
 * @param {'teacher' | 'student'} mode
 * @param {object} store
 * @param {{ t: Function }} context
 */
export function mountLessonPlayer(container, config, resolved, mode, store, context) {
  let step = 'overview';
  let exerciseIndex = 0;
  /** @type {{ destroy?: () => void } | null} */
  let activeActivity = null;

  const host = document.createElement('div');
  host.className = mode === 'teacher' ? 'lesson-player lesson-player--teacher' : 'lesson-player';
  container.replaceChildren(host);

  render();

  return {
    destroy() {
      destroyActivity();
      container.replaceChildren();
    },
  };

  function render() {
    destroyActivity();

    if (step === 'overview') {
      host.innerHTML = renderOverview();
      bindOverviewEvents();
      return;
    }

    if (step === 'complete') {
      host.innerHTML = renderComplete();
      host.querySelector('.btn-lesson-restart')?.addEventListener('click', () => {
        step = 'overview';
        exerciseIndex = 0;
        render();
      });
      host.querySelector('.btn-back-builder')?.addEventListener('click', () => {
        window.location.hash = '#/builder';
      });
      return;
    }

    renderExerciseStep();
  }

  function renderOverview() {
    const duration = estimateLessonDuration(config, store);
    const warning =
      duration.status === 'short'
        ? `<p class="lesson-warning" role="status">${escapeHtml(context.t('lessonDurationShort', { gap: String(Math.abs(duration.contentGap)) }))}</p>`
        : duration.status === 'long'
          ? `<p class="lesson-warning lesson-warning--info" role="status">${escapeHtml(context.t('lessonDurationLong'))}</p>`
          : '';

    const items = resolved
      .map(
        (entry, idx) => `
      <li class="lesson-sequence__item">
        <span class="lesson-sequence__index">${idx + 1}</span>
        <span class="lesson-sequence__title">${escapeHtml(entry.exercise.title?.cs ?? entry.exercise.id)}</span>
        <span class="lesson-sequence__meta">${escapeHtml(context.t('lessonSlotMode', { mode: entry.slot.feedbackMode ?? entry.exercise.feedbackMode ?? 'practice' }))}</span>
      </li>`
      )
      .join('');

    return `
      <section class="lesson-overview" aria-labelledby="lesson-title">
        <header class="lesson-overview__header">
          <p class="session-chip session-chip--${mode === 'teacher' ? 'teacher' : mode === 'student' ? 'practice' : 'assessment'}">${escapeHtml(mode === 'teacher' ? context.t('sessionTeacher') : context.t('sessionStudent'))}</p>
          <h1 id="lesson-title" class="lesson-overview__title">${escapeHtml(config.title)}</h1>
          ${config.description ? `<p class="lesson-overview__desc">${escapeHtml(config.description)}</p>` : ''}
        </header>
        <div class="lesson-duration" aria-label="${escapeHtml(context.t('lessonDurationLabel'))}">
          <h2 class="lesson-duration__title">${escapeHtml(context.t('lessonDurationLabel'))}</h2>
          <dl class="lesson-duration__grid">
            <div><dt>${escapeHtml(context.t('lessonPlanned'))}</dt><dd>${duration.plannedMinutes} min</dd></div>
            <div><dt>${escapeHtml(context.t('lessonEstimatedActivities'))}</dt><dd>${duration.activityMinutes} min</dd></div>
            <div><dt>${escapeHtml(context.t('lessonEstimatedTotal'))}</dt><dd>${duration.totalEstimated} min</dd></div>
            <div><dt>${escapeHtml(context.t('lessonExerciseCount'))}</dt><dd>${duration.exerciseCount}</dd></div>
          </dl>
          <p class="lesson-duration__note">${escapeHtml(context.t('lessonDurationDisclaimer'))}</p>
          ${warning}
        </div>
        ${renderTeacherNotesOverview()}
        <section class="lesson-sequence" aria-labelledby="lesson-sequence-title">
          <h2 id="lesson-sequence-title" class="lesson-sequence__title">${escapeHtml(context.t('lessonSequence'))}</h2>
          <ol class="lesson-sequence__list">${items}</ol>
        </section>
        <div class="lesson-overview__actions">
          <button type="button" class="btn btn-primary btn-start-lesson">
            ${iconArrowRight}
            ${escapeHtml(context.t('lessonStart'))}
          </button>
          ${
            mode === 'teacher'
              ? `<a href="#/builder" class="btn btn-secondary">${escapeHtml(context.t('builderBack'))}</a>`
              : ''
          }
        </div>
      </section>`;
  }

  function bindOverviewEvents() {
    host.querySelector('.btn-start-lesson')?.addEventListener('click', () => {
      step = 'exercise';
      exerciseIndex = 0;
      render();
    });
  }

  function renderExerciseStep() {
    const entry = resolved[exerciseIndex];
    if (!entry) {
      step = 'complete';
      render();
      return;
    }

    const exercise = applySlotOverrides(entry.exercise, entry.slot);
    const activity = getActivity(exercise.type);
    if (!activity || !activity.supportsMode(mode)) {
      host.innerHTML = `<p class="status-message status-message--error">${escapeHtml(context.t('activityUnsupported'))}</p>`;
      return;
    }

    const current = exerciseIndex + 1;
    const total = resolved.length;

    host.innerHTML = `
      <div class="lesson-player__progress">
        <span>${escapeHtml(context.t('lessonProgress', { current: String(current), total: String(total) }))}</span>
        <span class="lesson-player__step-title">${escapeHtml(exercise.title?.cs ?? exercise.id)}</span>
      </div>
      <div class="lesson-player__activity-host"></div>
      <div class="lesson-player__nav">
        ${
          exerciseIndex > 0
            ? `<button type="button" class="btn btn-secondary btn-lesson-prev">${escapeHtml(context.t('lessonPrevExercise'))}</button>`
            : ''
        }
        <button type="button" class="btn btn-primary btn-lesson-next-exercise" ${mode === 'teacher' ? '' : 'disabled'}>
          ${iconArrowRight}
          ${escapeHtml(current === total ? context.t('lessonFinish') : context.t('lessonNextExercise'))}
        </button>
      </div>`;

    const activityHost = host.querySelector('.lesson-player__activity-host');
    if (!activityHost) return;

    if (mode === 'teacher') {
      const layout = document.createElement('div');
      layout.className = 'activity-layout activity-layout--teacher';
      const inner = document.createElement('div');
      inner.className = 'activity-host';
      layout.appendChild(inner);

      const notesHtml = renderTeacherNotesAside(exercise);
      if (notesHtml) {
        layout.insertAdjacentHTML('beforeend', notesHtml);
      } else {
        const panel = document.createElement('aside');
        panel.className = 'teacher-panel';
        panel.setAttribute('aria-label', context.t('teacherPanelTitle'));
        panel.innerHTML = `
          <h2 class="teacher-panel__title">${escapeHtml(context.t('teacherPanelTitle'))}</h2>
          <p class="teacher-panel__lesson-note">${escapeHtml(context.t('lessonTeacherNote'))}</p>
        `;
        layout.appendChild(panel);
      }

      activityHost.appendChild(layout);
      activeActivity = activity.mount(inner, exercise, { mode, t: context.t }, store);
    } else {
      const inner = document.createElement('div');
      inner.className = 'activity-host';
      activityHost.appendChild(inner);
      activeActivity = activity.mount(inner, exercise, { mode, t: context.t }, store);
    }

    if (mode !== 'teacher') {
      watchExerciseCompletion();
    }
    host.querySelector('.btn-lesson-prev')?.addEventListener('click', () => {
      exerciseIndex -= 1;
      render();
    });
    host.querySelector('.btn-lesson-next-exercise')?.addEventListener('click', () => {
      goNextExercise();
    });
  }

  function watchExerciseCompletion() {
    const nextBtn = host.querySelector('.btn-lesson-next-exercise');
    if (!nextBtn) return;

    const observer = new MutationObserver(() => {
      const summary = host.querySelector('.summary, .activity__summary');
      const review = host.querySelector('.review-list');
      if (summary || review) {
        nextBtn.disabled = false;
        observer.disconnect();
      }
    });

    observer.observe(host, { childList: true, subtree: true });
  }

  function goNextExercise() {
    if (exerciseIndex >= resolved.length - 1) {
      step = 'complete';
      render();
      return;
    }
    exerciseIndex += 1;
    render();
  }

  function renderComplete() {
    return `
      <section class="lesson-complete" aria-live="polite">
        <div class="lesson-complete__icon">${iconTrophy}</div>
        <h1 class="lesson-complete__title">${escapeHtml(context.t('lessonCompleteTitle'))}</h1>
        <p class="lesson-complete__text">${escapeHtml(context.t('lessonCompleteText', { title: config.title }))}</p>
        <ul class="lesson-complete__list">
          ${resolved
            .map(
              (entry) =>
                `<li><span class="lesson-complete__check">${iconCheck}</span>${escapeHtml(entry.exercise.title?.cs ?? entry.exercise.id)}</li>`
            )
            .join('')}
        </ul>
        <div class="lesson-complete__actions">
          <button type="button" class="btn btn-primary btn-lesson-restart">${escapeHtml(context.t('lessonRestart'))}</button>
          ${
            mode === 'teacher'
              ? `<a href="#/builder" class="btn btn-secondary btn-back-builder">${escapeHtml(context.t('builderBack'))}</a>`
              : `<a href="#/home" class="btn btn-secondary">${escapeHtml(context.t('navHome'))}</a>`
          }
        </div>
      </section>`;
  }

  function destroyActivity() {
    if (activeActivity?.destroy) activeActivity.destroy();
    activeActivity = null;
  }

  function hasTeacherNotes() {
    return mode === 'teacher' && Boolean(config.teacherNotes?.trim());
  }

  function renderTeacherNotesOverview() {
    if (!hasTeacherNotes()) return '';
    return renderLessonTeacherNotesOverview(config.teacherNotes, context.t('lessonTeacherNotesTitle'));
  }

  /**
   * @param {object} exercise
   * @returns {string}
   */
  function renderTeacherNotesAside(exercise) {
    if (!hasTeacherNotes()) return '';

    const nextEntry = resolved[exerciseIndex + 1];
    const showAssessmentCallout =
      isAssessmentExercise(exercise) ||
      (nextEntry && isAssessmentExercise(applySlotOverrides(nextEntry.exercise, nextEntry.slot)));

    return renderLessonTeacherNotesPanel(config.teacherNotes, {
      title: context.t('lessonTeacherNotesTitle'),
      callout: showAssessmentCallout ? context.t('lessonTeacherNotesCallout') : undefined,
    });
  }
}
