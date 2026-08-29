/**
 * Forex adapter — RapidAPI Currency Conversion & Exchange Rates
 * Docs host: currency-conversion-and-exchange-rates.p.rapidapi.com
 *
 * Env:
 *   RAPIDAPI_KEY
 *   RAPIDAPI_FOREX_HOST (optional)
 */
const DEFAULT_HOST = 'currency-conversion-and-exchange-rates.p.rapidapi.com';

function createForexAdapter() {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_FOREX_KEY || '';
  const host = process.env.RAPIDAPI_FOREX_HOST || DEFAULT_HOST;
  const liveReady = Boolean(apiKey && String(apiKey).trim());

  const FALLBACK = Object.freeze({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.6725,
    PKR: 278.5,
    USDC: 1,
    USDT: 1,
  });

  async function rapidGet(pathAndQuery) {
    const url = `https://${host}${pathAndQuery}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': host,
        'x-rapidapi-key': apiKey,
      },
    });
    const text = await res.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text.slice(0, 400) };
    }
    if (!res.ok) {
      const err = new Error(body?.message || `Forex API HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  return {
    id: 'rapidapi-forex',
    purpose: 'Currency conversion & exchange rates',
    mode: liveReady ? 'live' : 'sandbox',
    live_ready: liveReady,
    host,

    async latest({ base = 'USD', symbols } = {}) {
      const sym =
        symbols ||
        'EUR,GBP,AED,PKR,JPY,CHF,CAD,AUD,SAR,INR';
      if (!liveReady) {
        const rates = {};
        for (const s of String(sym).split(',')) {
          const code = s.trim().toUpperCase();
          if (!code) continue;
          rates[code] = FALLBACK[code] ?? null;
        }
        return {
          mode: 'sandbox',
          success: true,
          base: base.toUpperCase(),
          date: new Date().toISOString().slice(0, 10),
          rates,
          source: 'sandbox-fallback',
        };
      }
      const q = new URLSearchParams({ base: base.toUpperCase(), symbols: String(sym) });
      const data = await rapidGet(`/latest?${q}`);
      return { mode: 'live', source: host, ...data };
    },

    async timeseries({ start_date, end_date, base = 'USD', symbols = 'EUR,GBP' } = {}) {
      if (!start_date || !end_date) {
        throw Object.assign(new Error('start_date and end_date required'), { status: 400 });
      }
      if (!liveReady) {
        return {
          mode: 'sandbox',
          success: true,
          base: base.toUpperCase(),
          start_date,
          end_date,
          rates: {
            [start_date]: { EUR: 0.88, GBP: 0.79 },
            [end_date]: { EUR: 0.88, GBP: 0.79 },
          },
          source: 'sandbox-fallback',
        };
      }
      const q = new URLSearchParams({
        start_date,
        end_date,
        base: base.toUpperCase(),
        symbols: String(symbols),
      });
      const data = await rapidGet(`/timeseries?${q}`);
      return { mode: 'live', source: host, ...data };
    },

    async convert({ from = 'USD', to = 'AED', amount = 1 } = {}) {
      const amt = Number(amount);
      if (!(amt > 0)) throw Object.assign(new Error('amount must be positive'), { status: 400 });
      const latest = await this.latest({ base: from, symbols: to });
      const rate = Number(latest.rates?.[to.toUpperCase()]);
      if (!rate) throw Object.assign(new Error(`No rate for ${from}->${to}`), { status: 404 });
      return {
        mode: latest.mode,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: amt,
        rate,
        result: Number((amt * rate).toFixed(8)),
        date: latest.date,
        source: latest.source,
      };
    },
  };
}

module.exports = { createForexAdapter };
