/**
 * M8.3 – Verify production MP3 in assets/audio/ without tools/ intake.
 * Used for Netlify clean-checkout release gate (no stage:audio required).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isValidMp3Buffer } from './ttsmaker-scan-inventory.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'content/meta/audio-manifest.json');

/**
 * @param {string} filePath
 */
function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * @param {{ repoRoot?: string }} [options]
 */
export function verifyCommittedPublicAudio(options = {}) {
  const root = options.repoRoot ?? repoRoot;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/meta/audio-manifest.json'), 'utf8'));
  /** @type {string[]} */
  const verified = [];
  /** @type {string[]} */
  const errors = [];

  for (const entry of manifest.entries) {
    if (entry.publicReleaseApproved !== true) continue;
    const publicAbs = path.join(root, ...entry.publicFile.split('/'));

    if (!fs.existsSync(publicAbs)) {
      errors.push(`Missing committed file: ${entry.publicFile}`);
      continue;
    }

    const hash = sha256File(publicAbs);
    if (hash !== entry.sha256) {
      errors.push(`Checksum mismatch for ${entry.wordId}: expected ${entry.sha256}, got ${hash}`);
      continue;
    }

    const buffer = fs.readFileSync(publicAbs);
    if (!isValidMp3Buffer(buffer) || buffer.length !== entry.bytes) {
      errors.push(`Invalid MP3 or size mismatch for ${entry.wordId}`);
      continue;
    }

    verified.push(entry.publicFile);
  }

  const approvedCount =
    manifest.approvedPublicEntryCount ?? manifest.entries.filter((e) => e.publicReleaseApproved === true).length;

  return {
    expectedCount: approvedCount,
    verifiedCount: verified.length,
    verified,
    errors,
    ok: errors.length === 0 && verified.length === approvedCount,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = verifyCommittedPublicAudio();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
