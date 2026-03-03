import { Router } from 'express';
import { getMockUserScope, mockUserCredentials } from './userScopes.data';
import { UserScopeTokenPayload } from './userScope.types';

const authRouter = Router();

const encodeToken = (payload: UserScopeTokenPayload) =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

const decodeToken = (token: string): UserScopeTokenPayload =>
  JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // Validate password
  const credentials = mockUserCredentials[username];
  if (!credentials || credentials.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Get user scope
  const scope = getMockUserScope(username);
  if (!scope) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokenPayload: UserScopeTokenPayload = {
    sub: username,
    scope,
    iat: Date.now(),
  };

  const token = encodeToken(tokenPayload);

  return res.json({
    token,
    user: {
      username,
      role: scope.role,
      scope,
    },
  });
});

authRouter.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.json({ valid: false, user: null });
  }

  try {
    const decoded = decodeToken(token);
    return res.json({
      valid: true,
      user: {
        username: decoded.sub,
        role: decoded.scope.role,
        scope: decoded.scope,
      },
    });
  } catch {
    return res.json({ valid: false, user: null });
  }
});

export default authRouter;

