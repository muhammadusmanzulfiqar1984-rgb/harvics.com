#!/usr/bin/env node
/**
 * Sync selected secrets from .env.local → Cloudflare Worker secrets (harvics-com)
 * and refresh .dev.vars for local `wrangler` / OpenNext preview.
 *
 * Usage:
 *   node scripts/sync-env-to-cloudflare.mjs              # .dev.vars only
 *   node scripts/sync-env-to-cloudflare.mjs --remote      # also wrangler secret bulk
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const root = process.cwd()
const remote = process.argv.includes('--remote')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const out = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    let k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    if (v) out[k] = v
  }
  return out
}

/** Secrets the Worker / API routes need in production */
const SECRET_KEYS = [
  'GROQ_API_KEY',
  'GROQ_MODEL',
  'OPENAI_API_KEY',
  'NVIDIA_API_KEY',
  'NVIDIA_CHAT_MODEL',
  'DEEPSEEK_API_KEY',
  'DEEPGRAM_API_KEY',
  'GEMINI_API_KEY',
  'INTERNAL_API_KEY',
  'CLERK_SECRET_KEY',
  'HX_JWT_SECRET',
  'HX_API_BASE_URL',
  'HARVYX_API_KEY',
  'HARVYX_API_BASE',
  'HX_RESEND_API_KEY',
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'HX_RESEND_FROM',
  'REPLY_TO',
  'HX_EMAIL_PROVIDER',
  'HX_SENDGRID_FROM',
  'SENDGRID_API_KEY',
  'HX_TWILIO_ACCOUNT_SID',
  'HX_TWILIO_AUTH_TOKEN',
  'HX_TWILIO_SMS_FROM',
  'HX_TWILIO_WHATSAPP_FROM',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'INTERCOM_ACCESS_TOKEN',
  'HX_INTERCOM_ACCESS_TOKEN',
  'INTERCOM_APOLLO_ACCESS_TOKEN',
  'INTERCOM_ASSIST_ACCESS_TOKEN',
  'INTERCOM_IDENTITY_SECRET',
  'INTERCOM_CLIENT_SECRET',
  'FIN_VOICE_SECRET',
  'APOLLO_API_KEY',
  'PDL_API_KEY',
  'PEOPLEDATALABS_API_KEY',
  'HUNTER_API_KEY',
  'SERPER_API_KEY',
  'FIRECRAWL_API_KEY',
  'HF_API_KEY',
  'TINYFISH_API_KEY',
  'PHANTOMBUSTER_API_KEY',
  'CLOUDFLARE_API_TOKEN',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_S3_ENDPOINT',
  'CF_AI_GATEWAY_URL',
  'CF_AIG_GATEWAY_ID',
  'REALTIME_APP_ID',
  'REALTIME_HOST_PRESET',
  'REALTIME_GUEST_PRESET',
  'AI_SEARCH_INSTANCE',
  'KAFKA_BOOTSTRAP_SERVER',
  'KAFKA_API_KEY',
  'KAFKA_API_SECRET',
  'KAFKA_TOPIC',
  'KAFKA_CLIENT_ID',
  'KAFKA_GROUP_ID',
  'NEXT_PUBLIC_VAPI_PUBLIC_KEY',
  'NEXT_PUBLIC_VAPI_ASSISTANT_ID',
  'NEXT_PUBLIC_APPS_PIN',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'BACKEND_URL',
  'NEXT_PUBLIC_BACKEND_URL',
]

const env = {
  ...loadEnv(path.join(root, '.env')),
  ...loadEnv(path.join(root, '.env.local')),
}

const payload = {}
const missing = []
for (const key of SECRET_KEYS) {
  if (env[key]) payload[key] = env[key]
  else missing.push(key)
}

// Always keep Worker-local marker
payload.NEXTJS_ENV = env.NEXTJS_ENV || 'production'

const devVarsPath = path.join(root, '.dev.vars')
const lines = Object.entries(payload).map(([k, v]) => {
  const needsQuote = /[\s#"']/.test(v)
  return needsQuote ? `${k}=${JSON.stringify(v)}` : `${k}=${v}`
})
fs.writeFileSync(devVarsPath, lines.join('\n') + '\n', 'utf8')
console.log(`Wrote ${Object.keys(payload).length} keys → .dev.vars`)
if (missing.length) {
  console.log(`Skipped empty (${missing.length}): ${missing.join(', ')}`)
}

if (!remote) {
  console.log('\nLocal only. Re-run with --remote to push Worker secrets:')
  console.log('  node scripts/sync-env-to-cloudflare.mjs --remote')
  process.exit(0)
}

const tmp = path.join(root, '.tmp-cf-secrets.json')
fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8')
console.log(`\nPushing ${Object.keys(payload).length} secrets to harvics-com…`)

const result = spawnSync(
  'npx',
  ['wrangler', 'secret', 'bulk', tmp, '--name', 'harvics-com'],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      ALL_PROXY: '',
      all_proxy: '',
      CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID,
    },
  },
)

try {
  fs.unlinkSync(tmp)
} catch {
  /* ignore */
}

if (result.status !== 0) {
  console.error('\nwrangler secret bulk failed')
  process.exit(result.status || 1)
}
console.log('\nCloudflare Worker secrets synced.')
