/**
 * Emit Harvics_OS events from Next/CF routes via Hx API proxy
 * (kafkajs cannot run inside Cloudflare Workers).
 */

import type { HarvicsOsEventInput } from '../../../../packages/lib/kafka/types';

async function resolveHxEnv() {
  let base = process.env.HX_API_BASE_URL || 'http://localhost:3001';
  let secret = process.env.HX_JWT_SECRET || '';
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    base = ctx?.env?.HX_API_BASE_URL || base;
    secret = ctx?.env?.HX_JWT_SECRET || secret;
  } catch {
    /* local */
  }
  return { base: base.replace(/\/$/, ''), secret };
}

/** Non-blocking; swallows errors. */
export async function emitOsEventViaHx(
  input: HarvicsOsEventInput,
): Promise<void> {
  try {
    const { base, secret } = await resolveHxEnv();
    if (!secret) return;
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign({ sub: 'operator', role: 'admin' }, secret, {
      expiresIn: '10m',
    });
    void fetch(`${base}/api/v1/events/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
