/**
 * M7.1 / M7.3 – Allowed public application surface.
 * Shared by pilot-server, Netlify build and tests.
 */
import fs from 'node:fs';
import path from 'node:path';

/** @type {ReadonlySet<string>} */
export const PUBLIC_SURFACE_DIRS = new Set(['styles', 'src', 'content']);

/** @type {ReadonlySet<string>} */
export const PUBLIC_SURFACE_FILES = new Set(['index.html']);

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

/**
 * @param {string} relativePosix Path relative to repo root, forward slashes.
 */
export function isPublishableRelativePath(relativePosix) {
  const normalized = relativePosix.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) return false;

  const ext = path.posix.extname(normalized).toLowerCase();
  if (BLOCKED_PUBLISH_EXTENSIONS.has(ext)) return false;

  const segments = normalized.split('/').filter(Boolean);
  const first = segments[0];

  if (PUBLIC_SURFACE_FILES.has(normalized)) return true;
  return Boolean(first && PUBLIC_SURFACE_DIRS.has(first) && segments.length >= 2);
}

/**
 * @param {string} repoRoot
 * @returns {string[]}
 */
export function collectPublicSurfaceFiles(repoRoot) {
  /** @type {string[]} */
  const files = [];

  for (const file of PUBLIC_SURFACE_FILES) {
    const abs = path.join(repoRoot, file);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      files.push(file);
    }
  }

  for (const dir of PUBLIC_SURFACE_DIRS) {
    const absDir = path.join(repoRoot, dir);
    if (!fs.existsSync(absDir)) continue;
    walkPublishableTree(absDir, dir, repoRoot, files);
  }

  return [...new Set(files)].sort();
}

/**
 * @param {string} absDir
 * @param {string} relPrefix
 * @param {string} repoRoot
 * @param {string[]} files
 */
function walkPublishableTree(absDir, relPrefix, repoRoot, files) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const rel = `${relPrefix}/${entry.name}`.replace(/\\/g, '/');
    const abs = path.join(repoRoot, ...rel.split('/'));

    if (entry.isDirectory()) {
      walkPublishableTree(abs, rel, repoRoot, files);
      continue;
    }

    if (entry.isFile() && isPublishableRelativePath(rel)) {
      files.push(rel);
    }
  }
}

/**
 * @param {string} repoRoot
 * @param {string} outDir
 */
export function buildPublicDirectory(repoRoot, outDir) {
  const files = collectPublicSurfaceFiles(repoRoot);

  fs.rmSync(outDir, { recursive: true, force: true });

  for (const rel of files) {
    const src = path.join(repoRoot, ...rel.split('/'));
    const dest = path.join(outDir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  return { files, outDir, fileCount: files.length };
}
