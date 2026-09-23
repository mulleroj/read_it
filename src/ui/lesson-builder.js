import {
  createEmptyLessonConfig,
  validateLessonConfig,
  presetToLessonConfig,
  generateLessonId,
} from '../lessons/lesson-config.js';
import { estimateLessonDuration } from '../lessons/duration.js';
import {
  listSavedLessons,
  getSavedLesson,
  saveLesson,
  deleteSavedLesson,
  exportLessonJson,
  importLessonJson,
} from '../core/storage.js';
import { resolveBuilderShareState, syncBuilderShareOutputs } from './builder-share-sync.js';
import { ACTIVITY_TYPE_LABELS } from '../config.js';
import { getCategoryClass } from './category-styles.js';
import { escapeHtml, escapeAttr } from './html-utils.js';
import { iconArrowRight } from './icons.js';

/**
 * @param {HTMLElement} container
 * @param {object} store
 * @param {{ t: Function }} context
 */
export function mountLessonBuilder(container, store, context) {
  /** @type {import('../lessons/lesson-config.js').LessonConfig} */
  let draft = createEmptyLessonConfig({ title: context.t('builderDefaultTitle') });

  const editId = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('edit');
  const presetId = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('preset');

  if (editId) {
    const saved = getSavedLesson(editId);
    if (saved) draft = { ...saved };
  } else if (presetId) {
    const preset = store.getLessonPreset(presetId);
    if (preset) {
      draft = {
        ...presetToLessonConfig(preset),
        id: generateLessonId('custom'),
        kind: 'custom',
        sourcePresetId: preset.id,
      };
    }
  }

  const host = document.createElement('div');
  host.className = 'lesson-builder';
  container.replaceChildren(host);
  render();

  return {
    destroy() {
      container.replaceChildren();
    },
  };

  function render() {
    const exercises = [...store.exercisesById.values()].sort((a, b) => a.id.localeCompare(b.id));
    const duration = estimateLessonDuration(draft, store);
    const savedLessons = listSavedLessons();
    const validation = validateLessonConfig(draft);

    const selectedHtml = draft.exercises
      .map((slot, idx) => {
        const ex = store.getExercise(slot.exerciseId);
        const typeLabel = ex ? ACTIVITY_TYPE_LABELS[ex.type] ?? ex.type : slot.exerciseId;
        return `
          <li class="builder-selected__item" data-index="${idx}">
            <div class="builder-selected__main">
              <span class="builder-selected__order">${idx + 1}</span>
              <div>
                <strong>${escapeHtml(ex?.title?.cs ?? slot.exerciseId)}</strong>
                <span class="builder-selected__meta">${escapeHtml(typeLabel)}</span>
              </div>
            </div>
            <div class="builder-selected__controls">
              <label class="builder-selected__mode">
                <span>${escapeHtml(context.t('builderFeedbackMode'))}</span>
                <select class="builder-feedback-select" data-index="${idx}">
                  <option value="" ${!slot.feedbackMode ? 'selected' : ''}>${escapeHtml(context.t('builderFeedbackDefault'))}</option>
                  <option value="practice" ${slot.feedbackMode === 'practice' ? 'selected' : ''}>${escapeHtml(context.t('sessionPractice'))}</option>
                  <option value="assessment" ${slot.feedbackMode === 'assessment' ? 'selected' : ''}>${escapeHtml(context.t('sessionAssessment'))}</option>
                </select>
              </label>
              <div class="builder-selected__move">
                <button type="button" class="btn btn-secondary btn-move-up" data-index="${idx}" ${idx === 0 ? 'disabled' : ''} aria-label="${escapeAttr(context.t('builderMoveUp'))}">↑</button>
                <button type="button" class="btn btn-secondary btn-move-down" data-index="${idx}" ${idx === draft.exercises.length - 1 ? 'disabled' : ''} aria-label="${escapeAttr(context.t('builderMoveDown'))}">↓</button>
                <button type="button" class="btn btn-secondary btn-remove-ex" data-index="${idx}" aria-label="${escapeAttr(context.t('builderRemove'))}">×</button>
              </div>
            </div>
          </li>`;
      })
      .join('');

    const availableHtml = exercises
      .map((ex) => {
        const already = draft.exercises.some((s) => s.exerciseId === ex.id);
        const typeLabel = ACTIVITY_TYPE_LABELS[ex.type] ?? ex.type;
        return `
          <li class="builder-available__item ${getCategoryClass(ex.categoryId)}">
            <div>
              <strong>${escapeHtml(ex.title?.cs ?? ex.id)}</strong>
              <span class="builder-available__meta">${escapeHtml(typeLabel)} · ${escapeHtml(ex.feedbackMode === 'assessment' ? context.t('sessionAssessment') : context.t('sessionPractice'))}</span>
            </div>
            <button type="button" class="btn btn-secondary btn-add-ex" data-ex-id="${escapeAttr(ex.id)}" ${already ? 'disabled' : ''}>
              ${escapeHtml(already ? context.t('builderAdded') : context.t('builderAdd'))}
            </button>
          </li>`;
      })
      .join('');

    const presets = [...store.lessonsById.values()];
    const presetsHtml = presets
      .map(
        (p) => `
      <article class="builder-preset-card">
        <h3>${escapeHtml(p.title?.cs ?? p.id)}</h3>
        <p>${escapeHtml(p.description?.cs ?? '')}</p>
        <a href="#/builder?preset=${escapeAttr(p.id)}" class="btn btn-secondary">${escapeHtml(context.t('builderLoadPreset'))}</a>
      </article>`
      )
      .join('');

    const savedHtml = savedLessons
      .map(
        (lesson) => `
      <li class="builder-saved__item">
        <a href="#/builder?edit=${escapeAttr(lesson.id)}" class="builder-saved__link">${escapeHtml(lesson.title || lesson.id)}</a>
        <button type="button" class="btn btn-secondary btn-delete-saved" data-id="${escapeAttr(lesson.id)}">${escapeHtml(context.t('builderDelete'))}</button>
      </li>`
      )
      .join('');

    const durationWarning =
      duration.status === 'short'
        ? `<p class="lesson-warning" role="status">${escapeHtml(context.t('lessonDurationShort', { gap: String(Math.abs(duration.contentGap)) }))}</p>`
        : '';

    const launchLinks = resolveBuilderShareState(draft, store).launchLinks;

    host.innerHTML = `
      <header class="lesson-builder__header">
        <h1 class="lesson-builder__title">${escapeHtml(context.t('builderTitle'))}</h1>
        <p class="lesson-builder__intro">${escapeHtml(context.t('builderIntro'))}</p>
      </header>

      <div class="lesson-builder__layout">
        <section class="lesson-builder__panel" aria-labelledby="builder-form-title">
          <h2 id="builder-form-title" class="lesson-builder__section-title">${escapeHtml(context.t('builderConfigure'))}</h2>
          <div class="builder-form">
            <label class="builder-form__field">
              <span>${escapeHtml(context.t('builderLessonTitle'))}</span>
              <input type="text" class="builder-title-input" value="${escapeAttr(draft.title)}" required />
            </label>
            <label class="builder-form__field">
              <span>${escapeHtml(context.t('builderLessonDescription'))}</span>
              <textarea class="builder-desc-input" rows="2">${escapeHtml(draft.description ?? '')}</textarea>
            </label>
            <label class="builder-form__field builder-form__field--inline">
              <span>${escapeHtml(context.t('lessonPlanned'))}</span>
              <input type="number" class="builder-planned-input" min="5" max="120" value="${draft.plannedMinutes ?? 30}" />
              <span>min</span>
            </label>
          </div>

          <div class="builder-duration">
            <h3>${escapeHtml(context.t('lessonDurationLabel'))}</h3>
            <p>${escapeHtml(context.t('builderDurationSummary', {
              activity: String(duration.activityMinutes),
              total: String(duration.totalEstimated),
              planned: String(duration.plannedMinutes),
            }))}</p>
            <p class="builder-duration__note">${escapeHtml(context.t('lessonDurationDisclaimer'))}</p>
            ${durationWarning}
          </div>

          <h3 class="lesson-builder__section-title">${escapeHtml(context.t('builderSelected'))}</h3>
          ${
            draft.exercises.length
              ? `<ol class="builder-selected__list">${selectedHtml}</ol>`
              : `<p class="builder-empty">${escapeHtml(context.t('builderEmpty'))}</p>`
          }

          <div class="builder-actions">
            <button type="button" class="btn btn-primary btn-save-lesson">${escapeHtml(context.t('builderSave'))}</button>
            <button type="button" class="btn btn-secondary btn-export-lesson">${escapeHtml(context.t('builderExport'))}</button>
            <label class="btn btn-secondary builder-import-label">
              ${escapeHtml(context.t('builderImport'))}
              <input type="file" class="builder-import-input" accept="application/json,.json" hidden />
            </label>
            <a href="${escapeAttr(launchLinks.teacher)}" class="btn btn-secondary btn-launch-teacher" ${!validation.ok ? 'aria-disabled="true" tabindex="-1"' : ''}>${iconArrowRight} ${escapeHtml(context.t('builderLaunchTeacher'))}</a>
            <a href="${escapeAttr(launchLinks.student)}" class="btn btn-primary btn-launch-student" ${!validation.ok ? 'aria-disabled="true" tabindex="-1"' : ''}>${escapeHtml(context.t('builderLaunchStudent'))}</a>
          </div>
          <p class="builder-status" role="status" aria-live="polite"></p>
        </section>

        <section class="lesson-builder__panel" aria-labelledby="builder-available-title">
          <h2 id="builder-available-title" class="lesson-builder__section-title">${escapeHtml(context.t('builderAvailable'))}</h2>
          <ul class="builder-available__list">${availableHtml}</ul>
        </section>
      </div>

      <section class="lesson-builder__presets" aria-labelledby="builder-presets-title">
        <h2 id="builder-presets-title" class="lesson-builder__section-title">${escapeHtml(context.t('builderPresets'))}</h2>
        <div class="builder-presets__grid">${presetsHtml}</div>
      </section>

      <section class="lesson-builder__saved" aria-labelledby="builder-saved-title">
        <h2 id="builder-saved-title" class="lesson-builder__section-title">${escapeHtml(context.t('builderSaved'))}</h2>
        <p class="builder-saved__note">${escapeHtml(context.t('builderSavedNote'))}</p>
        ${savedLessons.length ? `<ul class="builder-saved__list">${savedHtml}</ul>` : `<p>${escapeHtml(context.t('builderNoSaved'))}</p>`}
      </section>

      <div class="lesson-builder__share-host"></div>`;

    bindEvents();
    syncBuilderShareOutputs(host, draft, store, context);
  }

  function bindEvents() {
    host.querySelector('.builder-title-input')?.addEventListener('input', (e) => {
      draft.title = /** @type {HTMLInputElement} */ (e.target).value;
      syncBuilderShareOutputs(host, draft, store, context);
    });
    host.querySelector('.builder-desc-input')?.addEventListener('input', (e) => {
      draft.description = /** @type {HTMLTextAreaElement} */ (e.target).value;
      syncBuilderShareOutputs(host, draft, store, context);
    });
    host.querySelector('.builder-planned-input')?.addEventListener('input', (e) => {
      draft.plannedMinutes = Number(/** @type {HTMLInputElement} */ (e.target).value) || 30;
      render();
    });

    host.querySelectorAll('.btn-add-ex').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ex-id');
        if (!id || draft.exercises.some((s) => s.exerciseId === id)) return;
        draft.exercises.push({ exerciseId: id });
        render();
      });
    });

    host.querySelectorAll('.btn-remove-ex').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        draft.exercises.splice(idx, 1);
        render();
      });
    });

    host.querySelectorAll('.btn-move-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        if (idx <= 0) return;
        [draft.exercises[idx - 1], draft.exercises[idx]] = [draft.exercises[idx], draft.exercises[idx - 1]];
        render();
      });
    });

    host.querySelectorAll('.btn-move-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        if (idx >= draft.exercises.length - 1) return;
        [draft.exercises[idx + 1], draft.exercises[idx]] = [draft.exercises[idx], draft.exercises[idx + 1]];
        render();
      });
    });

    host.querySelectorAll('.builder-feedback-select').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const idx = Number(/** @type {HTMLSelectElement} */ (e.target).dataset.index);
        const value = /** @type {HTMLSelectElement} */ (e.target).value;
        if (draft.exercises[idx]) {
          draft.exercises[idx].feedbackMode = value ? /** @type {'practice' | 'assessment'} */ (value) : undefined;
          syncBuilderShareOutputs(host, draft, store, context);
        }
      });
    });

    host.querySelector('.btn-save-lesson')?.addEventListener('click', () => {
      const validation = validateLessonConfig(draft);
      if (!validation.ok) {
        setStatus(validation.message, true);
        return;
      }
      saveLesson({ ...draft, kind: 'custom' });
      setStatus(context.t('builderSavedOk'));
      render();
    });

    host.querySelector('.btn-export-lesson')?.addEventListener('click', () => {
      const validation = validateLessonConfig(draft);
      if (!validation.ok) {
        setStatus(validation.message, true);
        return;
      }
      const blob = new Blob([exportLessonJson({ ...draft, kind: 'custom' })], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${draft.id}.readit.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    host.querySelector('.builder-import-input')?.addEventListener('change', async (e) => {
      const file = /** @type {HTMLInputElement} */ (e.target).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = importLessonJson(text);
        const validation = validateLessonConfig(parsed);
        if (!validation.ok) {
          setStatus(validation.message, true);
          return;
        }
        draft = { ...validation.config, id: generateLessonId('custom'), kind: 'custom' };
        setStatus(context.t('builderImportOk'));
        render();
      } catch {
        setStatus(context.t('builderImportError'), true);
      }
    });

    host.querySelectorAll('.btn-delete-saved').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) deleteSavedLesson(id);
        render();
      });
    });
  }

  /** @param {string} msg @param {boolean} [isError] */
  function setStatus(msg, isError = false) {
    const el = host.querySelector('.builder-status');
    if (el) {
      el.textContent = msg;
      el.className = isError ? 'builder-status builder-status--error' : 'builder-status';
    }
  }
}
