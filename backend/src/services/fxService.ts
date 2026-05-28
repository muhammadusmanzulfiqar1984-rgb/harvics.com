/**
 * HARVICS FX Service — OpenExchangeRates with in-memory cache.
 *
 * Free tier: 1000 requests/month, hourly updates, USD as base.
 * We cache 1 hour so a busy day uses ~24 requests/day.
 */
import 'dotenv/config';

const URL = 'https://openexchangerates.org/api/latest.json';
const getKey = () => process.env.OPEN_EXCHANGE_RATES_APP_ID || process.env.OPENEXCHANGE_APP_ID || '';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RatesCache {
  fetchedAt: number;
  base: string;
  rates: Record<string, number>;
}

let cache: RatesCache | null = null;
let inflight: Promise<RatesCache | null> | null = null;

export const fxEnabled = (): boolean => !!getKey();

/** Hardcoded fallback used when key is missing or API is down. Updated 2026-Q2. */
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, AED: 3.6725, EUR: 0.86, GBP: 0.74, JPY: 159, CNY: 6.79,
  PKR: 278, INR: 83, SAR: 3.75, RUB: 72, TRY: 32, BRL: 5.4, MXN: 17,
  CAD: 1.36, AUD: 1.50, CHF: 0.91, HKD: 7.83, SGD: 1.34, ZAR: 18.5,
  KRW: 1340, IDR: 15800, THB: 36, MYR: 4.7, PHP: 56, VND: 25000,
  NGN: 1600, EGP: 50, KES: 130,
};

async function fetchFreshRates(): Promise<RatesCache | null> {
  const key = getKey();
  if (!key) return null;
  try {
    const r = await fetch(`${URL}?app_id=${key}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) {
      console.warn('[fx] openexchangerates HTTP', r.status);
      return null;
    }
    const j = await r.json();
    if (!j?.rates) return null;
    return { fetchedAt: Date.now(), base: j.base || 'USD', rates: j.rates };
  } catch (e) {
    console.warn('[fx] fetch failed:', (e as Error).message);
    return null;
  }
}

/** Returns cached or fresh rates. Coalesces concurrent calls. */
export async function getRates(): Promise<RatesCache> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache;
  if (!inflight) {
    inflight = (async () => {
      const fresh = await fetchFreshRates();
      if (fresh) cache = fresh;
      inflight = null;
      return cache;
    })();
  }
  await inflight;
  return cache || { fetchedAt: Date.now(), base: 'USD', rates: FALLBACK_RATES };
}

/** Convert amount between two ISO currency codes. Returns null if not possible. */
export async function convert(amount: number, from: string, to: string): Promise<{ amount: number; rate: number; from: string; to: string; usingFallback: boolean } | null> {
  const F = (from || 'USD').toUpperCase();
  const T = (to || 'USD').toUpperCase();
  if (F === T) return { amount, rate: 1, from: F, to: T, usingFallback: false };

  const data = await getRates();
  const usingFallback = data === null || (data.fetchedAt === 0);
  const rates = (data?.rates && Object.keys(data.rates).length > 0) ? data.rates : FALLBACK_RATES;

  // Base is always USD on free tier
  const fromUsd = F === 'USD' ? 1 : rates[F];
  const toUsd = T === 'USD' ? 1 : rates[T];
  if (!fromUsd || !toUsd) return null;
  const rate = toUsd / fromUsd;
  return { amount: amount * rate, rate, from: F, to: T, usingFallback };
}

export function getCacheInfo() {
  if (!cache) return { cached: false, fxEnabled: fxEnabled() };
  return {
    cached: true,
    fxEnabled: fxEnabled(),
    fetchedAt: new Date(cache.fetchedAt).toISOString(),
    ageMs: Date.now() - cache.fetchedAt,
    base: cache.base,
    currencies: Object.keys(cache.rates).length,
  };
}
