/**
 * Upload La Pres presentation decks (textile-v2, mafi-presentation) to Cloudflare R2.
 *
 * Run:  node scripts/upload-presentation-decks.js
 *
 * Requires R2 credentials in .env.local (same as upload-seed-assets.js).
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { execSync } = require('child_process')

const fs = require('fs')
const path = require('path')
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3')

const BUCKET = process.env.R2_BUCKET_NAME || 'harvics-media-vault'
const CDN = process.env.NEXT_PUBLIC_CDN_URL || 'https://pub-f2496164b9544713bde9dd18d56e3663.r2.dev'

const DECK_DIRS = [
  { local: 'public/textile-v2', prefix: 'textile-v2' },
  { local: 'public/mafi-presentation', prefix: 'mafi-presentation' },
  { local: 'public/vietnam-denim-presentation', prefix: 'vietnam-denim-presentation', preBuild: 'node scripts/build-vietnam-denim-vite.mjs' },
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
}

if (!process.env.R2_ENDPOINT_URL || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('\n[ERROR] Missing R2 credentials in .env.local\n')
  process.exit(1)
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'src') continue
    if (entry.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

async function objectExists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function uploadFile(localPath, key) {
  const ext = path.extname(localPath).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  const body = fs.readFileSync(localPath)
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    })
  )
}

async function main() {
  console.log(`\nBucket: ${BUCKET}`)
  console.log(`CDN:    ${CDN}\n`)

  let uploaded = 0
  let skipped = 0

  for (const deck of DECK_DIRS) {
    if (deck.preBuild) {
      console.log(`\nPre-build: ${deck.prefix}`)
      execSync(deck.preBuild, { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
    }

    const root = path.join(__dirname, '..', deck.local)
    if (!fs.existsSync(root)) {
      console.warn(`[skip] missing folder: ${deck.local}`)
      continue
    }

    const files = walk(root)
    console.log(`\n── ${deck.prefix} (${files.length} files) ──`)

    for (const file of files) {
      const rel = path.relative(root, file).split(path.sep).join('/')
      const key = `${deck.prefix}/${rel}`

      if (await objectExists(key)) {
        skipped++
        continue
      }

      await uploadFile(file, key)
      uploaded++
      if (uploaded % 25 === 0) console.log(`  … ${uploaded} uploaded`)
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, skipped (already on R2): ${skipped}`)
  console.log(`Test: ${CDN}/textile-v2/lpp/index.html`)
  console.log(`Test: ${CDN}/mafi-presentation/index.html`)
  console.log(`Test: ${CDN}/vietnam-denim-presentation/index.html\n`)
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message)
  process.exit(1)
})
