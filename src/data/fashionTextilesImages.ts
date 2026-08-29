/**
 * Sand Atelier textiles / apparel / undergarment shots.
 * Single source for wiring into SmartImage, productCatalog, harvictradeImages, leafImageMap.
 */
export const FASHION_TEX = '/assets/harvictrade/products/fashion/textiles'

export const FASHION_SHOTS = {
  mens: `${FASHION_TEX}/mens.jpg`,
  ladies: `${FASHION_TEX}/ladies.jpg`,
  blouse: `${FASHION_TEX}/blouse.jpg`,
  suits: `${FASHION_TEX}/suits.jpg`,
  suitsWomens: `${FASHION_TEX}/suits-womens.jpg`,
  denim: `${FASHION_TEX}/denim.jpg`,
  sportswear: `${FASHION_TEX}/sportswear.jpg`,
  sportsAlt: `${FASHION_TEX}/sports-alt.jpg`,
  active: `${FASHION_TEX}/active.jpg`,
  swim: `${FASHION_TEX}/swim.jpg`,
  kids: `${FASHION_TEX}/kids.jpg`,
  girls: `${FASHION_TEX}/girls.jpg`,
  boys: `${FASHION_TEX}/boys.jpg`,
  kidsSports: `${FASHION_TEX}/kids-sports.jpg`,
  home: `${FASHION_TEX}/home.jpg`,
  lingerie: `${FASHION_TEX}/lingerie.jpg`,
  lingerieSet: `${FASHION_TEX}/lingerie-set.jpg`,
  bra: `${FASHION_TEX}/bra.jpg`,
  panties: `${FASHION_TEX}/panties.jpg`,
  sportsBra: `${FASHION_TEX}/sports-bra.jpg`,
  shapewear: `${FASHION_TEX}/shapewear.jpg`,
  hosiery: `${FASHION_TEX}/hosiery.jpg`,
  socks: `${FASHION_TEX}/socks.jpg`,
  mensUnderwear: `${FASHION_TEX}/mens-underwear.jpg`,
  robe: `${FASHION_TEX}/robe-model.jpg`,
  night: `${FASHION_TEX}/night-alt.jpg`,
  gown: `${FASHION_TEX}/gown.jpg`,
} as const

/** Keyword → image path (exact token keys for maps). */
export const FASHION_KEYWORD_MAP: Record<string, string> = {
  // mens
  men: FASHION_SHOTS.mens,
  mens: FASHION_SHOTS.mens,
  menswear: FASHION_SHOTS.mens,
  'mens wear': FASHION_SHOTS.mens,
  'mens-wear': FASHION_SHOTS.mens,
  shirt: FASHION_SHOTS.mens,
  shirts: FASHION_SHOTS.mens,
  polo: FASHION_SHOTS.boys,
  // ladies
  women: FASHION_SHOTS.ladies,
  womens: FASHION_SHOTS.ladies,
  womenswear: FASHION_SHOTS.ladies,
  ladies: FASHION_SHOTS.ladies,
  'ladies wear': FASHION_SHOTS.ladies,
  'ladies-wear': FASHION_SHOTS.ladies,
  dress: FASHION_SHOTS.ladies,
  dresses: FASHION_SHOTS.ladies,
  blouse: FASHION_SHOTS.blouse,
  fashion: FASHION_SHOTS.ladies,
  // suits / denim
  suit: FASHION_SHOTS.suits,
  suits: FASHION_SHOTS.suits,
  blazer: FASHION_SHOTS.suits,
  denim: FASHION_SHOTS.denim,
  jeans: FASHION_SHOTS.denim,
  // sports
  sportswear: FASHION_SHOTS.sportswear,
  'sports wear': FASHION_SHOTS.sportswear,
  'sports-wear': FASHION_SHOTS.sportswear,
  activewear: FASHION_SHOTS.sportswear,
  yoga: FASHION_SHOTS.active,
  swimwear: FASHION_SHOTS.swim,
  swimsuit: FASHION_SHOTS.swim,
  bikini: FASHION_SHOTS.swim,
  // kids
  kids: FASHION_SHOTS.kids,
  'kids wear': FASHION_SHOTS.kids,
  'kids-wear': FASHION_SHOTS.kids,
  boy: FASHION_SHOTS.boys,
  boys: FASHION_SHOTS.boys,
  girl: FASHION_SHOTS.girls,
  girls: FASHION_SHOTS.girls,
  // home
  home: FASHION_SHOTS.home,
  'home textiles': FASHION_SHOTS.home,
  'home-textiles': FASHION_SHOTS.home,
  'bed linen': FASHION_SHOTS.home,
  'bed-linen': FASHION_SHOTS.home,
  'bath linen': FASHION_SHOTS.home,
  bedsheet: FASHION_SHOTS.home,
  bedroom: FASHION_SHOTS.home,
  towel: FASHION_SHOTS.home,
  textile: FASHION_SHOTS.ladies,
  textiles: FASHION_SHOTS.ladies,
  apparel: FASHION_SHOTS.mens,
  // undergarments
  lingerie: FASHION_SHOTS.lingerie,
  bra: FASHION_SHOTS.bra,
  bras: FASHION_SHOTS.bra,
  panties: FASHION_SHOTS.panties,
  briefs: FASHION_SHOTS.panties,
  knickers: FASHION_SHOTS.panties,
  underwear: FASHION_SHOTS.mensUnderwear,
  shapewear: FASHION_SHOTS.shapewear,
  hosiery: FASHION_SHOTS.hosiery,
  tights: FASHION_SHOTS.hosiery,
  stockings: FASHION_SHOTS.hosiery,
  socks: FASHION_SHOTS.socks,
  'sports-bra': FASHION_SHOTS.sportsBra,
  'sports bra': FASHION_SHOTS.sportsBra,
  nightwear: FASHION_SHOTS.robe,
  nightgown: FASHION_SHOTS.robe,
  nightgowns: FASHION_SHOTS.robe,
  loungewear: FASHION_SHOTS.robe,
  robe: FASHION_SHOTS.robe,
  robes: FASHION_SHOTS.robe,
  pyjamas: FASHION_SHOTS.robe,
  pajamas: FASHION_SHOTS.robe,
  'dressing-gown': FASHION_SHOTS.robe,
  gown: FASHION_SHOTS.gown,
}

/** Ordered regex rules for free-text product names (first match wins). */
export const FASHION_NAME_RULES: Array<{ test: RegExp; path: string }> = [
  { test: /sports?\s*-?\s*bra/i, path: FASHION_SHOTS.sportsBra },
  { test: /shapewear|waist\s*trainer|bodysuit|thigh\s*shaper/i, path: FASHION_SHOTS.shapewear },
  { test: /\bbra\b|balcony|underwire|padded bra/i, path: FASHION_SHOTS.bra },
  { test: /panties|knickers|thong|boyshort|brazilian|period underwear/i, path: FASHION_SHOTS.panties },
  { test: /hosiery|tights|stockings/i, path: FASHION_SHOTS.hosiery },
  { test: /\bsocks?\b|knee-?high/i, path: FASHION_SHOTS.socks },
  { test: /boxer|mens?\s*underwear|undershirt/i, path: FASHION_SHOTS.mensUnderwear },
  { test: /lingerie|loungewear|nightwear|nightgown|pajama|pyjama|dressing\s*gown|\brobe\b/i, path: FASHION_SHOTS.lingerie },
  { test: /swimwear|swimsuit|bikini/i, path: FASHION_SHOTS.swim },
  { test: /sportswear|activewear|\byoga\b|tracksuit|compression/i, path: FASHION_SHOTS.sportswear },
  { test: /\bsuit\b|blazer|tuxedo/i, path: FASHION_SHOTS.suits },
  { test: /denim|\bjeans?\b/i, path: FASHION_SHOTS.denim },
  { test: /blouse/i, path: FASHION_SHOTS.blouse },
  { test: /\bgown\b|evening dress/i, path: FASHION_SHOTS.gown },
  { test: /\bdress(es)?\b|ladies|womens?|women'?s/i, path: FASHION_SHOTS.ladies },
  { test: /boys?\b|polo/i, path: FASHION_SHOTS.boys },
  { test: /girls?\b/i, path: FASHION_SHOTS.girls },
  { test: /kids?|children|infant|toddler/i, path: FASHION_SHOTS.kids },
  { test: /bed\s*sheet|bed\s*linen|bath\s*linen|towel|home\s*textile|duvet|comforter/i, path: FASHION_SHOTS.home },
  { test: /mens?|shirt|chino|garment|apparel|clothing|cotton basic|textile|fabric|greige|yarn/i, path: FASHION_SHOTS.mens },
]

export function resolveFashionImage(name: string): string | null {
  if (!name) return null
  const lower = name.toLowerCase().trim()
  if (FASHION_KEYWORD_MAP[lower]) return FASHION_KEYWORD_MAP[lower]
  for (const rule of FASHION_NAME_RULES) {
    if (rule.test.test(name)) return rule.path
  }
  return null
}
