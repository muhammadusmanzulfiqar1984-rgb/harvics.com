/**
 * Stripe / product plan caps for HarvyX Phase 4b.
 */

export type HarvyxPlan = 'free' | 'pro' | 'scale';

export type PlanLimits = {
  plan: HarvyxPlan;
  seats: number;
  dailySendCap: number;
  dailyEnrichCap: number;
  batchSendHardMax: number;
};

export const PLAN_LIMITS: Record<HarvyxPlan, PlanLimits> = {
  free: {
    plan: 'free',
    seats: 1,
    dailySendCap: 20,
    dailyEnrichCap: 50,
    batchSendHardMax: 5,
  },
  pro: {
    plan: 'pro',
    seats: 5,
    dailySendCap: 100,
    dailyEnrichCap: 200,
    batchSendHardMax: 20,
  },
  scale: {
    plan: 'scale',
    seats: 25,
    dailySendCap: 500,
    dailyEnrichCap: 1000,
    batchSendHardMax: 50,
  },
};

export function planFromStripePrice(priceId: string | null | undefined): HarvyxPlan {
  const id = (priceId || '').trim();
  if (!id) return 'free';
  if (id === (process.env.STRIPE_PRICE_SCALE || '').trim()) return 'scale';
  if (id === (process.env.STRIPE_PRICE_PRO || '').trim()) return 'pro';
  // Fallback: match substring
  if (/scale/i.test(id)) return 'scale';
  if (/pro/i.test(id)) return 'pro';
  return 'free';
}

export function limitsForPlan(plan: string): PlanLimits {
  if (plan === 'pro' || plan === 'scale' || plan === 'free') return PLAN_LIMITS[plan];
  return PLAN_LIMITS.free;
}
