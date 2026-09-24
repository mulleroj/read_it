import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_BATCH11_SOURCE_FILENAME,
  scanTtsmakerIntake,
  TTSMAKER_BATCH11_WORD_FILES,
  DEFAULT_INTAKE_DIR,
} from '../scripts/ttsmaker-scan-inventory.mjs';

const intakeDir = DEFAULT_INTAKE_DIR;
const splitModulePath = path.join(intakeDir, 'split-batch11.mjs');
const sourcePath = path.join(intakeDir, EXPECTED_BATCH11_SOURCE_FILENAME);
const hasLocalSplitToolchain =
  fs.existsSync(splitModulePath) && fs.existsSync(sourcePath);

describe('TTSMaker batch11 split', { skip: !hasLocalSplitToolchain ? 'local intake toolchain not present' : false }, () => {
  /** @type {typeof import('../tools/audio-prototype/ttsmaker-2402/split-batch11.mjs')} */
  let splitModule;

  it('loads local split module', async () => {
    splitModule = await import(pathToFileURL(splitModulePath).href);
    assert.equal(splitModule.EXPECTED_SOURCE_FILENAME, EXPECTED_BATCH11_SOURCE_FILENAME);
    assert.equal(splitModule.BATCH11_SPELLINGS.length, 11);
    assert.equal(splitModule.BATCH11_SPELLINGS[0], 'wait');
    assert.equal(splitModule.BATCH11_SPELLINGS[8], 'light');
    assert.equal(splitModule.BATCH11_SPELLINGS[10], 'high');
  });

  it('detects exactly eleven speech segments in the owner source file', async () => {
    splitModule ??= await import(pathToFileURL(splitModulePath).href);
    const silences = splitModule.detectSilenceRegions(sourcePath);
    const segments = splitModule.deriveSpeechSegments(16.104, silences);
    assert.equal(silences.length, 11);
    assert.equal(segments.length, 11);
  });

  it('produces eleven valid local intake MP3 without overwriting approved fifteen', async () => {
    splitModule ??= await import(pathToFileURL(splitModulePath).href);
    const result = splitModule.splitBatch11Recording({}, intakeDir);
    assert.equal(result.sourceFound, true);
    assert.equal(result.segmentCount, 11);
    assert.equal(result.outputs.length, 11);
    assert.equal(result.ok, true);

    for (const output of result.outputs) {
      assert.equal(output.validMp3, true);
      assert.ok(output.durationSeconds >= 0.08);
      assert.equal(TTSMAKER_BATCH11_WORD_FILES[output.spelling], `w-${output.spelling}`);
    }

    const inventory = scanTtsmakerIntake(intakeDir);
    assert.equal(inventory.approvedPresentCount, 15);
    assert.equal(inventory.batch11PresentCount, 11);
    assert.equal(inventory.unexpected.length, 0);
  });

  it('maps wait and light to dedicated word IDs', () => {
    assert.equal(TTSMAKER_BATCH11_WORD_FILES.wait, 'w-wait');
    assert.equal(TTSMAKER_BATCH11_WORD_FILES.light, 'w-light');
  });
});

/** @param {string} filePath */
function pathToFileURL(filePath) {
  return new URL(`file:///${filePath.replace(/\\/g, '/')}`);
}
