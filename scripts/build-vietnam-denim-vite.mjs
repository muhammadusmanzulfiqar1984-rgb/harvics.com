/**
 * Build Vietnam Denim deck (Vite + Tailwind v4) and copy output for production.
 * Run: node scripts/build-vietnam-denim-vite.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public/vietnam-denim-presentation');
const DIST = path.join(ROOT, 'dist');
const SOURCE = path.join(ROOT, 'index.source.html');
const INDEX = path.join(ROOT, 'index.html');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (!fs.existsSync(SOURCE)) {
  console.error('Missing index.source.html — vite entry template for the Vietnam deck.');
  process.exit(1);
}

console.log('Building Vietnam Denim deck…');
fs.copyFileSync(SOURCE, INDEX);
execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Vite build did not produce dist/index.html');
  process.exit(1);
}

// Serve built bundle at /vietnam-denim-presentation/ (keep src/ for local dev).
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(ROOT, 'index.html'));
copyDir(path.join(DIST, 'assets'), path.join(ROOT, 'assets'));

console.log('Production deck ready at public/vietnam-denim-presentation/index.html');
