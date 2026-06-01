#!/usr/bin/env node
// Full nav audit: walks every vertical/block/item route from megaMenuData.ts
// and curls each URL on http://localhost:3000 to verify:
//   1. HTTP 200
//   2. At least one leaf.jpg image rendered
//   3. No raw translation keys (e.g. 'sub.categories.pasta')
//   4. No obvious Next.js error markers in the HTML
//
// Usage:  node scripts/audit_nav.mjs [--limit N]

import { navVerticals, slugify } from '../src/data/megaMenuData'

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3000/en'
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '0', 10)

// Build full URL list: vertical, vertical/category, vertical/category/item
const urls = []
for (const v of navVerticals) {
  urls.push({ path: `/${v.key}`, label: v.label })
  for (const b of v.blocks) {
    const cat = slugify(b.title)
    urls.push({ path: `/${v.key}/${cat}`, label: `${v.label} > ${b.title}` })
    for (const item of b.items) {
      const itemSlug = slugify(item)
      urls.push({ path: `/${v.key}/${cat}/${itemSlug}`, label: `${v.label} > ${b.title} > ${item}` })
    }
  }
}

const targets = LIMIT > 0 ? urls.slice(0, LIMIT) : urls

console.log(`\nAuditing ${targets.length} URLs ...\n`)

const TRANSLATION_KEY_RE = /\b(sub|categories|nav|menu|common|industries|verticals|footer|header|home|products|pages)\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_.]+\b/g
const ERROR_MARKERS = [
  '__next_error__',
  'application error',
  'unhandledRejection',
  'TypeError:',
  'ReferenceError:',
  'Cannot read properties of undefined',
]

const results: any[] = []
async function main() {
let i = 0
for (const u of targets) {
  i++
  const full = BASE + u.path
  let status = 0, hasLeaf = false, rawKeys: string[] = [], errors: string[] = []
  try {
    const res = await fetch(full, { redirect: 'follow' })
    status = res.status
    const html = await res.text()
    hasLeaf = /leaf\.jpg/.test(html)
    const m = html.match(TRANSLATION_KEY_RE)
    if (m) rawKeys = [...new Set(m)].slice(0, 3)
    for (const marker of ERROR_MARKERS) if (html.includes(marker)) errors.push(marker)
  } catch (e: any) {
    errors.push(e.message)
  }
  results.push({ url: u.path, status, hasLeaf, rawKeys, errors })
  if (i % 25 === 0) process.stderr.write(`  ... ${i}/${targets.length}\n`)
}

// Summary table — only show problematic rows + final stats
const ok = results.filter(r => r.status === 200 && r.hasLeaf && r.rawKeys.length === 0 && r.errors.length === 0)
const bad = results.filter(r => !(r.status === 200 && r.hasLeaf && r.rawKeys.length === 0 && r.errors.length === 0))

console.log('\n┌──────── ISSUES ────────┐')
if (bad.length === 0) {
  console.log('   (none — all green)')
} else {
  console.log('URL'.padEnd(56) + ' | STAT | IMG | TRANSLATION/ERRORS')
  console.log('-'.repeat(110))
  for (const r of bad) {
    const issue =
      (r.rawKeys.length ? `raw=${r.rawKeys.join(',')} ` : '') +
      (r.errors.length ? `err=${r.errors.join(',')}` : '')
    console.log(
      r.url.padEnd(56) + ' | ' +
      String(r.status).padEnd(4) + ' | ' +
      (r.hasLeaf ? 'YES ' : 'NO  ') + '| ' +
      issue
    )
  }
}

console.log('\n┌──────── SUMMARY ────────┐')
console.log(`  Total URLs:        ${results.length}`)
console.log(`  Fully passing:     ${ok.length}`)
console.log(`  With issues:       ${bad.length}`)
console.log(`  HTTP non-200:      ${results.filter(r => r.status !== 200).length}`)
console.log(`  Missing leaf img:  ${results.filter(r => r.status === 200 && !r.hasLeaf).length}`)
console.log(`  Raw i18n keys:     ${results.filter(r => r.rawKeys.length).length}`)
console.log(`  Error markers:     ${results.filter(r => r.errors.length).length}`)
console.log('')
}
main().catch(e => { console.error(e); process.exit(1) })
