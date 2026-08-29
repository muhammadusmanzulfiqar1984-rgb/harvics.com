import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/harvyx/stripe';
import { planFromStripePrice, type HarvyxPlan } from '@/lib/harvyx/plans';
import { updateOrgPlan } from '@/lib/harvyx/org';
import { getLeadsDb as getDb } from '@/lib/harvyx/d1';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function findOrgIdByCustomer(customerId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const row = await db
      .prepare(`SELECT id FROM orgs WHERE stripe_customer_id = ? LIMIT 1`)
      .bind(customerId)
      .first();
    return row?.id ? String(row.id) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const secret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not set' }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error('[HarvyX Stripe webhook]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        metadata?: { orgId?: string; plan?: string };
        customer?: string | null;
        subscription?: string | null;
      };

      const orgId = session.metadata?.orgId;
      const plan = (session.metadata?.plan === 'scale' ? 'scale' : 'pro') as HarvyxPlan;
      if (orgId) {
        await updateOrgPlan(orgId, plan, {
          customerId: session.customer || undefined,
          subscriptionId: session.subscription || null,
        });
      }
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object as {
        id: string;
        customer: string;
        status: string;
        metadata?: { orgId?: string; plan?: string };
        items?: { data?: Array<{ price?: { id?: string } }> };
      };
      const orgId =
        sub.metadata?.orgId || (await findOrgIdByCustomer(String(sub.customer))) || null;
      if (orgId) {
        if (event.type === 'customer.subscription.deleted' || sub.status === 'canceled') {
          await updateOrgPlan(orgId, 'free', {
            customerId: String(sub.customer),
            subscriptionId: null,
          });
        } else {
          const priceId = sub.items?.data?.[0]?.price?.id;
          const plan = planFromStripePrice(priceId) || (sub.metadata?.plan as HarvyxPlan) || 'pro';
          await updateOrgPlan(orgId, plan === 'free' ? 'pro' : plan, {
            customerId: String(sub.customer),
            subscriptionId: sub.id,
          });
        }
      }
    }
  } catch (e) {
    console.error('[HarvyX Stripe webhook handler]', e);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
