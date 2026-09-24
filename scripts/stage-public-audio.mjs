/**
 * M8.2 – Stage approved TTSMaker MP3 from intake to assets/audio/.
 * Verifies SHA-256 against content/meta/audio-manifest.json.
 * Does NOT commit, deploy or enable public runtime audio.
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
 * @param {{ dryRun?: boolean }} [options]
 */
export function stagePublicAudio(options = {}) {
  const dryRun = options.dryRun === true;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  /** @type {string[]} */
  const staged = [];
  /** @type {string[]} */
  const errors = [];

  for (const entry of manifest.entries) {
    if (entry.publicReleaseApproved !== true) continue;
    const intakeAbs = path.join(repoRoot, ...entry.intakeFile.split('/'));
    const destAbs = path.join(repoRoot, ...entry.publicFile.split('/'));

    if (!fs.existsSync(intakeAbs)) {
      errors.push(`Missing intake file: ${entry.intakeFile}`);
      continue;
    }

    const hash = sha256File(intakeAbs);
    if (hash !== entry.sha256) {
      errors.push(`Checksum mismatch for ${entry.wordId}: expected ${entry.sha256}, got ${hash}`);
      continue;
    }

    const buffer = fs.readFileSync(intakeAbs);
    if (!isValidMp3Buffer(buffer) || buffer.length !== entry.bytes) {
      errors.push(`Invalid MP3 or size mismatch for ${entry.wordId}`);
      continue;
    }

    if (!dryRun) {
      fs.mkdirSync(path.dirname(destAbs), { recursive: true });
      fs.copyFileSync(intakeAbs, destAbs);
      if (sha256File(destAbs) !== entry.sha256) {
        errors.push(`Post-copy checksum failed for ${entry.wordId}`);
        continue;
      }
    }

    staged.push(entry.publicFile);
  }

  const approvedEntries = manifest.entries.filter((e) => e.publicReleaseApproved === true);

  return {
    dryRun,
    expectedCount: approvedEntries.length,
    stagedCount: staged.length,
    staged,
    errors,
    ok: errors.length === 0 && staged.length === approvedEntries.length,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const dryRun = process.argv.includes('--dry-run');
  const result = stagePublicAudio({ dryRun });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
