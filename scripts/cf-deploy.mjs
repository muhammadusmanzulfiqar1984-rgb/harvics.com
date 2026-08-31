#!/usr/bin/env node
/**
 * Cloudflare deploy helper.
 *
 * Modes:
 *   code   — rebuild worker + _next JS/CSS, then upload. Wrangler hash-dedups
 *            the 13k+ static files already on Cloudflare (no re-upload if unchanged).
 *   upload — skip build, push existing .open-next only (retry after failed upload).
 *   full   — same as code; alias for when public/ assets actually changed.
 *
 * Never `rm -rf .open-next` before deploy — that wipes the asset manifest and
 * forces Wrangler to treat every file as new.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const mode = process.argv[2] || 'code';
const DEPLOY = 'opennextjs-cloudflare deploy --cacheChunkSize=50';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

if (mode === 'upload') {
  if (!existsSync('.open-next/worker.js')) {
    console.error('[cf-deploy] No .open-next/worker.js — run: npm run deploy:code');
    process.exit(1);
  }
  console.log('[cf-deploy] Upload only — static files on CF are hash-deduped, not re-sent if unchanged.');
  run(DEPLOY);
} else {
  console.log('[cf-deploy] Building worker + app chunks (public/ copied locally for manifest only).');
  console.log('[cf-deploy] Upload step skips unchanged static files already on Cloudflare.');
  run(`opennextjs-cloudflare build && ${DEPLOY}`);
}
