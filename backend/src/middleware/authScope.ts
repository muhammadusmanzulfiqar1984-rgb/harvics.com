import { Request, Response, NextFunction } from 'express';
import { UserScopeTokenPayload } from '../modules/auth/userScope.types';

const decodeToken = (token: string): UserScopeTokenPayload =>
  JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

export const requireAuthScope = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const payload = decodeToken(token);
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

