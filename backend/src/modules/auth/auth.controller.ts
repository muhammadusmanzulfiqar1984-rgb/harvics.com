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
const TOKEN_TTL = '24h';

// Helper to get locale with fallback
const getLocale = (req: Request): string => (req as any).locale || 'en';

export function signToken(payload: UserScopeTokenPayload): string {
  // jwt.sign adds iat automatically; we pass exp via expiresIn
  const { iat: _iat, exp: _exp, ...rest } = payload;
  return jwt.sign(rest, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): UserScopeTokenPayload {
  return jwt.verify(token, JWT_SECRET) as UserScopeTokenPayload;
}

authRouter.post('/login', (req, res) => {
  const locale = getLocale(req);
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }

  // Validate password (bcrypt; demo seed users are hashed at startup)
  const credentials = mockUserCredentials[username];
  if (!credentials || !verifyPassword(username, password)) {
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

  const nowSeconds = Math.floor(Date.now() / 1000);
  const tokenPayload: UserScopeTokenPayload = {
    sub: username,
    scope,
    iat: nowSeconds,
    exp: nowSeconds + 86400,
  };

  const token = signToken(tokenPayload);

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
      user: {
        username,
        role: scope.role,
        scope,
      },
    }
  });
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

