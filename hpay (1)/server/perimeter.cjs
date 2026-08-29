/**
 * L7 — Perimeter & network hardening helpers
 * WAF-style headers, HSTS, CSP, sliding-window rate limit.
 */

function createPerimeter({ windowMs = 60_000, maxRequests = 120 } = {}) {
  /** @type {Map<string, number[]>} */
  const hits = new Map();

  function clientKey(req) {
    return (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  function securityHeaders(_req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* ws://localhost:* https:; frame-ancestors 'self' http://localhost:3333 http://localhost:8080 http://localhost:3000 http://127.0.0.1:3333 http://127.0.0.1:8080 https://harvics.com https://www.harvics.com https://app.harvics.com"
    );
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-HPay-Protocol', 'HPAY-REAL-MONEY-V2');
    res.setHeader('X-HPay-Layer', 'L7');
    next();
  }

  function rateLimit(req, res, next) {
    const key = clientKey(req);
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(key, arr);
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - arr.length)));
    if (arr.length > maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        layer: 'L7',
        retry_after_ms: windowMs,
      });
    }
    next();
  }

  return { securityHeaders, rateLimit };
}

module.exports = { createPerimeter };
