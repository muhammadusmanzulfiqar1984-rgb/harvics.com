// Server-only module - uses Node.js fs
// This file should only be imported in Server Components
import fs from 'fs'
import path from 'path'

// Runtime check for server-side only
if (typeof window !== 'undefined') {
  throw new Error('folderScanner can only be used in Server Components')
}

export interface Subcategory {
  name: string
  slug: string
  images: string[]
  imageCount: number
  description: string
}

export interface CategoryData {
  name: string
  key: string
  slug: string
  subcategories: Subcategory[]
  image: string
  description: string
  color: string
  icon: string
  vertical?: string
}

// Map folder names to category keys (folders are now lowercase kebab-case under /assets/verticals/02-fmcg/categories/)
const categoryMapping: { [key: string]: { key: string; name: string; icon: string; color: string; description: string } } = {
  'bakery': { key: 'bakery', name: 'Bakery', icon: 'icon-bakery', color: 'from-amber-500 to-orange-500', description: 'Premium biscuits, wafers, cakes and baked snacks sourced from certified European manufacturers.' },
  'beverages': { key: 'beverages', name: 'Beverages', icon: 'icon-beverage', color: 'from-blue-500 to-cyan-500', description: 'Carbonated, functional, health and hot drinks distributed across 42+ international markets.' },
  'confectionery': { key: 'confectionery', name: 'Confectionery', icon: 'icon-candy', color: 'from-pink-500 to-rose-600', description: 'Bubble gum, jellies, sugar candy and toffees — Halal certified, globally compliant.' },
  'culinary': { key: 'culinary', name: 'Culinary', icon: 'icon-culinary', color: 'from-orange-500 to-amber-600', description: 'Cooking oils, spices, sauces, pickles and ready-to-cook products for retail and foodservice.' },
  'frozen-foods': { key: 'frozenFoods', name: 'Frozen Foods', icon: 'icon-frozen', color: 'from-blue-500 to-purple-500', description: 'IQF chicken, fish fillets, frozen meat and vegetables — cold chain maintained from source to shelf.' },
  'pastas': { key: 'pasta', name: 'Pasta', icon: 'icon-pasta', color: 'from-red-600 to-orange-500', description: 'Durum wheat pasta in all formats — fusilli, bucatini, farfalle — from premium Italian producers.' },
  'snacks': { key: 'snacks', name: 'Snacks', icon: 'icon-snack', color: 'from-yellow-500 to-orange-500', description: 'Chips, crisps, baked snacks and fusion varieties across 15+ flavour profiles for global retail.' },
}

// Descriptions for every subcategory — keyed by slug
const subcategoryDescriptions: Record<string, string> = {
  // Bakery
  'snacks-and-dry-cakes': 'Dry cakes, rusks and cupcakes baked to consistent moisture levels. Long shelf life with nitrogen-flush packaging. Ideal for retail and foodservice.',
  'biscuits-and-cookies': 'Cream-filled biscuits, digestives, butter cookies and chocolate-coated varieties. Sourced from FSSC 22000 certified bakeries with multi-language labeling for export.',
  'cakes-and-pastries': 'Individually wrapped cakes and pastries with controlled water activity for extended shelf life. Suitable for ambient retail and convenience channels.',
  'wafer-and-wafer-bars': 'Crispy layered wafers and coated wafer bars in chocolate, vanilla, hazelnut and strawberry. Packed for retail and impulse formats. MOQ from 500 cartons.',
  // Beverages
  'carbonated': 'Sparkling waters, sodas and carbonated soft drinks in 250ml to 1.5L formats. Full private-label capability with custom flavours and nutrition panels.',
  'functional': 'Energy drinks, sports recovery and fortified functional beverages. Taurine, B-vitamin and electrolyte formulations for active consumer segments.',
  'health-special': 'Health-focused beverages including vitamin waters, immunity blends and low-sugar variants. Clean-label, no artificial colours. Halal and EU-certified.',
  'hot-and-ready-drink': 'Ready-to-drink teas, coffees and hot chocolate in aseptic carton and PET formats. Shelf-stable at ambient temperature with 12–18 month shelf life.',
  'non-carbonated': 'Still juices, nectars, flavoured water and non-carbonated soft drinks. Cold-press and UHT options. Multi-pack and single-serve formats.',
  // Confectionery
  'bubble-gum': 'Fruit and mint bubble gum in pillow, stick and ball formats. Halal certified. Bright consumer packaging designed for checkout impulse and gifting.',
  'jelly': 'Fruit jellies, gummy bears and BearPops jelly characters. Halal gelatine-free and gelatine options. Popular in GCC, South Asia and European impulse retail.',
  'sugar-candy': 'Boiled sweets, fruit drops and lollipops in bulk jar and flow-wrap formats. Consistent sugar profiles with Halal and Kosher certification available.',
  'toffees': 'Eclairs, milk toffees and caramel chews. Individually wrapped for hygiene compliance. Popular single-serve and counter-display formats for emerging markets.',
  // Culinary
  'cooking-oil-fats-and-dressing': 'Sunflower, vegetable and blended cooking oils in 500ml–5L. Mayonnaise, salad dressings and vinaigrettes in retail and foodservice sizes.',
  'pickles-chutneys-and-preserves': 'Mixed pickles, mango chutney, jam and fruit preserves. Traditional South Asian and Middle Eastern recipes with modern retail packaging.',
  'ready-to-cook': 'Marinated meat kits, curry pastes, spice kits and ready-to-cook meal solutions. Designed for minimal preparation — retailer-ready with full allergen labeling.',
  'seasoning-spices-and-marinade': 'Whole and ground spices — black pepper, chili, turmeric, cumin, coriander. Custom spice blends and marinades. Steam-sterilized, ETO-free processing.',
  'sauces-and-condiments': 'Ketchup, BBQ sauce, hot sauce, soy sauce, oyster sauce, pizza sauce, peri peri, honey mustard, Worcestershire and more. Retail and foodservice sizes.',
  // Frozen Foods
  'chicken-nuggets': 'Breaded and plain chicken nuggets from Halal-certified processing plants. IQF (Individually Quick Frozen) for consistent portion control. For QSR and retail.',
  'fish-fillet': 'White fish fillets — battered, breaded and plain. MSC-certified sourcing options. Cold chain maintained at -18°C from processing to delivery.',
  'frozen-meat': 'Halal-certified frozen chicken portions, beef cuts and lamb. Vacuum-packed and blast-frozen. Full HACCP traceability from farm to fork.',
  'frozen-vegetables': 'IQF mixed vegetables, peas, sweetcorn, spinach and stir-fry blends. No additives, no preservatives. Sourced from controlled agricultural supply chains.',
  // Pasta
  'all': 'Durum wheat semolina pasta — fusilli, bucatini, farfalle, fettuccine, linguine and more. Bronze-die extruded for authentic texture. From premium Italian and Spanish producers.',
  // Snacks
  'baked-and-roasted': 'Oven-baked and air-roasted snacks — chickpeas, corn puffs and grain-based crisps. Lower fat than fried alternatives. Clean label for health-conscious retail.',
  'chips-and-crisps': 'Potato chips, vegetable crisps and rice crackers in 30g–200g retail formats. 15+ flavour profiles. Nitrogen-flush packaging for maximum crunch retention.',
  'fusion-snacks': 'East-meets-West snack fusions — masala puffs, wasabi beans, chili corn. Designed for multicultural urban retail and export markets across Europe and GCC.',
  'ready-to-eat-bite': 'Bite-size snack portions for convenience and on-the-go consumption. Single-serve and multipacks. High repeatability for vending, travel retail and convenience.',
  'savory': 'Savoury baked goods, breadsticks, crackers and pretzel formats. Cheese, herb and smoked flavours. Ideal for gifting, hospitality and premium retail.',
  // BearPops
  'bearpops-characters': 'BearPops character confectionery — the Harvics kids brand. Gummy bears, jellies and lollipops with collectible character designs. Halal certified, EU compliant.',
  // Product Photos
  'product-photos': 'Full Harvics FMCG portfolio — all categories photographed for catalogue, digital and retail display use.',
}

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to get image files from a directory
function getImageFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }
    
    const files = fs.readdirSync(dirPath)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        // Only include image files, exclude videos and other files
        return imageExtensions.includes(ext) && !file.toLowerCase().endsWith('.mp4')
      })
      .map(file => {
        // Get relative path from public folder
        const relativePath = path.relative(path.join(process.cwd(), 'public'), dirPath)
        // Convert to URL path (forward slashes) - Next.js handles spaces automatically
        const urlPath = relativePath.replace(/\\/g, '/')
        return `/${urlPath}/${file}`
      })
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

// Cache for categories to avoid repeated file system scans
let categoriesCache: CategoryData[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 1 minute cache

// All 10 vertical directories under public/assets/verticals/
const VERTICAL_DIRS = [
  '01-apparels', '02-fmcg', '03-commodities', '04-industrial', '05-minerals',
  '06-oil-gas', '07-real-estate', '08-sourcing', '09-finance', '10-ai-tech',
] as const

// Verticals where we need backwards-compat keys (FMCG food keeps its mapped keys).
const LEGACY_FMCG_DIR = '02-fmcg'

// Display defaults for verticals that don't have an entry in categoryMapping.
const VERTICAL_DEFAULTS: Record<string, { name: string; color: string; icon: string; description: string }> = {
  '01-apparels':    { name: 'Apparels',     color: 'from-rose-600 to-pink-700',     icon: 'icon-textile',    description: 'Apparel, home textiles, fabrics and accessories sourced from certified global mills.' },
  '02-fmcg':        { name: 'FMCG',         color: 'from-amber-500 to-orange-500',  icon: 'icon-fmcg',       description: 'Fast-moving consumer goods across food, personal-care, home-care and distribution.' },
  '03-commodities': { name: 'Commodities',  color: 'from-yellow-600 to-amber-700',  icon: 'icon-commodity',  description: 'Agri, energy, softs and metals — physical commodities traded across 42+ markets.' },
  '04-industrial':  { name: 'Industrial',   color: 'from-slate-600 to-slate-800',   icon: 'icon-industrial', description: 'Industrial chemicals, machinery, safety and MRO supplies for manufacturing operations.' },
  '05-minerals':    { name: 'Minerals',     color: 'from-stone-600 to-stone-800',   icon: 'icon-mineral',    description: 'Metals, energy, precious and industrial minerals from certified mining operations.' },
  '06-oil-gas':     { name: 'Oil & Gas',    color: 'from-zinc-700 to-zinc-900',     icon: 'icon-oilgas',     description: 'Upstream, midstream, downstream and services across the global hydrocarbon value chain.' },
  '07-real-estate': { name: 'Real Estate',  color: 'from-emerald-600 to-teal-700',  icon: 'icon-realestate', description: 'Residential, commercial, industrial and land assets across emerging-market hubs.' },
  '08-sourcing':    { name: 'Sourcing',     color: 'from-indigo-600 to-blue-800',   icon: 'icon-sourcing',   description: 'Sourcing services, category management and regional supplier networks.' },
  '09-finance':     { name: 'Finance',      color: 'from-green-700 to-emerald-800', icon: 'icon-finance',    description: 'Banking, HPay, capital markets and advisory — built for cross-border commerce.' },
  '10-ai-tech':     { name: 'AI & Tech',    color: 'from-violet-600 to-purple-800', icon: 'icon-aitech',     description: 'AI services, platforms, infrastructure and emerging tech powering HARVICS OS.' },
}

// Recursively find every "leaf" folder under a directory.
// A leaf = folder with no subdirectories other than the reserved `videos` sibling.
// Returns: { relPath, absPath } where relPath is the path from `categoriesRoot` to the leaf.
function findLeafFolders(categoriesRoot: string): Array<{ relPath: string; absPath: string }> {
  if (!fs.existsSync(categoriesRoot)) return []
  const results: Array<{ relPath: string; absPath: string }> = []

  function walk(dir: string, relPath: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    const subdirs = entries.filter(e => e.isDirectory() && e.name !== 'videos')
    if (subdirs.length === 0) {
      results.push({ relPath, absPath: dir })
      return
    }
    for (const sd of subdirs) {
      const childRel = relPath === '' ? sd.name : `${relPath}/${sd.name}`
      walk(path.join(dir, sd.name), childRel)
    }
  }

  for (const top of fs.readdirSync(categoriesRoot, { withFileTypes: true })) {
    if (top.isDirectory() && top.name !== 'videos') {
      walk(path.join(categoriesRoot, top.name), top.name)
    }
  }
  return results
}

// Pretty-cased name from a kebab-case slug
function prettify(slug: string): string {
  return slug.split(/[-/]/).map(w => w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)).join(' ')
}

// Get all categories across all 10 verticals from the folder structure.
// - FMCG food categories keep their existing keys (bakery, beverages, ...) for
//   backwards compatibility with /products/[category] URLs.
// - All other categories use composite keys: `{verticalSlug}-{parent-path-with-hyphens}`.
// - Leaves with zero images are still returned (with imageCount=0) so dry-runs can
//   plan generation. Existing FMCG food behavior is preserved (its leaves all have images).
export function getCategoriesFromFolder(): CategoryData[] {
  const now = Date.now()
  if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoriesCache
  }

  const verticalsBase = path.join(process.cwd(), 'public', 'assets', 'verticals')
  if (!fs.existsSync(verticalsBase)) {
    categoriesCache = []
    cacheTimestamp = now
    return []
  }

  // Group leaves by their category bucket: key = `${verticalDir}|${categoryRelPath}`
  type Bucket = {
    verticalDir: string
    categoryRelPath: string       // e.g. 'bakery' or 'apparel/mens-wear'
    leaves: Array<{ name: string; absPath: string }>  // leaf folders inside the bucket
  }
  const buckets = new Map<string, Bucket>()

  for (const verticalDir of VERTICAL_DIRS) {
    const categoriesRoot = path.join(verticalsBase, verticalDir, 'categories')
    if (!fs.existsSync(categoriesRoot)) continue

    const leaves = findLeafFolders(categoriesRoot)

    for (const leaf of leaves) {
      const segments = leaf.relPath.split('/')
      let categoryRelPath: string
      let leafName: string

      if (segments.length === 1) {
        // Top-level leaf (e.g. FMCG pastas — images directly inside).
        // Treat the leaf itself as the category and use a single "all" subcategory.
        categoryRelPath = segments[0]
        leafName = 'all'
      } else {
        // Normal case: leaf's parent is the category.
        categoryRelPath = segments.slice(0, -1).join('/')
        leafName = segments[segments.length - 1]
      }

      const bucketKey = `${verticalDir}|${categoryRelPath}`
      let bucket = buckets.get(bucketKey)
      if (!bucket) {
        bucket = { verticalDir, categoryRelPath, leaves: [] }
        buckets.set(bucketKey, bucket)
      }
      bucket.leaves.push({ name: leafName, absPath: leaf.absPath })
    }
  }

  const categories: CategoryData[] = []

  for (const bucket of buckets.values()) {
    const isLegacyFmcg =
      bucket.verticalDir === LEGACY_FMCG_DIR && !bucket.categoryRelPath.includes('/')

    let key: string
    let displayName: string
    let icon: string
    let color: string
    let description: string

    const legacyInfo = isLegacyFmcg ? categoryMapping[bucket.categoryRelPath] : undefined
    if (legacyInfo) {
      // Backwards-compat: keep existing FMCG food keys and metadata.
      key = legacyInfo.key
      displayName = legacyInfo.name
      icon = legacyInfo.icon
      color = legacyInfo.color
      description = legacyInfo.description
    } else {
      const verticalSlug = bucket.verticalDir.replace(/^\d+-/, '')
      key = `${verticalSlug}-${bucket.categoryRelPath.replace(/\//g, '-')}`
      const defaults = VERTICAL_DEFAULTS[bucket.verticalDir]
      displayName = prettify(bucket.categoryRelPath)
      icon = defaults?.icon ?? 'icon-default'
      color = defaults?.color ?? 'from-stone-600 to-stone-800'
      description = defaults
        ? `${defaults.name} — ${prettify(bucket.categoryRelPath)}.`
        : prettify(bucket.categoryRelPath)
    }

    const subcategories: Subcategory[] = []
    for (const leaf of bucket.leaves) {
      const images = getImageFiles(leaf.absPath)
      const subSlug = leaf.name === 'all' ? 'all' : createSlug(leaf.name)
      subcategories.push({
        name: leaf.name === 'all' ? 'All' : leaf.name,
        slug: subSlug,
        images,
        imageCount: images.length,
        description:
          subcategoryDescriptions[subSlug] ||
          `Premium ${prettify(leaf.name).toLowerCase()} — quality assured, globally sourced by Harvics Global Ventures.`,
      })
    }

    // Pick a representative image (first leaf that has any).
    let categoryImage = '/assets/brand/photo/logo.png'
    for (const sub of subcategories) {
      if (sub.images.length > 0) {
        categoryImage = sub.images[0]
        break
      }
    }

    categories.push({
      name: displayName,
      key,
      slug: createSlug(bucket.categoryRelPath.replace(/\//g, '-')),
      subcategories,
      image: categoryImage,
      description,
      color,
      icon,
      vertical: bucket.verticalDir,
    })
  }

  const sorted = categories.sort((a, b) => {
    const va = a.vertical ?? ''
    const vb = b.vertical ?? ''
    if (va !== vb) return va.localeCompare(vb)
    return a.name.localeCompare(b.name)
  })

  categoriesCache = sorted
  cacheTimestamp = Date.now()
  return sorted
}

// Get subcategories for a specific category
export function getSubcategoriesForCategory(categoryKey: string): Subcategory[] {
  const categories = getCategoriesFromFolder()
  const category = categories.find(cat => cat.key === categoryKey)
  return category ? category.subcategories : []
}

// Get images for a specific category and subcategory
export function getImagesForSubcategory(categoryKey: string, subcategorySlug: string): string[] {
  const categories = getCategoriesFromFolder()
  const category = categories.find(cat => cat.key === categoryKey)
  
  if (!category) {
    return []
  }

  const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug)
  return subcategory ? subcategory.images : []
}

// Get category info
export function getCategoryInfo(categoryKey: string): CategoryData | null {
  const categories = getCategoriesFromFolder()
  return categories.find(cat => cat.key === categoryKey) || null
}

// Get all categories (for products page)
export function getAllCategories(): CategoryData[] {
  return getCategoriesFromFolder()
}

