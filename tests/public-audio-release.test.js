import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import approval from '../content/meta/ttsmaker-audio-approval.json' with { type: 'json' };
import batch2 from '../content/meta/ttsmaker-audio-approval-batch2.json' with { type: 'json' };
import manifest from '../content/meta/audio-manifest.json' with { type: 'json' };
import {
  APPROVED_PUBLIC_AUDIO_BY_WORD_ID,
  APPROVED_PUBLIC_AUDIO_PATHS,
  EXTENDED_PUBLIC_AUDIO_RELEASE_ENABLED,
  MANIFEST_AUDIO_BY_WORD_ID,
  PUBLIC_AUDIO_RELEASE_ENABLED,
  getPublicAudioUrl,
  isApprovedPublicAudioPath,
} from '../src/audio/public-audio-manifest.js';
import { LOCAL_PROTOTYPE_WORD_FILES } from '../src/audio/local-prototype-audio.js';
import { scanTtsmakerIntake } from '../scripts/ttsmaker-scan-inventory.mjs';
import { stagePublicAudio } from '../scripts/stage-public-audio.mjs';
import { verifyCommittedPublicAudio } from '../scripts/verify-committed-audio.mjs';
import {
  isPublishableRelativePath,
  collectPublicSurfaceFiles,
  listApprovedPublicAudioPaths,
  buildPublicDirectory,
} from '../scripts/public-surface.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function removeDistDir(distRoot) {
  if (!fs.existsSync(distRoot)) return;
  fs.rmSync(distRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
const approvedEntries = manifest.entries.filter((e) => e.publicReleaseApproved === true);
const batch11Entries = manifest.entries.filter((e) => e.sourceBatch);

describe('TTSMaker owner approval record', () => {
  it('records 15/15 owner-declared pronunciation approval on 2026-09-24', () => {
    assert.equal(approval.approvedCount, 15);
    assert.equal(approval.wordCount, 15);
    assert.equal(approval.approvalDate, '2026-09-24');
    assert.match(approval.approvalSource, /ChatGPT/i);
    assert.match(approval.reviewHtmlNote, /localStorage was not the approval record/i);
    assert.equal(approval.voiceId, '2402');
    assert.equal(approval.voiceName, 'Robert');
  });

  it('records batch11 owner pronunciation approval when complete', () => {
    assert.equal(batch2.approvedCount, 11);
    assert.equal(batch2.wordCount, 11);
    assert.equal(batch2.approvalDate, '2026-09-24');
    assert.match(batch2.approvalSource, /review-batch11/i);
    assert.equal(batch2.reviewExport.reviews.wait, 'approved');
    assert.equal(batch2.reviewExport.reviews.light, 'approved');
  });
});

describe('public audio manifest', () => {
  it('lists twenty-six owner-approved public-release paths', () => {
    assert.equal(manifest.entries.length, 26);
    assert.equal(manifest.approvedPublicEntryCount, 26);
    assert.equal(manifest.pendingPublicEntryCount, 0);
    assert.equal(approvedEntries.length, 26);
    assert.equal(APPROVED_PUBLIC_AUDIO_PATHS.size, 26);
    assert.equal(MANIFEST_AUDIO_BY_WORD_ID.size, 26);
    assert.equal(manifest.publicAudioEnabled, true);
    assert.equal(manifest.extendedReleaseEnabled, true);
    assert.equal(PUBLIC_AUDIO_RELEASE_ENABLED, true);
    assert.equal(EXTENDED_PUBLIC_AUDIO_RELEASE_ENABLED, true);
  });

  it('maps each approved wordId to assets/audio/{wordId}.mp3', () => {
    for (const entry of approvedEntries) {
      assert.equal(entry.publicFile, `assets/audio/${entry.wordId}.mp3`);
      assert.equal(getPublicAudioUrl(entry.wordId), entry.publicFile);
      assert.equal(isApprovedPublicAudioPath(entry.publicFile), true);
    }
    assert.equal(isApprovedPublicAudioPath('assets/audio/w-extra.mp3'), false);
  });

  it('records batch11 provenance on split entries', () => {
    assert.equal(batch11Entries.length, 11);
    for (const entry of batch11Entries) {
      assert.equal(entry.ownerPronunciationApproved, true);
      assert.equal(entry.publicReleaseApproved, true);
      assert.match(entry.sourceBatch.sourceFile, /ttsmaker-file-2026-9-24-17-36-11\.mp3/);
    }
    assert.equal(manifest.batch11Source.declaredWordOrder.length, 11);
    assert.equal(manifest.batch11Source.declaredWordOrder[0], 'wait');
    assert.equal(manifest.batch11Source.declaredWordOrder[8], 'light');
  });

  it('matches local prototype word IDs and intake spellings for all twenty-six', () => {
    const localIds = Object.keys(LOCAL_PROTOTYPE_WORD_FILES);
    assert.equal(localIds.length, 26);
    for (const wordId of localIds) {
      const entry = MANIFEST_AUDIO_BY_WORD_ID.get(wordId);
      assert.ok(entry, `missing manifest entry for ${wordId}`);
      assert.equal(entry.spelling, LOCAL_PROTOTYPE_WORD_FILES[wordId]);
    }
  });

  it('matches live intake checksums for all twenty-six when present', () => {
    const intake = scanTtsmakerIntake();
    if (intake.presentCount !== 26) {
      return;
    }
    for (const entry of approvedEntries) {
      const basename = entry.intakeFile.split('/').pop()?.replace('.mp3', '');
      const file = intake.files[basename];
      assert.ok(file, `intake missing ${basename}`);
      assert.equal(file.sha256, entry.sha256);
      assert.equal(file.bytes, entry.bytes);
      assert.equal(file.validMp3, true);
    }
  });
});

describe('public surface audio allowlist', () => {
  it('allows only approved manifest MP3 paths', () => {
    assert.equal(isPublishableRelativePath('assets/audio/w-rain.mp3'), true);
    assert.equal(isPublishableRelativePath('assets/audio/w-wait.mp3'), true);
    assert.equal(isPublishableRelativePath('assets/audio/w-light.mp3'), true);
    assert.equal(isPublishableRelativePath('assets/audio/w-extra.mp3'), false);
    assert.equal(isPublishableRelativePath('tools/audio-prototype/ttsmaker-2402/rain.mp3'), false);
    assert.equal(isPublishableRelativePath('src/demo.mp3'), false);
    assert.equal(isPublishableRelativePath('assets/audio/README.md'), true);
  });

  it('still blocks wav, onnx and entire tools tree', () => {
    assert.equal(isPublishableRelativePath('tools/audio-prototype/output/rain.wav'), false);
    assert.equal(isPublishableRelativePath('tools/audio-prototype/ttsmaker-2402/rain.mp3'), false);
    assert.equal(isPublishableRelativePath('src/model.onnx'), false);
  });

  it('includes committed MP3 in public inventory when present', () => {
    const files = collectPublicSurfaceFiles(repoRoot);
    const mp3 = files.filter((f) => f.endsWith('.mp3'));
    const verify = verifyCommittedPublicAudio();
    if (verify.verifiedCount === 26) {
      assert.equal(mp3.length, 26);
    } else if (verify.verifiedCount === 15) {
      assert.equal(mp3.length, 15);
    } else {
      assert.equal(mp3.length, 0);
    }
    assert.ok(files.includes('assets/audio/README.md'));
    assert.equal(files.some((f) => f.startsWith('tools/')), false);
  });

  it('lists twenty-six approved paths for staging target', () => {
    assert.equal(listApprovedPublicAudioPaths().length, 26);
  });
});

describe('stage-public-audio dry run', () => {
  it('validates approved intake against manifest without writing files', () => {
    const result = stagePublicAudio({ dryRun: true });
    if (result.stagedCount === 26) {
      assert.equal(result.ok, true);
      assert.equal(result.errors.length, 0);
      assert.equal(result.expectedCount, 26);
    } else {
      assert.ok(result.errors.length > 0 || result.stagedCount < 26);
    }
  });
});

describe('committed public audio (Netlify clean checkout)', () => {
  it('verifies twenty-six MP3 in assets/audio against manifest without intake', () => {
    const result = verifyCommittedPublicAudio();
    assert.equal(result.expectedCount, 26);
    assert.equal(result.verifiedCount, 26, result.errors.join('; '));
    assert.equal(result.ok, true);
  });

  it('build:public succeeds from committed MP3 only (no staging)', () => {
    const verify = verifyCommittedPublicAudio();
    if (verify.verifiedCount !== 26) return;

    const distRoot = path.join(repoRoot, 'dist');
    if (fs.existsSync(distRoot)) removeDistDir(distRoot);

    const { files } = buildPublicDirectory(repoRoot, distRoot);
    const mp3 = files.filter((f) => f.endsWith('.mp3'));
    assert.equal(mp3.length, 26);

    for (const entry of approvedEntries) {
      assert.ok(files.includes(entry.publicFile), `missing ${entry.publicFile} in dist`);
      const distHash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(path.join(distRoot, entry.publicFile)))
        .digest('hex');
      assert.equal(distHash, entry.sha256);
    }

    assert.equal(files.some((f) => f.startsWith('tools/')), false);
    assert.equal(files.some((f) => f.endsWith('.wav')), false);
    assert.equal(files.some((f) => f.startsWith('docs/')), false);
    assert.equal(files.some((f) => f.startsWith('tests/')), false);
    assert.equal(files.some((f) => f.startsWith('scripts/')), false);
  });
});

describe('public dist build with staged audio', () => {
  const distRoot = path.join(repoRoot, 'dist');
  /** @type {string[]} */
  let stagedPaths = [];

  it('stages twenty-six approved MP3 into assets/audio when intake is complete', () => {
    const result = stagePublicAudio();
    if (result.stagedCount !== 26) {
      return;
    }
    stagedPaths = result.staged;
    assert.equal(result.ok, true);
    for (const rel of stagedPaths) {
      assert.ok(fs.existsSync(path.join(repoRoot, rel)));
    }
  });

  it('build:public copies exactly twenty-six approved MP3 and excludes prototypes', () => {
    if (stagedPaths.length !== 26) return;

    if (fs.existsSync(distRoot)) removeDistDir(distRoot);
    const { files } = buildPublicDirectory(repoRoot, distRoot);
    const mp3 = files.filter((f) => f.endsWith('.mp3'));
    assert.equal(mp3.length, 26);
    assert.equal(files.some((f) => f.startsWith('tools/')), false);
    assert.equal(files.some((f) => f.endsWith('.wav')), false);
    assert.equal(files.some((f) => f.endsWith('.onnx')), false);
    assert.equal(files.some((f) => f.startsWith('docs/')), false);
    assert.equal(files.some((f) => f.startsWith('tests/')), false);
    assert.equal(files.some((f) => f.startsWith('scripts/')), false);

    for (const entry of approvedEntries) {
      assert.ok(files.includes(entry.publicFile), `missing ${entry.publicFile} in dist`);
    }
  });
});
