import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  scanTtsmakerIntake,
  isValidMp3Buffer,
  REQUIRED_BASENAMES,
  APPROVED_BASENAMES,
  BATCH11_BASENAMES,
  TTSMAKER_WORD_FILES,
  ALLOWED_SOURCE_MP3,
} from '../scripts/ttsmaker-scan-inventory.mjs';

describe('TTSMaker intake inventory', () => {
  it('expects twenty-six required basenames (15 approved + 11 batch11)', () => {
    assert.equal(APPROVED_BASENAMES.length, 15);
    assert.equal(BATCH11_BASENAMES.length, 11);
    assert.equal(REQUIRED_BASENAMES.length, 26);
    assert.equal(TTSMAKER_WORD_FILES.rain, 'w-rain');
    assert.equal(TTSMAKER_WORD_FILES.wait, 'w-wait');
    assert.equal(TTSMAKER_WORD_FILES.light, 'w-light');
  });

  it('detects valid MP3 magic bytes', () => {
    assert.equal(isValidMp3Buffer(Buffer.from([0x49, 0x44, 0x33, 0x04])), true);
    assert.equal(isValidMp3Buffer(Buffer.from([0xff, 0xfb, 0x90, 0x00])), true);
    assert.equal(isValidMp3Buffer(Buffer.from([0x00, 0x00, 0x00, 0x00])), false);
  });

  it('reports missing files in empty intake directory', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'readit-ttsmaker-'));
    const report = scanTtsmakerIntake(tmp);
    assert.equal(report.presentCount, 0);
    assert.equal(report.missing.length, 26);
    assert.equal(report.allValid, false);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('accepts a minimal valid MP3 fixture and flags unexpected files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'readit-ttsmaker-'));
    const mp3Header = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00]);
    fs.writeFileSync(path.join(tmp, 'rain.mp3'), mp3Header);
    fs.writeFileSync(path.join(tmp, 'extra.mp3'), mp3Header);

    const report = scanTtsmakerIntake(tmp);
    assert.equal(report.presentCount, 1);
    assert.ok(report.missing.includes('day'));
    assert.ok(report.unexpected.includes('extra.mp3'));
    assert.equal(report.allValid, false);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('ignores allowed batch source original in unexpected list', () => {
    assert.ok([...ALLOWED_SOURCE_MP3].includes('ttsmaker-file-2026-9-24-17-36-11.mp3'));
  });
});
