import { NextResponse } from 'next/server';
import { isClerkConfigured, seatCount } from '@/app/api/harvyx/auth';
import { isStripeConfigured } from '@/lib/harvyx/stripe';
import {
  getDefaultOrg,
  getOrgById,
  getOrgForClerkUser,
  resolveOrgId,
} from '@/lib/harvyx/org';
import { getUsage } from '@/lib/harvyx/usage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Soft session snapshot — never 401s (console chrome). */
export async function GET(req: Request) {
  const clerkConfigured = isClerkConfigured();
  const stripeConfigured = isStripeConfigured();

  let mode: 'api-key' | 'clerk' | 'browser' = 'browser';
  let seat = 'browser';
  let userId: string | null = null;
  let org = await getOrgById(resolveOrgId(req));

  const apiKey = req.headers.get('x-api-key');
  if (apiKey && process.env.HARVYX_API_KEY && apiKey === process.env.HARVYX_API_KEY) {
    mode = 'api-key';
    seat = 'primary';
  } else if (clerkConfigured) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const session = await auth();
      if (session?.userId) {
        mode = 'clerk';
        seat = 'clerk';
        userId = session.userId;
        const memberOrg = await getOrgForClerkUser(session.userId);
        if (memberOrg) org = memberOrg;
      }
    } catch {
      /* unsigned */
    }
  }

  const usage = getUsage(org.orgId);
  return NextResponse.json({
    ok: true,
    clerkConfigured,
    stripeConfigured,
    signedIn: mode === 'clerk' || mode === 'api-key',
    mode,
    seat,
    userId,
    org: {
      orgId: org.orgId,
      name: org.name,
      plan: org.plan,
      seats: Math.max(org.seats, seatCount()),
      dailySendCap: org.dailySendCap,
      dailyEnrichCap: org.dailyEnrichCap,
      batchSendHardMax: org.batchSendHardMax,
      stripeCustomerId: org.stripeCustomerId || null,
    },
    usage,
  });
}
