/**
 * M7.1 – Classroom pilot static server.
 * Serves ONLY public app assets (index.html, styles/, src/, content/).
 * Does NOT expose tools/, WAV files, docs, tests, node_modules, etc.
 * Binds to 0.0.0.0 for school LAN – use npm run serve for localhost dev + audio.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PILOT_REPO_ROOT = path.resolve(__dirname, '..');

/** @type {ReadonlySet<string>} */
export const PILOT_ALLOWED_DIRS = new Set(['styles', 'src', 'content']);

/** @type {ReadonlySet<string>} */
export const PILOT_ALLOWED_FILES = new Set(['index.html']);

/** @type {Record<string, string>} */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

/**
 * Resolve a URL path to an absolute file under repo root, or null if blocked.
 * @param {string} urlPath
 * @param {string} [repoRoot]
 */
export function resolvePilotFilePath(urlPath, repoRoot = PILOT_REPO_ROOT) {
  const raw = urlPath.split('?')[0].split('#')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  if (decoded === '/' || decoded === '') {
    decoded = '/index.html';
  }

  const relative = decoded.replace(/^\/+/, '').replace(/\//g, path.sep);
  const normalized = path.normalize(relative).replace(/^[\\/]+|[\\/]+$/g, '');

  if (!normalized || normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return null;
  }

  const segments = normalized.split(path.sep).filter(Boolean);
  const first = segments[0];

  const allowed =
    PILOT_ALLOWED_FILES.has(normalized) ||
    (first && PILOT_ALLOWED_DIRS.has(first) && segments.length >= 2);

  if (!allowed) {
    return null;
  }

  const absolute = path.resolve(repoRoot, normalized);
  if (!absolute.startsWith(repoRoot + path.sep) && absolute !== path.join(repoRoot, 'index.html')) {
    return null;
  }

  return absolute;
}

/**
 * @param {string} filePath
 */
function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} [repoRoot]
 */
export function handlePilotRequest(req, res, repoRoot = PILOT_REPO_ROOT) {
  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = resolvePilotFilePath(req.url ?? '/', repoRoot);
  if (!filePath) {
    res.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    });
    res.end('Not Found');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Content-Length': stat.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    });

    if (method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  });
}

/**
 * @param {{ port?: number, host?: string, repoRoot?: string }} [options]
 */
export function createPilotServer(options = {}) {
  const port = options.port ?? Number(process.env.PORT ?? 3000);
  const host = options.host ?? '0.0.0.0';
  const repoRoot = options.repoRoot ?? PILOT_REPO_ROOT;

  const server = http.createServer((req, res) => handlePilotRequest(req, res, repoRoot));

  return {
    server,
    port,
    host,
    listen() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, () => resolve({ port, host }));
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const pilot = createPilotServer();
  pilot.listen().then(({ port, host }) => {
    console.log(`READ IT! pilot server (public assets only)`);
    console.log(`  Listening on http://${host}:${port}`);
    console.log(`  Allowed: index.html, styles/, src/, content/`);
    console.log(`  Blocked:  tools/, docs/, tests/, node_modules/, *.wav`);
    console.log(`  Teacher localhost + audio: npm run serve`);
  });
}
