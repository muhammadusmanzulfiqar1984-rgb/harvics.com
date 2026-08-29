#!/usr/bin/env node
/**
 * Live-verify API keys from .env / .env.local.
 * Prints OK/FAIL + HTTP status only (never prints secret values).
 */
import fs from 'fs'
import path from 'path'

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
    out[k] = v
  }
  return out
}

const root = process.cwd()
const e = {
  ...loadEnv(path.join(root, '.env')),
  ...loadEnv(path.join(root, '.env.local')),
}

const checks = [
  [
    'GROQ',
    async () => {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${e.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: e.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      })
      return r.status
    },
  ],
  [
    'OPENAI',
    async () =>
      (
        await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${e.OPENAI_API_KEY}` },
        })
      ).status,
  ],
  [
    'DEEPGRAM',
    async () =>
      (
        await fetch('https://api.deepgram.com/v1/projects', {
          headers: { Authorization: `Token ${e.DEEPGRAM_API_KEY}` },
        })
      ).status,
  ],
  [
    'RESEND',
    async () =>
      (
        await fetch('https://api.resend.com/domains', {
          headers: { Authorization: `Bearer ${e.RESEND_API_KEY}` },
        })
      ).status,
  ],
  [
    'TWILIO',
    async () => {
      const auth = Buffer.from(
        `${e.TWILIO_ACCOUNT_SID}:${e.TWILIO_AUTH_TOKEN}`,
      ).toString('base64')
      return (
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${e.TWILIO_ACCOUNT_SID}.json`,
          { headers: { Authorization: `Basic ${auth}` } },
        )
      ).status
    },
  ],
  [
    'CLERK',
    async () =>
      (
        await fetch('https://api.clerk.com/v1/users?limit=1', {
          headers: { Authorization: `Bearer ${e.CLERK_SECRET_KEY}` },
        })
      ).status,
  ],
  [
    'CLOUDFLARE',
    async () =>
      (
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${e.CLOUDFLARE_ACCOUNT_ID}`,
          { headers: { Authorization: `Bearer ${e.CLOUDFLARE_API_TOKEN}` } },
        )
      ).status,
  ],
  [
    'APOLLO',
    async () =>
      (
        await fetch('https://api.apollo.io/api/v1/auth/health', {
          headers: {
            'X-Api-Key': e.APOLLO_API_KEY,
            'Content-Type': 'application/json',
          },
        })
      ).status,
  ],
  [
    'PDL',
    async () =>
      (
        await fetch(
          'https://api.peopledatalabs.com/v5/person/enrich?email=test@example.com',
          { headers: { 'X-Api-Key': e.PDL_API_KEY } },
        )
      ).status,
  ],
  [
    'HUNTER',
    async () =>
      (await fetch(`https://api.hunter.io/v2/account?api_key=${e.HUNTER_API_KEY}`))
        .status,
  ],
  [
    'SERPER',
    async () =>
      (
        await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': e.SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: 'harvics', num: 1 }),
        })
      ).status,
  ],
  [
    'HF',
    async () =>
      (
        await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { Authorization: `Bearer ${e.HF_API_KEY}` },
        })
      ).status,
  ],
  [
    'DEEPSEEK',
    async () =>
      (
        await fetch('https://api.deepseek.com/models', {
          headers: { Authorization: `Bearer ${e.DEEPSEEK_API_KEY}` },
        })
      ).status,
  ],
  [
    'NVIDIA',
    async () =>
      (
        await fetch('https://integrate.api.nvidia.com/v1/models', {
          headers: { Authorization: `Bearer ${e.NVIDIA_API_KEY}` },
        })
      ).status,
  ],
  [
    'EXCHANGE',
    async () =>
      (
        await fetch(
          `https://v6.exchangerate-api.com/v6/${e.EXCHANGE_RATE_API_KEY}/latest/USD`,
        )
      ).status,
  ],
  [
    'OPENWEATHER',
    async () =>
      (
        await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${e.OPENWEATHER_KEY}`,
        )
      ).status,
  ],
  [
    'INTERCOM',
    async () =>
      (
        await fetch('https://api.intercom.io/me', {
          headers: {
            Authorization: `Bearer ${e.INTERCOM_ACCESS_TOKEN}`,
            Accept: 'application/json',
          },
        })
      ).status,
  ],
  [
    'SENDGRID',
    async () =>
      (
        await fetch('https://api.sendgrid.com/v3/user/account', {
          headers: { Authorization: `Bearer ${e.SENDGRID_API_KEY}` },
        })
      ).status,
  ],
  [
    'MAPBOX',
    async () =>
      (
        await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/prague.json?access_token=${e.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`,
        )
      ).status,
  ],
  [
    'FIRECRAWL',
    async () =>
      (
        await fetch('https://api.firecrawl.dev/v1/team/credit-usage', {
          headers: { Authorization: `Bearer ${e.FIRECRAWL_API_KEY}` },
        })
      ).status,
  ],
  [
    'PHANTOMBUSTER',
    async () =>
      (
        await fetch('https://api.phantombuster.com/api/v2/agents/fetch-all', {
          headers: { 'X-Phantombuster-Key': e.PHANTOMBUSTER_API_KEY },
        })
      ).status,
  ],
]

let ok = 0
let fail = 0
for (const [name, fn] of checks) {
  if (!e[name === 'CLOUDFLARE' ? 'CLOUDFLARE_API_TOKEN' : name === 'MAPBOX' ? 'NEXT_PUBLIC_MAPBOX_TOKEN' : name === 'HF' ? 'HF_API_KEY' : name === 'EXCHANGE' ? 'EXCHANGE_RATE_API_KEY' : name === 'OPENWEATHER' ? 'OPENWEATHER_KEY' : name === 'PDL' ? 'PDL_API_KEY' : name === 'PHANTOMBUSTER' ? 'PHANTOMBUSTER_API_KEY' : `${name}_API_KEY`] && !e.GROQ_API_KEY) {
    // skip empty-key soft check below per service
  }
  try {
    const status = await fn()
    const pass =
      (status >= 200 && status < 300) || (name === 'PDL' && status === 404)
    console.log(`${pass ? 'OK  ' : 'FAIL'} ${name.padEnd(14)} HTTP ${status}`)
    if (pass) ok++
    else fail++
  } catch (err) {
    console.log(`FAIL ${name.padEnd(14)} ${err.message}`)
    fail++
  }
}
console.log(`\nSummary: ${ok} ok, ${fail} fail`)
process.exit(fail ? 1 : 0)
