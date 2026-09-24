import { isLocalDevHostname } from '../audio/local-prototype-audio.js';
import { buildLessonShareLinks } from '../share/url-codec.js';
import { renderQrToCanvas, downloadQrCanvas } from '../share/qr.js';
import { escapeHtml, escapeAttr } from './html-utils.js';

/**
 * @param {string} [hostname]
 * @returns {'localhost' | 'lan' | 'public'}
 */
export function resolveShareAccessContext(hostname = window.location.hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    return 'localhost';
  }
  if (isLocalDevHostname(hostname)) {
    return 'lan';
  }
  return 'public';
}

/**
 * @param {Function} t
 * @param {string} [hostname]
 */
export function resolveShareQrHint(t, hostname = window.location.hostname) {
  const context = resolveShareAccessContext(hostname);
  if (context === 'localhost') return t('shareQrHintLocalhost');
  if (context === 'lan') return t('shareQrHintLan');
  return t('shareQrHintPublic');
}

/**
 * @param {HTMLElement} container
 * @param {import('../lessons/lesson-config.js').LessonConfig} config
 * @param {{ t: Function }} context
 * @param {{ getLessonPreset?: (id: string) => object | null }} [store]
 */
export function renderLessonSharePanel(container, config, context, store) {
  const teacherLinks = buildLessonShareLinks(config, 'teacher', undefined, store);
  const studentLinks = buildLessonShareLinks(config, 'student', undefined, store);
  const tooLong = teacherLinks.tooLong || studentLinks.tooLong;
  const accessContext = resolveShareAccessContext();
  const qrHint = resolveShareQrHint(context.t);
  const localhostWarning =
    accessContext === 'localhost'
      ? `<p class="lesson-warning" role="alert">${escapeHtml(context.t('shareAccessLocalhost'))}</p>`
      : '';

  container.innerHTML = `
    <section class="lesson-share" aria-labelledby="lesson-share-title">
      <h2 id="lesson-share-title" class="lesson-share__title">${escapeHtml(context.t('shareTitle'))}</h2>
      ${
        tooLong
          ? `<p class="lesson-warning" role="alert">${escapeHtml(context.t('shareUrlTooLong'))}</p>`
          : ''
      }
      <div class="lesson-share__block">
        <label class="lesson-share__label" for="share-student-url">${escapeHtml(context.t('shareStudentLink'))}</label>
        <div class="lesson-share__row">
          <input id="share-student-url" class="lesson-share__input" type="text" readonly value="${escapeAttr(studentLinks.url)}" />
          <button type="button" class="btn btn-secondary btn-copy-link" data-url="${escapeAttr(studentLinks.url)}">${escapeHtml(context.t('shareCopy'))}</button>
        </div>
      </div>
      <div class="lesson-share__block">
        <label class="lesson-share__label" for="share-teacher-url">${escapeHtml(context.t('shareTeacherLink'))}</label>
        <div class="lesson-share__row">
          <input id="share-teacher-url" class="lesson-share__input" type="text" readonly value="${escapeAttr(teacherLinks.url)}" />
          <button type="button" class="btn btn-secondary btn-copy-link" data-url="${escapeAttr(teacherLinks.url)}">${escapeHtml(context.t('shareCopy'))}</button>
        </div>
      </div>
      ${localhostWarning}
      <div class="lesson-share__qr">
        <h3 class="lesson-share__subtitle">${escapeHtml(context.t('shareQrTitle'))}</h3>
        <p class="lesson-share__hint">${escapeHtml(qrHint)}</p>
        <div class="lesson-share__qr-wrap" id="qr-preview" aria-label="${escapeAttr(context.t('shareQrTitle'))}"></div>
        <div class="lesson-share__qr-actions">
          <button type="button" class="btn btn-secondary btn-download-qr">${escapeHtml(context.t('shareDownloadQr'))}</button>
          <button type="button" class="btn btn-primary btn-qr-fullscreen">${escapeHtml(context.t('shareQrFullscreen'))}</button>
        </div>
      </div>
      <p class="lesson-share__note">${escapeHtml(context.t('shareStorageNote'))}</p>
    </section>`;

  const qrPreview = container.querySelector('#qr-preview');
  let qrCanvas = null;
  if (qrPreview && !tooLong) {
    qrCanvas = renderQrToCanvas(studentLinks.url, 5);
    qrCanvas.className = 'lesson-share__qr-canvas';
    qrPreview.appendChild(qrCanvas);
  }

  container.querySelectorAll('.btn-copy-link').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-url') ?? '';
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = context.t('shareCopied');
        setTimeout(() => {
          btn.textContent = context.t('shareCopy');
        }, 2000);
      } catch {
        window.prompt(context.t('shareCopyFallback'), url);
      }
    });
  });

  container.querySelector('.btn-download-qr')?.addEventListener('click', () => {
    if (qrCanvas) downloadQrCanvas(qrCanvas);
  });

  container.querySelector('.btn-qr-fullscreen')?.addEventListener('click', () => {
    if (!qrCanvas || tooLong) return;
    openQrFullscreen(studentLinks.url, context.t);
  });
}

/**
 * @param {string} url
 * @param {Function} t
 */
function openQrFullscreen(url, t) {
  const overlay = document.createElement('div');
  overlay.className = 'qr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', t('shareQrFullscreen'));

  const canvas = renderQrToCanvas(url, 10);
  canvas.className = 'qr-overlay__canvas';

  overlay.innerHTML = `
    <div class="qr-overlay__inner">
      <p class="qr-overlay__url">${escapeHtml(url)}</p>
      <button type="button" class="btn btn-secondary qr-overlay__close">${escapeHtml(t('shareClose'))}</button>
    </div>`;

  const inner = overlay.querySelector('.qr-overlay__inner');
  inner?.insertBefore(canvas, inner.firstChild);

  const close = () => overlay.remove();
  overlay.querySelector('.qr-overlay__close')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener(
    'keydown',
    function onKey(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    },
    { once: true }
  );

  document.body.appendChild(overlay);
}
