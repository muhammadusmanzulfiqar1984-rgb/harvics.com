#!/usr/bin/env node
/**
 * Local / CLI test for Cloudflare Workers AI — pruna/p-video
 *
 * Uses the REST API (no Worker needed):
 *   CLOUDFLARE_API_TOKEN=... node scripts/p-video-generate.mjs "your prompt"
 *
 * Token needs Workers AI Write (or Account AI).
 * Account ID defaults to harvics wrangler account.
 *
 * Defaults: draft=true, 720p, 5s — cheapest for free Neurons.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function loadToken() {
  const fromEnv = (process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim()
  if (fromEnv) return fromEnv
  const envPath = resolve('.env.local')
  if (!existsSync(envPath)) return ''
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^CLOUDFLARE_API_TOKEN=(.+)$/)
    if (m && !m[1].trim().startsWith('#')) return m[1].trim()
  }
  return ''
}

const TOKEN = loadToken()

const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  process.env.CF_ACCOUNT_ID ||
  'c606ef34847cc91452c3e27a2a7a91e6'

function pickVideoUrl(result) {
  if (!result || typeof result !== 'object') return null
  const r = result
  if (typeof r.generation_url === 'string' && r.generation_url.startsWith('http')) return r.generation_url
  for (const key of ['video_url', 'url', 'uri', 'video']) {
    const v = r[key]
    if (typeof v === 'string' && v.startsWith('http')) return v
  }
  for (const nest of ['result', 'output', 'data']) {
    const found = pickVideoUrl(r[nest])
    if (found) return found
  }
  return null
}

function parseArgs(argv) {
  const out = { prompt: '', promptFile: '', outPath: '' }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--prompt-file' && argv[i + 1]) {
      out.promptFile = argv[++i]
    } else if (a === '--out' && argv[i + 1]) {
      out.outPath = argv[++i]
    } else {
      rest.push(a)
    }
  }
  out.prompt = rest.join(' ').trim()
  return out
}

const args = parseArgs(process.argv.slice(2))
const prompt =
  args.prompt ||
  (args.promptFile
    ? readFileSync(resolve(args.promptFile), 'utf8').trim()
    : 'A sports car drifting through a neon-lit city at night, cinematic aerial shot')

const draft = process.env.PVIDEO_DRAFT !== '0'
const duration = Number(process.env.PVIDEO_DURATION || 5)
const resolution = process.env.PVIDEO_RESOLUTION || '720p'
const aspect_ratio = process.env.PVIDEO_ASPECT || '16:9'
const outPath =
  args.outPath ||
  process.env.PVIDEO_OUT ||
  'public/assets/harvictrade/heroes/textiles/hero-cinematic.mp4'

async function downloadVideo(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buf)
  console.log('\nSaved:', dest, `(${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
}

async function main() {
  if (!TOKEN) {
    console.error('Set CLOUDFLARE_API_TOKEN (Workers AI Write).')
    process.exit(1)
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/pruna/p-video`
  console.log('Calling', url)
  console.log({ duration, resolution, aspect_ratio, draft, outPath })
  console.log('Prompt preview:', prompt.slice(0, 120) + '…')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration,
      resolution,
      aspect_ratio,
      draft,
    }),
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error('Non-JSON response', res.status, text.slice(0, 500))
    process.exit(1)
  }

  if (!res.ok) {
    console.error('Failed', res.status, JSON.stringify(json, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify(json, null, 2))
  const result = json.result ?? json
  const videoUrl = pickVideoUrl(result)

  if (typeof result?.video === 'string' && result.video.startsWith('data:')) {
    const b64 = result.video.split(',')[1]
    const buf = Buffer.from(b64, 'base64')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, buf)
    console.log('\nSaved (base64):', outPath)
    return
  }

  if (videoUrl) {
    console.log('\nVIDEO URL:\n' + videoUrl)
    await downloadVideo(videoUrl, resolve(outPath))
    return
  }

  console.error('No video URL in response — check raw JSON above.')
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
