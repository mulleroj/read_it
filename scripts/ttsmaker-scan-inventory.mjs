/**
 * M8 – TTSMaker MP3 intake inventory helpers (committed; intake MP3 stay gitignored).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_INTAKE_DIR = path.join(repoRoot, 'tools/audio-prototype/ttsmaker-2402');

export const EXPECTED_BATCH11_SOURCE_FILENAME = 'ttsmaker-file-2026-9-24-17-36-11.mp3';

/** @type {Readonly<Record<string, string>>} */
export const TTSMAKER_APPROVED_WORD_FILES = Object.freeze({
  rain: 'w-rain',
  day: 'w-day',
  car: 'w-car',
  bird: 'w-bird',
  coin: 'w-coin',
  cow: 'w-cow',
  city: 'w-city',
  gym: 'w-gym',
  happy: 'w-happy',
  letter: 'w-letter',
  tree: 'w-tree',
  bell: 'w-bell',
  clock: 'w-clock',
  gift: 'w-gift',
  boat: 'w-boat',
});

/** @type {Readonly<Record<string, string>>} */
export const TTSMAKER_BATCH11_WORD_FILES = Object.freeze({
  wait: 'w-wait',
  chain: 'w-chain',
  play: 'w-play',
  grey: 'w-grey',
  see: 'w-see',
  bee: 'w-bee',
  coat: 'w-coat',
  road: 'w-road',
  light: 'w-light',
  night: 'w-night',
  high: 'w-high',
});

/** @type {Readonly<Record<string, string>>} */
export const TTSMAKER_WORD_FILES = Object.freeze({
  ...TTSMAKER_APPROVED_WORD_FILES,
  ...TTSMAKER_BATCH11_WORD_FILES,
});

export const APPROVED_BASENAMES = Object.freeze(Object.keys(TTSMAKER_APPROVED_WORD_FILES));
export const BATCH11_BASENAMES = Object.freeze(Object.keys(TTSMAKER_BATCH11_WORD_FILES));
export const REQUIRED_BASENAMES = Object.freeze(Object.keys(TTSMAKER_WORD_FILES));

/** @type {ReadonlySet<string>} */
export const ALLOWED_SOURCE_MP3 = Object.freeze(new Set([EXPECTED_BATCH11_SOURCE_FILENAME]));

/**
 * @param {Buffer} buffer
 */
export function isValidMp3Buffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;
  return false;
}

/**
 * @param {string} [intakeDir]
 */
export function scanTtsmakerIntake(intakeDir = DEFAULT_INTAKE_DIR) {
  if (!fs.existsSync(intakeDir)) {
    return {
      intakeDir,
      requiredCount: REQUIRED_BASENAMES.length,
      approvedRequiredCount: APPROVED_BASENAMES.length,
      batch11RequiredCount: BATCH11_BASENAMES.length,
      presentCount: 0,
      approvedPresentCount: 0,
      batch11PresentCount: 0,
      missing: [...REQUIRED_BASENAMES],
      unexpected: [],
      files: {},
      allValid: false,
    };
  }

  const entries = fs.readdirSync(intakeDir, { withFileTypes: true });
  const mp3Names = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.mp3'))
    .map((e) => e.name);

  const duplicateCheck = new Set();
  /** @type {string[]} */
  const unexpected = [];
  /** @type {Record<string, object>} */
  const present = {};

  for (const filename of mp3Names) {
    const lower = filename.toLowerCase();
    if (duplicateCheck.has(lower)) {
      unexpected.push(`${filename} (duplicate casing)`);
      continue;
    }
    duplicateCheck.add(lower);

    if (ALLOWED_SOURCE_MP3.has(filename)) {
      continue;
    }

    const basename = path.basename(filename, path.extname(filename)).toLowerCase();
    if (!REQUIRED_BASENAMES.includes(basename)) {
      unexpected.push(filename);
      continue;
    }

    const abs = path.join(intakeDir, filename);
    const stat = fs.statSync(abs);
    const buffer = fs.readFileSync(abs);
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const validMp3 = stat.size > 0 && isValidMp3Buffer(buffer);

    present[basename] = {
      filename,
      wordId: TTSMAKER_WORD_FILES[basename],
      bytes: stat.size,
      modifiedIso: stat.mtime.toISOString(),
      sha256,
      validMp3,
      readable: stat.size > 0,
      batch: APPROVED_BASENAMES.includes(basename) ? 'approved-15' : 'batch11',
    };
  }

  /** @type {string[]} */
  const missing = REQUIRED_BASENAMES.filter((b) => !present[b]);

  return {
    intakeDir,
    requiredCount: REQUIRED_BASENAMES.length,
    approvedRequiredCount: APPROVED_BASENAMES.length,
    batch11RequiredCount: BATCH11_BASENAMES.length,
    presentCount: Object.keys(present).length,
    approvedPresentCount: APPROVED_BASENAMES.filter((b) => present[b]).length,
    batch11PresentCount: BATCH11_BASENAMES.filter((b) => present[b]).length,
    missing,
    unexpected,
    files: present,
    allValid:
      missing.length === 0 &&
      unexpected.length === 0 &&
      Object.values(present).every((f) => f.validMp3 && f.readable),
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const report = scanTtsmakerIntake();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.allValid ? 0 : 1;
}
