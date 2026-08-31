#!/usr/bin/env node
/**
 * Generate textiles hero via OpenAI Sora → hero-cinematic.mp4
 * Requires OPENAI_API_KEY in env or .env.local
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function loadOpenAiKey() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim()
  const envPath = resolve('.env.local')
  if (!existsSync(envPath)) return ''
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^OPENAI_API_KEY=(.+)$/)
    if (m) return m[1].trim()
  }
  return ''
}

const key = loadOpenAiKey()
if (!key) {
  console.error('Set OPENAI_API_KEY in .env.local')
  process.exit(1)
}

const soraCli = resolve(
  process.env.HOME || '',
  '.codex/skills/sora/scripts/sora.py',
)
const promptFile = resolve('scripts/prompts/textiles-hero-cinematic-api.txt')
const out = resolve('public/assets/harvictrade/heroes/textiles/hero-cinematic.mp4')

console.log('Generating NEW cinematic textile hero via Sora (4s, 1280x720)…')
console.log('This takes 1–3 minutes.\n')

const r = spawnSync(
  'uv',
  [
    'run',
    '--with',
    'openai',
    'python',
    soraCli,
    'create-and-poll',
    '--model',
    'sora-2',
    '--prompt-file',
    promptFile,
    '--no-augment',
    '--size',
    '1280x720',
    '--seconds',
    '4',
    '--download',
    '--variant',
    'video',
    '--out',
    out,
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, OPENAI_API_KEY: key, UV_CACHE_DIR: '/tmp/uv-cache' },
  },
)

process.exit(r.status ?? 1)
