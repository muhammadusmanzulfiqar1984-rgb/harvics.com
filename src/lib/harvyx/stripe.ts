import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  if (!_stripe) {
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export function appOriginFromRequest(req: Request): string {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  const forced = (process.env.HARVYX_APP_ORIGIN || '').trim();
  if (forced) return forced.replace(/\/$/, '');
  return `${proto}://${host}`.replace(/\/$/, '');
}

export function priceIdForPlan(plan: 'pro' | 'scale'): string | null {
  if (plan === 'scale') return (process.env.STRIPE_PRICE_SCALE || '').trim() || null;
  return (process.env.STRIPE_PRICE_PRO || '').trim() || null;
}
