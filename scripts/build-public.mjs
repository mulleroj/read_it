/**
 * M7.3 – Prepare deterministic Netlify/public deploy directory.
 * Copies ONLY index.html, styles/, src/, content/ (no docs/tools/tests/scripts).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPublicDirectory } from './public-surface.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.resolve(repoRoot, 'dist');

const { fileCount } = buildPublicDirectory(repoRoot, outDir);

console.log(`READ IT! public build ready`);
console.log(`  Output: ${outDir}`);
console.log(`  Files:  ${fileCount}`);
console.log(`  Surface: index.html, favicon.svg, styles/, src/, content/`);
