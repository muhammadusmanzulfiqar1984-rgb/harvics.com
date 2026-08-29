/**
 * Crypto adapter — RapidAPI Realtime Crypto Prices + spot complement
 * Host: realtime-crypto-prices.p.rapidapi.com
 *
 * Live RapidAPI paths (verified):
 *   GET /liquidity?symbol=BTC   → { symbol, liquidity, readable_liquidity }
 *   GET /volume?symbol=BTC      → { symbol, volume, readable_volume }
 *   GET /marketcap?symbol=BTC   → { symbol, marketcap, readable_marketcap }
 *
 * Spot USD + 24h change: CoinGecko simple price (no key) — RapidAPI has no working /rate path.
 *
 * Env: RAPIDAPI_KEY, RAPIDAPI_CRYPTO_HOST
 */
const DEFAULT_HOST = 'realtime-crypto-prices.p.rapidapi.com';

const COINGECKO_IDS = Object.freeze({
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XRP: 'ripple',
  BNB: 'binancecoin',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  USDC: 'usd-coin',
  USDT: 'tether',
});

const FALLBACK = Object.freeze({
  BTC: { price: 95420, change24h: 1.2 },
  ETH: { price: 2740, change24h: 0.8 },
  SOL: { price: 148, change24h: 2.1 },
  XRP: { price: 2.15, change24h: -0.4 },
  BNB: { price: 620, change24h: 0.5 },
  DOGE: { price: 0.18, change24h: -1.1 },
  ADA: { price: 0.72, change24h: 0.3 },
  AVAX: { price: 28, change24h: 1.4 },
  USDC: { price: 1, change24h: 0 },
  USDT: { price: 1, change24h: 0 },
});

function createCryptoAdapter() {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_CRYPTO_KEY || '';
  const host = process.env.RAPIDAPI_CRYPTO_HOST || DEFAULT_HOST;
  const liveReady = Boolean(apiKey && String(apiKey).trim());

  async function rapidGet(pathAndQuery) {
    const url = `https://${host}${pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`}`;
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
      body = { raw: text.slice(0, 500) };
    }
    if (!res.ok) {
      const err = new Error(body?.message || body?.error || `Crypto API HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  function normalizeSymbol(symbol) {
    return String(symbol || 'BTC').toUpperCase().replace(/USDT$|USD$/, '') || 'BTC';
  }

  async function fetchSpotBatch(symbols) {
    const ids = [...new Set(symbols.map((s) => COINGECKO_IDS[s]).filter(Boolean))];
    if (!ids.length) return {};
    const url =
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}` +
      `&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Spot feed HTTP ${res.status}`);
    const data = await res.json();
    const bySymbol = {};
    for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
      if (!symbols.includes(sym) || !data[id]) continue;
      bySymbol[sym] = {
        price: Number(data[id].usd) || null,
        change24h: Number(data[id].usd_24h_change) || 0,
      };
    }
    return bySymbol;
  }

  async function enrichRapid(sym) {
    if (!liveReady) {
      return {
        liquidity: null,
        readable_liquidity: null,
        volume: null,
        readable_volume: null,
        marketcap: null,
        readable_marketcap: null,
      };
    }
    const [liq, vol, mcap] = await Promise.allSettled([
      rapidGet(`/liquidity?symbol=${encodeURIComponent(sym)}`),
      rapidGet(`/volume?symbol=${encodeURIComponent(sym)}`),
      rapidGet(`/marketcap?symbol=${encodeURIComponent(sym)}`),
    ]);
    const L = liq.status === 'fulfilled' ? liq.value : {};
    const V = vol.status === 'fulfilled' ? vol.value : {};
    const M = mcap.status === 'fulfilled' ? mcap.value : {};
    return {
      liquidity: Number(L.liquidity ?? NaN) || null,
      readable_liquidity: L.readable_liquidity || null,
      volume: Number(V.volume ?? NaN) || null,
      readable_volume: V.readable_volume || null,
      marketcap: Number(M.marketcap ?? NaN) || null,
      readable_marketcap: M.readable_marketcap || null,
    };
  }

  return {
    id: 'rapidapi-crypto',
    purpose: 'Realtime crypto prices, liquidity, volume & market cap',
    mode: liveReady ? 'live' : 'sandbox',
    live_ready: liveReady,
    host,

    async liquidity({ symbol = 'BTC' } = {}) {
      const sym = normalizeSymbol(symbol);
      if (!liveReady) {
        return {
          mode: 'sandbox',
          source: 'sandbox-fallback',
          symbol: sym,
          liquidity: null,
          readable_liquidity: null,
        };
      }
      const data = await rapidGet(`/liquidity?symbol=${encodeURIComponent(sym)}`);
      return {
        mode: 'live',
        source: host,
        symbol: data?.symbol || sym,
        liquidity: Number(data?.liquidity ?? NaN) || null,
        readable_liquidity: data?.readable_liquidity || null,
        as_of: new Date().toISOString(),
        raw: data,
      };
    },

    async volume({ symbol = 'BTC' } = {}) {
      const sym = normalizeSymbol(symbol);
      if (!liveReady) {
        return { mode: 'sandbox', symbol: sym, volume: null, readable_volume: null };
      }
      const data = await rapidGet(`/volume?symbol=${encodeURIComponent(sym)}`);
      return {
        mode: 'live',
        source: host,
        symbol: data?.symbol || sym,
        volume: Number(data?.volume ?? NaN) || null,
        readable_volume: data?.readable_volume || null,
        as_of: new Date().toISOString(),
        raw: data,
      };
    },

    async marketcap({ symbol = 'BTC' } = {}) {
      const sym = normalizeSymbol(symbol);
      if (!liveReady) {
        return { mode: 'sandbox', symbol: sym, marketcap: null, readable_marketcap: null };
      }
      const data = await rapidGet(`/marketcap?symbol=${encodeURIComponent(sym)}`);
      return {
        mode: 'live',
        source: host,
        symbol: data?.symbol || sym,
        marketcap: Number(data?.marketcap ?? NaN) || null,
        readable_marketcap: data?.readable_marketcap || null,
        as_of: new Date().toISOString(),
        raw: data,
      };
    },

    async rates({ symbol = 'BTC' } = {}) {
      const sym = normalizeSymbol(symbol);
      try {
        const spot = await fetchSpotBatch([sym]);
        const row = spot[sym] || FALLBACK[sym] || { price: null, change24h: 0 };
        return {
          mode: liveReady ? 'live' : 'sandbox',
          source: 'coingecko+rapidapi',
          symbol: sym,
          price: row.price,
          rate: row.price,
          change24h: row.change24h,
          to_fiat: 'USD',
          as_of: new Date().toISOString(),
        };
      } catch {
        const fb = FALLBACK[sym] || { price: null, change24h: 0 };
        return {
          mode: 'sandbox',
          source: 'sandbox-fallback',
          symbol: sym,
          price: fb.price,
          rate: fb.price,
          change24h: fb.change24h,
          to_fiat: 'USD',
        };
      }
    },

    async tickers({ symbols = 'BTC,ETH' } = {}) {
      const board = await this.board({ symbols });
      const out = {};
      for (const row of board.rows) {
        out[row.symbol] = {
          mode: board.mode,
          symbol: row.symbol,
          price: row.price,
          rate: row.price,
          change24h: row.change24h,
          liquidity: row.liquidity,
          volume: row.volume,
          marketcap: row.marketcap,
        };
      }
      return {
        mode: board.mode,
        source: board.source,
        tickers: out,
        as_of: board.as_of,
      };
    },

    /** Full blotter for the market ticker rail */
    async board({ symbols = 'BTC,ETH,SOL,XRP,BNB,DOGE' } = {}) {
      const list = String(symbols)
        .split(',')
        .map((s) => normalizeSymbol(s))
        .filter(Boolean);

      let spot = {};
      let spotMode = 'sandbox';
      try {
        spot = await fetchSpotBatch(list);
        spotMode = 'live';
      } catch {
        spot = {};
      }

      const enriched = await Promise.all(
        list.map(async (sym) => {
          const fb = FALLBACK[sym] || { price: null, change24h: 0 };
          const s = spot[sym] || fb;
          let rapid = {
            liquidity: null,
            readable_liquidity: null,
            volume: null,
            readable_volume: null,
            marketcap: null,
            readable_marketcap: null,
          };
          try {
            rapid = await enrichRapid(sym);
          } catch {
            /* keep nulls */
          }
          return {
            symbol: sym,
            name: sym,
            price: s.price,
            change24h: s.change24h,
            ...rapid,
          };
        })
      );

      return {
        mode: liveReady || spotMode === 'live' ? 'live' : 'sandbox',
        source: liveReady ? `${host}+coingecko` : spotMode === 'live' ? 'coingecko' : 'sandbox-fallback',
        rapidapi_live: liveReady,
        rows: enriched,
        as_of: new Date().toISOString(),
      };
    },
  };
}

module.exports = { createCryptoAdapter };
