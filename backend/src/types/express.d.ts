import type { UserScope } from '../modules/auth/userScope.types';

declare module 'express-serve-static-core' {
  interface Request {
    userScope?: UserScope;
    user?: {
      id: string;
      role: UserScope['role'];
    };
  }
}

