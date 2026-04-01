import { Request, Response, NextFunction } from 'express';
import { UserScopeTokenPayload } from '../modules/auth/userScope.types';

const decodeToken = (token: string): UserScopeTokenPayload =>
  JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

// Demo tokens issued by frontend for local testing
const DEMO_SCOPES: Record<string, UserScopeTokenPayload> = {
  'demo-token-company_admin': { sub: 'admin', scope: { userId: 'admin', role: 'company_admin', geographic: { global: true, countries: [], territories: [] } } },
  'demo-token-supplier':      { sub: 'supplier_user', scope: { userId: 'supplier_user', role: 'supplier', geographic: { global: false, countries: [], territories: [] } } },
  'demo-token-distributor':   { sub: 'distributor_user', scope: { userId: 'distributor_user', role: 'distributor', geographic: { global: false, countries: [], territories: [] } } },
  'demo-token-hq':            { sub: 'hq_user', scope: { userId: 'hq_user', role: 'hq', geographic: { global: true, countries: [], territories: [] } } },
  'demo-token-sales_officer': { sub: 'sales_officer_user', scope: { userId: 'sales_officer_user', role: 'sales_officer', geographic: { global: false, countries: [], territories: [] } } },
};

export const requireAuthScope = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  // Allow frontend demo tokens (local dev only)
  if (token.startsWith('demo-token-') && DEMO_SCOPES[token]) {
    const demo = DEMO_SCOPES[token];
    req.userScope = demo.scope;
    req.user = { id: demo.sub, role: demo.scope.role };
    return next();
  }

  try {
    const payload = decodeToken(token);

    // Enforce token expiry
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSeconds) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }

    req.userScope = payload.scope;
    req.user = {
      id: payload.sub,
      role: payload.scope.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

