import {
  LESSON_CONFIG_VERSION,
  validateLessonConfig,
  presetToLessonConfig,
  lessonConfigMatchesPreset,
} from '../lessons/lesson-config.js';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from '../vendor/lz-string.esm.js';

/** Practical limit for QR readability (characters in cfg payload). */
export const MAX_CFG_PAYLOAD_LENGTH = 800;

const CFG_PREFIX = `v${LESSON_CONFIG_VERSION}.`;

/**
 * @param {import('../lessons/lesson-config.js').LessonConfig} config
 */
export function encodeLessonConfig(config) {
  const validation = validateLessonConfig(config);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const payload = JSON.stringify(validation.config);
  const compressed = compressToEncodedURIComponent(payload);
  return `${CFG_PREFIX}${compressed}`;
}

/**
 * @param {string} encoded
 */
export function decodeLessonConfig(encoded) {
  if (typeof encoded !== 'string' || !encoded.startsWith(CFG_PREFIX)) {
    throw new Error('Neplatný formát sdílené konfigurace lekce.');
  }

  const compressed = encoded.slice(CFG_PREFIX.length);
  const json = decompressFromEncodedURIComponent(compressed);
  if (!json) {
    throw new Error('Nepodařilo se dekódovat konfiguraci lekce.');
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Konfigurace lekce není platný JSON.');
  }

  const validation = validateLessonConfig(parsed);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  return validation.config;
}

/**
 * @param {string} encoded
 */
export function isCfgPayloadTooLong(encoded) {
  return encoded.length > MAX_CFG_PAYLOAD_LENGTH;
}

/**
 * @param {string} [baseUrl] defaults to current origin+pathname
 * @param {'teacher' | 'student'} mode
 * @param {{ lesson?: string, cfg?: string }} query
 */
export function buildShareUrl(mode, query, baseUrl) {
  const base =
    baseUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}${window.location.search}`
      : 'https://example.test/readit/');
  const params = new URLSearchParams();
  if (query.lesson) params.set('lesson', query.lesson);
  if (query.cfg) params.set('cfg', query.cfg);
  const qs = params.toString();
  return `${base}#/${mode}${qs ? `?${qs}` : ''}`;
}

/**
 * @param {URLSearchParams} params
 * @param {{ getLessonPreset?: (id: string) => object | null, getExercise: (id: string) => object | null }} store
 */
export function parseLessonFromParams(params, store) {
  const lessonId = params.get('lesson');
  const cfg = params.get('cfg');

  if (lessonId && cfg) {
    return { ok: false, code: 'ambiguous', message: 'Odkaz obsahuje současně preset i vlastní konfiguraci.' };
  }

  if (lessonId) {
    const preset = store.getLessonPreset?.(lessonId);
    if (!preset) {
      return { ok: false, code: 'preset_not_found', message: `Preset lekce „${lessonId}“ nebyl nalezen.` };
    }
    return { ok: true, config: presetToLessonConfig(preset), source: 'preset' };
  }

  if (cfg) {
    try {
      const config = decodeLessonConfig(cfg);
      return { ok: true, config, source: 'url' };
    } catch (err) {
      return {
        ok: false,
        code: 'invalid_cfg',
        message: err instanceof Error ? err.message : 'Neplatná konfigurace v odkazu.',
      };
    }
  }

  return { ok: false, code: 'missing', message: 'Odkaz neobsahuje lekci.' };
}

/**
 * @param {import('../lessons/lesson-config.js').LessonConfig} config
 * @param {{ getLessonPreset?: (id: string) => object | null }} [store]
 */
export function resolvePresetShareId(config, store) {
  const presetId = config.sourcePresetId ?? (config.kind === 'preset' ? config.id : null);
  if (!presetId || !store?.getLessonPreset) return null;

  const preset = store.getLessonPreset(presetId);
  if (!preset) return null;

  return lessonConfigMatchesPreset(config, preset) ? presetId : null;
}

/**
 * Shared decision for preset vs custom cfg URLs (Builder launch + QR/share).
 * @param {import('../lessons/lesson-config.js').LessonConfig} config
 * @param {{ getLessonPreset?: (id: string) => object | null }} [store]
 * @returns {{ lesson: string | null, cfg: string | null, tooLong: boolean }}
 */
export function resolveLessonShareQuery(config, store) {
  const presetId = resolvePresetShareId(config, store);
  if (presetId) {
    return { lesson: presetId, cfg: null, tooLong: false };
  }

  const normalized = { ...config, kind: 'custom' };
  const encoded = encodeLessonConfig(normalized);
  const tooLong = isCfgPayloadTooLong(encoded);
  return { lesson: null, cfg: encoded, tooLong };
}

/**
 * @param {import('../lessons/lesson-config.js').LessonConfig} config
 * @param {'teacher' | 'student'} mode
 * @param {string} [baseUrl]
 * @param {{ getLessonPreset?: (id: string) => object | null }} [store]
 */
export function buildLessonShareLinks(config, mode, baseUrl, store) {
  const query = resolveLessonShareQuery(config, store);
  if (query.lesson) {
    const url = buildShareUrl(mode, { lesson: query.lesson }, baseUrl);
    return { url, cfg: null, tooLong: false };
  }

  const url = buildShareUrl(mode, { cfg: query.cfg ?? undefined }, baseUrl);
  return { url, cfg: query.cfg, tooLong: query.tooLong };
}
