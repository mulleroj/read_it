/**
 * M7.1 / M7.3 / M8.2 – Allowed public application surface.
 * Shared by pilot-server, Netlify build and tests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  APPROVED_PUBLIC_AUDIO_PATHS,
  isApprovedPublicAudioPath,
} from '../src/audio/public-audio-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/** @type {ReadonlySet<string>} */
export const PUBLIC_SURFACE_DIRS = new Set(['styles', 'src', 'content']);

/** @type {ReadonlySet<string>} */
export const PUBLIC_SURFACE_FILES = new Set(['index.html', 'favicon.svg']);

/** @type {ReadonlySet<string>} */
export const BLOCKED_PUBLISH_EXTENSIONS = new Set([
  '.wav',
  '.mp3',
  '.onnx',
  '.zip',
  '.pem',
  '.key',
  '.env',
]);

/** Documentation-only paths under assets/audio (no binary audio). */
const PUBLIC_ASSET_DOC_FILES = new Set(['assets/audio/README.md']);

/**
 * @param {string} relativePosix Path relative to repo root, forward slashes.
 */
export function isPublishableRelativePath(relativePosix) {
  const normalized = relativePosix.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) return false;

  if (PUBLIC_ASSET_DOC_FILES.has(normalized)) return true;

  const ext = path.posix.extname(normalized).toLowerCase();

  if (ext === '.mp3') {
    return isApprovedPublicAudioPath(normalized);
  }

  if (BLOCKED_PUBLISH_EXTENSIONS.has(ext)) return false;

  const segments = normalized.split('/').filter(Boolean);
  const first = segments[0];

  if (PUBLIC_SURFACE_FILES.has(normalized)) return true;
  return Boolean(first && PUBLIC_SURFACE_DIRS.has(first) && segments.length >= 2);
}

/** @returns {string[]} */
export function listApprovedPublicAudioPaths() {
  return [...APPROVED_PUBLIC_AUDIO_PATHS].sort();
}

/**
 * @param {string} repoRootArg
 * @returns {string[]}
 */
export function collectPublicSurfaceFiles(repoRootArg = repoRoot) {
  /** @type {string[]} */
  const files = [];

  for (const file of PUBLIC_SURFACE_FILES) {
    const abs = path.join(repoRootArg, file);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      files.push(file);
    }
  }

  for (const doc of PUBLIC_ASSET_DOC_FILES) {
    const abs = path.join(repoRootArg, ...doc.split('/'));
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      files.push(doc);
    }
  }

  for (const dir of PUBLIC_SURFACE_DIRS) {
    const absDir = path.join(repoRootArg, dir);
    if (!fs.existsSync(absDir)) continue;
    walkPublishableTree(absDir, dir, repoRootArg, files);
  }

  for (const rel of listApprovedPublicAudioPaths()) {
    const abs = path.join(repoRootArg, ...rel.split('/'));
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      files.push(rel);
    }
  }

  return [...new Set(files)].sort();
}

/**
 * @param {string} absDir
 * @param {string} relPrefix
 * @param {string} repoRootArg
 * @param {string[]} files
 */
function walkPublishableTree(absDir, relPrefix, repoRootArg, files) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const rel = `${relPrefix}/${entry.name}`.replace(/\\/g, '/');
    const abs = path.join(repoRootArg, ...rel.split('/'));

    if (entry.isDirectory()) {
      walkPublishableTree(abs, rel, repoRootArg, files);
      continue;
    }

    if (entry.isFile() && isPublishableRelativePath(rel)) {
      files.push(rel);
    }
  }
}

/**
 * @param {string} repoRootArg
 * @param {string} outDir
 */
export function buildPublicDirectory(repoRootArg = repoRoot, outDir) {
  const files = collectPublicSurfaceFiles(repoRootArg);

  fs.rmSync(outDir, { recursive: true, force: true });

  for (const rel of files) {
    const src = path.join(repoRootArg, ...rel.split('/'));
    const dest = path.join(outDir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  return { files, outDir, fileCount: files.length };
}
