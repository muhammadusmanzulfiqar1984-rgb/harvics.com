#!/usr/bin/env node
/**
 * HarvyX Outreach Pipeline
 * Fetches new leads → DeepSeek personalization → Resend → marks as contacted
 *
 * Usage:
 *   node index.js                    # live mode
 *   DRY_RUN=true node index.js       # test mode (no emails sent)
 *   BATCH_SIZE=5 node index.js       # small batch
 *   VERTICAL=textile node index.js   # specific vertical only
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile(path, { override = false } = {}) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (override || !(k in process.env)) process.env[k] = v
  }
}

/** CLI / pre-set runtime knobs win over .env */
const RUNTIME_KEYS = ['DRY_RUN', 'BATCH_SIZE', 'DELAY_MS', 'VERTICAL', 'MAX_LEADS']
const runtimeSaved = Object.fromEntries(
  RUNTIME_KEYS.filter((k) => k in process.env).map((k) => [k, process.env[k]]),
)

loadEnvFile(join(__dirname, '.env'), { override: true })
loadEnvFile(join(__dirname, '..', '.env.outreach'))
loadEnvFile(join(__dirname, '..', '.env.local'))
loadEnvFile(join(__dirname, '..', '.dev.vars'))

for (const [k, v] of Object.entries(runtimeSaved)) process.env[k] = v

const DRY_RUN    = process.env.DRY_RUN === 'true'
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '20', 10)
const DELAY_MS   = parseInt(process.env.DELAY_MS || '1200', 10)
const VERTICAL   = process.env.VERTICAL || ''
/** Optional hard cap (useful for dry runs / smoke tests). 0 = no cap. */
const MAX_LEADS  = parseInt(process.env.MAX_LEADS || '0', 10)

const HARVYX_API_BASE  = (process.env.HARVYX_API_BASE || 'https://www.harvics.com').replace(/\/$/, '')
const HARVYX_API_KEY   = process.env.HARVYX_API_KEY
const RESEND_API_KEY   = process.env.RESEND_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const NVIDIA_API_KEY   = process.env.NVIDIA_API_KEY
const GROQ_API_KEY     = process.env.GROQ_API_KEY
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY
const FROM_EMAIL       = process.env.FROM_EMAIL || 'Mian Muhammad Usman <founder@harvics.com>'
const REPLY_TO         = process.env.REPLY_TO || 'usman@harvics.com'

// ─── Vertical context for DeepSeek ───────────────────────────────────────────

const VERTICAL_CONTEXT = {
  'Textile / Fashion / Retail': 'textile and apparel procurement, fabric sourcing, garment manufacturing supply chains',
  'textile':                    'textile procurement, yarn and fabric sourcing, mill-to-brand supply chains',
  'Food & Beverage':            'FMCG and food commodity trading, supplier verification, cold chain sourcing',
  'Minerals':                   'mineral commodity trading, raw material sourcing, mining sector procurement',
  'Oil & Gas':                  'energy sector procurement, petroleum product trading, industrial supply chains',
  'Real Estate':                'commercial real estate procurement, construction materials sourcing',
  'Commodities':                'commodity trading, bulk raw material procurement, global sourcing',
  'Industrial':                 'industrial equipment procurement, B2B manufacturing supply chains',
  'Sourcing':                   'global sourcing operations, supplier discovery, procurement efficiency',
  'Finance':                    'trade finance, supply chain financing, commodity-backed transactions',
  'AI & Tech':                  'technology procurement, AI-driven supply chain optimization',
}

function getVerticalContext(vertical) {
  if (!vertical) return 'B2B trade, procurement, and global sourcing'
  if (VERTICAL_CONTEXT[vertical]) return VERTICAL_CONTEXT[vertical]
  const key = Object.keys(VERTICAL_CONTEXT).find(k =>
    vertical.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(vertical.toLowerCase())
  )
  return key ? VERTICAL_CONTEXT[key] : 'B2B trade, procurement, and global sourcing'
}

function leadName(lead) {
  return lead.name || lead.contactName || lead.contact_name || ''
}

function leadVertical(lead) {
  return lead.vertical || lead.segment || lead.industry || 'Other'
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchLeads(offset = 0) {
  let url = `${HARVYX_API_BASE}/api/harvyx/leads?status=new&limit=${BATCH_SIZE}&offset=${offset}`
  if (VERTICAL) url += `&vertical=${encodeURIComponent(VERTICAL)}`

  const res = await fetch(url, { headers: { 'x-api-key': HARVYX_API_KEY } })
  if (!res.ok) throw new Error(`fetchLeads failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return (data.leads || []).filter(l => !!(l.email || '').trim())
}

async function callChatProvider({ name, url, apiKey, model, prompt }) {
  if (!apiKey) throw new Error(`${name}: API key not set`)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    throw new Error(`${name}: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error(`${name}: empty response`)
  const parsed = JSON.parse(content)
  if (!parsed?.subject || !parsed?.body) {
    throw new Error(`${name}: missing subject/body in JSON`)
  }
  return parsed
}

async function generateEmail(lead) {
  const vertical = leadVertical(lead)
  const context  = getVerticalContext(vertical)
  const fullName = leadName(lead)
  const name     = fullName ? fullName.split(' ')[0] : 'there'

  const prompt = `You are writing a cold B2B outreach email on behalf of Usman Zulfiqar at Harvics Global Ventures.

About Harvics: A B2B intelligence and procurement platform helping companies in commodities, textiles, FMCG, and industrial sectors find verified suppliers, buyers, and trading partners globally. We give companies trade intelligence they cannot get elsewhere — verified contacts, deal flow signals, and sourcing connections across 50+ countries.

Prospect details:
- First name: ${name}
- Company: ${lead.company}
- Industry: ${vertical} (${context})

Write a cold outreach email. Rules:
1. Subject line: specific to their industry pain point, max 8 words, no clickbait
2. Open line: one sentence referencing a real challenge in their industry (NOT "I hope this finds you well")
3. Paragraph 2: connect their challenge to what Harvics solves — be specific, not generic
4. Paragraph 3: brief social proof or capability ("We've helped [industry] companies..." — you can be general)
5. CTA: ask for a 15-minute call, nothing more
6. Signature: Usman Zulfiqar | Harvics Global Ventures | harvics.com
7. Total body: under 180 words
8. Tone: direct, peer-to-peer, zero corporate fluff

Respond ONLY with valid JSON — no markdown, no code block:
{"subject": "...", "body": "..."}`

  const providers = [
    {
      name: 'deepseek',
      url: 'https://api.deepseek.com/chat/completions',
      apiKey: DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
    },
    {
      name: 'nvidia',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      apiKey: NVIDIA_API_KEY,
      model: 'deepseek-ai/deepseek-r1',
    },
    {
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
    },
    {
      name: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: OPENAI_API_KEY,
      model: 'gpt-4o-mini',
    },
  ]

  const failures = []
  for (const provider of providers) {
    try {
      const { subject, body } = await callChatProvider({ ...provider, prompt })
      return { subject, body, provider: provider.name }
    } catch (err) {
      const msg = err?.message || String(err)
      log(`⚠ ${provider.name} failed: ${msg}`)
      failures.push(msg)
    }
  }

  throw new Error(`All providers failed: ${failures.join(' | ')}`)
}

async function sendEmail(lead, subject, body) {
  if (DRY_RUN) {
    log(`[DRY RUN] → ${lead.email}\n  Subject: ${subject}\n  Preview: ${body.slice(0, 100)}...`)
    return { id: 'dry-run-' + Date.now() }
  }

  const htmlBody = body
    .split('\n')
    .map(line => line.trim() === '' ? '<br>' : `<p style="margin:0 0 12px">${line}</p>`)
    .join('')

  const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:600px;margin:0 auto;padding:20px">
${htmlBody}
</body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [lead.email],
      reply_to: REPLY_TO,
      subject,
      text: body,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Resend: ${JSON.stringify(err)}`)
  }
  return res.json()
}

async function updateLeadStatus(id, status) {
  if (DRY_RUN) return

  const res = await fetch(`${HARVYX_API_BASE}/api/harvyx/leads`, {
    method: 'PATCH',
    headers: {
      'x-api-key': HARVYX_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, status }),
  })

  if (!res.ok) {
    log(`⚠ Failed to update status for ${id}: ${res.status}`)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function withRetry(fn, label, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (err?.fatal) throw err
      if (i === retries - 1) throw err
      log(`⚠ ${label} failed (attempt ${i + 1}/${retries}): ${err.message} — retrying in 3s`)
      await sleep(3000)
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`
╔══════════════════════════════════════╗
║   HarvyX Outreach Pipeline           ║
╚══════════════════════════════════════╝
  Mode:       ${DRY_RUN ? '🟡 DRY RUN (no emails sent)' : '🟢 LIVE'}
  Batch size: ${BATCH_SIZE}
  Vertical:   ${VERTICAL || 'all'}
  From:       ${FROM_EMAIL}
  Base URL:   ${HARVYX_API_BASE}
`)

  if (!HARVYX_API_KEY)   throw new Error('HARVYX_API_KEY not set')
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not set')
  if (!RESEND_API_KEY && !DRY_RUN) throw new Error('RESEND_API_KEY not set')

  let offset      = 0
  let totalSent   = 0
  let totalFailed = 0

  while (true) {
    let leads
    try {
      leads = await withRetry(() => fetchLeads(offset), 'fetchLeads')
    } catch (err) {
      log(`✗ Fatal: could not fetch leads — ${err.message}`)
      break
    }

    if (leads.length === 0) {
      log('✅ No more new leads to process.')
      break
    }

    log(`📦 Batch: ${leads.length} leads (offset ${offset})`)

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i]
      const tag  = `(${offset + i + 1}) ${lead.email} [${lead.company}]`

      try {
        const { subject, body, provider } = await withRetry(
          () => generateEmail(lead),
          `generateEmail(${lead.email})`
        )

        await withRetry(
          () => sendEmail(lead, subject, body),
          `sendEmail(${lead.email})`
        )

        await updateLeadStatus(lead.id, 'contacted')

        log(`[provider: ${provider}] ✓ ${lead.email} — "${subject}"`)
        totalSent++
      } catch (err) {
        log(`✗ ${tag} — ${err.message}`)
        totalFailed++
      }

      if (MAX_LEADS > 0 && totalSent + totalFailed >= MAX_LEADS) {
        log(`⏹ MAX_LEADS=${MAX_LEADS} reached — stopping.`)
        leads = [] // break outer while after this batch accounting
        break
      }

      if (i < leads.length - 1) await sleep(DELAY_MS)
    }

    log(`📊 Running total: ${totalSent} sent | ${totalFailed} failed`)
    if (MAX_LEADS > 0 && totalSent + totalFailed >= MAX_LEADS) break
    offset += leads.length

    await sleep(3000)
  }

  console.log(`
╔══════════════════════════════════════╗
║   Done                               ║
║   Sent:   ${String(totalSent).padEnd(28)}║
║   Failed: ${String(totalFailed).padEnd(28)}║
╚══════════════════════════════════════╝`)
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
