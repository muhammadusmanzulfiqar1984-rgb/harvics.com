#!/usr/bin/env node
/**
 * Replace hardcoded canonical brand hex with Tailwind harvics-* classes or CSS vars.
 * Safe for src/ only; skips tests if needed.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'src')

const CLASS_REPLACEMENTS = [
  // burgundy text/bg with opacity
  [/text-\[#1A0505\]\/(\d+)\]/g, 'text-harvics-burgundy/$1'],
  [/text-\[#1a0505\]\/(\d+)\]/gi, 'text-harvics-burgundy/$1'],
  [/bg-\[#1A0505\]\/(\d+)\]/g, 'bg-harvics-burgundy/$1'],
  [/text-\[#1A0505\]/g, 'text-harvics-burgundy'],
  [/text-\[#1a0505\]/gi, 'text-harvics-burgundy'],
  [/bg-\[#1A0505\]/g, 'bg-harvics-burgundy'],
  [/bg-\[#1a0505\]/gi, 'bg-harvics-burgundy'],
  [/border-\[#1A0505\]/g, 'border-harvics-burgundy'],
  [/ring-\[#1A0505\]/g, 'ring-harvics-burgundy'],
  [/from-\[#1A0505\]/g, 'from-harvics-burgundy'],
  [/to-\[#1A0505\]/g, 'to-harvics-burgundy'],
  [/hover:text-\[#1A0505\]/g, 'hover:text-harvics-burgundy'],
  [/hover:bg-\[#1A0505\]/g, 'hover:bg-harvics-burgundy'],
  // gold
  [/text-\[#C9A84C\]\/(\d+)\]/g, 'text-harvics-gold/$1'],
  [/text-\[#c9a84c\]\/(\d+)\]/gi, 'text-harvics-gold/$1'],
  [/bg-\[#C9A84C\]\/(\d+)\]/g, 'bg-harvics-gold/$1'],
  [/border-\[#C9A84C\]\/(\d+)\]/g, 'border-harvics-gold/$1'],
  [/ring-\[#C9A84C\]\/(\d+)\]/g, 'ring-harvics-gold/$1'],
  [/hover:border-\[#C9A84C\]/g, 'hover:border-harvics-gold'],
  [/hover:text-\[#C9A84C\]/g, 'hover:text-harvics-gold'],
  [/hover:bg-\[#C9A84C\]/g, 'hover:bg-harvics-gold'],
  [/text-\[#C9A84C\]/g, 'text-harvics-gold'],
  [/text-\[#c9a84c\]/gi, 'text-harvics-gold'],
  [/bg-\[#C9A84C\]/g, 'bg-harvics-gold'],
  [/border-\[#C9A84C\]/g, 'border-harvics-gold'],
  [/ring-\[#C9A84C\]/g, 'ring-harvics-gold'],
  [/ring-1 ring-\[#C9A84C\]/g, 'ring-1 ring-harvics-gold'],
  [/via-\[#C9A84C\]/g, 'via-harvics-gold'],
  [/from-\[#C9A84C\]/g, 'from-harvics-gold'],
  [/to-\[#C9A84C\]/g, 'to-harvics-gold'],
  // cream
  [/text-\[#F5F0E8\]\/(\d+)\]/g, 'text-harvics-cream/$1'],
  [/text-\[#F5F0E8\]/g, 'text-harvics-cream'],
  [/bg-\[#F5F0E8\]/g, 'bg-harvics-cream'],
  [/border-\[#F5F0E8\]/g, 'border-harvics-cream'],
  [/hover:border-\[#F5F0E8\]/g, 'hover:border-harvics-cream'],
  [/hover:text-\[#F5F0E8\]/g, 'hover:text-harvics-cream'],
  // muted + card surfaces
  [/text-\[#8A7D6B\]/g, 'text-harvics-muted'],
  [/bg-\[#EFE8DC\]/g, 'bg-harvics-card'],
  [/bg-\[#efe8dc\]/gi, 'bg-harvics-card'],
  [/bg-\[#e5dccb\]/gi, 'bg-harvics-cardMuted'],
  [/hover:border-\[#EFE8DC\]/gi, 'hover:border-harvics-card'],
]

const QUOTE_REPLACEMENTS = [
  ["'#1A0505'", "'var(--harvics-burgundy)'"],
  ['"#1A0505"', '"var(--harvics-burgundy)"'],
  ["'#C9A84C'", "'var(--harvics-gold)'"],
  ['"#C9A84C"', '"var(--harvics-gold)"'],
  ["'#F5F0E8'", "'var(--harvics-cream)'"],
  ['"#F5F0E8"', '"var(--harvics-cream)"'],
  ["'#8A7D6B'", "'var(--harvics-muted)'"],
  ['"#8A7D6B"', '"var(--harvics-muted)"'],
  ["'#EFE8DC'", "'var(--harvics-card)'"],
  ['"#EFE8DC"', '"var(--harvics-card)"'],
]

const EXT = new Set(['.tsx', '.ts', '.jsx', '.js', '.css'])

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue
      walk(p, out)
    } else if (EXT.has(path.extname(ent.name))) {
      out.push(p)
    }
  }
  return out
}

let filesChanged = 0
for (const file of walk(SRC)) {
  let text = fs.readFileSync(file, 'utf8')
  const orig = text
  for (const [re, rep] of CLASS_REPLACEMENTS) {
    text = text.replace(re, rep)
  }
  for (const [a, b] of QUOTE_REPLACEMENTS) {
    text = text.split(a).join(b)
  }
  if (text !== orig) {
    fs.writeFileSync(file, text)
    filesChanged++
  }
}

console.log(`cleanup-harvics-tokens: updated ${filesChanged} files in src/`)
