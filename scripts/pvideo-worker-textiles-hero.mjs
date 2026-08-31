#!/usr/bin/env node
/**
 * Generate textiles hero via the deployed harvics-p-video worker.
 * No auth required on the worker UI/API.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const WORKER =
  process.env.PVIDEO_WORKER_URL ||
  'https://harvics-p-video.muhammadusmanzulfiqar1984.workers.dev'

const prompt = existsSync(resolve('scripts/prompts/textiles-hero-cinematic-api.txt'))
  ? readFileSync(resolve('scripts/prompts/textiles-hero-cinematic-api.txt'), 'utf8').trim()
  : 'Classical luxury textile fashion film, macro ivory fabric, atelier, burgundy and gold, 35mm cinematic'

const outPath = resolve('public/assets/harvictrade/heroes/textiles/hero-cinematic.mp4')

async function main() {
  console.log('Calling', WORKER + '/api/video')
  const res = await fetch(WORKER + '/api/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'pruna/p-video',
      prompt,
      duration: 5,
      resolution: '720p',
      aspect_ratio: '16:9',
      draft: true,
    }),
  })

  const json = await res.json()
  console.log(JSON.stringify(json, null, 2))

  if (!json.ok || !json.videoUrl) {
    process.exit(1)
  }

  const vid = await fetch(json.videoUrl)
  if (!vid.ok) throw new Error('Download failed ' + vid.status)
  const buf = Buffer.from(await vid.arrayBuffer())
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  console.log('\nSaved:', outPath, `(${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
