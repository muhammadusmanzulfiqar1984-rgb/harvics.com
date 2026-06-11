/**
 * After `next build`, produce `.open-next/worker.js` on Cloudflare Workers CI only.
 * Cloudflare Git builds use: build = npm run build, deploy = wrangler versions upload.
 * Skipped on Vercel and local builds.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function isCloudflareWorkersBuild() {
  if (process.env.HARVICS_CF_WORKERS_BUILD === '1') return true;
  const home = process.env.HOME || '';
  const pwd = process.cwd();
  return home.includes('buildhome') || pwd.includes('/opt/buildhome');
}

if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
  process.exit(0);
}

if (!isCloudflareWorkersBuild()) {
  process.exit(0);
}

if (existsSync('.open-next/worker.js')) {
  console.log('[cloudflare-postbuild] .open-next/worker.js exists — skip');
  process.exit(0);
}

console.log('[cloudflare-postbuild] Bundling OpenNext for Workers (skipNextBuild)...');
execSync('npx opennextjs-cloudflare build --skipNextBuild', { stdio: 'inherit' });
