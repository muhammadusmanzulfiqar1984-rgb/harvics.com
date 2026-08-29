/**
 * Copy webpack-bundle-analyzer HTML reports out of .next (which gets wiped)
 * into scripts/.cache/analyze for durable review + package summary JSON.
 */
import { cpSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const srcDir = join(process.cwd(), '.next', 'analyze')
const destDir = join(process.cwd(), 'scripts', '.cache', 'analyze')

if (!existsSync(srcDir)) {
  console.warn('[analyze] No .next/analyze folder — run ANALYZE=true next build first.')
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
for (const name of ['client.html', 'nodejs.html', 'edge.html']) {
  const from = join(srcDir, name)
  if (existsSync(from)) {
    cpSync(from, join(destDir, name))
    console.log(`[analyze] copied ${name} → scripts/.cache/analyze/${name}`)
  }
}

const clientHtml = join(destDir, 'client.html')
if (!existsSync(clientHtml)) {
  process.exit(0)
}

const html = readFileSync(clientHtml, 'utf8')
const assignAt = html.indexOf('window.chartData = [')
if (assignAt < 0) {
  console.warn('[analyze] chartData not found in client.html')
  process.exit(0)
}

const from = html.indexOf('[', assignAt)
let depth = 0
let end = -1
for (let p = from; p < html.length; p++) {
  const c = html[p]
  if (c === '[') depth++
  else if (c === ']') {
    depth--
    if (depth === 0) {
      end = p
      break
    }
  }
}

const data = JSON.parse(html.slice(from, end + 1))
const leaves = []
const walk = (nodes, path = []) => {
  for (const n of nodes || []) {
    const label = n.label || n.id || ''
    const next = path.concat(label)
    if (n.groups?.length) walk(n.groups, next)
    else leaves.push({ path: next.join(' › '), gzip: n.gzipSize || 0, parsed: n.parsedSize || 0 })
  }
}
walk(data)

const pkgs = {}
for (const n of leaves) {
  const nm = n.path.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
  const pkg = nm ? nm[1] : 'app-src'
  if (!pkgs[pkg]) pkgs[pkg] = { gzip: 0, parsed: 0 }
  pkgs[pkg].gzip += n.gzip
  pkgs[pkg].parsed += n.parsed
}

const topPackages = Object.entries(pkgs)
  .sort((a, b) => b[1].gzip - a[1].gzip)
  .slice(0, 40)
  .map(([pkg, v]) => ({ pkg, ...v }))

writeFileSync(
  join(destDir, 'client-packages.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      topPackages,
      topModules: leaves.sort((a, b) => b.gzip - a.gzip).slice(0, 40),
    },
    null,
    2
  )
)

console.log('\nTop client packages (gzip):')
for (const row of topPackages.slice(0, 15)) {
  console.log(`  ${(row.gzip / 1024).toFixed(1).padStart(7)} KB  ${row.pkg}`)
}
console.log(`\nOpen: scripts/.cache/analyze/client.html`)
