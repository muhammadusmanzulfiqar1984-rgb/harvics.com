import createMiddleware from 'next-intl/middleware';
import type { NextFetchEvent } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware } from './middleware/rbac';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/locales';
import { hasOpsAccess, opsAccessDeniedResponse } from '@/lib/harvyx/accessAuth';

const intlMiddleware = createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false,
});

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES as readonly string[]);
const APP_HOSTS = new Set(['app.harvics.com', 'app.harvyx.com']);

function isClerkConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '').trim() &&
      (process.env.CLERK_SECRET_KEY || '').trim(),
  );
}

function isAppHost(request: NextRequest): boolean {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  return APP_HOSTS.has(host);
}

/** Locale HarvyX app: /en/harvyx, /en/harvyx/console — NOT /en/apps/harvyx (marketing). */
function isLocaleHarvyxApp(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length >= 2 && SUPPORTED_LOCALE_SET.has(parts[0]) && parts[1] === 'harvyx';
}

/** Soft entry only: /en/harvyx (no subpath) — shows Sign in / Sign up gate. */
function isLocaleHarvyxGate(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 2 && SUPPORTED_LOCALE_SET.has(parts[0]) && parts[1] === 'harvyx';
}

/** HarvyX Concierge iframe app: /en/apps/harvyx-concierge — requires login. */
function isLocaleHarvyxConcierge(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return (
    parts.length >= 3 &&
    SUPPORTED_LOCALE_SET.has(parts[0]) &&
    parts[1] === 'apps' &&
    parts[2] === 'harvyx-concierge'
  );
}

/** Harvoice iframe app: /en/apps/harvoice — requires login. */
function isLocaleHarvoiceApp(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return (
    parts.length >= 3 &&
    SUPPORTED_LOCALE_SET.has(parts[0]) &&
    parts[1] === 'apps' &&
    parts[2] === 'harvoice'
  );
}

/** Paths that must run through Clerk (HarvyX console + gated Apps). */
function isHarvyxPath(pathname: string): boolean {
  return (
    pathname.startsWith('/app') ||
    pathname === '/harvyx.html' ||
    pathname === '/harvyx' ||
    isLocaleHarvyxApp(pathname) ||
    isLocaleHarvyxConcierge(pathname) ||
    isLocaleHarvoiceApp(pathname) ||
    pathname.startsWith('/api/harvyx/') ||
    pathname.startsWith('/__clerk/')
  );
}

function isHarvyxPublicApi(pathname: string): boolean {
  return (
    pathname === '/api/harvyx/health' ||
    pathname.startsWith('/api/harvyx/health/') ||
    pathname === '/api/harvyx/billing/webhook' ||
    pathname.startsWith('/api/harvyx/billing/webhook/') ||
    pathname === '/api/harvyx/access' ||
    pathname.startsWith('/api/harvyx/access/') ||
    pathname === '/api/harvyx/me' ||
    pathname.startsWith('/api/harvyx/me/')
  );
}

function isHarvyxAuthPublic(pathname: string): boolean {
  return (
    isHarvyxPublicApi(pathname) ||
    pathname.startsWith('/app/sign-in') ||
    pathname.startsWith('/app/sign-up') ||
    pathname.startsWith('/app/sign-out') ||
    pathname.startsWith('/__clerk/')
  );
}

async function runCoreMiddleware(request: NextRequest): Promise<NextResponse | Response> {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();

  if (isAppHost(request)) {
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone();
      url.pathname = '/en/harvyx';
      return NextResponse.redirect(url);
    }
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 1 && SUPPORTED_LOCALE_SET.has(parts[0])) {
      const url = request.nextUrl.clone();
      url.pathname = '/en/harvyx';
      return NextResponse.redirect(url);
    }
  }

  if (
    isClerkConfigured() &&
    (host === 'www.harvics.com' || host === 'harvics.com') &&
    pathname === '/harvyx.html' &&
    process.env.HARVYX_FORCE_APP_HOST === '1'
  ) {
    const target = process.env.HARVYX_APP_ORIGIN || 'https://app.harvics.com';
    return NextResponse.redirect(`${target.replace(/\/$/, '')}/harvyx.html`);
  }

  if (
    (pathname.startsWith('/api/harvyx/') &&
      !pathname.startsWith('/api/harvyx/access') &&
      !isHarvyxPublicApi(pathname)) ||
    pathname.startsWith('/api/meet/')
  ) {
    if (!(await hasOpsAccess(request))) {
      return opsAccessDeniedResponse();
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/') || pathname.startsWith('/launch/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/app') || pathname === '/harvyx.html' || pathname === '/harvyx') {
    return NextResponse.next();
  }

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

  if (parts.length >= 2 && SUPPORTED_LOCALE_SET.has(parts[0]) && parts[1] === 'architecture') {
    const url = request.nextUrl.clone();
    url.pathname = `/${parts[0]}/modules`;
    return NextResponse.redirect(url);
  }

  const rbacResponse = rbacMiddleware(request);
  if (rbacResponse !== undefined) {
    return rbacResponse;
  }

  // Avoid next-intl absolute rewrite → "Failed to proxy http://localhost:PORT/..." when
  // the dev server is bound to 127.0.0.1 (localhost resolves to ::1 and hangs/404s).
  // Paths that already include a supported locale can pass through directly.
  if (parts.length >= 1 && SUPPORTED_LOCALE_SET.has(parts[0])) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

type ClerkMw = (req: NextRequest, event: NextFetchEvent) => Response | Promise<Response>;
let clerkWrapped: ClerkMw | null = null;

async function getClerkWrapped(): Promise<ClerkMw> {
  if (clerkWrapped) return clerkWrapped;
  const { clerkMiddleware } = await import('@clerk/nextjs/server');

  clerkWrapped = clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;
    const apiKey = request.headers.get('x-api-key');

    // Defense in depth — marketing must never reach here, but skip auth if it does
    if (!isHarvyxPath(pathname)) {
      return runCoreMiddleware(request);
    }

    const needsAuth =
      !apiKey &&
      !isHarvyxAuthPublic(pathname) &&
      !isLocaleHarvyxGate(pathname) &&
      // Protect console + /app shell + Concierge + Harvoice
      (pathname.startsWith('/app') ||
        (isLocaleHarvyxApp(pathname) && !isLocaleHarvyxGate(pathname)) ||
        isLocaleHarvyxConcierge(pathname) ||
        isLocaleHarvoiceApp(pathname) ||
        pathname === '/harvyx.html');

    if (needsAuth) {
      const session = await auth();
      if (!session.userId) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized', code: 'CLERK_REQUIRED' }, { status: 401 });
        }
        const signIn = new URL('/app/sign-in', request.url);
        const redirectTarget =
          isLocaleHarvyxConcierge(pathname) || isLocaleHarvoiceApp(pathname) ? pathname : '/harvyx.html';
        signIn.searchParams.set('redirect_url', redirectTarget);
        return NextResponse.redirect(signIn);
      }
    }

    return runCoreMiddleware(request);
  }) as ClerkMw;

  return clerkWrapped;
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  // CRITICAL: marketing / locale / shop pages never enter Clerk
  if (!isHarvyxPath(pathname)) {
    return runCoreMiddleware(request);
  }

  if (isClerkConfigured()) {
    try {
      const mw = await getClerkWrapped();
      return mw(request, event);
    } catch (e) {
      console.warn('[middleware] Clerk wrap failed', e instanceof Error ? e.message : e);
    }
  }
  return runCoreMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|_static|favicon|vietnam-denim-presentation|tabraiz-town|doha|harvics_doha_2|ventures|harvics_ventures|energies|apps/event-os|apps/harvics-os|apps/vatify|.*\\.).*)',
    '/',
    '/harvyx.html',
    '/harvyx',
    '/api/harvyx/:path*',
    '/api/meet/:path*',
    '/app/:path*',
    '/__clerk/:path*',
  ],
};
