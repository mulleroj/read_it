import { APP_VERSION, ACTIVITY_TYPE_LABELS } from './config.js';
import { parseHashRoute, isValidMode } from './router.js';
import { loadContentStore } from './core/content-loader.js';
import { getActivity } from './activities/registry.js';
import { parseLessonFromParams } from './share/url-codec.js';
import { resolveLessonConfig } from './lessons/lesson-config.js';
import { mountLessonPlayer } from './lessons/lesson-player.js';
import { mountLessonBuilder } from './ui/lesson-builder.js';
import { t } from './i18n.js';
import { updateHeaderModeBadge } from './ui/mode-badge.js';
import { getCategoryClass } from './ui/category-styles.js';
import { iconTeacher, iconStudent } from './ui/icons.js';
import { escapeHtml } from './ui/html-utils.js';

/** @type {Awaited<ReturnType<typeof loadContentStore>> | null} */
let contentStore = null;

/** @type {object | null} */
let activeActivity = null;

const mainEl = document.getElementById('main-content');

const CATEGORY_LEGEND = [
  { id: 'cat-vowel-teams', label: 'Vowel Teams', active: true },
  { id: 'cat-r-controlled', label: 'R-Controlled', active: false },
  { id: 'cat-diphthongs', label: 'Diphthongs', active: false },
  { id: 'cat-soft-cg', label: 'Soft C / G', active: false },
  { id: 'cat-double-consonants', label: 'Double Consonants', active: false },
];

init();

async function init() {
  if (!mainEl) return;

  bindNavigation();
  window.addEventListener('hashchange', () => renderRoute());

  mainEl.innerHTML = `<p class="status-message status-message--info">${t('loading')}</p>`;

  try {
    contentStore = await loadContentStore('');
  } catch (err) {
    console.error(err);
    mainEl.innerHTML = `<p class="status-message status-message--error" role="alert">${t('loadError')}</p>`;
    return;
  }

  renderRoute();
}

function bindNavigation() {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', () => {
      requestAnimationFrame(updateNavState);
    });
  });
}

function updateNavState() {
  const { mode } = parseHashRoute(window.location.hash);
  document.body.classList.toggle('mode-teacher', mode === 'teacher');
  document.body.classList.toggle('mode-student', mode === 'student');
  document.body.classList.toggle('mode-builder', mode === 'builder');

  updateHeaderModeBadge(mode, t);

  document.querySelectorAll('[data-route]').forEach((el) => {
    const route = el.getAttribute('data-route');
    el.classList.toggle('is-active', route === mode);
  });
}

function renderRoute() {
  if (!mainEl || !contentStore) return;

  destroyActiveActivity();
  updateNavState();

  const { mode, params } = parseHashRoute(window.location.hash);

  if (!isValidMode(mode)) {
    mainEl.innerHTML = `<p class="status-message status-message--error">${t('unknownRoute')}</p>`;
    return;
  }

  if (mode === 'home') {
    renderHome();
    return;
  }

  if (mode === 'builder') {
    activeActivity = mountLessonBuilder(mainEl, contentStore, { t });
    return;
  }

  const lessonParam = parseLessonFromParams(params, contentStore);
  if (params.get('lesson') || params.get('cfg')) {
    renderLessonMode(mode, lessonParam);
    return;
  }

  const exerciseId = params.get('ex');
  if (!exerciseId) {
    renderExercisePicker(mode);
    return;
  }

  renderExerciseMode(mode, exerciseId);
}

/**
 * @param {'teacher' | 'student'} mode
 * @param {ReturnType<typeof parseLessonFromParams>} lessonParam
 */
function renderLessonMode(mode, lessonParam) {
  if (!mainEl || !contentStore) return;

  if (!lessonParam.ok) {
    mainEl.innerHTML = `<p class="status-message status-message--error" role="alert">${escapeHtml(lessonParam.message)}</p>`;
    return;
  }

  const resolved = resolveLessonConfig(lessonParam.config, contentStore);
  if (!resolved.ok) {
    mainEl.innerHTML = `<p class="status-message status-message--error" role="alert">${escapeHtml(resolved.message)}</p>`;
    return;
  }

  activeActivity = mountLessonPlayer(
    mainEl,
    resolved.config,
    resolved.resolved,
    mode,
    contentStore,
    { t }
  );
}

function renderHome() {
  if (!mainEl || !contentStore) return;

  const legendHtml = CATEGORY_LEGEND.map(
    (cat) => `
    <span class="category-chip ${cat.id} ${cat.active ? '' : 'category-chip--inactive'}">
      <span class="category-chip__dot" aria-hidden="true"></span>
      ${cat.label}${cat.active ? '' : ' (brzy)'}
    </span>`
  ).join('');

  const exercises = [...contentStore.exercisesById.values()].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const exerciseCards = exercises
    .map((ex) => {
      const catClass = getCategoryClass(ex.categoryId);
      const typeLabel = ACTIVITY_TYPE_LABELS[ex.type] ?? ex.type;
      const modeLabel = ex.feedbackMode === 'assessment' ? t('sessionAssessment') : t('sessionPractice');
      return `
        <article class="exercise-card ${catClass}">
          <span class="exercise-card__type">${escapeHtml(typeLabel)}</span>
          <h3 class="exercise-card__title">${escapeHtml(ex.title?.cs ?? ex.id)}</h3>
          <p class="exercise-card__meta">${escapeHtml(modeLabel)}</p>
          <div class="exercise-card__actions">
            <a href="#/teacher?ex=${escapeAttr(ex.id)}" class="btn btn-secondary">${t('modeBadgeTeacher')}</a>
            <a href="#/student?ex=${escapeAttr(ex.id)}" class="btn btn-primary">${t('modeBadgeStudent')}</a>
          </div>
        </article>`;
    })
    .join('');

  const presetCards = [...contentStore.lessonsById.values()]
    .map(
      (lesson) => `
      <article class="exercise-card exercise-card--lesson">
        <span class="exercise-card__type">${escapeHtml(t('homePresetLesson'))}</span>
        <h3 class="exercise-card__title">${escapeHtml(lesson.title?.cs ?? lesson.id)}</h3>
        <p class="exercise-card__meta">${escapeHtml(lesson.description?.cs ?? '')}</p>
        <div class="exercise-card__actions">
          <a href="#/teacher?lesson=${escapeAttr(lesson.id)}" class="btn btn-secondary">${t('modeBadgeTeacher')}</a>
          <a href="#/student?lesson=${escapeAttr(lesson.id)}" class="btn btn-primary">${t('modeBadgeStudent')}</a>
        </div>
      </article>`
    )
    .join('');

  mainEl.innerHTML = `
    <section class="view-home">
      <div class="view-home__hero">
        <h1>${t('homeTitle')}</h1>
        <p class="view-home__subtitle">${t('homeIntro')}</p>
        <span class="view-home__meta">Verze ${APP_VERSION} · obsah ${contentStore.meta.contentVersion}</span>
      </div>
      <div class="category-legend" aria-label="Tematické oblasti">${legendHtml}</div>
      <div class="card-grid">
        <article class="mode-card mode-card--teacher">
          <span class="mode-card__icon" aria-hidden="true">${iconTeacher}</span>
          <h2>Učitel</h2>
          <p>${t('homeTeacherCard')}</p>
          <a href="#/teacher" class="btn btn-primary">${t('startTeacher')}</a>
        </article>
        <article class="mode-card mode-card--student">
          <span class="mode-card__icon" aria-hidden="true">${iconStudent}</span>
          <h2>Student</h2>
          <p>${t('homeStudentCard')}</p>
          <a href="#/student" class="btn btn-primary">${t('startStudent')}</a>
        </article>
        <article class="mode-card mode-card--builder">
          <h2>${t('builderTitle')}</h2>
          <p>${t('homeLessonCard')}</p>
          <a href="#/builder" class="btn btn-primary">${t('homeStartBuilder')}</a>
        </article>
      </div>
      <section class="exercise-list" aria-labelledby="lesson-list-title">
        <h2 id="lesson-list-title" class="exercise-list__title">${t('builderPresets')}</h2>
        <div class="exercise-list__grid">${presetCards}</div>
      </section>
      <section class="exercise-list" aria-labelledby="exercise-list-title">
        <h2 id="exercise-list-title" class="exercise-list__title">${t('homeExerciseList')}</h2>
        <div class="exercise-list__grid">${exerciseCards}</div>
      </section>
    </section>
  `;
}

/**
 * @param {'teacher' | 'student'} mode
 */
function renderExercisePicker(mode) {
  if (!mainEl || !contentStore) return;

  const exercises = [...contentStore.exercisesById.values()].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const cards = exercises
    .map((ex) => {
      const typeLabel = ACTIVITY_TYPE_LABELS[ex.type] ?? ex.type;
      return `
        <a href="#/${mode}?ex=${escapeAttr(ex.id)}" class="exercise-card ${getCategoryClass(ex.categoryId)} exercise-card--link">
          <span class="exercise-card__type">${escapeHtml(typeLabel)}</span>
          <h3 class="exercise-card__title">${escapeHtml(ex.title?.cs ?? ex.id)}</h3>
        </a>`;
    })
    .join('');

  const presetLinks = [...contentStore.lessonsById.values()]
    .map(
      (lesson) => `
      <a href="#/${mode}?lesson=${escapeAttr(lesson.id)}" class="exercise-card exercise-card--link exercise-card--lesson">
        <span class="exercise-card__type">${escapeHtml(t('homePresetLesson'))}</span>
        <h3 class="exercise-card__title">${escapeHtml(lesson.title?.cs ?? lesson.id)}</h3>
      </a>`
    )
    .join('');

  mainEl.innerHTML = `
    <section>
      <h1 class="activity__title">${mode === 'teacher' ? t('modeBadgeTeacher') : t('modeBadgeStudent')} – ${t('homeExerciseList')}</h1>
      <h2 class="exercise-list__subtitle">${escapeHtml(t('builderPresets'))}</h2>
      <div class="exercise-list__grid">${presetLinks}</div>
      <h2 class="exercise-list__subtitle">${escapeHtml(t('homeExerciseList'))}</h2>
      <div class="exercise-list__grid">${cards}</div>
      <p><a href="#/builder" class="btn btn-secondary">${escapeHtml(t('homeStartBuilder'))}</a></p>
    </section>
  `;
}

/**
 * @param {'teacher' | 'student'} mode
 * @param {string} exerciseId
 */
function renderExerciseMode(mode, exerciseId) {
  if (!mainEl || !contentStore) return;

  const exercise = contentStore.getExercise(exerciseId);
  if (!exercise) {
    mainEl.innerHTML = `<p class="status-message status-message--error">${t('activityNotFound')}</p>`;
    return;
  }

  const activity = getActivity(exercise.type);
  if (!activity || !activity.supportsMode(mode)) {
    mainEl.innerHTML = `<p class="status-message status-message--error">${t('activityUnsupported')}</p>`;
    return;
  }

  const host = document.createElement('div');
  host.className = mode === 'teacher' ? 'activity-layout activity-layout--teacher' : 'activity-layout';
  mainEl.replaceChildren(host);

  const activityHost = document.createElement('div');
  activityHost.className = 'activity-host';
  host.appendChild(activityHost);

  if (mode === 'teacher') {
    const panel = document.createElement('aside');
    panel.className = 'teacher-panel';
    panel.setAttribute('aria-label', t('teacherPanelTitle'));
    panel.innerHTML = `
      <h2 class="teacher-panel__title">${iconTeacher} ${t('teacherPanelTitle')}</h2>
      <ul class="teacher-panel__list">
        <li>${t('teacherTip1')}</li>
        <li>${t('teacherTip2')}</li>
        <li>${t('teacherTip3')}</li>
        <li>${t('teacherTip4')}</li>
      </ul>
    `;
    host.appendChild(panel);
  }

  activeActivity = activity.mount(activityHost, exercise, { mode, t }, contentStore);
}

function destroyActiveActivity() {
  if (activeActivity?.destroy) {
    activeActivity.destroy();
  }
  activeActivity = null;
}

/** @param {string} str */
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
