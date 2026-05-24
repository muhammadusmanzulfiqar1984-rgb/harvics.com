/**
 * AUTH CONTROLLER
 * Handles user authentication with locale-aware responses
 *
 * LOCALIZATION: All responses are locale-aware based on req.locale
 * SECURITY: Uses HMAC-SHA256 signed JWT (jsonwebtoken). No plain base64url.
 */

import { Router, Request } from 'express';
import jwt from 'jsonwebtoken';
import { getMockUserScope, mockUserCredentials, verifyPassword } from './userScopes.data';
import { UserScopeTokenPayload } from './userScope.types';
import { translateError, translateMessage } from '../../core/translate';
import { auditLogService } from '../../services/auditLog.service';
// Import locale middleware types
import '../../middleware/locale';

const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'harvics-os-fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + ':refresh';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

// Per-username login lockout. After N failed attempts within the window the
// account is locked for the remainder of the window. IP rate-limiting is done
// separately at the express level in index.ts.
const LOGIN_FAIL_LIMIT = Number(process.env.LOGIN_FAIL_LIMIT || 5);
const LOGIN_FAIL_WINDOW_MS = Number(process.env.LOGIN_FAIL_WINDOW_MS || 15 * 60 * 1000);
const loginFailures = new Map<string, { count: number; firstAt: number }>();

function isLockedOut(username: string): boolean {
  const entry = loginFailures.get(username);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > LOGIN_FAIL_WINDOW_MS) {
    loginFailures.delete(username);
    return false;
  }
  return entry.count >= LOGIN_FAIL_LIMIT;
}

function recordLoginFailure(username: string): void {
  const now = Date.now();
  const entry = loginFailures.get(username);
  if (!entry || now - entry.firstAt > LOGIN_FAIL_WINDOW_MS) {
    loginFailures.set(username, { count: 1, firstAt: now });
  } else {
    entry.count++;
  }
}

function clearLoginFailures(username: string): void {
  loginFailures.delete(username);
}

// Revoked refresh-token jti list (in-memory; swap for Redis in prod).
const revokedRefreshTokens = new Set<string>();

// Helper to get locale with fallback
const getLocale = (req: Request): string => (req as any).locale || 'en';

export function signToken(payload: UserScopeTokenPayload): string {
  // jwt.sign adds iat automatically; we pass exp via expiresIn
  const { iat: _iat, exp: _exp, ...rest } = payload;
  return jwt.sign(rest, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function verifyToken(token: string): UserScopeTokenPayload {
  return jwt.verify(token, JWT_SECRET) as UserScopeTokenPayload;
}

function signRefreshToken(username: string): string {
  const jti = `${username}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
  return jwt.sign({ sub: username, jti, typ: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  } as jwt.SignOptions);
}

authRouter.post('/login', (req, res) => {
  const locale = getLocale(req);
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }

  // Account lockout (per-username)
  if (isLockedOut(username)) {
    auditLogService.write({
      userId: username,
      userRole: 'unknown',
      action: 'login:locked',
      resource: 'users',
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 423,
      allowed: false,
      reason: 'Account temporarily locked due to repeated failed logins',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    return res.status(423).json({
      success: false,
      error: translateError('accountLocked', locale) || 'Account temporarily locked. Try again later.',
      code: 'ACCOUNT_LOCKED',
    });
  }

  // Validate password (bcrypt; demo seed users are hashed at startup)
  const credentials = mockUserCredentials[username];
  if (!credentials || !verifyPassword(username, password)) {
    recordLoginFailure(username);
    auditLogService.write({
      userId: username || 'unknown',
      userRole: 'unknown',
      action: 'login:failed',
      resource: 'users',
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 401,
      allowed: false,
      reason: 'Invalid credentials',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    return res.status(401).json({ success: false, error: translateError('invalidCredentials', locale) });
  }

  // Get user scope
  const scope = getMockUserScope(username);
  if (!scope) {
    return res.status(401).json({ success: false, error: translateError('invalidCredentials', locale) });
  }

  clearLoginFailures(username);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const tokenPayload: UserScopeTokenPayload = {
    sub: username,
    scope,
    iat: nowSeconds,
    exp: nowSeconds + 15 * 60, // 15m, matches ACCESS_TOKEN_TTL default
  };

  const token = signToken(tokenPayload);
  const refreshToken = signRefreshToken(username);

  auditLogService.write({
    userId: username,
    userRole: scope.role,
    action: 'login:success',
    resource: 'users',
    method: 'POST',
    path: '/api/auth/login',
    statusCode: 200,
    allowed: true,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  return res.json({
    success: true,
    message: translateMessage('loginSuccess', locale),
    data: {
      token,
      refreshToken,
      user: {
        username,
        role: scope.role,
        scope,
      },
    }
  });
});

authRouter.post('/refresh', (req, res) => {
  const locale = getLocale(req);
  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      sub: string;
      jti: string;
      typ: string;
    };

    if (decoded.typ !== 'refresh' || revokedRefreshTokens.has(decoded.jti)) {
      return res.status(401).json({ success: false, error: translateError('tokenInvalid', locale), code: 'REFRESH_INVALID' });
    }

    const scope = getMockUserScope(decoded.sub);
    if (!scope) {
      return res.status(401).json({ success: false, error: translateError('tokenInvalid', locale), code: 'REFRESH_INVALID' });
    }

    // Rotate: revoke old refresh jti, issue new pair.
    revokedRefreshTokens.add(decoded.jti);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const accessToken = signToken({
      sub: decoded.sub,
      scope,
      iat: nowSeconds,
      exp: nowSeconds + 15 * 60,
    });
    const newRefresh = signRefreshToken(decoded.sub);

    return res.json({
      success: true,
      data: { token: accessToken, refreshToken: newRefresh },
    });
  } catch {
    return res.status(401).json({ success: false, error: translateError('tokenInvalid', locale), code: 'REFRESH_INVALID' });
  }
});

authRouter.post('/logout', (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken && typeof refreshToken === 'string') {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti?: string };
      if (decoded?.jti) revokedRefreshTokens.add(decoded.jti);
    } catch {
      // ignore — logout is best-effort
    }
  }
  return res.json({ success: true });
});

authRouter.get('/verify', (req, res) => {
  const locale = getLocale(req);
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.json({ success: false, valid: false, user: null, error: translateError('tokenInvalid', locale) });
  }

  try {
    const decoded = verifyToken(token);

    return res.json({
      success: true,
      valid: true,
      user: {
        username: decoded.sub,
        role: decoded.scope?.role,
        scope: decoded.scope,
      },
    });
  } catch (err: unknown) {
    const isExpired = err instanceof Error && err.message === 'jwt expired';
    return res.json({
      success: false,
      valid: false,
      user: null,
      error: isExpired
        ? translateError('tokenExpired', locale)
        : translateError('tokenInvalid', locale),
    });
  }
});

export default authRouter;

