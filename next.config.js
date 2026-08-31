const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.ANALYZE_OPEN === 'true',
})

const path = require('path')
const distDir = process.env.NEXT_DIST_DIR || '.next'
/** HARVOICEX encrypted messenger (local Express+Vite or prod host) */
const harvoiceAppUrl = (process.env.NEXT_PUBLIC_HARVOICE_URL || 'http://localhost:3000').replace(/\/$/, '')
/** HarvyX Concierge elite executive app */
const harvyxConciergeUrl = (process.env.NEXT_PUBLIC_HARVYX_CONCIERGE_URL || 'http://localhost:3002').replace(/\/$/, '')
/** HPay settlement desk (Cloudflare Worker or local :3001) */
const hpayAppUrl = (process.env.NEXT_PUBLIC_HPAY_URL || 'https://hpay.muhammadusmanzulfiqar1984.workers.dev').replace(/\/$/, '')
const embeddedAppFrameSrc = [harvoiceAppUrl, harvyxConciergeUrl, hpayAppUrl, 'https://*.workers.dev'].join(' ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow 127.0.0.1 in dev (avoids broken webpack HMR / "reading 'call'" when not using localhost)
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingExcludes: {
    '*': [
      './public/assets/**',
      './public/vietnam-denim-presentation/**',
      './public/_originals/**',
      './archive/**',
      './backend/backups/**',
      './ai-engine/**',
      './src/data/harvyx/contacts/**',
      './HARVICS MEMORY/**',
      './node_modules/@swc/core-linux-x64-musl/**',
      './node_modules/@esbuild/**',
    ],
  },
  // Exclude archive folder from all Next.js processing
  excludeDefaultMomentLocales: true,
  webpack: (config, { dev }) => {
    // Memory cache in dev — disk pack cache was leaving deleted client modules
    // as undefined factories ("Cannot read properties of undefined (reading 'call')").
    if (dev) config.cache = { type: 'memory' }
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    }
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.next_old/**',
        '**/HARVICS OLD/**',
        '**/backend/backups/**',
        '**/_archive/**',
        '**/public/_originals/**',
      ],
    }
    return config
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'lodash',
      'framer-motion',
      'gsap',
      '@react-google-maps/api',
      '@studio-freight/lenis',
    ],
  },
  devIndicators: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // output: 'standalone' was breaking Vercel deploys (every URL 404s).
  // Vercel needs default output. Re-enable only for self-hosted Node/Docker via env.
  output: process.env.NEXT_OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,
  typescript: {
    // Allow production deploy while legacy type debt is cleaned up incrementally
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Opt out on Cloudflare/static hosts via NEXT_IMAGE_UNOPTIMIZED=true
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'www.harvics.com' },
      { protocol: 'https', hostname: 'harvics.com' },
      { protocol: 'https', hostname: 'media.harvics.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'pub-f2496164b9544713bde9dd18d56e3663.r2.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  trailingSlash: false, // Disable trailing slashes for API routes to work properly
  // output: 'export', // Commented out for development
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined, // Disabled for dev mode
  distDir,
  reactStrictMode: true,
  // Increase timeout for static generation
  staticPageGenerationTimeout: 300,
  // Proxy API requests to backend (only when BACKEND_URL is set, e.g. local dev)
  // On Vercel without BACKEND_URL, /api/* hits Next.js App Router routes directly.
  async rewrites() {
    const rewrites = [];

    // External launch/CDN rewrites stay off in development (avoid proxy loops in next dev).
    if (process.env.NODE_ENV !== 'development') {
      // Presentation decks on R2 — opt-in after upload (NEXT_PUBLIC_DECK_CDN=true).
      const cdn = process.env.NEXT_PUBLIC_CDN_URL;
      if (cdn && process.env.NEXT_PUBLIC_DECK_CDN === 'true') {
        rewrites.push(
          { source: '/textile-v2/:path*', destination: `${cdn}/textile-v2/:path*` },
          { source: '/mafi-presentation/:path*', destination: `${cdn}/mafi-presentation/:path*` },
          { source: '/vietnam-denim-presentation/:path*', destination: `${cdn}/vietnam-denim-presentation/:path*` },
        );
      }

      // Micro-apps served from Cloudflare Pages under main domain
      rewrites.push(
        { source: '/launch/vatify', destination: 'https://vatify-os.pages.dev/index.html' },
        { source: '/launch/vatify/:path*', destination: 'https://vatify-os.pages.dev/:path*' },
        { source: '/launch/event-os', destination: 'https://harvics-event-os.pages.dev/index.html' },
        { source: '/launch/event-os/:path*', destination: 'https://harvics-event-os.pages.dev/:path*' },
        { source: '/launch/harvics-os', destination: 'https://harvics-os.pages.dev/index.html' },
        { source: '/launch/harvics-os/:path*', destination: 'https://harvics-os.pages.dev/:path*' },
      );
    }

    // Backend API proxy — allowed in development when BACKEND_URL is set (unblocks OS/CRM).
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      const isValidUrl = backendUrl.startsWith('http://') || backendUrl.startsWith('https://');
      if (isValidUrl) {
        rewrites.push({
          // Exclude groq, harvyx, ai, wave8 — those are handled by Next.js routes
          source: '/api/:path((?!gro[qk](?:/|$))(?!harvyx(?:/|$))(?!ai(?:/|$))(?!wave8(?:/|$)).*)',
          destination: `${backendUrl}/api/:path`,
        });
      }
    }

    return rewrites;
  },
  async redirects() {
    return [
      // Legacy bare paths → default locale app / marketing pages (not raw HTML shells)
      { source: '/harvyx', destination: '/en/harvyx', permanent: false },
      { source: '/apps/harvyx', destination: '/en/apps/harvyx', permanent: false },
      { source: '/apps/harvoice', destination: '/en/apps/harvoice', permanent: false },
      { source: '/apps/hpay', destination: '/en/apps/hpay', permanent: false },
      { source: '/launch/hpay', destination: '/en/apps/hpay', permanent: false },
      { source: '/launch/hpay/', destination: '/en/apps/hpay', permanent: false },
      { source: '/apps/harvyx-concierge', destination: '/en/apps/harvyx-concierge', permanent: false },
      // OS nav aliases — one system, no dead links
      { source: '/:locale/os/procurement', destination: '/:locale/os/supplier-procurement', permanent: false },
      { source: '/:locale/os/automation', destination: '/:locale/os/workflows', permanent: false },
      { source: '/:locale/os/competitor', destination: '/:locale/os/competitor-intel', permanent: false },
      // Presentation deck — serve the static HTML directly, bypassing [locale] route
      { source: '/vietnam-denim-presentation', destination: '/vietnam-denim-presentation/index.html', permanent: false },
      { source: '/doha', destination: '/harvics_doha_2.html', permanent: false },
      { source: '/doha/', destination: '/harvics_doha_2.html', permanent: false },
      { source: '/:locale/doha', destination: '/harvics_doha_2.html', permanent: false },
      { source: '/:locale/doha/', destination: '/harvics_doha_2.html', permanent: false },
      { source: '/ventures', destination: '/harvics_ventures.html', permanent: false },
      { source: '/ventures/', destination: '/harvics_ventures.html', permanent: false },
      { source: '/:locale/ventures', destination: '/harvics_ventures.html', permanent: false },
      { source: '/:locale/ventures/', destination: '/harvics_ventures.html', permanent: false },
      { source: '/energies', destination: '/en/energies', permanent: false },
      { source: '/energies/', destination: '/en/energies', permanent: false },
      { source: '/tabraiz-town', destination: '/tabraiz-town/index.html', permanent: false },
      { source: '/tabraiz-town/', destination: '/tabraiz-town/index.html', permanent: false },
      { source: '/launch/tabraiz-town', destination: '/tabraiz-town/index.html', permanent: false },
      { source: '/launch/tabraiz-town/', destination: '/tabraiz-town/index.html', permanent: false },
      { source: '/:locale/real-estate/projects/tabraiz-town', destination: '/:locale/projects/tabraiz-town', permanent: false },
      { source: '/:locale/real-estate/projects/tabraiz-town/', destination: '/:locale/projects/tabraiz-town', permanent: false },
      // Apps — redirect directory paths to index.html
      { source: '/apps/event-os', destination: '/apps/event-os/index.html', permanent: false },
      { source: '/apps/event-os/', destination: '/apps/event-os/index.html', permanent: false },
      { source: '/apps/harvics-os', destination: '/apps/harvics-os/index.html', permanent: false },
      { source: '/apps/harvics-os/', destination: '/apps/harvics-os/index.html', permanent: false },
      { source: '/apps/vatify', destination: '/apps/vatify/index.html', permanent: false },
      { source: '/apps/vatify/', destination: '/apps/vatify/index.html', permanent: false },
      // Legacy launch URLs
      { source: '/launch/event-os', destination: '/apps/event-os/index.html', permanent: true },
      { source: '/launch/harvics-os', destination: '/apps/harvics-os/index.html', permanent: true },
      { source: '/launch/vatify', destination: '/apps/vatify/index.html', permanent: true },
      // HARVOICEX — encrypted messenger (replaces old harvoice.pages.dev shell)
      { source: '/launch/harvoice', destination: '/en/apps/harvoice', permanent: false },
      { source: '/launch/harvoice/', destination: '/en/apps/harvoice', permanent: false },
      // HarvyX Concierge — elite executive app
      { source: '/launch/harvyx-concierge', destination: '/en/apps/harvyx-concierge', permanent: false },
      { source: '/launch/harvyx-concierge/', destination: '/en/apps/harvyx-concierge', permanent: false },
      { source: '/:locale/presentations', destination: '/:locale/la-pres', permanent: true },
      { source: '/:locale/presentations/access', destination: '/:locale/la-pres', permanent: true },
      { source: '/:locale/presentations/lobby', destination: '/:locale/la-pres/lobby', permanent: true },
      { source: '/:locale/presentations/lounge', destination: '/:locale/la-pres/lounge', permanent: true },
      { source: '/:locale/presentations/view/:id', destination: '/:locale/la-pres/:id', permanent: true },
    ];
  },
  // Headers for CSP and security
  async headers() {
    // Get backend URL for CSP (always use actual backend, not frontend proxy)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // Frontend URL for client-side
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Build connect-src directive dynamically
    const connectSrc = [
      "'self'",
      // Development URLs — only in dev; never ship localhost in prod CSP
      ...(isProduction ? [] : [
        "http://localhost:4000",
        "ws://localhost:4000",
        "http://localhost:8080",
        "ws://localhost:8080",
      ]),
      // Backend URL (for direct connections if needed)
      ...(backendUrl.startsWith('http') ? [backendUrl, backendUrl.replace('http', 'ws')] : []),
      // Production API URL (if configured)
      ...(isProduction && apiUrl.startsWith('http') ? [apiUrl, apiUrl.replace('http', 'ws')] : []),
      // Google APIs (Gemini, Maps, Translate, Vision)
      "https://generativelanguage.googleapis.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://translation.googleapis.com",
      "https://vision.googleapis.com",
      // Mapbox APIs (HarvicsGlobe)
      "https://api.mapbox.com",
      "https://events.mapbox.com",
      // Weather and currency APIs
      "https://api.openweathermap.org",
      "https://openexchangerates.org",
      // Vapi voice AI
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://api.vapi.ai",
      "wss://api.vapi.ai",
      "https://*.daily.co",
      "wss://*.daily.co",
      // Clerk auth (HarvyX /app sign-in)
      "https://*.clerk.accounts.dev",
      "https://api.clerk.com",
      "https://clerk.com",
      "https://*.clerk.com",
      "https://clerk-telemetry.com",
      "https://*.clerk-telemetry.com",
      "https://*.protect.clerk.com",
      "https://img.clerk.com",
      // Cloudflare RealtimeKit (video meetings) — API + media/signaling
      "https://realtime.cloudflare.com",
      "https://api.realtime.cloudflare.com",
      "wss://realtime.cloudflare.com",
      "wss://api.realtime.cloudflare.com",
      "https://*.realtime.cloudflare.com",
      "wss://*.realtime.cloudflare.com",
      "https://api.cluster.dyte.in",
      "https://*.dyte.io",
      "wss://*.dyte.io",
      "https://*.dyte.in",
      "wss://*.dyte.in",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      "https://*.vercel-insights.com",
      "https://*.vercel-scripts.com",
      // Intercom
      "https://api-iam.intercom.io",
      "https://api-ping.intercom.io",
      "https://api.intercom.io",
      "https://via.intercom.io",
      "https://*.intercom.io",
      "https://js.intercomcdn.com",
      "https://downloads.intercomcdn.com",
      "https://static.intercomassets.com",
      "https://static.intercomassets.eu",
      "https://*.intercomcdn.com",
      "https://www.intercom-reporting.com",
      "https://app.intercom.com",
      "https://messenger-apps.intercom.io",
      "https://messenger-apps.eu.intercom.io",
      "https://app.getsentry.com",
      "wss://*.intercom.io",
      "https://nexus-websocket-a.intercom.io",
      "wss://nexus-websocket-a.intercom.io",
      "https://nexus-europe-websocket.intercom.io",
      "wss://nexus-europe-websocket.intercom.io",
      // Deepgram (STT — server-side primarily; allow in case of client streaming later)
      "https://api.deepgram.com",
      "wss://api.deepgram.com",
      // Common production API patterns
      ...(isProduction ? [
        "https://api.harvics.com",
        "wss://api.harvics.com",
        "https://*.harvics.com",
        "wss://*.harvics.com"
      ] : [])
    ].join(' ');

    return [
      // HarvyX console HTML may be framed by /[locale]/harvyx/console (same origin)
      {
        source: '/harvyx.html',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com https://*.protect.clerk.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://unpkg.com data:",
              "img-src 'self' data: blob: https: https://img.clerk.com",
              "media-src 'self' blob: https: data:",
              `connect-src ${connectSrc}`,
              "frame-src 'self' https://*.clerk.accounts.dev https://*.protect.clerk.com https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.accounts.dev https://accounts.dev https://clerk.com",
              "frame-ancestors 'self'",
              ...(isProduction ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'microphone=*, camera=*, autoplay=(self), display-capture=()',
          },
        ],
      },
      // Next hashed static assets
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public media under /assets (images + video)
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      // Cache static images for 1 year (extension match)
      {
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache fonts for 1 year
      {
        source: '/:path*\\.(woff|woff2|ttf|otf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache videos for 7 days with range support
      {
        source: '/:path*\\.(mp4|webm|mov)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com https://cdn.jsdelivr.net https://unpkg.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com https://*.protect.clerk.com https://widget.intercom.io https://js.intercomcdn.com https://*.intercomcdn.com https://*.intercom.io https://app.intercom.io https://app.intercom.com https://www.intercom-reporting.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com https://js.intercomcdn.com https://*.intercomcdn.com",
              "font-src 'self' https://fonts.gstatic.com https://unpkg.com data: https://js.intercomcdn.com https://fonts.intercomcdn.com https://*.intercomcdn.com",
              "img-src 'self' data: blob: https: https://maps.gstatic.com https://maps.googleapis.com https://openweathermap.org https://unpkg.com https://img.clerk.com https://static.intercomassets.com https://downloads.intercomcdn.com",
              "media-src 'self' blob: https: data:",
              `connect-src ${connectSrc}`,
              `frame-src 'self' ${embeddedAppFrameSrc} https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com https://*.daily.co https://*.vapi.ai https://realtime.cloudflare.com https://*.realtime.cloudflare.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.protect.clerk.com https://intercom-sheets.com https://*.intercom.io https://js.intercomcdn.com https://*.intercomcdn.com https://widget.intercom.io https://www.intercom-reporting.com https://app.intercom.com https://intercom-sheets.eu.intercom.io`,
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.accounts.dev https://accounts.dev https://clerk.com https://*.intercom.io https://intercom.help",
              "frame-ancestors 'none'",
              ...(isProduction ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
          {
            // Allow microphone (and camera) so Vapi/Daily.co WebRTC iframes can capture audio.
            // Note: Permissions-Policy origin lists do NOT support wildcards, so we use * (all
            // origins) here — Vapi/Daily provision call sessions on unpredictable subdomains.
            key: 'Permissions-Policy',
            value: 'microphone=*, camera=*, autoplay=(self), display-capture=()',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(withBundleAnalyzer(nextConfig));

// OpenNext Cloudflare adapter — opt-in only.
// Plain `next dev` must work without Cloudflare auth.
// Enable with: ENABLE_CF_DEV=1 npm run dev
if (
  process.env.ENABLE_CF_DEV === '1' &&
  process.env.NODE_ENV === 'development' &&
  !process.env.VERCEL &&
  !process.env.CI
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
    Promise.resolve(initOpenNextCloudflareForDev()).catch((err) => {
      console.warn(
        '[dev] Cloudflare bindings unavailable — continuing with plain Next.js.',
        err?.cause?.cause?.notes?.[0]?.text || err?.message || err
      );
    });
  } catch {
    /* adapter not installed — skip */
  }
}
