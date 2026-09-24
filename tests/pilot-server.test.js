import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  resolvePilotFilePath,
  handlePilotRequest,
  createPilotServer,
  PILOT_ALLOWED_DIRS,
} from '../scripts/pilot-server.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, '..');

describe('pilot server path allowlist', () => {
  it('allows index.html and public app directories', () => {
    assert.ok(resolvePilotFilePath('/', repoRoot)?.endsWith('index.html'));
    assert.ok(resolvePilotFilePath('/index.html', repoRoot));
    assert.ok(resolvePilotFilePath('/styles/main.css', repoRoot));
    assert.ok(resolvePilotFilePath('/src/main.js', repoRoot));
    assert.ok(resolvePilotFilePath('/content/index.json', repoRoot));
  });

  it('blocks prototype audio, tools, docs, tests and traversal', () => {
    assert.equal(resolvePilotFilePath('/tools/audio-prototype/output/rain.wav', repoRoot), null);
    assert.equal(resolvePilotFilePath('/tools/audio-prototype/ttsmaker-2402/rain.mp3', repoRoot), null);
    assert.equal(resolvePilotFilePath('/tools/audio-prototype/', repoRoot), null);
    assert.equal(resolvePilotFilePath('/docs/CLASSROOM_PILOT_RUNSHEET.cs.md', repoRoot), null);
    assert.equal(resolvePilotFilePath('/tests/mixed-content.test.js', repoRoot), null);
    assert.equal(resolvePilotFilePath('/node_modules/lz-string/package.json', repoRoot), null);
    assert.equal(resolvePilotFilePath('/package.json', repoRoot), null);
    assert.equal(resolvePilotFilePath('/../package.json', repoRoot), null);
    assert.equal(resolvePilotFilePath('/content/../tools/audio-prototype/output/rain.wav', repoRoot), null);
  });

  it('does not allow directory roots without a file', () => {
    for (const dir of PILOT_ALLOWED_DIRS) {
      assert.equal(resolvePilotFilePath(`/${dir}`, repoRoot), null);
      assert.equal(resolvePilotFilePath(`/${dir}/`, repoRoot), null);
    }
  });
});

describe('pilot server HTTP', () => {
  /** @type {import('../scripts/pilot-server.mjs').createPilotServer extends (...args: any[]) => infer R ? R : never} */
  let pilot;

  before(async () => {
    pilot = createPilotServer({ port: 0, host: '127.0.0.1', repoRoot });
    await pilot.listen();
  });

  after(async () => {
    await pilot.close();
  });

  /**
   * @param {string} path
   * @param {string} [method]
   */
  function request(path, method = 'GET') {
    const port = /** @type {import('node:net').AddressInfo} */ (pilot.server.address()).port;
    return new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: '127.0.0.1', port, path, method },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            resolve({
              status: res.statusCode ?? 0,
              body: Buffer.concat(chunks).toString('utf8'),
            });
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  it('serves index.html and content for the lesson app', async () => {
    const index = await request('/index.html');
    assert.equal(index.status, 200);
    assert.match(index.body, /READ IT!/);

    const content = await request('/content/index.json');
    assert.equal(content.status, 200);
    assert.match(content.body, /mixed-preset/);
  });

  it('serves vendor .mjs modules with JavaScript MIME type', async () => {
    const port = /** @type {import('node:net').AddressInfo} */ (pilot.server.address()).port;
    const res = await new Promise((resolve, reject) => {
      http
        .get({ hostname: '127.0.0.1', port, path: '/src/vendor/qrcode-generator.mjs' }, (response) => {
          const chunks = [];
          response.on('data', (c) => chunks.push(c));
          response.on('end', () => {
            resolve({
              status: response.statusCode ?? 0,
              type: response.headers['content-type'],
              bodyLen: Buffer.concat(chunks).length,
            });
          });
        })
        .on('error', reject);
    });

    assert.equal(res.status, 200);
    assert.match(String(res.type), /javascript/);
    assert.ok(res.bodyLen > 0);
  });

  it('returns 404 for prototype WAV and tools paths', async () => {
    const wav = await request('/tools/audio-prototype/output/rain.wav');
    assert.equal(wav.status, 404);

    const tools = await request('/tools/audio-prototype/');
    assert.equal(tools.status, 404);

    const head = await request('/tools/audio-prototype/output/rain.wav', 'HEAD');
    assert.equal(head.status, 404);
  });
});
