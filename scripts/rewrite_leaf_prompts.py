#!/usr/bin/env python3
"""One-shot rewriter for scripts/leaf_prompts.py.

Strategy:
- 01-apparels prompts use editorial fashion / accessory / textile photography
  styling inspired by Zara, Armani, and Gucci's actual visual conventions.
- 02-fmcg prompts use premium grocery / FMCG styling inspired by M&S Food,
  Waitrose, and Whole Foods Market.

For every existing leaf key we:
  1. Look up the style template for its (vertical, L3, L4) tree.
  2. Build a product-accurate subject phrase from the leaf name (with manual
     overrides for awkward names).
  3. Assemble: "{subject}, {frame}, {lighting}, {surface}, {style}"

Then the generator script appends STYLE_SUFFIX (quality keywords only).
Run: python3 scripts/rewrite_leaf_prompts.py
"""
import os
import sys
import textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from leaf_prompts import LEAF_PROMPTS as OLD_PROMPTS  # type: ignore

OUT_PATH = os.path.join(HERE, "leaf_prompts.py")

STYLE_SUFFIX = (
    "shot on a medium-format camera, razor-sharp focus on the hero product, "
    "natural depth of field, ultra-detailed, 8k, editorial commercial "
    "photography, no humans"
)

# ----------------------------------------------------------------------
# Style catalogue. Key = "<vertical>/<L3>/<L4>"
# Each entry: {prefix, suffix, frame, lighting, surface, style}
# Subject = f"{prefix} {leaf_humanized} {suffix}".strip()
# ----------------------------------------------------------------------

# ===================== 01-APPARELS =====================

S_BAG = {
    "frame": "single bag presented at a three-quarter angle on a clean sweep",
    "lighting": "soft directional studio light from the upper left, gentle long shadow falling to the right",
    "surface": "warm sand seamless paper backdrop",
    "style": "in the style of Gucci editorial accessory photography",
}
S_SMALL_LEATHER = {
    "frame": "shot directly from above, the product laid flat",
    "lighting": "warm Rembrandt window light grazing the leather grain",
    "surface": "dark walnut wood plank surface",
    "style": "in the style of Armani Casa still life",
}
S_BELT = {
    "frame": "belt coiled neatly into a soft loop, buckle facing camera",
    "lighting": "single warm spotlight from above, deep shadow at the edges",
    "surface": "polished walnut wood surface",
    "style": "in the style of Armani men's accessory campaign",
}
S_GLOVES = {
    "frame": "matching pair laid flat side by side, fingers gently extended",
    "lighting": "soft north-facing window light, low contrast",
    "surface": "natural linen fabric backdrop",
    "style": "in the style of Zara accessories flat-lay editorial",
}
S_HAT = {
    "frame": "single hat shot at eye level, slight three-quarter angle",
    "lighting": "soft beauty-dish light from above, low even shadow",
    "surface": "ivory seamless paper sweep",
    "style": "in the style of Gucci eyewear and hat editorial",
}
S_JEWELLERY = {
    "frame": "macro hero shot, single piece in sharp focus, generous negative space",
    "lighting": "tight jewel spotlight from above, dramatic specular highlights",
    "surface": "polished black satin fabric, hint of bokeh",
    "style": "in the style of Cartier and Bulgari high-jewellery photography",
}
S_SCARF = {
    "frame": "scarf softly draped and gently flowing, forming an elegant curve",
    "lighting": "soft golden-hour window light from the side",
    "surface": "cream raw silk backdrop",
    "style": "in the style of Hermes silk scarf editorial",
}
S_SUNGLASSES = {
    "frame": "single pair front-on, arms angled slightly forward, hero composition",
    "lighting": "crisp dual rim lights producing twin reflections on the lenses",
    "surface": "polished smoky mirror surface with subtle gradient backdrop",
    "style": "in the style of Gucci eyewear campaign",
}

S_BABY_APPAREL = {
    "frame": "garment flat-laid neatly, sleeves softly folded into a relaxed shape",
    "lighting": "diffused morning window light, very gentle shadow",
    "surface": "soft natural cotton muslin backdrop in cream",
    "style": "in the style of Zara Baby lookbook flat-lay",
}
S_KIDS_APPAREL = {
    "frame": "garment flat-laid in a relaxed natural shape, small playful styling",
    "lighting": "soft diffused daylight from the upper left",
    "surface": "pale bleached oak wood plank surface",
    "style": "in the style of Zara Kids campaign flat-lay",
}
S_TEENS_APPAREL = {
    "frame": "garment flat-laid with a casual relaxed fold, slight crumple for movement",
    "lighting": "soft warm cinematic light, low contrast",
    "surface": "textured warm grey recycled paper",
    "style": "in the style of Zara TRF teen editorial",
}
S_MENS_APPAREL = {
    "frame": "garment flat-laid with crisp tailored folds, slight diagonal",
    "lighting": "moody chiaroscuro side-lighting from the right",
    "surface": "polished charcoal stone slab",
    "style": "in the style of Armani Men's tailoring campaign",
}
S_WOMENS_APPAREL = {
    "frame": "garment elegantly flat-laid with a soft draped fall, suggestion of movement",
    "lighting": "soft golden window light from the left, painterly mood",
    "surface": "warm sand washed-linen backdrop",
    "style": "in the style of Zara Woman editorial lookbook",
}
S_SPORTSWEAR = {
    "frame": "garment flat-laid with athletic geometry, sleeves and hem aligned",
    "lighting": "cool directional studio light, crisp shadow",
    "surface": "polished concrete floor",
    "style": "in the style of Zara Athleticz performance editorial",
}
S_LINGERIE = {
    "frame": "garment delicately flat-laid, lace and trims softly arranged",
    "lighting": "soft blush window light, low contrast, romantic mood",
    "surface": "champagne silk satin backdrop",
    "style": "in the style of La Perla and Calvin Klein lingerie editorial",
}

S_FABRIC = {
    "frame": "folded fabric swatch and a partially unrolled bolt, edge softly fraying, fibres visible",
    "lighting": "soft northern window light raking across the weave to reveal texture",
    "surface": "warm oak tabletop with a hint of natural linen runner",
    "style": "in the style of Loro Piana fabric campaign and Zara Home material library",
}

S_FOOTWEAR_BABY = {
    "frame": "matching pair side by side at slight three-quarter angle",
    "lighting": "soft diffused window light, very gentle shadow",
    "surface": "soft cream knitted wool blanket",
    "style": "in the style of Zara Baby footwear flat-lay",
}
S_FOOTWEAR_KIDS_TEENS = {
    "frame": "matching pair side by side at three-quarter angle",
    "lighting": "soft daylight with mild contrast",
    "surface": "pale oak plank surface",
    "style": "in the style of Zara Kids footwear editorial",
}
S_FOOTWEAR_MENS = {
    "frame": "single shoe in dramatic side profile, slight foreshortening, hero composition",
    "lighting": "warm directional spotlight, deep theatrical shadow",
    "surface": "polished dark walnut floor with subtle reflection",
    "style": "in the style of Armani Men's footwear campaign",
}
S_FOOTWEAR_WOMENS = {
    "frame": "single shoe at elegant three-quarter angle, second shoe softly out of focus behind",
    "lighting": "soft beauty light from the upper left, warm golden tone",
    "surface": "beige seamless paper sweep",
    "style": "in the style of Zara Woman footwear editorial",
}
S_FOOTWEAR_SPORTS = {
    "frame": "single shoe in dynamic side profile suggesting motion",
    "lighting": "crisp cool studio light with strong rim highlight",
    "surface": "polished concrete floor with slight gradient backdrop",
    "style": "in the style of Nike and Adidas premium performance campaign",
}

S_HOME_BATH = {
    "frame": "textile softly folded and stacked, edge stitching visible, fibres lifted",
    "lighting": "soft morning window light grazing the weave",
    "surface": "ivory marble bathroom shelf",
    "style": "in the style of Zara Home bath linen catalogue",
}
S_HOME_BED = {
    "frame": "textile flat-laid with one corner softly folded back to reveal texture and stitching",
    "lighting": "soft daylight from the left, low shadow",
    "surface": "natural raw linen surface",
    "style": "in the style of Zara Home bedlinen editorial",
}
S_HOME_CURTAIN = {
    "frame": "fabric softly draped and partially folded showing pleats and hem",
    "lighting": "soft backlit window light revealing weave translucency",
    "surface": "ivory plaster wall corner",
    "style": "in the style of Zara Home window dressing catalogue",
}
S_HOME_KITCHEN = {
    "frame": "textile neatly folded with a sprig of fresh rosemary placed alongside for scale",
    "lighting": "warm window light from the left, gentle shadow",
    "surface": "warm oak farmhouse table",
    "style": "in the style of Zara Home kitchen lifestyle catalogue",
}
S_HOME_TABLE = {
    "frame": "textile partially set across a corner of the table with simple ceramic prop alongside",
    "lighting": "soft warm afternoon light, painterly mood",
    "surface": "warm oak dining table",
    "style": "in the style of Zara Home tabletop catalogue",
}

# ===================== 02-FMCG =====================

S_BABY_SKINCARE = {
    "frame": "single pastel-coloured product container, slight three-quarter angle, soft baby muslin folded alongside",
    "lighting": "soft north-facing window light, very gentle shadow",
    "surface": "creamy off-white linen tabletop",
    "style": "in the style of M&S Little baby care catalogue",
}
S_DIAPERS = {
    "frame": "single folded diaper laid flat with packaging softly out of focus behind, fluffy cotton swatch alongside",
    "lighting": "soft bright daylight, low even shadow",
    "surface": "ivory cotton waffle blanket",
    "style": "in the style of M&S Little nursery essentials catalogue",
}
S_FEEDING = {
    "frame": "single feeding item upright at three-quarter angle, soft pastel bib softly folded alongside",
    "lighting": "soft window light from the left, gentle shadow",
    "surface": "pale grey washed-oak tabletop",
    "style": "in the style of Waitrose Baby aisle hero photography",
}

S_FOOD_BABY = {
    "frame": "single hero product (jar / pouch / pack) upright at three-quarter angle with a few raw ingredients (oats, fruit, vegetable) scattered around",
    "lighting": "soft morning window light from the left, warm soft shadow",
    "surface": "natural linen runner over pale oak tabletop",
    "style": "in the style of Ella's Kitchen and Waitrose baby food editorial",
}
S_BAKING = {
    "frame": "single packet or jar with a small mound of the ingredient spilled on the board, vintage measuring spoon alongside",
    "lighting": "warm afternoon window light, golden mood, soft dust particles in air",
    "surface": "flour-dusted reclaimed oak baking board",
    "style": "in the style of M&S Food bakery and Waitrose home baking catalogue",
}
S_BEVERAGES = {
    "frame": "single bottle or carton upright at three-quarter angle with a frosted glass freshly poured alongside, fresh garnish (citrus slice, mint sprig) on a small dish",
    "lighting": "crisp cool daylight from the side, sparkling highlights on glass, light condensation",
    "surface": "polished Carrara marble slab",
    "style": "in the style of Waitrose & Partners beverage editorial",
}
S_BREAD = {
    "frame": "freshly baked bread or pastry on a wooden board, soft natural crust crumbs scattered, linen cloth folded alongside",
    "lighting": "warm golden window light from the side, gentle dust motes in the air",
    "surface": "reclaimed oak bakery board with rustic linen cloth",
    "style": "in the style of M&S Food bakery hero photography and Paul Hollywood cookbook editorial",
}
S_BREAKFAST = {
    "frame": "single packet upright at the back with a small ceramic bowl of the product in foreground, fresh fruit and a drizzle of honey alongside",
    "lighting": "soft warm morning window light from the left",
    "surface": "natural oak breakfast table with linen runner",
    "style": "in the style of M&S Food breakfast editorial",
}
S_CHOCOLATE = {
    "frame": "single product with broken chocolate shards and cocoa-dusted curls scattered, hint of cacao nibs",
    "lighting": "dramatic warm sidelight, deep velvety shadows, golden specular highlights",
    "surface": "dark slate stone surface",
    "style": "in the style of Hotel Chocolat and Lindt premium editorial",
}
S_DAIRY = {
    "frame": "single dairy product styled fresh with a small white ceramic dish or wooden board alongside, condensation visible",
    "lighting": "cool clean daylight from the left, crisp shadow",
    "surface": "white Carrara marble slab",
    "style": "in the style of Waitrose dairy aisle hero and M&S Food fresh dairy editorial",
}
S_DELI = {
    "frame": "product styled fresh on a wooden charcuterie board with sprigs of fresh herbs and a small ceramic bowl alongside",
    "lighting": "warm window light from the side, painterly soft shadow",
    "surface": "rustic oak charcuterie board over linen",
    "style": "in the style of M&S Food deli counter editorial",
}
S_FROZEN = {
    "frame": "product styled with frost crystals and a few ice cubes scattered around, vapour just rising",
    "lighting": "cool bright daylight, crisp blue-tinted highlights",
    "surface": "frosted blue-grey marble slab",
    "style": "in the style of Birds Eye and M&S Food frozen aisle editorial",
}
S_FREE_FROM = {
    "frame": "single product with a few raw ingredient cues (seeds, oats, leafy greens) styled minimally alongside",
    "lighting": "bright airy daylight from above, soft even shadow",
    "surface": "white-washed wooden tabletop with natural linen runner",
    "style": "in the style of Whole Foods Market 365 health & wellness editorial",
}
S_INTERNATIONAL = {
    "frame": "single product with culturally appropriate ingredient props (spices, herbs, regional ceramics) styled tastefully alongside",
    "lighting": "warm golden window light, painterly mood",
    "surface": "warm terracotta or oak surface with hand-woven natural runner",
    "style": "in the style of Whole Foods world cuisine and Waitrose international aisle editorial",
}
S_MEAT_SEAFOOD = {
    "frame": "fresh raw product styled on butcher paper or oak block with sprigs of rosemary, thyme and cracked black pepper alongside",
    "lighting": "soft directional daylight from the left, painterly low-key shadow",
    "surface": "thick oak butcher block with crumpled brown butcher paper",
    "style": "in the style of M&S Food butchery and Waitrose meat counter editorial",
}
S_PANTRY = {
    "frame": "single glass jar or labelled pack with a small dish of the ingredient and a vintage spoon alongside",
    "lighting": "soft warm window light from the left, gentle shadow",
    "surface": "warm oak pantry shelf with natural linen cloth",
    "style": "in the style of M&S Food pantry and Waitrose Cooks Ingredients editorial",
}
S_PRODUCE = {
    "frame": "fresh whole produce styled in a small cluster with one piece cut to reveal interior texture, fresh water droplets visible",
    "lighting": "bright crisp daylight, clean specular highlights",
    "surface": "natural raw linen surface with hint of woven wicker basket edge",
    "style": "in the style of Waitrose fresh produce and Whole Foods Market editorial",
}
S_SNACKS = {
    "frame": "single pack with a small ceramic bowl of the product and a few pieces scattered casually on the surface",
    "lighting": "warm daylight from the side, soft shadow",
    "surface": "warm oak board with natural linen runner",
    "style": "in the style of M&S Food snack aisle editorial",
}

S_HEALTH = {
    "frame": "single bottle or pack upright at three-quarter angle, soft eucalyptus sprig and small clear glass dish of capsules alongside",
    "lighting": "soft bright daylight, very clean shadow",
    "surface": "white Carrara marble apothecary shelf",
    "style": "in the style of Boots Premium and Holland & Barrett wellness editorial",
}

S_HOME_AIR = {
    "frame": "single product upright at three-quarter angle with a fresh greenery sprig and minimal lifestyle prop alongside",
    "lighting": "soft bright daylight from the left, low even shadow",
    "surface": "natural oak shelf against a soft sage wall",
    "style": "in the style of The White Company and M&S Home air-care editorial",
}
S_HOME_CLEAN = {
    "frame": "single bottle upright at three-quarter angle with a folded microfibre cloth and a small fresh lemon or eucalyptus sprig alongside",
    "lighting": "bright crisp daylight, clean specular highlights",
    "surface": "white subway-tile surface",
    "style": "in the style of Method and Mrs Hinch premium home-care editorial",
}
S_HOME_DETERGENT = {
    "frame": "single product upright at three-quarter angle with a folded soft cotton towel and a fresh linen sprig alongside",
    "lighting": "soft bright daylight, low even shadow",
    "surface": "natural raw linen surface",
    "style": "in the style of Persil Premium and M&S laundry aisle editorial",
}
S_HOME_PAPER = {
    "frame": "single pack upright with a single sheet softly unfurled to show texture, neatly folded cotton cloth alongside",
    "lighting": "soft daylight from above, low even shadow",
    "surface": "natural oak shelf with cream linen runner",
    "style": "in the style of M&S Home paper goods catalogue",
}
S_HOME_PEST = {
    "frame": "single pack or bottle upright at three-quarter angle with a sprig of fresh lavender or citronella leaf alongside",
    "lighting": "soft daylight from the side, low even shadow",
    "surface": "natural oak shelf",
    "style": "in the style of M&S Home utility editorial",
}

S_COSMETICS = {
    "frame": "single hero product upright at three-quarter angle with a small mirror, pressed-petal accent and golden tweezer prop softly out of focus alongside",
    "lighting": "soft beauty-dish key light with golden rim, glossy specular highlights",
    "surface": "polished pink marble vanity surface",
    "style": "in the style of Charlotte Tilbury and Dior Beauty campaign",
}
S_HAIRCARE = {
    "frame": "single bottle upright at three-quarter angle with a small glass dish of clear product and a few water droplets on the surface",
    "lighting": "crisp clean daylight from the side with strong specular highlight on the bottle",
    "surface": "wet polished white marble slab",
    "style": "in the style of Kerastase and Aveda premium haircare editorial",
}
S_HYGIENE = {
    "frame": "single product upright at three-quarter angle with a folded white cotton towel and a fresh eucalyptus sprig alongside",
    "lighting": "soft bright spa daylight, low even shadow",
    "surface": "smooth river-stone surface",
    "style": "in the style of L'Occitane and Aesop spa editorial",
}
S_MENS_GROOM = {
    "frame": "single product upright at three-quarter angle with a vintage badger shaving brush and folded white linen towel alongside",
    "lighting": "warm directional sidelight, moody chiaroscuro",
    "surface": "dark slate barbershop counter with subtle brass detail",
    "style": "in the style of Tom Ford for Men and The Art of Shaving editorial",
}
S_ORAL = {
    "frame": "single product upright at three-quarter angle with a glass tumbler of fresh water and a sprig of fresh mint alongside",
    "lighting": "crisp clean daylight, very bright clean highlights",
    "surface": "polished white marble bathroom shelf",
    "style": "in the style of Marvis and Sensodyne Pro premium oral-care editorial",
}
S_SKINCARE = {
    "frame": "single jar or bottle upright at three-quarter angle with a small dollop of cream on a polished surface and a fresh peony petal alongside",
    "lighting": "soft beauty-dish light with golden rim, dewy specular highlights",
    "surface": "polished cream marble vanity surface",
    "style": "in the style of La Mer and Sisley Paris skincare campaign",
}

S_PET = {
    "frame": "single product upright at three-quarter angle with a small terracotta dish of the food or a folded soft toy alongside",
    "lighting": "warm window light from the side, gentle shadow",
    "surface": "warm oak floor with natural woven jute mat edge",
    "style": "in the style of Lily's Kitchen and Waitrose pet aisle editorial",
}

# ----------------------------------------------------------------------
# TREE -> style mapping (vertical/L3/L4)
# ----------------------------------------------------------------------

TREE_STYLE = {
    # 01-apparels / accessories
    "01-apparels/accessories/bags":       S_BAG,
    "01-apparels/accessories/belts":      S_BELT,
    "01-apparels/accessories/gloves":     S_GLOVES,
    "01-apparels/accessories/hats":       S_HAT,
    "01-apparels/accessories/jewellery":  S_JEWELLERY,
    "01-apparels/accessories/scarves":    S_SCARF,
    "01-apparels/accessories/sunglasses": S_SUNGLASSES,
    "01-apparels/accessories/wallets":    S_SMALL_LEATHER,
    # 01-apparels / apparel
    "01-apparels/apparel/baby":           S_BABY_APPAREL,
    "01-apparels/apparel/kids-wear":      S_KIDS_APPAREL,
    "01-apparels/apparel/teens":          S_TEENS_APPAREL,
    "01-apparels/apparel/mens-wear":      S_MENS_APPAREL,
    "01-apparels/apparel/womens-wear":    S_WOMENS_APPAREL,
    "01-apparels/apparel/sportswear":     S_SPORTSWEAR,
    # 01-apparels / fabrics (all sub-trees share styling)
    "01-apparels/fabrics/blends":         S_FABRIC,
    "01-apparels/fabrics/cotton":         S_FABRIC,
    "01-apparels/fabrics/denim":          S_FABRIC,
    "01-apparels/fabrics/linen":          S_FABRIC,
    "01-apparels/fabrics/polyester":      S_FABRIC,
    "01-apparels/fabrics/silk":           S_FABRIC,
    "01-apparels/fabrics/synthetic":      S_FABRIC,
    "01-apparels/fabrics/wool":           S_FABRIC,
    # 01-apparels / footwear
    "01-apparels/footwear/baby":          S_FOOTWEAR_BABY,
    "01-apparels/footwear/kids":          S_FOOTWEAR_KIDS_TEENS,
    "01-apparels/footwear/teens":         S_FOOTWEAR_KIDS_TEENS,
    "01-apparels/footwear/mens":          S_FOOTWEAR_MENS,
    "01-apparels/footwear/womens":        S_FOOTWEAR_WOMENS,
    "01-apparels/footwear/sports":        S_FOOTWEAR_SPORTS,
    # 01-apparels / home-textiles
    "01-apparels/home-textiles/bath-linen": S_HOME_BATH,
    "01-apparels/home-textiles/bed-linen":  S_HOME_BED,
    "01-apparels/home-textiles/curtains":   S_HOME_CURTAIN,
    "01-apparels/home-textiles/kitchen":    S_HOME_KITCHEN,
    "01-apparels/home-textiles/table":      S_HOME_TABLE,
    # 01-apparels / lingerie
    "01-apparels/lingerie/bras":         S_LINGERIE,
    "01-apparels/lingerie/hosiery":      S_LINGERIE,
    "01-apparels/lingerie/loungewear":   S_LINGERIE,
    "01-apparels/lingerie/nightwear":    S_LINGERIE,
    "01-apparels/lingerie/panties":      S_LINGERIE,
    "01-apparels/lingerie/shapewear":    S_LINGERIE,

    # 02-fmcg / baby-care
    "02-fmcg/baby-care/baby-skincare": S_BABY_SKINCARE,
    "02-fmcg/baby-care/diapers":       S_DIAPERS,
    "02-fmcg/baby-care/feeding":       S_FEEDING,
    # 02-fmcg / food
    "02-fmcg/food/baby-food":          S_FOOD_BABY,
    "02-fmcg/food/baking":             S_BAKING,
    "02-fmcg/food/beverages":          S_BEVERAGES,
    "02-fmcg/food/bread-bakery":       S_BREAD,
    "02-fmcg/food/breakfast-cereal":   S_BREAKFAST,
    "02-fmcg/food/candy-chocolate":    S_CHOCOLATE,
    "02-fmcg/food/dairy":              S_DAIRY,
    "02-fmcg/food/deli":               S_DELI,
    "02-fmcg/food/frozen":             S_FROZEN,
    "02-fmcg/food/health-free-from":   S_FREE_FROM,
    "02-fmcg/food/international":      S_INTERNATIONAL,
    "02-fmcg/food/meat-seafood":       S_MEAT_SEAFOOD,
    "02-fmcg/food/pantry":             S_PANTRY,
    "02-fmcg/food/produce":            S_PRODUCE,
    "02-fmcg/food/snacks":             S_SNACKS,
    # 02-fmcg / health-wellness
    "02-fmcg/health-wellness/OTC-medicines":     S_HEALTH,
    "02-fmcg/health-wellness/cold-flu":          S_HEALTH,
    "02-fmcg/health-wellness/digestive-health":  S_HEALTH,
    "02-fmcg/health-wellness/first-aid":         S_HEALTH,
    "02-fmcg/health-wellness/protein":           S_HEALTH,
    "02-fmcg/health-wellness/supplements":       S_HEALTH,
    "02-fmcg/health-wellness/vitamins":          S_HEALTH,
    # 02-fmcg / home-care
    "02-fmcg/home-care/air-care":     S_HOME_AIR,
    "02-fmcg/home-care/cleaners":     S_HOME_CLEAN,
    "02-fmcg/home-care/detergents":   S_HOME_DETERGENT,
    "02-fmcg/home-care/paper":        S_HOME_PAPER,
    "02-fmcg/home-care/pest-control": S_HOME_PEST,
    # 02-fmcg / personal-care
    "02-fmcg/personal-care/cosmetics":      S_COSMETICS,
    "02-fmcg/personal-care/haircare":       S_HAIRCARE,
    "02-fmcg/personal-care/hygiene":        S_HYGIENE,
    "02-fmcg/personal-care/mens-grooming":  S_MENS_GROOM,
    "02-fmcg/personal-care/oral-care":      S_ORAL,
    "02-fmcg/personal-care/skincare":       S_SKINCARE,
    # 02-fmcg / pet-care
    "02-fmcg/pet-care/cat":   S_PET,
    "02-fmcg/pet-care/dog":   S_PET,
    "02-fmcg/pet-care/other": S_PET,
}


# ----------------------------------------------------------------------
# Subject builder per tree. Receives the path parts AFTER L4 and returns
# a clean product noun phrase. Each builder is hand-crafted per family.
# ----------------------------------------------------------------------

def _human(s):
    return s.replace("-", " ").lower()

def _last(parts):
    return _human(parts[-1])

# ---- accessories ----

def subj_bags(parts):
    leaf = _last(parts)
    table = {
        "crossbody": "a single premium crossbody bag with adjustable strap, in supple full-grain camel leather",
        "travel-bags": "a single premium weekender travel bag with leather handles, in waxed canvas and tan saddle leather",
        "wallets": "a single premium leather wallet bag with subtle hardware detail, in deep chestnut full-grain leather",
    }
    return table.get(parts[-1], f"a single premium {leaf} bag in supple full-grain leather")

def subj_belts(parts):
    leaf = _last(parts)
    table = {
        "casual": "a single casual woven cotton-and-leather belt with brass slide buckle, in olive and tan",
        "formal": "a single formal black full-grain leather dress belt with polished silver pin buckle",
    }
    return table.get(parts[-1], f"a single premium {leaf} belt in full-grain leather")

def subj_gloves(parts):
    leaf = parts[-1]
    table = {
        "leather": "a matching pair of supple black napa leather gloves with subtle topstitching",
        "sports": "a matching pair of mesh-and-microsuede sports training gloves with hook-and-loop wrist closure, in charcoal and graphite",
        "winter": "a matching pair of chunky cable-knit winter mittens with soft fleece lining, in oatmeal cream",
        "wool": "a matching pair of fine merino wool knit gloves in heather grey",
    }
    return table[leaf]

def subj_hats(parts):
    leaf = parts[-1]
    table = {
        "beanies": "a single ribbed cuffed beanie hat in heather charcoal merino wool",
        "caps": "a single six-panel structured baseball cap in washed navy cotton twill with curved brim",
        "fedoras": "a single classic wide-brim fedora hat in charcoal wool felt with grosgrain band",
        "sun-hats": "a single wide-brim natural straw sun hat with ivory ribbon trim",
    }
    return table[leaf]

def subj_jewellery(parts):
    leaf = parts[-1]
    table = {
        "anklets": "a single delicate 18k gold chain anklet with tiny star charms",
        "bracelets": "a single fine 18k gold tennis bracelet set with brilliant-cut white diamonds",
        "earrings": "a matching pair of 18k gold hoop earrings with brushed satin finish",
        "necklaces": "a single delicate 18k gold pendant necklace with a small teardrop diamond charm",
        "rings": "a single solitaire diamond engagement ring with brilliant-cut centre stone in a platinum setting",
    }
    return table[leaf]

def subj_scarves(parts):
    leaf = parts[-1]
    table = {
        "hijabs": "a single fine chiffon hijab scarf in soft dusty rose",
    }
    return table.get(leaf, f"a single fine {_human(leaf)} scarf in pure silk")

def subj_sunglasses(parts):
    leaf = parts[-1]
    table = {
        "aviator": "a single pair of classic gold-frame aviator sunglasses with smoke-green lenses",
        "fashion": "a single pair of oversized cat-eye sunglasses in tortoiseshell acetate with warm brown gradient lenses",
        "sport": "a single pair of wraparound performance sunglasses in matte carbon black with mirrored blue lenses",
        "wayfarer": "a single pair of classic wayfarer sunglasses in glossy black acetate with deep grey lenses",
    }
    return table[leaf]

def subj_wallets(parts):
    leaf = parts[-1]
    table = {
        "card-holders": "a single slim minimalist card-holder wallet in saddle tan full-grain leather with a few cards softly visible",
        "mens": "a single men's classic bifold wallet in deep black pebbled full-grain leather",
        "womens": "a single women's long zip-around wallet in blush pink saffiano leather",
    }
    return table[leaf]

# ---- apparel ----

def _apparel_garment(parts, gender_phrase):
    leaf = parts[-1]
    base = {
        "tops": "long-sleeve top", "blouses": "silk-look blouse", "dresses": "midi dress",
        "skirts": "midi skirt", "trousers": "tailored trousers", "shorts": "tailored shorts",
        "knitwear": "fine-knit jumper", "cardigans": "knit cardigan",
        "coats": "tailored wool coat", "outerwear": "structured outerwear jacket",
        "swimwear": "swimsuit", "jumpsuits": "tailored jumpsuit",
        "abayas": "flowing abaya in fine crepe", "ethnic": "embroidered ethnic ensemble",
        "polo": "polo shirt", "hoodies": "hooded sweatshirt",
        "socks": "pair of dress socks", "underwear": "set of boxer briefs",
        "compression": "compression performance top and leggings set",
        "cycling": "cycling jersey and bib shorts set",
        "yoga": "yoga top and leggings set",
        "boys-teens": "graphic-print sweatshirt and joggers set",
        "girls-teens": "cropped sweatshirt and wide-leg joggers set",
        "school-uniforms": "school uniform pinafore and blouse set",
        "infants": "soft cotton onesie", "toddlers": "long-sleeve top and trousers set",
        "boys": "graphic t-shirt and chino shorts set",
        "girls": "soft cotton dress with ruffle hem",
        "bottoms": "pair of pull-on trousers",
        "outerwear": "quilted jacket",
        "rompers": "short-sleeve romper", "sets": "matching top and bottom set",
        "tops": "long-sleeve top",
        "newborn-essentials": "newborn cotton bodysuit",
        "hats": "soft knit hat", "mittens": "pair of soft scratch mittens",
    }
    item = base.get(leaf, _human(leaf))
    return f"a single {gender_phrase} {item}"

def subj_apparel_womens(parts):
    return _apparel_garment(parts, "premium women's") + ", in muted neutral tone"

def subj_apparel_mens(parts):
    return _apparel_garment(parts, "premium men's") + ", in tonal neutral palette"

_KIDSWEAR = {
    ("boys", "hoodies"): "a single premium boys' hooded sweatshirt in soft sage cotton",
    ("boys", "jackets"): "a single premium boys' lightweight bomber jacket in muted olive",
    ("boys", "shirts"): "a single premium boys' linen shirt in soft ivory",
    ("boys", "shorts"): "a single premium pair of boys' chino shorts in stone beige",
    ("boys", "swimwear"): "a single premium pair of boys' swim shorts in deep navy with pastel piping",
    ("boys", "t-shirts"): "a single premium boys' crew-neck t-shirt in heather grey",
    ("boys", "trousers"): "a single premium pair of boys' chino trousers in soft taupe",
    ("boys", "underwear"): "a single set of premium boys' soft cotton boxer briefs in dove grey",
    ("girls", "dresses"): "a single premium girls' tiered cotton dress in dusty rose",
    ("girls", "jackets"): "a single premium girls' quilted jacket in soft blush",
    ("girls", "leggings"): "a single pair of premium girls' soft cotton leggings in soft heather grey",
    ("girls", "skirts"): "a single premium girls' tiered cotton skirt in soft sage",
    ("girls", "swimwear"): "a single premium girls' one-piece swimsuit in dusty rose with pastel trim",
    ("girls", "tops"): "a single premium girls' long-sleeve top with ruffle trim in cream",
    ("girls", "underwear"): "a single set of premium girls' soft cotton briefs in soft pastel pink",
    ("infants", "bibs"): "a single soft folded baby bib in pastel cream cotton with terry backing",
    ("infants", "hats"): "a single soft knit baby hat in cream with tiny top knot",
    ("infants", "onesies"): "a single baby long-sleeve onesie in pastel mint with foot-cuff trim",
    ("infants", "rompers"): "a single short-sleeve baby romper in pale buttercream with snap crotch",
    ("infants", "sets"): "a single matching baby outfit set of soft cotton top and shorts in dove blue",
    ("infants", "sleepsuits"): "a single baby sleepsuit in pastel cream with foot covers",
    ("infants", "socks"): "a single pair of soft cotton baby socks in pastel cream",
    ("school-uniforms", "boys-uniform"): "a single premium boys' school uniform set: white shirt and navy trousers neatly flat-laid",
    ("school-uniforms", "girls-uniform"): "a single premium girls' school uniform set: white blouse and navy pinafore neatly flat-laid",
    ("school-uniforms", "pe-kit"): "a single premium school PE kit set: white t-shirt and navy shorts neatly folded",
    ("school-uniforms", "shoes"): "a single pair of premium black leather school shoes neatly placed together",
    ("toddlers", "bottoms"): "a single pair of soft cotton toddler trousers in heather grey",
    ("toddlers", "dresses"): "a single soft cotton toddler dress with ruffled hem in dusty rose",
    ("toddlers", "outerwear"): "a single quilted toddler jacket in cream with snap fasteners and small hood",
    ("toddlers", "sets"): "a single matching toddler outfit set of soft cotton top and trousers in cream and sage",
    ("toddlers", "swimwear"): "a single toddler swimsuit in pastel mint with cute ruffle trim",
    ("toddlers", "tops"): "a single soft cotton toddler long-sleeve top with kangaroo pocket in oat",
}

def subj_apparel_kids(parts):
    # parts = [subcat, leaf]
    key = (parts[-2], parts[-1])
    return _KIDSWEAR.get(key, f"a single premium kids' {_human(parts[-1])} in soft pastel tone")

_TEENS = {
    ("boys-teens", "hoodies"): "a single premium teen boys' oversized hooded sweatshirt in faded charcoal",
    ("boys-teens", "jeans"): "a single pair of premium teen boys' straight-fit jeans in mid-wash indigo",
    ("boys-teens", "shirts"): "a single premium teen boys' overshirt in olive cotton twill",
    ("boys-teens", "shorts"): "a single pair of premium teen boys' cargo shorts in washed khaki",
    ("boys-teens", "swimwear"): "a single pair of premium teen boys' surf shorts in faded teal with subtle pattern",
    ("boys-teens", "t-shirts"): "a single premium teen boys' graphic-print t-shirt in faded black",
    ("boys-teens", "tracksuits"): "a single premium teen boys' tracksuit set of zip jacket and joggers in heather charcoal",
    ("boys-teens", "underwear"): "a single set of premium teen boys' soft cotton boxer briefs in heather grey",
    ("girls-teens", "activewear"): "a single premium teen girls' seamless sports top and leggings set in soft sage",
    ("girls-teens", "dresses"): "a single premium teen girls' slip dress in soft champagne",
    ("girls-teens", "hoodies"): "a single premium teen girls' cropped hoodie in dusty rose",
    ("girls-teens", "jeans"): "a single pair of premium teen girls' wide-leg jeans in light vintage wash",
    ("girls-teens", "skirts"): "a single premium teen girls' pleated mini skirt in soft cream",
    ("girls-teens", "swimwear"): "a single premium teen girls' triangle bikini set in soft terracotta",
    ("girls-teens", "tops"): "a single premium teen girls' fitted crop top in soft butter yellow",
    ("girls-teens", "underwear"): "a single set of premium teen girls' soft cotton briefs in soft pastel pink",
}

def subj_apparel_teens(parts):
    key = (parts[-2], parts[-1])
    return _TEENS.get(key, f"a single premium teen {_human(parts[-1])} in muted contemporary tone")

def subj_apparel_baby(parts):
    leaf = parts[-1]
    table = {
        "infant/bottoms": "a single soft cotton baby pull-on trousers in pastel mint with elastic waist",
        "infant/outerwear": "a single quilted baby jacket in cream with snap fasteners and small hood",
        "infant/rompers": "a single short-sleeve cotton baby romper with snap crotch in pale buttercream",
        "infant/sets": "a matching baby outfit set of soft cotton top and shorts in dove blue",
        "infant/tops": "a single soft cotton baby long-sleeve top with envelope neckline in cream",
        "newborn/hats": "a single soft knit newborn hat in cream with tiny top knot",
        "newborn/mittens": "a matching pair of tiny soft cotton newborn scratch mittens in soft white",
        "newborn/sets": "a single matching newborn set of soft cotton bodysuit and trousers in cream",
        "newborn/sleepsuits": "a single soft cotton newborn sleepsuit in pastel cream with built-in foot covers",
        "newborn/socks": "a single matching pair of tiny soft cotton newborn socks in soft cream",
        "newborn/swaddles": "a single softly folded muslin newborn swaddle blanket in pastel cream with delicate cloud print",
        "newborn/vests": "a single soft cotton newborn vest with envelope shoulder in pastel cream",
        "newborn/newborn-essentials": "a single newborn cotton bodysuit in soft white with envelope shoulder",
        "newborn/onesies": "a single newborn long-sleeve onesie in pastel mint with foot-cuff trim",
        "toddler/bottoms": "a single pair of soft cotton toddler trousers in heather grey with elastic waist",
        "toddler/dresses": "a single soft cotton toddler dress with ruffled hem in dusty rose",
        "toddler/leggings": "a single pair of soft cotton toddler leggings in soft heather grey",
        "toddler/outerwear": "a single quilted toddler jacket in cream with snap fasteners and small hood",
        "toddler/outfit-sets": "a matching toddler outfit set of soft cotton top and trousers in cream and sage",
        "toddler/sets": "a single matching toddler set of soft cotton top and trousers in cream and sage",
        "toddler/shirts": "a single soft cotton toddler shirt with small Peter Pan collar in pale blue",
        "toddler/tops": "a single soft cotton toddler long-sleeve top with kangaroo pocket in oat",
    }
    sub = "/".join(parts[-2:])
    return table.get(sub, "a single soft cotton baby garment in pastel cream")

def subj_apparel_sportswear(parts):
    leaf = parts[-1]
    table = {
        "compression": "a single set of compression performance top and leggings in charcoal with subtle reflective seam detail",
        "cycling": "a single matching cycling jersey and bib shorts set in steel grey with technical mesh panels",
        "yoga": "a single yoga top and high-waist leggings set in soft sage with seamless construction",
    }
    return table.get(leaf, _apparel_garment(parts, "premium performance"))

# ---- fabrics ----

def subj_fabric(parts):
    family = parts[-2] if len(parts) >= 2 else ""
    variant = parts[-1]
    desc = {
        ("cotton", "jersey"): "cotton jersey",
        ("cotton", "poplin"): "crisp cotton poplin",
        ("cotton", "twill"): "robust cotton twill",
        ("denim", "black-denim"): "black raw selvedge denim",
        ("denim", "colored"): "warm rust-coloured raw denim",
        ("linen", "blended"): "linen-and-cotton blend",
        ("linen", "organic"): "organic European flax linen",
        ("linen", "plain"): "natural undyed linen",
        ("linen", "printed"): "block-printed botanical linen",
        ("silk", "charmeuse"): "fluid silk charmeuse",
        ("silk", "chiffon"): "weightless silk chiffon",
        ("silk", "dupioni"): "textured silk dupioni",
        ("silk", "organza"): "crisp silk organza",
        ("silk", "satin"): "lustrous silk satin",
        ("wool", "cashmere"): "fine Mongolian cashmere",
        ("wool", "felt"): "dense pressed wool felt",
        ("wool", "lambswool"): "soft brushed lambswool",
        ("wool", "merino"): "fine Italian merino wool",
        ("wool", "tweed"): "heritage Donegal tweed",
        ("polyester", "chiffon"): "lightweight polyester chiffon",
        ("polyester", "recycled"): "recycled-PET smooth polyester",
        ("polyester", "satin"): "polished polyester satin",
        ("synthetic", "acrylic"): "fine acrylic knit",
        ("synthetic", "elastane"): "high-stretch elastane jersey",
        ("synthetic", "microfiber"): "ultra-soft microfibre weave",
        ("synthetic", "nylon"): "smooth ripstop nylon",
        ("synthetic", "spandex"): "high-stretch spandex weave",
        ("blends", "bamboo"): "soft bamboo-and-cotton blend",
        ("blends", "lycra"): "stretch cotton-and-lycra blend",
        ("blends", "viscose"): "fluid viscose blend",
    }
    label = desc.get((family, variant), f"{_human(variant)} {family} fabric")
    return f"a folded fabric swatch and a partially unrolled bolt of premium {label}"

# ---- footwear ----

def _shoe(parts, kind):
    leaf = parts[-1]
    base = {
        "boots": "ankle boot", "casual": "casual leather shoe", "dress-shoes": "oxford dress shoe",
        "loafers": "penny loafer", "sandals": "leather sandal", "slippers": "soft slipper",
        "sneakers": "low-top sneaker", "sports": "performance sports shoe",
        "work-safety": "rugged work-safety boot",
        "flats": "ballet flat", "heels": "pointed-toe high heel", "pumps": "court pump", "wedges": "wedge sandal",
        "first-walkers": "soft-sole first-walker shoe", "pre-walkers": "soft pre-walker bootie",
        "school-shoes": "leather school shoe",
        "basketball": "high-top basketball performance shoe",
        "football": "moulded-stud football boot",
        "cricket": "white spiked cricket shoe",
        "hiking": "rugged trail hiking boot",
        "running": "lightweight road-running shoe",
        "tennis": "court tennis shoe",
    }
    return f"a single {kind} {base.get(leaf, _human(leaf))}"

def subj_footwear_baby(parts):  return _shoe(parts, "premium baby")
def subj_footwear_kids(parts):  return _shoe(parts, "premium kids'")
def subj_footwear_teens(parts): return _shoe(parts, "premium teen")
def subj_footwear_mens(parts):  return _shoe(parts, "premium men's")
def subj_footwear_womens(parts):return _shoe(parts, "premium women's")
def subj_footwear_sports(parts):return _shoe(parts, "premium performance")

# ---- home-textiles ----

def subj_home_textile(parts):
    leaf = parts[-1]
    table = {
        "hand-towels": "a single neatly folded premium cotton hand towel in soft ivory",
        "quilts": "a single softly folded premium cotton quilt in pale ivory with subtle stitched pattern",
        "roman-blinds": "a single sample of premium linen Roman blind fabric in natural oat",
        "napkins": "a single neatly folded premium linen napkin in natural oat",
        "coasters": "a small stack of premium woven jute coasters",
        "table-runners": "a single softly draped premium linen table runner in soft sage",
        "tablecloths": "a single softly draped premium linen tablecloth in soft cream",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} textile in soft neutral tone")

# ---- lingerie ----

def subj_lingerie(parts):
    leaf = parts[-1]
    table = {
        # bras
        "balcony": "a single delicate balconette bra in soft blush satin with fine lace trim",
        "maternity": "a single soft maternity bra in seamless dove grey microfibre",
        "non-wired": "a single soft non-wired bralette in fine ivory lace",
        "padded": "a single padded T-shirt bra in soft champagne microfibre",
        "sports-bra": "a single high-support sports bra in technical charcoal jersey",
        "strapless": "a single strapless bra in smooth blush satin with silicone grip trim",
        "underwired": "a single full-cup underwired bra in delicate black Chantilly lace",
        # hosiery
        "knee-highs": "a single neatly folded pair of fine knee-high socks in charcoal merino",
        "socks": "a single pair of fine ankle socks in soft cream cotton",
        "stockings": "a single folded pair of sheer silk stockings in nude tone",
        "tights": "a single folded pair of opaque tights in soft black",
        # loungewear
        "bottoms": "a single soft modal lounge trouser in dove grey",
        "sets": "a matching loungewear set of soft modal top and trousers in soft taupe",
        "tops": "a single soft modal lounge top in pale champagne",
        # nightwear
        "nightgowns": "a single fine silk nightgown with delicate lace trim in blush pink",
        "pajamas": "a matching silk pyjama set with piped trim in soft navy",
        "robes": "a single soft satin robe with self-tie belt in champagne",
        "slippers": "a single soft cotton slipper pair in blush pink",
        # panties
        "boyshorts": "a single seamless boyshort brief in dove grey microfibre",
        "brazilian": "a single delicate brazilian brief in soft ivory lace",
        "briefs": "a single classic brief in smooth blush microfibre",
        "high-waist": "a single high-waist brief in soft champagne lace",
        "period-underwear": "a single full-cover period brief in soft dove grey technical knit",
        "thongs": "a single delicate thong in fine champagne lace",
        # shapewear
        "bodysuits": "a single sculpting bodysuit in smooth nude microfibre",
        "thigh-shapers": "a single high-waist thigh shaper in smooth nude microfibre",
    }
    return table.get(leaf, f"a single delicate {_human(leaf)} lingerie piece in soft champagne lace")

# ---- baby-care ----

def subj_baby_skincare(parts):
    leaf = parts[-1]
    table = {
        "baby-lotion": "a single softly tinted baby lotion bottle with pump dispenser, in pastel mint",
        "baby-shampoo": "a single tear-free baby shampoo bottle with flip-cap, in soft peach",
        "baby-wipes": "a single soft pack of fragrance-free baby wipes in pastel cream",
        "nappy-cream": "a single small tub of soothing nappy cream with screw lid, in pastel ivory",
    }
    return table[leaf]

def subj_diapers(parts):
    leaf = parts[-1]
    table = {
        "infant-diapers": "a single folded infant nappy in soft white with pastel waistband",
        "newborn-diapers": "a single folded newborn nappy in soft white with delicate umbilical cut-out",
        "swim-diapers": "a single folded swim nappy in soft aqua",
        "toddler-diapers": "a single folded toddler pull-up nappy in soft white with pastel print",
        "training-pants": "a single folded toddler training pant in soft white with pastel print",
    }
    return table[leaf]

def subj_feeding(parts):
    leaf = parts[-1]
    table = {
        "bibs": "a single softly folded baby bib in pastel cream cotton with terry backing",
        "bottles": "a single premium glass baby feeding bottle with silicone teat",
        "formula": "a single premium tin of stage-1 infant formula powder with measuring scoop",
        "sippy-cups": "a single soft-spout sippy cup in pastel mint with non-spill valve",
    }
    return table[leaf]

# ---- food/baby-food ----

def subj_food_baby(parts):
    leaf = parts[-1]
    table = {
        "baby-cereal": "a single small glass jar of organic baby cereal flakes with measuring scoop",
        "baby-snacks": "a single small pack of organic baby rice puffs with a few puffs scattered",
        "finger-foods": "a small wooden bowl of soft organic baby finger foods with raw oats scattered",
        "infant-formula": "a single premium tin of stage-1 infant formula powder with scoop",
        "purees": "a single small glass jar of organic vegetable puree with fresh carrot and parsnip alongside",
        "toddler-meals": "a single small ceramic bowl of organic toddler pasta meal with cherry tomatoes alongside",
    }
    return table[leaf]

# ---- food/baking ----

def subj_baking(parts):
    leaf = parts[-1]
    table = {
        "baking-powder": "a small tin of baking powder with a teaspoon mound of powder spilled on the board",
        "cake-mix": "a single bag of premium cake mix with a small bowl of the dry blend and a wooden spoon alongside",
        "flour": "a single linen sack of stoneground flour with a small mound spilled on the board and a vintage scoop alongside",
        "frosting": "a single small jar of vanilla frosting with a wooden spatula and a small piped swirl on the board",
        "sugar": "a small linen sack of golden caster sugar with a small mound spilled and a vintage scoop alongside",
        "vanilla": "a single small dark glass bottle of pure vanilla extract with a fresh vanilla pod sliced open alongside",
        "yeast": "a small glass jar of active dry yeast with a teaspoon of granules spilled alongside",
    }
    return table[leaf]

# ---- food/beverages ----

_BEVERAGES = {
    ("alcohol", "beer"): "a single chilled premium craft beer bottle with a freshly poured glass with a perfect head of foam alongside",
    ("alcohol", "cocktails"): "a single premium pre-mixed cocktail bottle with a chilled coupe glass freshly poured and a citrus twist alongside",
    ("alcohol", "non-alcoholic-beer"): "a single chilled premium non-alcoholic beer bottle with a freshly poured glass with light foam alongside",
    ("alcohol", "spirits"): "a single elegant premium whisky bottle with a heavy crystal tumbler with a single large ice sphere alongside",
    ("alcohol", "wine"): "a single elegant bottle of premium red wine with a freshly poured crystal wine glass alongside",
    ("carbonated", "cola"): "a single chilled glass bottle of premium cola with a freshly poured tumbler full of rising bubbles and a lemon wheel",
    ("carbonated", "energy-drinks"): "a single chilled premium energy drink can with a freshly poured glass and a slice of fresh lime alongside",
    ("carbonated", "flavored-soda"): "a single chilled glass bottle of premium artisanal flavoured soda with a freshly poured tumbler and fresh fruit garnish",
    ("carbonated", "lemon-lime"): "a single chilled bottle of premium lemon-lime sparkling soda with a freshly poured tumbler full of bubbles and a lemon wedge",
    ("carbonated", "sparkling-water"): "a single chilled premium glass bottle of sparkling water with a freshly poured tumbler full of bubbles and a lime wedge",
    ("hot-drinks", "coffee"): "a single small linen sack of single-origin coffee beans with a steaming ceramic cup of espresso alongside",
    ("hot-drinks", "herbal-tea"): "a small premium tin of loose herbal tea with a glass teapot full of golden infusion and fresh herbs alongside",
    ("hot-drinks", "hot-chocolate"): "a single small tin of premium drinking chocolate with a steaming ceramic mug of hot chocolate and a few cocoa shavings",
    ("hot-drinks", "instant-coffee"): "a single small premium jar of instant coffee with a small steaming ceramic cup and a few coffee beans alongside",
    ("hot-drinks", "matcha"): "a single small tin of premium ceremonial matcha powder with a bamboo whisk and a ceramic chawan bowl of frothy matcha alongside",
    ("hot-drinks", "tea"): "a single small premium tin of loose-leaf black tea with a glass teapot of brewing tea and a fresh sprig of mint",
    ("kids-drinks", "flavored-milk"): "a single small premium carton of strawberry flavoured milk with a striped paper straw and fresh strawberries alongside",
    ("kids-drinks", "juice-boxes"): "a single small premium carton of organic apple juice with a striped paper straw and fresh apple slice alongside",
    ("kids-drinks", "smoothie-pouches"): "a single premium fruit smoothie pouch with fresh berries and a fresh banana alongside",
    ("non-carbonated", "coconut-water"): "a single chilled premium glass bottle of pure coconut water with a freshly poured tumbler and a fresh young coconut alongside",
    ("non-carbonated", "fruit-juice"): "a single chilled premium glass bottle of cold-pressed orange juice with a freshly poured tumbler and a fresh orange half alongside",
    ("non-carbonated", "nectar"): "a single chilled premium glass bottle of peach nectar with a freshly poured tumbler and a fresh peach half alongside",
    ("non-carbonated", "smoothies"): "a single chilled premium glass bottle of berry smoothie with a freshly poured tumbler and fresh berries alongside",
    ("non-carbonated", "sports-drinks"): "a single chilled premium glass bottle of sports drink with a freshly poured tumbler and a fresh lime wedge alongside",
}

def subj_beverages(parts):
    key = (parts[-2], parts[-1])
    return _BEVERAGES.get(key, f"a single chilled premium {_human(parts[-1])} drink with a freshly poured glass alongside")

# ---- food/bread-bakery ----

def subj_bread(parts):
    leaf = parts[-1]
    table = {
        "croissants": "a single freshly baked all-butter croissant with golden flaky layers and a few buttery crumbs",
        "donuts": "a single glazed brioche donut with delicate sugar crystals",
        "flatbread": "a single warm stone-baked flatbread with charred edges and a small dish of olive oil alongside",
        "pies": "a single golden hand-raised pie with crimped edges and a few crumbs of flaky pastry alongside",
        "pita": "a single soft warm pita bread, partially torn to reveal the pocket",
        "rolls-buns": "a small cluster of golden brioche rolls with shiny egg-wash glaze",
        "sliced-bread": "a single hand-cut slice of artisanal sourdough loaf on the board, with a few crust crumbs",
        "tortillas": "a small stack of soft flour tortillas with one partially folded back",
    }
    return table[leaf]

# ---- food/breakfast-cereal ----

def subj_breakfast(parts):
    leaf = parts[-1]
    table = {
        "breakfast-bars": "a single premium oat-and-honey breakfast bar partially unwrapped, with scattered oats and a fresh raspberry alongside",
        "cereals": "a single small ceramic bowl of toasted whole-grain cereal flakes with a milk pour caught mid-motion, fresh berries alongside",
        "granola": "a small ceramic bowl of toasted golden granola clusters with a drizzle of honey and a few almonds alongside",
        "muesli": "a small ceramic bowl of Bircher muesli with fresh blueberries and a wooden spoon",
        "oatmeal": "a small ceramic bowl of creamy oatmeal porridge with a swirl of honey and a few raspberries on top",
        "porridge": "a small ceramic bowl of hot porridge with a sprinkling of cinnamon and fresh sliced banana on top",
    }
    return table[leaf]

# ---- food/candy-chocolate ----

def subj_chocolate(parts):
    leaf = parts[-1]
    table = {
        "boxed-chocolates": "a single elegant open box of premium dark chocolate truffles with cocoa-dusted finish",
        "chocolate-bars": "a single broken premium dark chocolate bar with sharp clean shards and a few cacao nibs scattered",
        "gum": "a small stack of premium peppermint chewing gum pieces with fresh mint sprig alongside",
        "gummies": "a small ceramic dish of premium fruit-flavoured gummy sweets with glossy sugar coating",
        "hard-candy": "a small ceramic dish of jewel-toned hard candies with glassy translucent finish",
        "lollipops": "a small cluster of premium lollipops with jewel-toned translucent candy heads",
        "marshmallows": "a small ceramic dish of pillowy artisan marshmallows with a faint dusting of vanilla",
        "mints": "a small open tin of premium peppermint mints with fresh mint sprig alongside",
        "toffees": "a small ceramic dish of golden hand-cut butter toffees with glossy caramelised finish",
    }
    return table[leaf]

# ---- food/dairy ----

def subj_dairy(parts):
    leaf = parts[-1]
    table = {
        "butter": "a single small block of premium cultured butter with a wooden butter knife and a sprinkle of sea salt flakes alongside",
        "cheese": "a single wedge of premium aged cheese on a wooden board with a few grapes and a sprig of thyme alongside",
        "condensed-milk": "a single small tin of sweetened condensed milk with a spoon drizzling a glossy ribbon alongside",
        "cream": "a single small glass jug of fresh double cream with a single fresh strawberry alongside",
        "eggs": "a small wire basket of fresh free-range brown eggs with one cracked open onto the board to show vivid golden yolk",
        "milk": "a single glass milk bottle with a freshly poured glass tumbler alongside and gentle condensation on the glass",
        "powdered-milk": "a small tin of premium powdered milk with a teaspoon mound of powder alongside",
        "yogurt": "a single small glass pot of premium natural yogurt with a swirl of honey and fresh blueberries on top",
    }
    return table[leaf]

# ---- food/deli ----

def subj_deli(parts):
    leaf = parts[-1]
    table = {
        "charcuterie": "an artfully arranged premium charcuterie selection of cured meats fanned across the board with cornichons and fresh thyme",
        "cheese-slices": "a small fan of premium hand-cut cheese slices with a few walnuts and a drizzle of honey alongside",
        "deli-meats": "an arranged fan of premium thinly sliced deli meats with fresh rosemary and cracked pepper",
        "hummus": "a single small ceramic bowl of premium hummus with a swirl of olive oil and a sprinkle of paprika",
        "olives": "a small ceramic bowl of premium marinated olives with fresh herbs and a drizzle of olive oil",
        "prepared-salads": "a small ceramic bowl of premium prepared salad with fresh leaves and bright vegetable accents",
        "ready-to-eat": "a single premium ready-to-eat tart on a wooden board with fresh herb garnish",
    }
    return table[leaf]

# ---- food/frozen ----

_FROZEN = {
    ("frozen-breakfast", "hash-browns"): "a small cluster of premium frozen golden hash brown patties with fine frost dusting",
    ("frozen-breakfast", "pancakes"): "a small stack of premium frozen pancakes with a drizzle of maple syrup and a fresh raspberry",
    ("frozen-breakfast", "waffles"): "a single premium frozen Belgian waffle with a drizzle of maple syrup and a fresh blueberry",
    ("frozen-desserts", "frozen-yogurt"): "a single small tub of premium frozen yogurt with a perfect scoop and fresh strawberries",
    ("frozen-desserts", "ice-cream"): "a single small tub of premium vanilla ice cream with a perfect scoop, a single waffle cone and fresh raspberries",
    ("frozen-desserts", "ice-lollies"): "a single premium fruit ice lolly on a wooden stick with fresh berries and faint frost finish",
    ("frozen-desserts", "sorbet"): "a single small tub of premium fruit sorbet with a perfect scoop and a fresh mango slice",
    ("frozen-meals", "burritos"): "a single premium frozen burrito partially unwrapped with a small dish of salsa and fresh coriander",
    ("frozen-meals", "frozen-curry"): "a single small ceramic bowl of premium frozen curry with a slice of naan bread and a sprig of coriander",
    ("frozen-meals", "frozen-pasta"): "a single small ceramic bowl of premium frozen pasta meal with a sprig of fresh basil and a grating of parmesan",
    ("frozen-meals", "frozen-pizza"): "a single premium frozen pizza with a slice cut showing fresh tomato and basil and a faint cool mist rising",
    ("frozen-meals", "frozen-rice"): "a single small ceramic bowl of premium frozen rice meal with a few fresh herbs scattered alongside",
    ("frozen-meals", "ready-meals"): "a single premium chilled ready meal tray with sleek packaging and a sprig of fresh herb alongside",
    ("frozen-meat-seafood", "frozen-beef"): "a single premium frozen beef steak with fine frost crystals and a sprig of rosemary",
    ("frozen-meat-seafood", "frozen-burgers"): "a small stack of premium frozen beef burger patties with cracked pepper and a sprig of rosemary",
    ("frozen-meat-seafood", "frozen-chicken"): "a single premium frozen chicken breast with fine frost crystals and a sprig of thyme",
    ("frozen-meat-seafood", "frozen-fish"): "a single premium frozen salmon fillet with fine frost crystals and a sprig of dill",
    ("frozen-meat-seafood", "frozen-shrimp"): "a small cluster of premium frozen tiger prawns with fine frost crystals and a wedge of lemon",
    ("frozen-produce", "frozen-fruits"): "a small ceramic bowl of premium frozen mixed berries with faint frost dusting and a fresh mint sprig",
    ("frozen-produce", "frozen-herbs"): "a small ice-cube tray of premium frozen chopped herbs in olive oil with fresh basil alongside",
    ("frozen-produce", "frozen-vegetables"): "a small ceramic bowl of premium frozen mixed vegetables with faint frost dusting",
    ("frozen-snacks", "fries"): "a small ceramic dish of premium frozen straight-cut fries with sea salt flakes alongside",
    ("frozen-snacks", "nuggets"): "a small ceramic dish of premium frozen chicken nuggets with a small dish of dipping sauce alongside",
    ("frozen-snacks", "onion-rings"): "a small ceramic dish of premium frozen golden onion rings with a small dish of dipping sauce alongside",
    ("frozen-snacks", "samosas"): "a small ceramic dish of premium frozen samosas with a small dish of mint chutney and fresh coriander",
    ("frozen-snacks", "spring-rolls"): "a small ceramic dish of premium frozen spring rolls with a small dish of sweet chilli sauce alongside",
}

def subj_frozen(parts):
    key = (parts[-2], parts[-1])
    return _FROZEN.get(key, f"a single premium frozen {_human(parts[-1])} with fine frost dusting and a fresh herb sprig alongside")

# ---- food/health-free-from ----

def subj_free_from(parts):
    leaf = parts[-1]
    table = {
        "dairy-free": "a single small carton of premium oat milk with a freshly poured glass and a few oats scattered alongside",
        "gluten-free": "a single premium gluten-free sourdough loaf with a few crumbs and a sprig of fresh thyme",
        "high-protein": "a single premium high-protein granola bar with a small bowl of mixed seeds and a fresh raspberry",
        "keto": "a small ceramic dish of premium keto-friendly seed crackers with a wedge of avocado",
        "organic": "a single premium organic produce item (heirloom tomato or carrot bunch) with fresh herbs",
        "plant-based": "a single small ceramic dish of premium plant-based protein patty with fresh leaves alongside",
        "vegan": "a single small glass jar of premium vegan nut butter with a wooden spoon and a few raw nuts",
    }
    return table[leaf]

# ---- food/international ----

def subj_international(parts):
    leaf = parts[-1]
    table = {
        "african": "a small ceramic bowl of premium African berbere spice blend with a few dried chillies alongside",
        "asian-foods": "a single small glass jar of premium soy sauce with a black ceramic dish and a pair of bamboo chopsticks alongside",
        "indian-foods": "a small wooden bowl of premium fragrant basmati rice with whole spices (star anise, cinnamon stick, cardamom) alongside",
        "latin-american": "a single small ceramic bowl of premium black beans with fresh coriander and a wedge of lime",
        "mediterranean": "a single small ceramic dish of premium pitted Kalamata olives with a drizzle of olive oil and fresh oregano",
        "mexican-foods": "a single soft warm corn tortilla with a small ceramic dish of fresh salsa verde and a wedge of lime",
        "middle-eastern": "a single small ceramic bowl of premium za'atar spice blend with a drizzle of olive oil and warm flatbread",
    }
    return table[leaf]

# ---- food/meat-seafood ----

def subj_meat_seafood(parts):
    leaf = parts[-1]
    table = {
        "beef": "a single premium dry-aged beef ribeye steak with cracked black pepper and a sprig of fresh rosemary",
        "chicken": "a single fresh whole free-range chicken with a sprig of thyme and a sliced lemon alongside",
        "deli-meats": "an arranged fan of premium thinly sliced cured ham with fresh rosemary and cracked black pepper",
        "fish": "a single premium fresh salmon fillet with a sprig of dill and a slice of lemon alongside",
        "halal-meat": "a single premium halal-certified lamb chop with a sprig of fresh rosemary and cracked black pepper",
        "lamb": "a single premium rack of lamb with fresh rosemary, garlic clove and cracked pepper",
        "pork": "a single premium pork loin with a sprig of fresh sage and a sliced apple alongside",
        "sausages": "a small cluster of premium handmade Cumberland sausages with fresh sage leaves",
        "shrimp": "a small cluster of premium fresh tiger prawns with a wedge of lemon and a sprig of parsley",
    }
    return table[leaf]

# ---- food/pantry ----

_PANTRY = {
    ("canned-goods", "canned-beans"): "a single premium tin of cannellini beans with a small ceramic dish of beans and a sprig of fresh rosemary alongside",
    ("canned-goods", "canned-fish"): "a single premium tin of olive-oil sardines with a small ceramic dish and a wedge of fresh lemon alongside",
    ("canned-goods", "canned-fruits"): "a single premium tin of sliced peaches in juice with a small ceramic dish of peach slices and a sprig of mint",
    ("canned-goods", "canned-meat"): "a single premium tin of corned beef with a small ceramic dish and a sprig of fresh thyme alongside",
    ("canned-goods", "canned-vegetables"): "a single premium tin of sweetcorn kernels with a small ceramic dish of corn and a sprig of fresh parsley",
    ("canned-goods", "soups"): "a single premium tin of tomato soup with a small ceramic bowl of soup, a swirl of cream and a fresh basil leaf",
    ("canned-goods", "tomatoes"): "a single premium tin of San Marzano plum tomatoes with a small ceramic dish of tomatoes and a sprig of fresh basil",
    ("condiments", "hot-sauce"): "a single small premium glass bottle of artisan hot sauce with a small ceramic dish and a fresh red chilli alongside",
    ("condiments", "ketchup"): "a single premium glass bottle of artisan tomato ketchup with a small ceramic dish and a sprig of fresh basil alongside",
    ("condiments", "mayonnaise"): "a single premium glass jar of artisan mayonnaise with a wooden spoon dollop and a fresh lemon wedge alongside",
    ("condiments", "mustard"): "a single small premium glass jar of wholegrain mustard with a small wooden spoon and a sprig of fresh thyme",
    ("condiments", "salad-dressing"): "a single premium glass bottle of artisan vinaigrette with a small ceramic dish and a fresh herb sprig alongside",
    ("condiments", "soy-sauce"): "a single small premium glass bottle of artisan soy sauce with a small black ceramic dish and a pair of bamboo chopsticks alongside",
    ("condiments", "vinegar"): "a single premium amber glass bottle of artisan balsamic vinegar with a small ceramic dish and a sprig of fresh rosemary",
    ("cooking-oils", "coconut"): "a single premium glass jar of cold-pressed coconut oil with a fresh halved coconut alongside",
    ("cooking-oils", "ghee"): "a single premium glass jar of golden clarified ghee with a wooden spoon and a sprig of fresh curry leaves alongside",
    ("cooking-oils", "olive"): "a single tall premium glass bottle of cold-pressed extra-virgin olive oil with a small dish of fresh olives and a sprig of rosemary",
    ("cooking-oils", "palm"): "a single premium glass bottle of palm oil with a small ceramic dish of palm fruit alongside",
    ("cooking-oils", "sunflower"): "a single premium glass bottle of cold-pressed sunflower oil with a few fresh sunflower seeds alongside",
    ("cooking-oils", "vegetable"): "a single premium glass bottle of refined vegetable cooking oil with a small ceramic dish of fresh herbs alongside",
    ("herbs-spices", "ground-spices"): "a small wooden spice tray with three open ceramic dishes of ground turmeric, paprika and cumin with a vintage brass spoon",
    ("herbs-spices", "herbs"): "a small bundle of premium freshly cut culinary herbs (basil, thyme, rosemary) loosely gathered with garden twine",
    ("herbs-spices", "rubs"): "a small ceramic dish of premium dry meat rub blend with cracked peppercorns and a sprig of fresh thyme",
    ("herbs-spices", "salt-pepper"): "a matching premium sea-salt grinder and black-peppercorn grinder pair with a small dish of flake salt and cracked black pepper",
    ("herbs-spices", "seasoning-mixes"): "a small premium glass jar of seasoning blend with a wooden spoon of the blend and fresh herbs alongside",
    ("herbs-spices", "spice-blends"): "a small premium glass jar of artisan spice blend with a wooden spoon mound of the blend and whole spices alongside",
    ("herbs-spices", "whole-spices"): "a small wooden tray of premium whole spices: star anise, cinnamon sticks, cardamom pods and cloves arranged in three open dishes",
    ("pasta-rice", "couscous"): "a small premium linen sack of fine couscous with a small ceramic dish of couscous and a sprig of fresh mint",
    ("pasta-rice", "grains"): "a small premium linen sack of pearl barley with a small ceramic dish of grains and a sprig of fresh thyme",
    ("pasta-rice", "lentils"): "a small premium linen sack of green Puy lentils with a small ceramic dish of lentils and a sprig of bay leaf",
    ("pasta-rice", "noodles"): "a small bundle of premium dried ramen noodles with a pair of bamboo chopsticks and a small dish of soy sauce alongside",
    ("pasta-rice", "pasta"): "a small premium linen sack of bronze-cut spaghetti with a few raw strands fanned out and a sprig of basil alongside",
    ("pasta-rice", "quinoa"): "a small premium linen sack of tri-coloured quinoa with a small ceramic dish of quinoa and a sprig of fresh coriander",
    ("pasta-rice", "rice"): "a small premium linen sack of long-grain basmati rice with a small ceramic dish of rice and whole spices alongside",
    ("sauces-marinades", "bbq-sauce"): "a single premium glass bottle of artisan smoky BBQ sauce with a small ceramic dish and a sprig of fresh thyme alongside",
    ("sauces-marinades", "curry-sauce"): "a single premium glass jar of artisan curry sauce with a small ceramic dish and a sprig of fresh coriander",
    ("sauces-marinades", "gravy"): "a single premium glass jar of artisan gravy with a small ceramic gravy boat freshly poured and a sprig of fresh rosemary",
    ("sauces-marinades", "pasta-sauce"): "a single premium glass jar of artisan tomato pasta sauce with a small ceramic dish and a sprig of fresh basil alongside",
    ("sauces-marinades", "pesto"): "a single premium small glass jar of artisan basil pesto with a small ceramic dish and a few fresh basil leaves and pine nuts alongside",
    ("sauces-marinades", "stir-fry"): "a single premium glass bottle of artisan stir-fry sauce with a small black ceramic dish and a sprig of fresh spring onion alongside",
    ("sauces-marinades", "teriyaki"): "a single premium glass bottle of artisan teriyaki sauce with a small black ceramic dish and a pair of bamboo chopsticks alongside",
    ("soup", "broth-stock"): "a single premium glass jar of artisan chicken stock with a small ceramic bowl of broth, a sprig of fresh thyme and a few vegetable trimmings",
    ("soup", "canned-soup"): "a single premium tin of tomato soup with a small ceramic bowl of soup, a swirl of cream and a fresh basil leaf",
    ("soup", "cup-noodles"): "a single premium cup of instant noodles partially unsealed with a pair of bamboo chopsticks and a fresh spring onion",
    ("soup", "instant-soup"): "a single small premium pack of instant soup with a small ceramic bowl of soup and fresh herbs alongside",
    ("spreads", "honey"): "a single premium glass jar of raw acacia honey with a wooden honey dipper drizzling a golden ribbon and a slice of toast alongside",
    ("spreads", "jam"): "a single premium small glass jar of artisan strawberry jam with a wooden spoon and a slice of toasted bread alongside",
    ("spreads", "marmalade"): "a single premium small glass jar of bitter orange marmalade with a wooden spoon and a slice of toasted bread alongside",
    ("spreads", "nutella"): "a single premium glass jar of chocolate hazelnut spread with a wooden spoon and a slice of toasted brioche with hazelnuts alongside",
    ("spreads", "peanut-butter"): "a single premium small glass jar of artisan crunchy peanut butter with a wooden spoon and a slice of toasted bread and fresh banana alongside",
    ("spreads", "tahini"): "a single premium small glass jar of stone-ground tahini with a wooden spoon and a sprinkle of toasted sesame seeds alongside",
}

def subj_pantry(parts):
    key = (parts[-2], parts[-1])
    return _PANTRY.get(key, f"a single premium {_human(parts[-1])} pantry product with a small ceramic dish and fresh herb alongside")

# ---- food/produce ----

def subj_produce(parts):
    leaf = parts[-1]
    table = {
        "fresh-fruits": "a small cluster of premium fresh seasonal fruits (peaches, raspberries, figs) with one peach halved to reveal the stone, fresh dewdrops on the skin",
        "fresh-vegetables": "a small cluster of premium fresh seasonal vegetables (heirloom tomatoes, courgette, fresh herbs) with one tomato halved to reveal interior",
        "herbs": "a small bundle of premium freshly cut culinary herbs (basil, thyme, rosemary) loosely gathered with garden twine",
        "organic-produce": "a small cluster of premium organic produce (heirloom carrots with leafy tops, radishes) with a few water droplets on the skin",
        "salad": "a small wooden bowl of premium mixed salad leaves with edible flowers and a drizzle of olive oil",
    }
    return table[leaf]

# ---- food/snacks ----

def subj_snacks(parts):
    leaf = parts[-1]
    table = {
        "chips-crisps": "a small ceramic bowl of premium hand-cooked sea-salt crisps with a few crisps scattered casually on the board",
        "crackers": "a small fan of premium artisan crackers with a wedge of cheese and a fresh fig alongside",
        "fruit-snacks": "a small ceramic dish of premium dried fruit medley with a few whole dried apricots and figs alongside",
        "granola-bars": "a single premium granola bar partially unwrapped with a few rolled oats and a drizzle of honey alongside",
        "jerky": "a small wooden board with premium hand-cut beef jerky strips fanned out and cracked black pepper",
        "nuts-trail-mix": "a small ceramic bowl of premium mixed roasted nuts with a few raisins and a whole walnut alongside",
        "popcorn": "a small striped paper cone of premium sea-salt-and-caramel popcorn with a few kernels scattered alongside",
        "pretzels": "a small wooden bowl of premium hand-twisted sourdough pretzels with a small ceramic dish of grain mustard",
        "rice-cakes": "a small stack of premium thin rice cakes with a small spread of nut butter and fresh sliced banana alongside",
    }
    return table[leaf]

# ---- health-wellness ----

def subj_health(parts):
    leaf = parts[-1]
    table = {
        "OTC-medicines":      "a single premium glass apothecary bottle of OTC tablets with a small ceramic dish of capsules alongside",
        "cold-flu":           "a single premium amber glass bottle of cold-and-flu syrup with a measuring cup and a fresh sprig of eucalyptus alongside",
        "digestive-health":   "a single premium glass bottle of digestive-health supplement with a small dish of capsules and a sprig of fresh mint",
        "first-aid":          "a single small premium first-aid kit tin open to show neatly arranged plasters, bandage and antiseptic vial",
        "protein":            "a single premium matt-finish tub of whey protein powder with a measuring scoop and a few raw oats alongside",
        "supplements":        "a single premium amber glass bottle of nutritional supplement with a small ceramic dish of softgel capsules and a sprig of eucalyptus",
        "vitamins":           "a single premium amber glass bottle of multivitamin tablets with a small ceramic dish of capsules and a wedge of fresh orange",
    }
    return table[leaf]

# ---- home-care ----

def subj_air_care(parts):
    leaf = parts[-1]
    table = {
        "air-fresheners": "a single premium amber glass air-freshener bottle with bamboo reeds and a sprig of fresh lavender alongside",
        "candles": "a single premium soy-wax candle in an amber glass jar with a softly lit flame and a sprig of fresh rosemary alongside",
        "diffusers": "a single premium reed diffuser in an amber glass bottle with bamboo reeds and a sprig of eucalyptus alongside",
        "insecticide": "a single premium matt-finish insecticide spray can with a sprig of fresh citronella leaf alongside",
    }
    return table[leaf]

def subj_cleaners(parts):
    leaf = parts[-1]
    table = {
        "bathroom-cleaner": "a single premium amber glass bottle of bathroom cleaner with a folded white microfibre cloth and a sprig of fresh eucalyptus",
        "bleach": "a single premium matt-finish bleach bottle with a folded white microfibre cloth and a fresh lemon wedge alongside",
        "floor-cleaner": "a single premium amber glass bottle of floor cleaner with a folded grey microfibre cloth and a sprig of fresh pine",
        "glass-cleaner": "a single premium spray bottle of glass cleaner with a folded yellow microfibre cloth and a fresh lemon slice alongside",
        "kitchen-cleaner": "a single premium spray bottle of kitchen cleaner with a folded grey microfibre cloth and a fresh lemon wedge alongside",
        "toilet-cleaner": "a single premium matt-finish toilet cleaner bottle with a folded white microfibre cloth and a sprig of fresh eucalyptus",
    }
    return table[leaf]

def subj_detergents(parts):
    leaf = parts[-1]
    table = {
        "liquid-detergent": "a single premium matt-finish bottle of laundry liquid detergent with a folded soft white cotton towel and a sprig of fresh lavender alongside",
        "washing-pods": "a single small premium jar of laundry washing pods with a folded soft white cotton towel and a sprig of fresh lavender alongside",
    }
    return table[leaf]

def subj_paper(parts):
    leaf = parts[-1]
    table = {
        "bin-liners": "a single premium roll of compostable bin liners with one bag softly unfurled and a fresh leaf alongside",
        "tissues": "a single premium box of facial tissues with one tissue softly drawn out and a sprig of fresh eucalyptus alongside",
    }
    return table[leaf]

def subj_pest_control(parts):
    leaf = parts[-1]
    table = {
        "insect-killers": "a single premium matt-finish insect-killer spray can with a sprig of fresh citronella leaf alongside",
        "mosquito-repellent": "a single premium amber glass bottle of mosquito repellent with a sprig of fresh lemongrass alongside",
        "rodent-control": "a single premium matt-finish rodent-control pack with a sprig of fresh peppermint leaf alongside",
    }
    return table[leaf]

# ---- personal-care ----

def subj_cosmetics(parts):
    leaf = parts[-1]
    table = {
        "blush": "a single premium pressed blush compact open to reveal soft rose powder with a soft kabuki brush alongside",
        "eyeshadow": "a single premium eyeshadow palette open to reveal warm neutral shades with a small brush and a pressed peony petal alongside",
        "mascara": "a single premium glossy black mascara tube with sleek lacquered cap, a soft pressed peony petal alongside",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} cosmetic product with sleek lacquered finish and a soft pressed peony petal alongside")

def subj_haircare(parts):
    leaf = parts[-1]
    table = {
        "dry-shampoo": "a single premium matt-finish dry shampoo can with a soft white round brush and a few water droplets on the surface",
        "hair-color": "a single premium hair-colour box with a small glass dish of cream colour and a fresh strand of natural hair alongside",
        "hair-oil": "a single premium small amber glass bottle of hair oil with a pipette dropper and a single golden droplet on the surface",
        "styling": "a single premium glass jar of hair styling cream with a wooden spatula scoop and a soft fresh strand of hair alongside",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} haircare bottle with a small glass dish of clear product and a few water droplets on the surface")

def subj_hygiene(parts):
    leaf = parts[-1]
    table = {
        "body-wash": "a single premium glass bottle of body wash with a pump dispenser, a folded white cotton towel and a fresh eucalyptus sprig alongside",
        "wet-wipes": "a single premium pack of fragrance-free wet wipes with one wipe softly drawn out and a sprig of fresh eucalyptus alongside",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} hygiene product with a folded white cotton towel and a fresh eucalyptus sprig alongside")

def subj_mens_groom(parts):
    leaf = parts[-1]
    table = {
        "aftershave": "a single premium amber glass bottle of men's aftershave with a vintage badger brush and a folded white linen towel alongside",
        "beard-care": "a single premium small amber glass bottle of beard oil with a wooden beard comb and folded white linen towel alongside",
        "deodorant": "a single premium matt-finish men's deodorant stick with a folded white linen towel and a sprig of fresh cedar alongside",
        "mens-skincare": "a single premium glass jar of men's face cream with a wooden spatula and folded white linen towel alongside",
        "shaving": "a single premium chrome safety razor and a small lacquered shaving brush with a folded white linen towel and a marble dish of shaving soap",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} grooming product for men with a vintage badger shaving brush and folded white linen towel alongside")

def subj_oral(parts):
    leaf = parts[-1]
    table = {
        "floss": "a single premium small lacquered tin of waxed dental floss with a glass tumbler of fresh water and a sprig of fresh mint alongside",
        "mouthwash": "a single premium glass bottle of cool blue mouthwash with a small glass cup poured and a sprig of fresh mint alongside",
        "toothbrush": "a single premium hand-finished bamboo toothbrush with soft bristles, a glass tumbler of fresh water and a sprig of fresh mint alongside",
        "toothpaste": "a single premium lacquered toothpaste tube with a soft white toothbrush and a glass tumbler of fresh water alongside",
        "whitening": "a single premium whitening toothpaste tube with a soft white toothbrush, a glass of water and a sprig of fresh mint alongside",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} oral-care product with a glass tumbler of fresh water and a sprig of fresh mint alongside")

def subj_skincare(parts):
    leaf = parts[-1]
    table = {
        "body-lotion": "a single premium glass bottle of body lotion with pump dispenser, a small dollop of cream on the marble and a fresh peony petal alongside",
        "eye-cream": "a single premium small glass jar of eye cream with a tiny gold spatula scoop and a fresh peony petal alongside",
        "toners": "a single premium tall glass bottle of facial toner with a cotton pad and a fresh peony petal alongside",
    }
    return table.get(leaf, f"a single premium {_human(leaf)} skincare jar or bottle with a small dollop of cream on the marble and a fresh peony petal alongside")

# ---- pet-care ----

def subj_pet_cat(parts):
    leaf = parts[-1]
    table = {
        "cat-food-dry": "a single premium ceramic bowl of dry cat kibble with a few kibbles scattered alongside and a small fresh sprig of catnip",
        "cat-food-wet": "a single premium small tin of pate cat food with a small ceramic dish of pate and a fresh sprig of catnip alongside",
        "cat-litter": "a single premium small pack of cat litter with a small open dish of clean granules alongside",
        "cat-toys": "a single premium hand-stitched cat toy mouse with a small ball of natural twine alongside",
        "cat-treats": "a single premium small pack of cat treats with a small ceramic dish of treats and a fresh sprig of catnip alongside",
    }
    return table.get(leaf, f"a single premium cat {_human(leaf)} product with a small terracotta dish alongside")

def subj_pet_dog(parts):
    leaf = parts[-1]
    table = {
        "dog-food-dry": "a single premium ceramic bowl of dry dog kibble with a few kibbles scattered alongside and a small soft dog toy",
        "dog-food-wet": "a single premium small tin of dog food pate with a small ceramic dish of pate and a folded soft pet blanket",
        "dog-grooming": "a single premium glass bottle of dog grooming shampoo with a soft natural bristle brush and a folded soft pet towel alongside",
        "dog-toys": "a single premium braided rope dog toy with a small natural rubber chew ball alongside",
        "dog-treats": "a single premium small pack of dog treats with a small ceramic dish of treats and a folded soft pet blanket alongside",
    }
    return table.get(leaf, f"a single premium dog {_human(leaf)} product with a folded soft pet blanket alongside")

def subj_pet_other(parts):
    leaf = parts[-1]
    table = {
        "bird-food": "a single small premium pack of mixed bird seed with a small ceramic dish of seed and a single decorative feather alongside",
        "fish-food": "a single small premium tub of fish flake food with a tiny pinch of flakes on the surface and a small clear glass tumbler of water alongside",
        "small-animal-food": "a single small premium pack of small-animal pellet food with a small ceramic dish of pellets and a sprig of fresh hay alongside",
    }
    return table.get(leaf, f"a single premium small-pet {_human(leaf)} product with a small ceramic dish alongside")

# ----------------------------------------------------------------------
# Tree -> subject-builder
# ----------------------------------------------------------------------

SUBJECT_BUILDERS = {
    "01-apparels/accessories/bags":       subj_bags,
    "01-apparels/accessories/belts":      subj_belts,
    "01-apparels/accessories/gloves":     subj_gloves,
    "01-apparels/accessories/hats":       subj_hats,
    "01-apparels/accessories/jewellery":  subj_jewellery,
    "01-apparels/accessories/scarves":    subj_scarves,
    "01-apparels/accessories/sunglasses": subj_sunglasses,
    "01-apparels/accessories/wallets":    subj_wallets,
    "01-apparels/apparel/baby":           subj_apparel_baby,
    "01-apparels/apparel/kids-wear":      subj_apparel_kids,
    "01-apparels/apparel/teens":          subj_apparel_teens,
    "01-apparels/apparel/mens-wear":      subj_apparel_mens,
    "01-apparels/apparel/womens-wear":    subj_apparel_womens,
    "01-apparels/apparel/sportswear":     subj_apparel_sportswear,
    "01-apparels/fabrics/blends":         subj_fabric,
    "01-apparels/fabrics/cotton":         subj_fabric,
    "01-apparels/fabrics/denim":          subj_fabric,
    "01-apparels/fabrics/linen":          subj_fabric,
    "01-apparels/fabrics/polyester":      subj_fabric,
    "01-apparels/fabrics/silk":           subj_fabric,
    "01-apparels/fabrics/synthetic":      subj_fabric,
    "01-apparels/fabrics/wool":           subj_fabric,
    "01-apparels/footwear/baby":          subj_footwear_baby,
    "01-apparels/footwear/kids":          subj_footwear_kids,
    "01-apparels/footwear/teens":         subj_footwear_teens,
    "01-apparels/footwear/mens":          subj_footwear_mens,
    "01-apparels/footwear/womens":        subj_footwear_womens,
    "01-apparels/footwear/sports":        subj_footwear_sports,
    "01-apparels/home-textiles/bath-linen": subj_home_textile,
    "01-apparels/home-textiles/bed-linen":  subj_home_textile,
    "01-apparels/home-textiles/curtains":   subj_home_textile,
    "01-apparels/home-textiles/kitchen":    subj_home_textile,
    "01-apparels/home-textiles/table":      subj_home_textile,
    "01-apparels/lingerie/bras":         subj_lingerie,
    "01-apparels/lingerie/hosiery":      subj_lingerie,
    "01-apparels/lingerie/loungewear":   subj_lingerie,
    "01-apparels/lingerie/nightwear":    subj_lingerie,
    "01-apparels/lingerie/panties":      subj_lingerie,
    "01-apparels/lingerie/shapewear":    subj_lingerie,

    "02-fmcg/baby-care/baby-skincare": subj_baby_skincare,
    "02-fmcg/baby-care/diapers":       subj_diapers,
    "02-fmcg/baby-care/feeding":       subj_feeding,
    "02-fmcg/food/baby-food":          subj_food_baby,
    "02-fmcg/food/baking":             subj_baking,
    "02-fmcg/food/beverages":          subj_beverages,
    "02-fmcg/food/bread-bakery":       subj_bread,
    "02-fmcg/food/breakfast-cereal":   subj_breakfast,
    "02-fmcg/food/candy-chocolate":    subj_chocolate,
    "02-fmcg/food/dairy":              subj_dairy,
    "02-fmcg/food/deli":               subj_deli,
    "02-fmcg/food/frozen":             subj_frozen,
    "02-fmcg/food/health-free-from":   subj_free_from,
    "02-fmcg/food/international":      subj_international,
    "02-fmcg/food/meat-seafood":       subj_meat_seafood,
    "02-fmcg/food/pantry":             subj_pantry,
    "02-fmcg/food/produce":            subj_produce,
    "02-fmcg/food/snacks":             subj_snacks,
    "02-fmcg/health-wellness/OTC-medicines":    subj_health,
    "02-fmcg/health-wellness/cold-flu":         subj_health,
    "02-fmcg/health-wellness/digestive-health": subj_health,
    "02-fmcg/health-wellness/first-aid":        subj_health,
    "02-fmcg/health-wellness/protein":          subj_health,
    "02-fmcg/health-wellness/supplements":      subj_health,
    "02-fmcg/health-wellness/vitamins":         subj_health,
    "02-fmcg/home-care/air-care":     subj_air_care,
    "02-fmcg/home-care/cleaners":     subj_cleaners,
    "02-fmcg/home-care/detergents":   subj_detergents,
    "02-fmcg/home-care/paper":        subj_paper,
    "02-fmcg/home-care/pest-control": subj_pest_control,
    "02-fmcg/personal-care/cosmetics":     subj_cosmetics,
    "02-fmcg/personal-care/haircare":      subj_haircare,
    "02-fmcg/personal-care/hygiene":       subj_hygiene,
    "02-fmcg/personal-care/mens-grooming": subj_mens_groom,
    "02-fmcg/personal-care/oral-care":     subj_oral,
    "02-fmcg/personal-care/skincare":      subj_skincare,
    "02-fmcg/pet-care/cat":   subj_pet_cat,
    "02-fmcg/pet-care/dog":   subj_pet_dog,
    "02-fmcg/pet-care/other": subj_pet_other,
}


def build_prompt(key):
    parts = key.split("/")
    # key = "<vert>/categories/<L3>/<L4>/...rest..."
    if len(parts) < 4 or parts[1] != "categories":
        raise ValueError(f"unexpected key shape: {key}")
    vert, L3, L4 = parts[0], parts[2], parts[3]
    rest = parts[4:]  # the leaf parts under L4
    tree = f"{vert}/{L3}/{L4}"
    style = TREE_STYLE[tree]
    builder = SUBJECT_BUILDERS[tree]
    # If the leaf is at level L4 (no rest, e.g. health-wellness/cold-flu),
    # pass [L4] so builder can use it as the leaf name.
    subject_parts = rest if rest else [L4]
    subject = builder(subject_parts)
    return (
        f"{subject}, {style['frame']}, {style['lighting']}, "
        f"{style['surface']}, {style['style']}"
    )


def main():
    keys = sorted(OLD_PROMPTS.keys())
    missing_tree = []
    out = {}
    for k in keys:
        try:
            out[k] = build_prompt(k)
        except KeyError as e:
            missing_tree.append((k, str(e)))
        except Exception as e:  # noqa: BLE001
            missing_tree.append((k, f"err: {e}"))

    if missing_tree:
        print("ERRORS:")
        for k, m in missing_tree[:20]:
            print(f"  {k}  {m}")
        print(f"\n{len(missing_tree)} total errors. Aborting write.")
        sys.exit(1)

    # Write the new leaf_prompts.py
    header = textwrap.dedent('''\
        """LEAF_PROMPTS — one product-accurate, brand-styled prompt per leaf folder.

        01-apparels prompts use editorial fashion / accessory / textile styling
        inspired by the actual photography conventions of Zara, Armani and Gucci.

        02-fmcg prompts use premium grocery / FMCG styling inspired by
        M&S Food, Waitrose and Whole Foods Market.

        Generated by scripts/rewrite_leaf_prompts.py — do not hand-edit this
        file; edit the generator and re-run.

        Keys are paths RELATIVE to public/assets/verticals/.
        STYLE_SUFFIX is appended by the generator script.
        """

        STYLE_SUFFIX = (
        ''') + '    "' + STYLE_SUFFIX + '"\n)\n\n'

    with open(OUT_PATH, "w") as f:
        f.write(header)
        f.write("LEAF_PROMPTS = {\n")
        current_vert = None
        current_l3 = None
        for k in keys:
            parts = k.split("/")
            vert, L3 = parts[0], parts[2]
            if vert != current_vert:
                f.write(f"\n    # =====================================================\n")
                f.write(f"    # {vert.upper()}\n")
                f.write(f"    # =====================================================\n")
                current_vert = vert
                current_l3 = None
            if L3 != current_l3:
                f.write(f"\n    # ---- {L3} ----\n")
                current_l3 = L3
            escaped = out[k].replace('"', '\\"')
            f.write(f'    "{k}": "{escaped}",\n')
        f.write("}\n")

    print(f"Wrote {len(out)} entries to {OUT_PATH}")


if __name__ == "__main__":
    main()
