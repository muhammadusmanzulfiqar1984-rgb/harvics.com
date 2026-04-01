/**
 * AUTH CONTROLLER
 * Handles user authentication with locale-aware responses
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request } from 'express';
import { getMockUserScope, mockUserCredentials } from './userScopes.data';
import { UserScopeTokenPayload } from './userScope.types';
import { translateError, translateMessage } from '../../core/translate';
// Import locale middleware types
import '../../middleware/locale';

const authRouter = Router();

// Helper to get locale with fallback
const getLocale = (req: Request): string => (req as any).locale || 'en';

const encodeToken = (payload: UserScopeTokenPayload) =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

const decodeToken = (token: string): UserScopeTokenPayload =>
  JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

authRouter.post('/login', (req, res) => {
  const locale = getLocale(req);
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }

  // Validate password
  const credentials = mockUserCredentials[username];
  if (!credentials || credentials.password !== password) {
    return res.status(401).json({ success: false, error: translateError('invalidCredentials', locale) });
  }

  // Get user scope
  const scope = getMockUserScope(username);
  if (!scope) {
    return res.status(401).json({ success: false, error: translateError('invalidCredentials', locale) });
  }

  const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours
  const nowSeconds = Math.floor(Date.now() / 1000);

  const tokenPayload: UserScopeTokenPayload = {
    sub: username,
    scope,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
  };

  const token = encodeToken(tokenPayload);

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
    const decoded = decodeToken(token);

    // Enforce expiry on verify too
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < nowSeconds) {
      return res.json({ success: false, valid: false, user: null, error: translateError('tokenExpired', locale) });
    }

    return res.json({
      success: true,
      valid: true,
      user: {
        username: decoded.sub,
        role: decoded.scope.role,
        scope: decoded.scope,
      },
    });
  } catch {
    return res.json({ success: false, valid: false, user: null, error: translateError('tokenInvalid', locale) });
  }
});

export default authRouter;

