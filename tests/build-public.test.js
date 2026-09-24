import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectPublicSurfaceFiles,
  buildPublicDirectory,
  isPublishableRelativePath,
} from '../scripts/public-surface.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(repoRoot, 'dist');

describe('public surface allowlist', () => {
  it('allows app files and blocks repo internals', () => {
    assert.equal(isPublishableRelativePath('index.html'), true);
    assert.equal(isPublishableRelativePath('favicon.svg'), true);
    assert.equal(isPublishableRelativePath('src/main.js'), true);
    assert.equal(isPublishableRelativePath('src/vendor/qrcode-generator.mjs'), true);
    assert.equal(isPublishableRelativePath('content/index.json'), true);
    assert.equal(isPublishableRelativePath('assets/audio/README.md'), true);
    assert.equal(isPublishableRelativePath('assets/audio/w-rain.mp3'), true);
    assert.equal(isPublishableRelativePath('assets/audio/w-extra.mp3'), false);
    assert.equal(isPublishableRelativePath('docs/CLASSROOM_PILOT_RUNSHEET.cs.md'), false);
    assert.equal(isPublishableRelativePath('tools/audio-prototype/output/rain.wav'), false);
    assert.equal(isPublishableRelativePath('tools/audio-prototype/ttsmaker-2402/rain.mp3'), false);
    assert.equal(isPublishableRelativePath('tests/router.test.js'), false);
    assert.equal(isPublishableRelativePath('package.json'), false);
    assert.equal(isPublishableRelativePath('scripts/pilot-server.mjs'), false);
  });

  it('blocks audio and model extensions even under src/', () => {
    assert.equal(isPublishableRelativePath('src/prototype/rain.wav'), false);
    assert.equal(isPublishableRelativePath('content/demo.mp3'), false);
  });
});

describe('build:public output', () => {
  /** @type {string[]} */
  let builtFiles;

  before(() => {
    const result = buildPublicDirectory(repoRoot, distRoot);
    builtFiles = result.files;
  });

  after(() => {
    fs.rmSync(distRoot, { recursive: true, force: true });
  });

  it('includes required application assets', () => {
    assert.ok(builtFiles.includes('index.html'));
    assert.ok(builtFiles.includes('favicon.svg'));
    assert.ok(builtFiles.includes('styles/main.css'));
    assert.ok(builtFiles.includes('src/main.js'));
    assert.ok(builtFiles.includes('src/vendor/qrcode-generator.mjs'));
    assert.ok(builtFiles.includes('content/index.json'));
    assert.ok(builtFiles.includes('assets/audio/README.md'));
    assert.ok(builtFiles.some((f) => f.startsWith('src/help/')));
    assert.ok(builtFiles.some((f) => f.startsWith('src/ui/teacher-help.js') || f === 'src/ui/teacher-help.js'));
  });

  it('excludes docs, tools, tests, scripts and package manifests', () => {
    assert.equal(builtFiles.some((f) => f.startsWith('docs/')), false);
    assert.equal(builtFiles.some((f) => f.startsWith('tools/')), false);
    assert.equal(builtFiles.some((f) => f.startsWith('tests/')), false);
    assert.equal(builtFiles.some((f) => f.startsWith('scripts/')), false);
    assert.equal(builtFiles.includes('package.json'), false);
    assert.equal(builtFiles.includes('package-lock.json'), false);
  });

  it('never copies blocked binary extensions except approved public MP3', () => {
    assert.equal(builtFiles.some((f) => f.endsWith('.wav')), false);
    assert.equal(builtFiles.some((f) => f.endsWith('.onnx')), false);
    const mp3 = builtFiles.filter((f) => f.endsWith('.mp3'));
    assert.ok(mp3.every((f) => f.startsWith('assets/audio/w-') && f.endsWith('.mp3')));
    assert.equal(mp3.length <= 26, true);
  });

  it('matches collectPublicSurfaceFiles inventory', () => {
    assert.deepEqual(collectPublicSurfaceFiles(repoRoot), builtFiles);
  });
});
