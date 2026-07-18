// Central resolver that maps HarvicTrade product names to the real generated
// image files that exist on disk under /public/assets/harvictrade/products.
// Ordered list: the FIRST matching keyword rule wins, so put more specific
// rules before broader ones.

const PRODUCTS_DIR = '/assets/harvictrade/products'
const HEROES_DIR = '/assets/harvictrade/heroes'

// Files that actually exist right now (14 product shots).
export const AVAILABLE_PRODUCT_IMAGES = [
  'basmati-rice',
  'cement',
  'chocolate',
  'copper-cathode',
  'cotton-tshirt',
  'denim-fabric',
  'diesel-tanker',
  'galaxy-phone',
  'hard-hat',
  'iphone',
  'nitrile-gloves',
  'olive-oil',
  'refined-sugar',
  'safety-jacket',
] as const

// Keyword → image-file rules (checked top to bottom, first hit wins).
const KEYWORD_RULES: Array<{ test: RegExp; file: string }> = [
  { test: /basmati|jasmine|\brice\b|grain|\bcorn\b/i, file: 'basmati-rice' },
  { test: /sugar|sweetener|icumsa/i, file: 'refined-sugar' },
  { test: /olive|coconut oil|sunflower|palm olein|edible oil|cooking oil/i, file: 'olive-oil' },
  { test: /chocolate|wafer|biscuit|confection|snack|candy|chips/i, file: 'chocolate' },
  { test: /cement|concrete|rebar|construction material/i, file: 'cement' },
  { test: /nitrile|glove/i, file: 'nitrile-gloves' },
  { test: /hard hat|helmet|\bppe\b|ear defend|fire exting|safety equipment|hazmat|caustic|chemical/i, file: 'hard-hat' },
  { test: /hi-?vis|safety jacket|safety boot|steel toe|coverall|workwear|work trouser|cargo/i, file: 'safety-jacket' },
  { test: /copper|zinc|alumini?um|ingot|cathode|iron ore|\bsteel\b|scrap|\bgold\b|silica|base metal|precious metal|mineral/i, file: 'copper-cathode' },
  { test: /denim|fabric|greige|taffeta|polyester|\byarn\b|textile|bed sheet|towel|apron|home textile/i, file: 'denim-fabric' },
  { test: /t-?shirt|polo|chino|blouse|shirt|garment|apparel|clothing|cotton basic/i, file: 'cotton-tshirt' },
  { test: /iphone|ipad|macbook|airpod|apple watch|\bapple\b|\bmac\b/i, file: 'iphone' },
  { test: /galaxy|samsung|pixel|xiaomi|android|smartphone|\bphone\b/i, file: 'galaxy-phone' },
  { test: /diesel|jet fuel|\bfuel\b|\blpg\b|propane|butane|petrochem|polypropylene|\bpvc\b|resin|\bgas\b|crude oil|petroleum/i, file: 'diesel-tanker' },
]

// Per-category fallback hero (used when no product keyword matches).
const CATEGORY_HERO: Record<string, string> = {
  textiles: `${HEROES_DIR}/textiles-hero.jpg`,
  fmcg: `${HEROES_DIR}/fmcg-hero.jpg`,
  commodities: `${HEROES_DIR}/commodities-hero.jpg`,
  industrial: `${HEROES_DIR}/industrial-hero.jpg`,
  minerals: `${HEROES_DIR}/minerals-hero.jpg`,
  energy: `${HEROES_DIR}/energy-hero.jpg`,
  electronics: `${HEROES_DIR}/electronics-hero.jpg`,
}

export function getCategoryHero(categorySlug?: string): string {
  return (categorySlug && CATEGORY_HERO[categorySlug]) || `${HEROES_DIR}/commodities-hero.jpg`
}

// Resolve the best real image for a product. Falls back to the category hero
// (and finally the commodities hero) when nothing specific matches.
export function getProductImage(name: string, categorySlug?: string): string {
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(name)) return `${PRODUCTS_DIR}/${rule.file}.jpg`
  }
  return getCategoryHero(categorySlug)
}
