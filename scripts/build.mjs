/**
 * Cloudflare Workers CI: full OpenNext build (creates .open-next/worker.js).
 * Vercel / local: standard next build.
 */
import { execSync } from 'node:child_process';

function isCloudflareWorkersBuild() {
  if (process.env.HARVICS_CF_WORKERS_BUILD === '1') return true;
  const home = process.env.HOME || '';
  const pwd = process.cwd();
  return home.includes('buildhome') || pwd.includes('/opt/buildhome');
}

if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
  execSync('next build', { stdio: 'inherit' });
} else if (isCloudflareWorkersBuild()) {
  console.log('[build] Cloudflare Workers CI — running OpenNext build...');
  execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });
} else {
  execSync('next build', { stdio: 'inherit' });
}
