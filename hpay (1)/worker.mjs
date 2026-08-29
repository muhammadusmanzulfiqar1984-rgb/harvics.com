/**
 * Cloudflare Worker — HPay UI (ASSETS) + lean API (auth, health, market).
 * Full Express ledger stays on localhost / a Node host; Workers cannot boot pg/sqlite.
 */
const users = new Map(); // isolate memory — trial only

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
}

function b64url(bytes) {
  let s = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signJwt(payload, secret) {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(sig)}`;
}

async function verifyJwt(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!ok) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function bearer(request) {
  const h = request.headers.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

async function cryptoBoard() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,binancecoin,dogecoin&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await res.json();
    const map = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      XRP: 'ripple',
      BNB: 'binancecoin',
      DOGE: 'dogecoin',
    };
    const rows = Object.entries(map).map(([symbol, id]) => ({
      symbol,
      name: symbol,
      price: Number(data[id]?.usd) || null,
      change24h: Number(data[id]?.usd_24h_change) || 0,
      liquidity: null,
      volume: null,
      marketcap: null,
    }));
    return { mode: 'live', source: 'coingecko', rapidapi_live: false, rows, as_of: new Date().toISOString() };
  } catch {
    return {
      mode: 'sandbox',
      source: 'sandbox-fallback',
      rows: [
        { symbol: 'BTC', price: 95420, change24h: 1.2 },
        { symbol: 'ETH', price: 2740, change24h: 0.8 },
      ],
      as_of: new Date().toISOString(),
    };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Idempotency-Key',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
      });
    }

    if (!url.pathname.startsWith('/api')) {
      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      headers.delete('X-Frame-Options');
      headers.set(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://harvics.com https://www.harvics.com https://app.harvics.com http://localhost:3333 http://localhost:8080 http://localhost:3000 http://127.0.0.1:3333 http://127.0.0.1:8080"
      );
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }

    const secret = env.JWT_SECRET || 'hpay-prototype-2026-secret';

    if (url.pathname === '/api/health' || url.pathname === '/health') {
      return json({
        status: 'healthy',
        platform: 'cloudflare-workers',
        security: 'HPAY-REAL-MONEY-V2',
        ledger: 'ephemeral-isolate',
        neon: Boolean(env.HYPERDRIVE),
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === '/api/v1/market/crypto/board' && request.method === 'GET') {
      return json(await cryptoBoard());
    }

    if ((url.pathname === '/api/v1/auth/signup' || url.pathname === '/api/v1/auth/register') && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!name || !email || password.length < 8) {
        return json({ error: 'Name, email and password (8+) required' }, 400);
      }
      if ([...users.values()].some((u) => u.email === email)) {
        return json({ error: 'Email already registered' }, 409);
      }
      const handle = String(body.handle || name)
        .toLowerCase()
        .replace(/^@/, '')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);
      const user = {
        id: crypto.randomUUID(),
        email,
        name,
        hpay_id: `@${handle || 'user'}`,
        kyc_status: 'not_started',
        password_hash: await sha256(`${email}:${password}`),
      };
      users.set(user.id, user);
      const access_token = await signJwt(
        { id: user.id, email, hpay_id: user.hpay_id, iat: Math.floor(Date.now() / 1000) },
        secret
      );
      const { password_hash, ...safe } = user;
      return json({ access_token, user: safe }, 201);
    }

    if (url.pathname === '/api/v1/auth/login' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = [...users.values()].find((u) => u.email === email);
      const hash = await sha256(`${email}:${password}`);
      if (!user || user.password_hash !== hash) {
        return json({ error: 'Invalid credentials' }, 401);
      }
      const access_token = await signJwt(
        { id: user.id, email: user.email, hpay_id: user.hpay_id, iat: Math.floor(Date.now() / 1000) },
        secret
      );
      const { password_hash, ...safe } = user;
      return json({ access_token, user: safe });
    }

    if (url.pathname === '/api/v1/auth/me' && request.method === 'GET') {
      const payload = await verifyJwt(bearer(request), secret);
      if (!payload?.id) return json({ error: 'Unauthorized' }, 401);
      const user = users.get(payload.id);
      if (!user) return json({ error: 'User not found' }, 404);
      const { password_hash, ...safe } = user;
      return json(safe);
    }

    if (url.pathname === '/api/v1/auth/logout' && request.method === 'POST') {
      return json({ message: 'Logged out successfully' });
    }

    if (url.pathname === '/api/v1/accounts' && request.method === 'GET') {
      const payload = await verifyJwt(bearer(request), secret);
      if (!payload?.id) return json({ error: 'Unauthorized' }, 401);
      return json({
        accounts: [
          {
            id: `acc_${payload.id}`,
            user_id: payload.id,
            type: 'consumer_wallet',
            currency: 'USD',
            status: 'ACTIVE',
            balance_cents: 0,
            balance: '0.00',
          },
        ],
      });
    }

    if (url.pathname === '/api/v1/accounts/balances' && request.method === 'GET') {
      const payload = await verifyJwt(bearer(request), secret);
      if (!payload?.id) return json({ error: 'Unauthorized' }, 401);
      return json({
        account_id: `acc_${payload.id}`,
        currency: 'USD',
        balance_cents: 0,
        balance: '0.00',
        USD: 0,
      });
    }

    return json({ error: 'Not implemented on Cloudflare isolate', path: url.pathname }, 404);
  },
};
