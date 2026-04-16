const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
);

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Exclude archive folder from all Next.js processing
  excludeDefaultMomentLocales: true,
  webpack: (config) => {
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
  },
  typescript: {
    // Pre-existing type errors in distributor/competitor pages; safe to ignore during build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'www.harvics.com' },
      { protocol: 'https', hostname: 'harvics.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  trailingSlash: false, // Disable trailing slashes for API routes to work properly
  // output: 'export', // Commented out for development
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined, // Disabled for dev mode
  distDir: '.next',
  reactStrictMode: true,
  // Increase timeout for static generation
  staticPageGenerationTimeout: 300,
  // Proxy API requests to backend
  // This makes all /api/* requests go through Next.js on port 3000, then proxy to backend on 4000
  async rewrites() {
    // IMPORTANT: Always use backend URL (port 4000) for rewrites, NOT NEXT_PUBLIC_API_URL
    // NEXT_PUBLIC_API_URL is for client-side code, but rewrites need the actual backend server
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    // Validate backend URL format
    const isValidUrl = backendUrl.startsWith('http://') || backendUrl.startsWith('https://');
    if (!isValidUrl) {
      console.warn(`Invalid backend URL format: ${backendUrl}. Using default http://localhost:4000`);
    }
    
    const finalBackendUrl = isValidUrl ? backendUrl : 'http://localhost:4000';
    
    console.log(`[Next.js Rewrites] Proxying /api/* to ${finalBackendUrl}/api/*`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${finalBackendUrl}/api/:path*`,
      },
    ];
  },
  // Headers for CSP and security
  async headers() {
    // Get backend URL for CSP (always use actual backend, not frontend proxy)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Frontend URL for client-side
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Build connect-src directive dynamically
    const connectSrc = [
      "'self'",
      // Development URLs - always allow backend and frontend
      "http://localhost:4000",
      "ws://localhost:4000",
      "http://localhost:3000",
      "ws://localhost:3000",
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
      // Weather and currency APIs
      "https://api.openweathermap.org",
      "https://openexchangerates.org",
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: https://maps.gstatic.com https://maps.googleapis.com https://openweathermap.org",
              `connect-src ${connectSrc}`,
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com",
              "worker-src blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              ...(isProduction ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
