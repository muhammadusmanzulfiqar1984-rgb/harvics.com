#!/usr/bin/env node
/**
 * Root locale sync — keeps every locale file in key-parity with en.json,
 * translates missing / leftover-English strings, prunes orphan keys (optional).
 *
 * Usage:
 *   node scripts/sync-locales.mjs              # sync + translate gaps
 *   node scripts/sync-locales.mjs --check       # exit 1 if drift (CI)
 *   node scripts/sync-locales.mjs --prune-orphans
 *   node scripts/sync-locales.mjs --structure-only  # copy EN for missing, no API
 *
 * Requires OPENAI_API_KEY in env or .env.local for translation.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const localesDir = path.join(root, 'src/locales')

const args = new Set(process.argv.slice(2))
const CHECK_ONLY = args.has('--check')
const PRUNE = args.has('--prune-orphans')
const STRUCTURE_ONLY = args.has('--structure-only')
const FROM = (() => {
  const raw = process.argv.find((a) => a.startsWith('--from='))
  return raw ? raw.slice('--from='.length) : null
})()

function atomicWriteJson(filePath, obj) {
  const tmp = `${filePath}.tmp.${process.pid}`
  const body = JSON.stringify(obj, null, 2) + '\n'
  fs.writeFileSync(tmp, body)
  // Validate before replace
  JSON.parse(fs.readFileSync(tmp, 'utf8'))
  fs.renameSync(tmp, filePath)
}

const LOCALE_NAMES = {
  ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German', zh: 'Simplified Chinese',
  he: 'Hebrew', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese',
  ko: 'Korean', it: 'Italian', nl: 'Dutch', pl: 'Polish', tr: 'Turkish',
  vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', ms: 'Malay', sw: 'Swahili',
  uk: 'Ukrainian', ro: 'Romanian', cs: 'Czech', sv: 'Swedish', da: 'Danish',
  fi: 'Finnish', no: 'Norwegian', el: 'Greek', hu: 'Hungarian', bg: 'Bulgarian',
  hr: 'Croatian', sk: 'Slovak', sr: 'Serbian', bn: 'Bengali', ur: 'Urdu',
  fa: 'Persian', ps: 'Pashto',
}

/** Keep these in English (brand / codes / metrics). */
function keepEnglish(value) {
  if (typeof value !== 'string') return true
  const v = value.trim()
  if (!v) return true
  if (v.length <= 2) return true
  if (/^[\d.,+%\s·•/-]+$/.test(v)) return true
  if (/^(Harvics|HarvyX|Harvoice|HPay|HarvicTrade|Fin|Intercom|WhatsApp|ESG|FMCG|SKU|NDA|ICP|RFQ|QC|GPS|CRM|OS)\b/i.test(v) && v.length < 28) {
    return true
  }
  if (/^42 Markets\. 10 Industries\. 14 Stages$/.test(v)) return true
  if (/^Est\. 2019$/.test(v)) return true
  if (/^London[•,\s].*Milan.*New York/.test(v)) return true
  return false
}

function loadEnvLocal() {
  const p = path.join(root, '.env.local')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    if (process.env[m[1]]) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}

function flatten(obj, prefix = '', out = {}) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    out[prefix] = obj
    return out
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) flatten(v, p, out)
    else out[p] = v
  }
  return out
}

function setPath(obj, dotted, value) {
  const parts = dotted.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((a, k) => (a && typeof a === 'object' ? a[k] : undefined), obj)
}

function deletePath(obj, dotted) {
  const parts = dotted.split('.')
  const stack = [{ parent: obj, key: null, node: obj }]
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur?.[parts[i]]) return
    cur = cur[parts[i]]
    stack.push({ parent: stack[stack.length - 1].node, key: parts[i], node: cur })
  }
  if (cur && Object.prototype.hasOwnProperty.call(cur, parts[parts.length - 1])) {
    delete cur[parts[parts.length - 1]]
  }
}

function pruneEmpty(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  for (const k of Object.keys(obj)) {
    pruneEmpty(obj[k])
    if (
      obj[k] &&
      typeof obj[k] === 'object' &&
      !Array.isArray(obj[k]) &&
      Object.keys(obj[k]).length === 0
    ) {
      delete obj[k]
    }
  }
  return obj
}

async function translateBatchGoogle(locale, pairs) {
  const out = {}
  const tl = googleLang(locale)
  for (const item of pairs) {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
      encodeURIComponent(tl) +
      '&dt=t&q=' +
      encodeURIComponent(item.text)
    let attempt = 0
    while (attempt < 4) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Google translate ${res.status}`)
        const data = await res.json()
        const translated = (data?.[0] || []).map((row) => row[0]).join('').trim()
        out[item.path] = protectBrands(item.text, translated || item.text)
        break
      } catch (e) {
        attempt++
        if (attempt >= 4) {
          console.warn(`[${locale}] google fail for ${item.path}: ${e.message}`)
          out[item.path] = item.text
        } else {
          await new Promise((r) => setTimeout(r, 400 * attempt))
        }
      }
    }
    await new Promise((r) => setTimeout(r, 40))
  }
  return out
}

function protectBrands(source, translated) {
  const brands = [
    'Harvics',
    'HarvyX',
    'Harvoice',
    'HPay',
    'HarvicTrade',
    'Intercom',
    'WhatsApp',
  ]
  let out = translated
  for (const b of brands) {
    if (source.includes(b) && !out.includes(b)) {
      // common mangling: leave as-is if missing; prefer source token injection is hard — keep translated
    }
  }
  return out
}

function googleLang(locale) {
  const map = {
    zh: 'zh-CN',
    he: 'iw',
    no: 'no',
    ps: 'ps',
    ur: 'ur',
    fa: 'fa',
    bn: 'bn',
    sw: 'sw',
    ms: 'ms',
    sr: 'sr',
  }
  return map[locale] || locale
}

async function translateBatch(locale, languageName, pairs) {
  if (!pairs.length) return {}
  const key = process.env.OPENAI_API_KEY
  if (key && process.env.LOCALE_SYNC_ENGINE !== 'google') {
    try {
      return await translateBatchOpenAI(locale, languageName, pairs, key)
    } catch (e) {
      console.warn(`[${locale}] OpenAI unavailable — falling back to Google`)
    }
  }
  return translateBatchGoogle(locale, pairs)
}

async function translateBatchOpenAI(locale, languageName, pairs, key) {
  const payload = Object.fromEntries(pairs.map(({ path: p, text }) => [p, text]))
  const system = `You are a professional localization engine for Harvics Global Ventures (trade / B2B / marketplace).
Translate UI strings into ${languageName} (${locale}).
Rules:
- Return ONLY valid JSON object: same keys as input, translated string values.
- Preserve brand names exactly: Harvics, HarvyX, Harvoice, HPay, HarvicTrade, Fin, Intercom, WhatsApp.
- Preserve acronyms when customary: ESG, FMCG, RFQ, QC, ICP, NDA, SKU, CRM, AI, GPS.
- Preserve numbers, punctuation rhythm, and placeholders like {name}.
- Formal B2B tone. No emoji. No markdown.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.LOCALE_SYNC_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(payload) },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 400)}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty OpenAI response')
  return JSON.parse(content)
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  loadEnvLocal()

  const enPath = path.join(localesDir, 'en.json')
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const enFlat = flatten(en)
  const enKeys = Object.keys(enFlat)

  const files = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .sort()
    .filter((f) => {
      if (!FROM) return true
      return f.replace('.json', '') >= FROM
    })

  let drift = 0
  const report = []

  for (const file of files) {
    const locale = file.replace('.json', '')
    const filePath = path.join(localesDir, file)
    const loc = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const flat = flatten(loc)

    const missing = enKeys.filter((k) => !(k in flat))
    const orphans = Object.keys(flat).filter((k) => !(k in enFlat))
    const leftover = enKeys.filter((k) => {
      if (!(k in flat)) return false
      const a = enFlat[k]
      const b = flat[k]
      if (typeof a !== 'string' || typeof b !== 'string') return false
      if (!a.trim()) return false
      if (a !== b) return false
      return !keepEnglish(a)
    })

    drift += missing.length + (PRUNE ? orphans.length : 0) + leftover.length

    report.push({
      locale,
      missing: missing.length,
      orphans: orphans.length,
      leftover: leftover.length,
    })

    if (CHECK_ONLY) continue

    // 1) Structure: ensure every EN key exists (English placeholder first)
    for (const k of missing) {
      setPath(loc, k, enFlat[k])
    }

    // Empty strings that exist in EN with a value
    for (const k of enKeys) {
      const a = enFlat[k]
      const b = getPath(loc, k)
      if (typeof a === 'string' && a.trim() && typeof b === 'string' && !b.trim()) {
        setPath(loc, k, a)
        leftover.push(k)
      }
    }

    if (PRUNE) {
      for (const k of orphans) deletePath(loc, k)
      pruneEmpty(loc)
    }

    const toTranslate = []
    const seen = new Set()
    for (const k of [...missing, ...leftover]) {
      if (seen.has(k)) continue
      seen.add(k)
      const text = enFlat[k]
      if (typeof text !== 'string') continue
      if (keepEnglish(text)) continue
      toTranslate.push({ path: k, text })
    }

    if (!STRUCTURE_ONLY && toTranslate.length) {
      const lang = LOCALE_NAMES[locale] || locale
      console.log(`[${locale}] translating ${toTranslate.length} strings…`)
      for (const batch of chunk(toTranslate, 80)) {
        let translated = {}
        let attempt = 0
        while (attempt < 3) {
          try {
            translated = await translateBatch(locale, lang, batch)
            break
          } catch (e) {
            attempt++
            console.warn(`[${locale}] batch fail (${attempt}):`, e.message)
            if (attempt >= 3) throw e
            await new Promise((r) => setTimeout(r, 1500 * attempt))
          }
        }
        for (const { path: p, text } of batch) {
          const t = translated[p]
          if (typeof t === 'string' && t.trim()) setPath(loc, p, t)
          else setPath(loc, p, text)
        }
      }
    }

    atomicWriteJson(filePath, loc)
    console.log(
      `[${locale}] wrote — missing filled ${missing.length}, leftover queued ${leftover.length}, orphans ${orphans.length}${PRUNE ? ' pruned' : ''}`,
    )
  }

  console.log('\n=== SUMMARY ===')
  for (const r of report) {
    console.log(
      `${r.locale.padEnd(3)} missing=${String(r.missing).padStart(4)} leftoverEN=${String(r.leftover).padStart(4)} orphans=${String(r.orphans).padStart(4)}`,
    )
  }

  if (CHECK_ONLY) {
    const bad = report.filter((r) => r.missing > 0)
    if (bad.length) {
      console.error(`\nLocale drift: ${bad.length} files missing keys. Run: node scripts/sync-locales.mjs`)
      process.exit(1)
    }
    console.log('\nOK — key parity with en.json')
  } else {
    console.log(`\nDone. Pre-sync drift signals: ${drift}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
