import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { rbacMiddleware } from './middleware/rbac';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/locales';

// Use shared locale configuration
const intlMiddleware = createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false
});

export default function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return;
  }
  
  // Apply RBAC checks first (if route requires auth)
  const rbacResponse = rbacMiddleware(request);
  if (rbacResponse !== undefined) {
    return rbacResponse;
  }
  
  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames - accept any locale
  // Exclude API routes, static files, and Next.js internals
  matcher: [
    // Match all paths except API routes, Next.js internals, and static files
    '/((?!api|_next|_static|favicon|.*\\.).*)',
    // Explicitly match root
    '/'
  ]
};
