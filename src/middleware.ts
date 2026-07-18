import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rbacMiddleware } from './middleware/rbac';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/locales';
import { hasOpsAccess, opsAccessDeniedResponse } from '@/lib/harvyx/accessAuth';

// Use shared locale configuration
const intlMiddleware = createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false
});

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES as readonly string[]);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect HarvyX + Meet APIs (cookie or INTERNAL_API_KEY)
  if (
    (pathname.startsWith('/api/harvyx/') && !pathname.startsWith('/api/harvyx/access')) ||
    pathname.startsWith('/api/meet/')
  ) {
    if (!(await hasOpsAccess(request))) {
      return opsAccessDeniedResponse();
    }
    return NextResponse.next();
  }

  // Skip middleware for other API and launch routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/launch/')) {
    return;
  }

  // Temporary: bypass intl/RBAC for wheel-map trial while debugging proxy 500s
  if (pathname.includes('/wheel-map-trial')) {
    return NextResponse.next();
  }

  // Redirect localized launch routes (e.g. /en/launch/harvics-os -> /launch/harvics-os)
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && SUPPORTED_LOCALE_SET.has(parts[0]) && parts[1] === 'launch') {
    const url = request.nextUrl.clone();
    url.pathname = '/' + parts.slice(1).join('/');
    return NextResponse.redirect(url);
  }

  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  // Temporary safe redirects for legacy/missing pages.
  if (parts.length >= 2 && SUPPORTED_LOCALE_SET.has(parts[0])) {
    const locale = parts[0];
    const page = parts[1];
    // /architecture still redirects (page not built); /modules now serves the catalog
    if (page === 'architecture') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/modules`;
      return NextResponse.redirect(url);
    }
  }

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
  // Exclude API routes, static files, Next.js internals, and static presentation decks
  matcher: [
    // Match all paths except API routes, Next.js internals, static files, and presentation decks
    '/((?!api|_next|_static|favicon|vietnam-denim-presentation|apps/event-os|apps/harvics-os|apps/vatify|apps/harvoice|.*\\.).*)',
    // Explicitly match root
    '/'
  ]
};
