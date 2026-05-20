/**
 * Image processor for HARVICS
 *
 * Modes:
 * 1) Default in-place public compression
 *    node scripts/compress-images.mjs
 *
 * 2) Bulk copy from archive/images-original -> public/images-web
 *    node scripts/compress-images.mjs --mode=bulk-copy
 *
 * Optional flags:
 *    --source=archive/images-original
 *    --output=public/images-web
 *    --width=1600
 *    --quality=75
 */
import { mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, extname, join, relative, resolve } from 'path'
import { spawnSync } from 'child_process'

const args = process.argv.slice(2)
const options = Object.fromEntries(
  args
    .filter((arg) => arg.startsWith('--') && arg.includes('='))
    .map((arg) => {
      const [key, ...rest] = arg.slice(2).split('=')
      return [key, rest.join('=')]
    })
)

const mode = options.mode || 'in-place-public'
const quality = Number(options.quality || 75)
const maxWidth = Number(options.width || (mode === 'bulk-copy' ? 1600 : 1920))
const sourceDir = resolve(options.source || (mode === 'bulk-copy' ? 'archive/images-original' : 'public'))
const outputDir = resolve(options.output || (mode === 'bulk-copy' ? 'public/images-web' : 'public'))
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png'])

let totalBefore = 0
let totalAfter = 0
let processedCount = 0
let changedCount = 0

function getAllImages(dir) {
  let results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(getAllImages(fullPath))
      continue
    }

    const extension = extname(entry.name).toLowerCase()
    if (supportedExtensions.has(extension)) {
      results.push(fullPath)
    }
  }
  return results
}

function processImage(sourcePath, destinationPath) {
  mkdirSync(dirname(destinationPath), { recursive: true })

  const result = spawnSync(
    'sips',
    [
      '--resampleWidth',
      String(maxWidth),
      '--setProperty',
      'formatOptions',
      String(quality),
      sourcePath,
      '--out',
      destinationPath,
    ],
    { stdio: 'pipe' }
  )

  return result.status === 0
}

if (mode === 'bulk-copy') {
  mkdirSync(sourceDir, { recursive: true })
  mkdirSync(outputDir, { recursive: true })
}

const images = getAllImages(sourceDir)
console.log(`Mode: ${mode}`)
console.log(`Source: ${sourceDir}`)
console.log(`Output: ${outputDir}`)
console.log(`Found ${images.length} image(s)`)

for (const sourcePath of images) {
  const before = statSync(sourcePath).size
  const relativePath = relative(sourceDir, sourcePath)
  const destinationPath = mode === 'bulk-copy' ? join(outputDir, relativePath) : sourcePath

  if (mode === 'in-place-public' && before < 100 * 1024) {
    continue
  }

  const ok = processImage(sourcePath, destinationPath)
  if (!ok) {
    continue
  }

  const after = statSync(destinationPath).size
  const saved = before - after
  const percent = before > 0 ? ((saved / before) * 100).toFixed(0) : '0'

  totalBefore += before
  totalAfter += after
  processedCount++

  if (saved !== 0 || mode === 'bulk-copy') {
    changedCount++
    console.log(`  ${relativePath}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${saved >= 0 ? '-' : '+'}${Math.abs(Number(percent))}%)`)
  }
}

const totalSaved = totalBefore - totalAfter
console.log('\n========================================')
console.log(`Processed: ${processedCount} image(s)`)
console.log(`Changed:   ${changedCount} image(s)`)
console.log(`Before:    ${(totalBefore / 1024 / 1024).toFixed(1)} MB`)
console.log(`After:     ${(totalAfter / 1024 / 1024).toFixed(1)} MB`)
console.log(`Saved:     ${(totalSaved / 1024 / 1024).toFixed(1)} MB`)
console.log('========================================')
