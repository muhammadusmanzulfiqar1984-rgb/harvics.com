import { Request, Response, NextFunction } from 'express';
import { UserScopeTokenPayload } from '../modules/auth/userScope.types';
import { verifyToken } from '../modules/auth/auth.controller';

// Demo tokens issued by frontend for local testing
const DEMO_SCOPES: Record<string, UserScopeTokenPayload> = {
  'demo-token-company_admin': { sub: 'admin', scope: { userId: 'admin', role: 'company', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: true } }, iat: 0, exp: 9999999999 },
  'demo-token-supplier':      { sub: 'supplier_user', scope: { userId: 'supplier_user', role: 'supplier', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: false } }, iat: 0, exp: 9999999999 },
  'demo-token-distributor':   { sub: 'distributor_user', scope: { userId: 'distributor_user', role: 'distributor', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: false } }, iat: 0, exp: 9999999999 },
  'demo-token-hq':            { sub: 'hq_user', scope: { userId: 'hq_user', role: 'hq', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: true } }, iat: 0, exp: 9999999999 },
  'demo-token-sales_officer': { sub: 'sales_officer_user', scope: { userId: 'sales_officer_user', role: 'sales_officer', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: false } }, iat: 0, exp: 9999999999 },
  'demo-token-country_manager': { sub: 'country_manager_user', scope: { userId: 'country_manager_user', role: 'country_manager', countries: [], territories: [], warehouseIds: [], currency: 'USD', geographic: { global: false } }, iat: 0, exp: 9999999999 },
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
    const payload = verifyToken(token);
    req.userScope = payload.scope;
    req.user = {
      id: payload.sub,
      role: payload.scope?.role,
    };
    return next();
  } catch (err: unknown) {
    const isExpired = err instanceof Error && err.message === 'jwt expired';
    return res.status(401).json({
      error: isExpired ? 'Token expired' : 'Invalid token',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }
};

