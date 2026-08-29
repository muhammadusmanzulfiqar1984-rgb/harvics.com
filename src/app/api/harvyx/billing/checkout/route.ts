import { NextResponse } from 'next/server';
import { requireAuthContext } from '@/app/api/harvyx/auth';
import { getStripe, appOriginFromRequest, priceIdForPlan, isStripeConfigured } from '@/lib/harvyx/stripe';
import { getLeadsDb } from '@/lib/harvyx/d1';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe not configured', hint: 'Set STRIPE_SECRET_KEY + STRIPE_PRICE_PRO/SCALE' },
      { status: 503 },
    );
  }

  const auth = await requireAuthContext(req);
  if (auth instanceof Response) return auth;

  let plan: 'pro' | 'scale' = 'pro';
  try {
    const body = await req.json();
    if (body?.plan === 'scale') plan = 'scale';
  } catch {
    /* default pro */
  }

  const priceId = priceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json({ error: `Missing STRIPE_PRICE_${plan.toUpperCase()}` }, { status: 503 });
  }

  const stripe = getStripe();
  const origin = appOriginFromRequest(req);
  let customerId = auth.org.stripeCustomerId || undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { orgId: auth.org.orgId, clerkUserId: auth.userId || '' },
      name: auth.org.name,
    });
    customerId = customer.id;
    const db = await getLeadsDb();
    if (db) {
      await db
        .prepare(`UPDATE orgs SET stripe_customer_id = ?, updated_at = ? WHERE id = ?`)
        .bind(customerId, new Date().toISOString(), auth.org.orgId)
        .run();
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/harvyx.html?billing=success&plan=${plan}`,
    cancel_url: `${origin}/harvyx.html?billing=cancel`,
    metadata: { orgId: auth.org.orgId, plan },
    subscription_data: { metadata: { orgId: auth.org.orgId, plan } },
  });

  return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
}
