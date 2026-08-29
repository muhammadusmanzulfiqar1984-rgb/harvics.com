/**
 * Phase 4b dual auth: Clerk session OR ops API-key seats.
 * Browser without Clerk keys configured remains open (4a ops mode).
 */

import type { HarvyxOrgConfig } from '@/lib/harvyx/org';
import {
  getDefaultOrg,
  getOrgById,
  getOrgForClerkUser,
  resolveOrgId,
  upsertOrgFromClerk,
} from '@/lib/harvyx/org';

export type AuthSeat = {
  key: string;
  seat: string;
};

export type HarvyxAuthContext = {
  mode: 'api-key' | 'clerk' | 'browser';
  seat: string;
  userId?: string;
  org: HarvyxOrgConfig;
};

function allSeats(): AuthSeat[] {
  const seats: AuthSeat[] = [];
  const primary = process.env.HARVYX_API_KEY?.trim();
  if (primary) seats.push({ key: primary, seat: 'primary' });

  const extra = (process.env.HARVYX_API_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  extra.forEach((key, i) => {
    if (!seats.some((s) => s.key === key)) {
      seats.push({ key, seat: `seat_${i + 2}` });
    }
  });
  return seats;
}

export function seatCount(): number {
  return Math.max(allSeats().length, Number(process.env.HARVYX_SEATS || 1) || 1);
}

export function isClerkConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '').trim() &&
      (process.env.CLERK_SECRET_KEY || '').trim(),
  );
}

function matchApiKey(request: Request): AuthSeat | null {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return null;
  return allSeats().find((s) => s.key === apiKey) || null;
}

/**
 * Dual auth for HarvyX APIs only.
 * - Valid x-api-key → ok (MCP/CLI)
 * - Invalid x-api-key → 401
 * - Clerk configured: browser without session still allowed for ops console
 *   (middleware gates /app/* only; do not lock marketing or static console APIs)
 */
export async function authenticate(request: Request): Promise<Response | null> {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    const seats = allSeats();
    if (!seats.length) {
      console.error('[HarvyX] HARVYX_API_KEY env var not set');
      return Response.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    if (!seats.some((s) => s.key === apiKey)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }

  // Browser / console: allow without Clerk session (ops mode).
  // Sign-in is optional via /app/sign-in — middleware does not lock the whole site.
  return null;
}

/** Sync wrapper for routes that still expect Response | null from sync authenticate — prefer authenticate(). */
export function authenticateSync(request: Request): Response | null {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return null;
  const seats = allSeats();
  if (!seats.length) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  if (!seats.some((s) => s.key === apiKey)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function resolveSeat(request: Request): string | null {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return 'browser';
  return allSeats().find((s) => s.key === apiKey)?.seat || null;
}

export async function resolveAuthContext(request: Request): Promise<HarvyxAuthContext | Response> {
  const denied = await authenticate(request);
  if (denied) return denied;

  const seat = matchApiKey(request);
  if (seat) {
    const org = await getOrgById(resolveOrgId(request));
    return { mode: 'api-key', seat: seat.seat, org };
  }

  if (isClerkConfigured()) {
    try {
      const { auth, currentUser } = await import('@clerk/nextjs/server');
      const session = await auth();
      if (session?.userId) {
        let org = await getOrgForClerkUser(session.userId);
        if (!org) {
          const user = await currentUser();
          const email = user?.emailAddresses?.[0]?.emailAddress || '';
          const slug =
            email.includes('@harvics.com') || email.includes('@harvyx.com')
              ? 'harvics'
              : `u_${session.userId.slice(0, 12)}`;
          org = await upsertOrgFromClerk({
            orgId: slug === 'harvics' ? 'harvics' : slug,
            name: slug === 'harvics' ? 'Harvics' : email || slug,
            clerkOrgId: session.orgId || null,
            clerkUserId: session.userId,
          });
          if (slug === 'harvics') {
            const { ensureMember } = await import('@/lib/harvyx/org');
            await ensureMember('harvics', session.userId, 'owner');
            org = await getOrgById('harvics');
          }
        }
        return { mode: 'clerk', seat: 'clerk', userId: session.userId, org };
      }
    } catch (e) {
      console.warn('[HarvyX] resolveAuthContext clerk', e instanceof Error ? e.message : e);
    }
  }

  const org = await getOrgById(resolveOrgId(request));
  return { mode: 'browser', seat: 'browser', org };
}

export async function requireAuthContext(request: Request): Promise<HarvyxAuthContext | Response> {
  return resolveAuthContext(request);
}
