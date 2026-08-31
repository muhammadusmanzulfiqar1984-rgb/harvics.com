/**
 * Convert JPG/JPEG → WebP under public/assets (pilot-safe).
 *
 * Usage:
 *   node scripts/convert-jpg-to-webp.mjs
 *   node scripts/convert-jpg-to-webp.mjs --dirs=public/assets/harvictrade/heroes,public/assets/shared
 *   node scripts/convert-jpg-to-webp.mjs --quality=80 --delete-jpg=true
 */
import sharp from 'sharp'
import { mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'fs'
import { join, relative, resolve } from 'path'

const args = process.argv.slice(2)
const options = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--') && a.includes('='))
    .map((a) => {
      const [key, ...rest] = a.slice(2).split('=')
      return [key, rest.join('=')]
    })
)

const quality = Number(options.quality || 80)
const deleteJpg = options['delete-jpg'] !== 'false'
const defaultDirs = [
  'public/assets/harvictrade/heroes',
  'public/assets/shared',
]
const dirs = (options.dirs || defaultDirs.join(','))
  .split(',')
  .map((d) => resolve(d.trim()))
  .filter(Boolean)

const manifest = []

const updateRefs = options['update-refs'] !== 'false'

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(jpe?g)$/i.test(entry.name)) acc.push(full)
  }
  return acc
}

let totalBefore = 0
let totalAfter = 0
let converted = 0
let reused = 0
let removed = 0

for (const root of dirs) {
  for (const jpgPath of walk(root)) {
    const before = statSync(jpgPath).size
    const webpPath = jpgPath.replace(/\.(jpe?g)$/i, '.webp')
    let after = 0

    if (statSync(jpgPath, { throwIfNoEntry: false })) {
      try {
        const fresh = await sharp(jpgPath).webp({ quality }).toBuffer()
        let useBuffer = fresh

        try {
          const existing = statSync(webpPath)
          if (existing.size < fresh.length) {
            useBuffer = null
            after = existing.size
            reused++
          }
        } catch {
          /* no existing webp */
        }

        if (useBuffer) {
          writeFileSync(webpPath, useBuffer)
          after = useBuffer.length
          converted++
        }

        totalBefore += before
        totalAfter += after

        if (deleteJpg && after > 0 && after <= before) {
          unlinkSync(jpgPath)
          removed++
        }

        manifest.push({
          from: `/${relative(resolve('.'), jpgPath).replace(/\\/g, '/')}`,
          to: `/${relative(resolve('.'), webpPath).replace(/\\/g, '/')}`,
          before,
          after,
          deleted: deleteJpg && after > 0 && after <= before,
        })

        const rel = relative(resolve('.'), jpgPath)
        console.log(
          `  ${rel}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB webp${deleteJpg && after <= before ? ' (jpg removed)' : ''}`
        )
      } catch (err) {
        console.warn(`  skip ${jpgPath}: ${err.message}`)
      }
    }
  }
}

const saved = totalBefore - totalAfter
console.log('\n========================================')
console.log(`Dirs:      ${dirs.map((d) => relative('.', d)).join(', ')}`)
console.log(`Converted: ${converted} new/updated webp`)
console.log(`Reused:    ${reused} existing smaller webp`)
console.log(`Removed:   ${removed} jpg(s)`)
console.log(`Before:    ${(totalBefore / 1024 / 1024).toFixed(1)} MB`)
console.log(`After:     ${(totalAfter / 1024 / 1024).toFixed(1)} MB`)
console.log(`Saved:     ${(saved / 1024 / 1024).toFixed(1)} MB`)
console.log('========================================')

mkdirSync('scripts/.gen', { recursive: true })
writeFileSync(
  'scripts/.gen/webp-pilot-manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`
)

if (updateRefs && manifest.length > 0) {
  const refRoots = ['src', 'scripts'].map((d) => resolve(d))
  let filesUpdated = 0
  let replacements = 0

  function walkRefs(dir, files = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue
        walkRefs(full, files)
      } else if (/\.(tsx?|jsx?|json|mjs)$/.test(entry.name)) {
        files.push(full)
      }
    }
    return files
  }

  const pairs = manifest
    .filter((m) => m.deleted)
    .map((m) => ({
      from: m.from.replace(/^\/public\/assets/, '/assets'),
      to: m.to.replace(/^\/public\/assets/, '/assets'),
    }))

  for (const root of refRoots) {
    for (const file of walkRefs(root)) {
      let text = readFileSync(file, 'utf8')
      let changed = false
      for (const { from, to } of pairs) {
        if (text.includes(from)) {
          const count = text.split(from).length - 1
          text = text.split(from).join(to)
          replacements += count
          changed = true
        }
      }
      if (changed) {
        writeFileSync(file, text)
        filesUpdated++
      }
    }
  }

  console.log(`Refs:      ${replacements} replacement(s) in ${filesUpdated} file(s)`)
}
