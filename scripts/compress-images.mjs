/**
 * Batch image compressor — shrinks all JPEG/PNG in public/ in-place.
 * Uses macOS built-in `sips` — no npm install needed.
 * Run: node scripts/compress-images.mjs
 */
import { execSync, spawnSync } from 'child_process'
import { readdirSync, statSync, renameSync } from 'fs'
import { join, extname, basename } from 'path'

const PUBLIC_DIR = new URL('../public', import.meta.url).pathname
const QUALITY = 75  // 75% quality — good balance, saves ~60% size
const MAX_WIDTH = 1920  // No image needs to be wider than 1920px

let totalBefore = 0
let totalAfter = 0
let count = 0

function getAllImages(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllImages(full))
    } else {
      const ext = extname(entry.name).toLowerCase()
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        results.push(full)
      }
    }
  }
  return results
}

const images = getAllImages(PUBLIC_DIR)
console.log(`Found ${images.length} images. Compressing...`)

for (const imgPath of images) {
  const before = statSync(imgPath).size

  // Skip if already small (< 100KB)
  if (before < 100 * 1024) continue

  // Use macOS sips to resize + compress
  const result = spawnSync('sips', [
    '--resampleWidth', String(MAX_WIDTH),
    '--setProperty', 'formatOptions', String(QUALITY),
    imgPath
  ], { stdio: 'pipe' })

  if (result.status !== 0) {
    // sips failed — skip this file
    continue
  }

  const after = statSync(imgPath).size
  const saved = before - after
  const pct = ((saved / before) * 100).toFixed(0)

  totalBefore += before
  totalAfter += after
  count++

  if (saved > 0) {
    console.log(`  ✅ ${basename(imgPath)}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${pct}%)`)
  }
}

const totalSaved = totalBefore - totalAfter
console.log(`\n========================================`)
console.log(`Processed: ${count} images`)
console.log(`Before:    ${(totalBefore / 1024 / 1024).toFixed(1)} MB`)
console.log(`After:     ${(totalAfter / 1024 / 1024).toFixed(1)} MB`)
console.log(`Saved:     ${(totalSaved / 1024 / 1024).toFixed(1)} MB (${((totalSaved/totalBefore)*100).toFixed(0)}%)`)
console.log(`========================================`)
