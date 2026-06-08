/**
 * Uploads seed placeholder images to Cloudflare R2 for all missing vertical
 * thumbnails, the hero image, and the brand logo.
 *
 * Run:  node scripts/upload-seed-assets.js
 *
 * Reads R2 credentials from .env.local (R2_ENDPOINT_URL, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, NEXT_PUBLIC_CDN_URL).
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET = 'harvics-media-vault';
const CDN    = process.env.NEXT_PUBLIC_CDN_URL || 'https://pub-f2496164b9544713bde9dd18d56e3663.r2.dev';

if (!process.env.R2_ENDPOINT_URL || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('\n[ERROR] Missing R2 credentials in .env.local\n  Required: R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY\n');
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Vertical seed definitions — accent colour used to tint the placeholder image
const VERTICALS = [
  { key: 'assets/verticals/01-apparels/thumb.webp',   label: 'Apparels',    hex: '#3B82F6' },
  { key: 'assets/verticals/02-fmcg/thumb.webp',       label: 'FMCG',        hex: '#10B981' },
  { key: 'assets/verticals/03-commodities/thumb.webp',label: 'Commodities', hex: '#C3A35E' },
  { key: 'assets/verticals/04-industrial/thumb.webp', label: 'Industrial',  hex: '#71717A' },
  { key: 'assets/verticals/05-minerals/thumb.webp',   label: 'Minerals',    hex: '#78716C' },
  { key: 'assets/verticals/06-oil-gas/thumb.webp',    label: 'Oil & Gas',   hex: '#F97316' },
  { key: 'assets/verticals/07-real-estate/thumb.webp',label: 'Real Estate', hex: '#06B6D4' },
  { key: 'assets/verticals/08-sourcing/thumb.webp',   label: 'Sourcing',    hex: '#8B5CF6' },
  { key: 'assets/verticals/09-finance/thumb.webp',    label: 'Finance',     hex: '#14B8A6' },
  { key: 'assets/verticals/10-ai-tech/thumb.webp',    label: 'AI & Tech',   hex: '#EC4899' },
];

const HERO = { key: 'assets/shared/heroes/hero-page-1.webp', label: 'Hero', width: 1920, height: 1080, hex: '#1A0505' };

const LOGO_SVG_PATH = path.join(__dirname, '../public/assets/brand/logo/primary.svg');
const LOGO_KEY = 'assets/brand/logo/primary.svg';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

async function objectExists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function generateThumb(label, hex, width = 1400, height = 900) {
  const { r, g, b } = hexToRgb(hex);

  // Dark gradient overlay composed with the accent colour
  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stop-color="rgba(0,0,0,0.75)"/>
          <stop offset="100%" stop-color="rgba(${r},${g},${b},0.55)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <text
        x="50%" y="50%"
        dominant-baseline="middle" text-anchor="middle"
        font-family="Helvetica Neue, Arial, sans-serif"
        font-size="${Math.round(width / 18)}"
        font-weight="300"
        letter-spacing="${Math.round(width / 70)}"
        fill="rgba(255,255,255,0.9)"
      >${label.toUpperCase().replace(/&/g, '&amp;')}</text>
      <text
        x="50%" y="62%"
        dominant-baseline="middle" text-anchor="middle"
        font-family="Helvetica Neue, Arial, sans-serif"
        font-size="${Math.round(width / 55)}"
        font-weight="400"
        fill="rgba(195,163,94,0.85)"
      >HARVICS</text>
    </svg>
  `;

  return sharp({
    create: { width, height, channels: 4, background: { r, g, b, alpha: 1 } },
  })
    .composite([{ input: Buffer.from(svgOverlay), blend: 'over' }])
    .webp({ quality: 88 })
    .toBuffer();
}

async function upload(key, body, contentType) {
  await r2.send(new PutObjectCommand({
    Bucket:       BUCKET,
    Key:          key,
    Body:         body,
    ContentType:  contentType,
    CacheControl: 'public, max-age=31536000',
  }));
  console.log(`  ✓  ${CDN}/${key}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🪣  Bucket: ${BUCKET}`);
  console.log(`🌐  CDN:    ${CDN}\n`);

  // 1. Vertical thumbnails
  console.log('── Vertical thumbnails ──────────────────────────────────────────');
  for (const v of VERTICALS) {
    if (await objectExists(v.key)) {
      console.log(`  ⏭  already exists — ${v.key}`);
      continue;
    }
    const buf = await generateThumb(v.label, v.hex);
    await upload(v.key, buf, 'image/webp');
  }

  // 2. Hero image
  console.log('\n── Hero image ───────────────────────────────────────────────────');
  if (await objectExists(HERO.key)) {
    console.log(`  ⏭  already exists — ${HERO.key}`);
  } else {
    const buf = await generateThumb(HERO.label, HERO.hex, HERO.width, HERO.height);
    await upload(HERO.key, buf, 'image/webp');
  }

  // 3. Logo SVG (from local public/assets)
  console.log('\n── Brand logo ───────────────────────────────────────────────────');
  if (await objectExists(LOGO_KEY)) {
    console.log(`  ⏭  already exists — ${LOGO_KEY}`);
  } else if (fs.existsSync(LOGO_SVG_PATH)) {
    const svgBuf = fs.readFileSync(LOGO_SVG_PATH);
    await upload(LOGO_KEY, svgBuf, 'image/svg+xml');
  } else {
    console.log(`  ⚠  logo SVG not found at ${LOGO_SVG_PATH}, skipping`);
  }

  console.log('\n✅  Done. All assets are live on R2.\n');
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
