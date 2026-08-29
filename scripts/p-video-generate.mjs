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

const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  process.env.CF_ACCOUNT_ID ||
  'c606ef34847cc91452c3e27a2a7a91e6'

const TOKEN = (process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim()

const prompt =
  process.argv.slice(2).join(' ').trim() ||
  'A sports car drifting through a neon-lit city at night, cinematic aerial shot'

const draft = process.env.PVIDEO_DRAFT !== '0'
const duration = Number(process.env.PVIDEO_DURATION || 5)
const resolution = process.env.PVIDEO_RESOLUTION || '720p'
const aspect_ratio = process.env.PVIDEO_ASPECT || '16:9'

async function main() {
  if (!TOKEN) {
    console.error('Set CLOUDFLARE_API_TOKEN (Workers AI Write).')
    process.exit(1)
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/pruna/p-video`
  console.log('Calling', url)
  console.log({ prompt, duration, resolution, aspect_ratio, draft })

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
  const videoUrl =
    result?.video_url || result?.url || result?.uri || result?.video || null
  if (videoUrl) {
    console.log('\nVIDEO URL:\n' + videoUrl)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
