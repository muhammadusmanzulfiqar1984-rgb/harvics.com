const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
);

const path = require('path')
const distDir = process.env.NEXT_DIST_DIR || '.next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingExcludes: {
    '*': [
      './public/assets/verticals/**',
      './public/_originals/**',
      './archive/**',
      './backend/backups/**',
      './ai-engine/**',
      './node_modules/@swc/core-linux-x64-musl/**',
      './node_modules/@esbuild/**',
    ],
  },
  // Exclude archive folder from all Next.js processing
  excludeDefaultMomentLocales: true,
  webpack: (config) => {
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
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'lodash'],
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
    // Serve /public assets directly — avoids _next/image failures on Cloudflare/local
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'www.harvics.com' },
      { protocol: 'https', hostname: 'harvics.com' },
      { protocol: 'https', hostname: 'media.harvics.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'pub-f2496164b9544713bde9dd18d56e3663.r2.dev' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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
      { source: '/launch/harvoice', destination: 'https://harvoice.pages.dev/index.html' },
      { source: '/launch/harvoice/:path*', destination: 'https://harvoice.pages.dev/:path*' },
    );

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    if (backendUrl) {
      const isValidUrl = backendUrl.startsWith('http://') || backendUrl.startsWith('https://');
      if (isValidUrl) {
        rewrites.push({
          source: '/api/:path((?!gro[qk](?:/|$)).*)',
          destination: `${backendUrl}/api/:path`,
        });
      }
    }

    return rewrites;
  },
  async redirects() {
    return [
      // Presentation deck — serve the static HTML directly, bypassing [locale] route
      { source: '/vietnam-denim-presentation', destination: '/vietnam-denim-presentation/index.html', permanent: false },
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
      // Common production API patterns
      ...(isProduction ? [
        "https://api.harvics.com",
        "wss://api.harvics.com",
        "https://*.harvics.com",
        "wss://*.harvics.com"
      ] : [])
    ].join(' ');

    return [
      // Cache static images for 1 year
      {
        source: '/(:path*\\.(?:jpg|jpeg|png|gif|webp|avif|svg|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache fonts for 1 year
      {
        source: '/(:path*\\.(?:woff|woff2|ttf|otf|eot))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache videos for 7 days with range support
      {
        source: '/(:path*\\.(?:mp4|webm|mov))',
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://unpkg.com data:",
              "img-src 'self' data: blob: https: https://maps.gstatic.com https://maps.googleapis.com https://openweathermap.org https://unpkg.com",
              "media-src 'self' blob: https: data:",
              `connect-src ${connectSrc}`,
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com https://*.daily.co https://*.vapi.ai",
              "worker-src blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
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

module.exports = withNextIntl(nextConfig);

// OpenNext Cloudflare adapter — local dev integration for bindings.
// Only run during local `next dev`, never during production builds (Vercel/Cloudflare CI).
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL && !process.env.CI) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  } catch {
    /* adapter not installed — skip */
  }
}
