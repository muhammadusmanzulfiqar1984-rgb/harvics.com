import { NextResponse } from 'next/server';
import { requireAuthContext } from '@/app/api/harvyx/auth';
import { getStripe, appOriginFromRequest, isStripeConfigured } from '@/lib/harvyx/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const auth = await requireAuthContext(req);
  if (auth instanceof Response) return auth;

  const customerId = auth.org.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json(
      { error: 'No Stripe customer yet — upgrade via checkout first' },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const origin = appOriginFromRequest(req);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/harvyx.html`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
