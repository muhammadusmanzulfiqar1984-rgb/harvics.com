#!/usr/bin/env python3
"""Generate src/data/leafImageMap.ts — a keyword -> leaf.jpg lookup so that
the static product catalog (`productCatalog.ts`) can serve real generated
images instead of Unsplash.

For every `leaf.jpg` under public/assets/verticals/<vert>/categories/<...>/X/leaf.jpg
we register the leaf folder's name (lowercased, kebab-case) and a few synonyms
derived from the path so existing catalog keywords resolve.
"""
import json
import os
import re

REPO = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO, "public/assets/verticals")
OUT  = os.path.join(REPO, "src/data/leafImageMap.ts")
LEAF = "leaf.jpg"

# Manual synonyms: catalog uses certain keywords (e.g. 'gown', 'denim', 'shirt')
# that don't match any leaf folder name exactly. Map them to the best leaf path.
# All paths below have been verified against the actual file tree.
SYNONYMS_TO_PATHS = {
    # ─── Apparels — Womenswear ───
    "gown":          "01-apparels/categories/apparel/womens-wear/dresses",
    "dress":         "01-apparels/categories/apparel/womens-wear/dresses",
    "floral":        "01-apparels/categories/apparel/womens-wear/dresses",
    "silk":          "01-apparels/categories/apparel/womens-wear/blouses",
    "blouse":        "01-apparels/categories/apparel/womens-wear/blouses",
    "knickers":      "01-apparels/categories/lingerie/panties/briefs",
    "handbag":       "01-apparels/categories/accessories/bags/crossbody",
    # ─── Apparels — Menswear (VERIFIED) ───
    "suit":          "01-apparels/categories/apparel/mens-wear/suits",
    "shirt":         "01-apparels/categories/apparel/mens-wear/shirts",
    "polo":          "01-apparels/categories/apparel/mens-wear/shirts",
    "denim":         "01-apparels/categories/apparel/teens/boys-teens/jeans",
    "jeans":         "01-apparels/categories/apparel/teens/boys-teens/jeans",
    "leather":       "01-apparels/categories/apparel/kids-wear/boys/jackets",
    "jacket":        "01-apparels/categories/apparel/kids-wear/boys/jackets",
    "chinos":        "01-apparels/categories/apparel/mens-wear/trousers",
    "blazer":        "01-apparels/categories/apparel/mens-wear/suits",
    "merino":        "01-apparels/categories/apparel/mens-wear/knitwear",
    "knitwear":      "01-apparels/categories/apparel/mens-wear/knitwear",
    "overcoat":      "01-apparels/categories/apparel/mens-wear/outerwear",
    "parka":         "01-apparels/categories/apparel/mens-wear/outerwear",
    "stormwear":     "01-apparels/categories/apparel/mens-wear/outerwear",
    "sportswear":    "01-apparels/categories/apparel/mens-wear/activewear",
    "technical":     "01-apparels/categories/apparel/mens-wear/activewear",
    "trainers":      "01-apparels/categories/footwear/sports/running",
    "loungewear":    "01-apparels/categories/lingerie/loungewear/sets",
    "pyjamas":       "01-apparels/categories/lingerie/nightwear/pajamas",
    "pajamas":       "01-apparels/categories/lingerie/nightwear/pajamas",
    "dressing-gown": "01-apparels/categories/lingerie/nightwear/robes",
    "nightwear":     "01-apparels/categories/lingerie/nightwear/pajamas",
    "wool":          "01-apparels/categories/fabrics/wool/merino",
    # ─── Apparels — Kids (VERIFIED) ───
    "boy":           "01-apparels/categories/apparel/kids-wear/boys/jackets",
    "girl":          "01-apparels/categories/apparel/kids-wear/girls/tops",
    "tshirt":        "01-apparels/categories/apparel/kids-wear/toddlers/tops",
    "uniform":       "01-apparels/categories/apparel/kids-wear/toddlers/sets",
    "school":        "01-apparels/categories/footwear/kids/sneakers",
    "hoodie":        "01-apparels/categories/apparel/kids-wear/boys/hoodies",
    "sneakers":      "01-apparels/categories/footwear/kids/sneakers",
    "shoes":         "01-apparels/categories/footwear/kids/sneakers",
    # ─── Apparels — Lingerie ───
    "bra":           "01-apparels/categories/lingerie/bras/padded",
    "lingerie":      "01-apparels/categories/lingerie/bras/padded",
    "shapewear":     "01-apparels/categories/lingerie/shapewear/bodysuits",
    "sports-bra":    "01-apparels/categories/lingerie/bras/padded",
    "tights":        "01-apparels/categories/lingerie/hosiery/tights",
    # ─── Apparels — Home Textiles (VERIFIED) ───
    "bedsheet":      "01-apparels/categories/home-textiles/bed-linen/sheets",
    "bedroom":       "01-apparels/categories/home-textiles/bed-linen/duvets",
    "towel":         "01-apparels/categories/home-textiles/bath-linen/bathrobes",
    "bathroom":      "01-apparels/categories/home-textiles/bath-linen/bath-mats",
    "cushion":       "01-apparels/categories/home-textiles/bed-linen/bedspreads",
    "decor":         "01-apparels/categories/home-textiles/bed-linen/bedspreads",
    "apron":         "01-apparels/categories/home-textiles/bed-linen/sheets",
    "kitchen":       "01-apparels/categories/home-textiles/bed-linen/sheets",
    # ─── FMCG — Staples (VERIFIED paths) ───
    "rice":          "02-fmcg/categories/food/pantry/pasta-rice/rice",
    "basmati":       "02-fmcg/categories/food/pantry/pasta-rice/rice",
    "flour":         "02-fmcg/categories/food/baking/flour",
    "lentils":       "02-fmcg/categories/food/pantry/pasta-rice/lentils",
    "red":           "02-fmcg/categories/food/pantry/pasta-rice/lentils",
    "oats":          "02-fmcg/categories/food/baking/flour",
    "grain":         "02-fmcg/categories/food/pantry/pasta-rice/grains",
    # ─── FMCG — Oils & Spices ───
    "oil":           "02-fmcg/categories/food/pantry/cooking-oils/olive",
    "sunflower":     "02-fmcg/categories/food/pantry/cooking-oils/sunflower",
    "olive":         "02-fmcg/categories/food/pantry/cooking-oils/olive",
    "ghee":          "02-fmcg/categories/food/pantry/cooking-oils/ghee",
    "spices":        "02-fmcg/categories/food/pantry/herbs-spices/spice-blends",
    # ─── FMCG — Packaged ───
    "noodles":       "02-fmcg/categories/food/pantry/pasta-rice/noodles",
    "cookies":       "02-fmcg/categories/bakery/biscuits-and-cookies",
    "chocolate":     "02-fmcg/categories/food/candy-chocolate/chocolate-bars",
    "chips":         "02-fmcg/categories/food/snacks/popcorn",
    "snack":         "02-fmcg/categories/food/snacks/popcorn",
    "corn":          "02-fmcg/categories/food/pantry/canned-goods/canned-vegetables",
    "canned":        "02-fmcg/categories/food/pantry/canned-goods/canned-vegetables",
    "pasta":         "02-fmcg/categories/food/pantry/pasta-rice/pasta",
    # ─── FMCG — Dairy & Beverages (VERIFIED) ───
    "milk":          "02-fmcg/categories/food/dairy/milk",
    "carton":        "02-fmcg/categories/food/dairy/milk",
    "cheese":        "02-fmcg/categories/food/dairy/cheese",
    "block":         "02-fmcg/categories/food/dairy/cheese",
    "butter":        "02-fmcg/categories/food/dairy/butter",
    "yogurt":        "02-fmcg/categories/food/dairy/yogurt",
    "cream":         "02-fmcg/categories/food/dairy/cream",
    "juice":         "02-fmcg/categories/food/beverages/non-carbonated/fruit-juice",
    "nectar":        "02-fmcg/categories/food/beverages/non-carbonated/fruit-juice",
    "fruit":         "02-fmcg/categories/food/produce/fresh-fruits",
    "glass":         "02-fmcg/categories/food/beverages/non-carbonated/fruit-juice",
    "coffee":        "02-fmcg/categories/food/beverages/hot-drinks/coffee",
    "jar":           "02-fmcg/categories/food/pantry/spreads/jam",
    "jam":           "02-fmcg/categories/food/pantry/spreads/jam",
    "honey":         "02-fmcg/categories/food/pantry/spreads/honey",
    "popcorn":       "02-fmcg/categories/food/snacks/popcorn",
    "egg":           "02-fmcg/categories/food/dairy/eggs",
    "eggs":          "02-fmcg/categories/food/dairy/eggs",
    # ─── FMCG — Personal Care ───
    "toothpaste":    "02-fmcg/categories/personal-care/oral-care/toothpaste",
    "tube":          "02-fmcg/categories/personal-care/oral-care/toothpaste",
    "soap":          "02-fmcg/categories/personal-care/hygiene/soaps",
    "bar":           "02-fmcg/categories/personal-care/hygiene/soaps",
    "shampoo":       "02-fmcg/categories/personal-care/haircare/shampoo",
    "bottle":        "02-fmcg/categories/personal-care/haircare/shampoo",
    "skincare":      "02-fmcg/categories/personal-care/skincare/eye-cream",
    # ─── FMCG — Home Care ───
    "detergent":     "02-fmcg/categories/home-care/detergents/liquid-detergent",
    "laundry":       "02-fmcg/categories/home-care/detergents/laundry-powder",
    "dishwashing":   "02-fmcg/categories/home-care/cleaners/kitchen-cleaner",
    "liquid":        "02-fmcg/categories/home-care/detergents/liquid-detergent",
    "cleaner":       "02-fmcg/categories/home-care/cleaners/floor-cleaner",
    # ─── Broad category fallbacks (catalog keywords like 'men', 'women', 'kids') ───
    "men":           "01-apparels/categories/apparel/mens-wear/shirts",
    "women":         "01-apparels/categories/apparel/womens-wear/dresses",
    "kids":          "01-apparels/categories/apparel/kids-wear/girls/tops",
    "ladies":        "01-apparels/categories/apparel/womens-wear/dresses",
    "baby":          "01-apparels/categories/apparel/baby/infant/sets",
    "teen":          "01-apparels/categories/apparel/teens/girls-teens/tops",
    "textiles":      "01-apparels/categories/home-textiles/bed-linen/sheets",
    "home":          "01-apparels/categories/home-textiles/bed-linen/sheets",
    # Apparel item synonyms missing
    "socks":         "01-apparels/categories/apparel/mens-wear/knitwear",
    "cardigan":      "01-apparels/categories/apparel/mens-wear/knitwear",
    "pack":          "01-apparels/categories/apparel/mens-wear/shirts",
    "shirts":        "01-apparels/categories/apparel/mens-wear/shirts",
    "fashion":       "01-apparels/categories/apparel/womens-wear/dresses",
    "sportswear":    "01-apparels/categories/apparel/mens-wear/knitwear",
    "technical":     "01-apparels/categories/apparel/mens-wear/knitwear",
    # FMCG broad
    "fmcg":          "02-fmcg/categories/food/dairy/cheese",
    "food":          "02-fmcg/categories/food/dairy/cheese",
    "beverage":      "02-fmcg/categories/food/beverages/non-carbonated/fruit-juice",
    "personal":      "02-fmcg/categories/personal-care/hygiene/soaps",
    "care":          "02-fmcg/categories/personal-care/hygiene/soaps",
    "hygiene":       "02-fmcg/categories/personal-care/hygiene/soaps",
    "haircare":      "02-fmcg/categories/personal-care/haircare/shampoo",
    "skincare":      "02-fmcg/categories/personal-care/skincare/eye-cream",
    "cosmetics":     "02-fmcg/categories/personal-care/skincare/eye-cream",
    "homecare":      "02-fmcg/categories/home-care/cleaners/floor-cleaner",
    "home-care":     "02-fmcg/categories/home-care/cleaners/floor-cleaner",
    "paper":         "02-fmcg/categories/personal-care/hygiene/soaps",
    "tools":         "02-fmcg/categories/home-care/cleaners/floor-cleaner",
    # Home textiles synonyms
    "bed":           "01-apparels/categories/home-textiles/bed-linen/sheets",
    "bath":          "01-apparels/categories/home-textiles/bath-linen/bathrobes",
    "linen":         "01-apparels/categories/home-textiles/bed-linen/sheets",
    "sheet":         "01-apparels/categories/home-textiles/bed-linen/sheets",
    "duvet":         "01-apparels/categories/home-textiles/bed-linen/duvets",
    # FMCG misc product keywords
    "cookie":        "02-fmcg/categories/bakery/biscuits-and-cookies",
    "biscuit":       "02-fmcg/categories/bakery/biscuits-and-cookies",
    "wafer":         "02-fmcg/categories/bakery/biscuits-and-cookies",
    "pastry":        "02-fmcg/categories/bakery/biscuits-and-cookies",
    "cake":          "02-fmcg/categories/bakery/biscuits-and-cookies",
    # ─── Commodities ───
    "commodities":   "03-commodities/categories/metals/copper/cathode",
    "commodity":     "03-commodities/categories/metals/copper/cathode",
    "agri":          "03-commodities/categories/agri/wheat/durum",
    "energy":        "03-commodities/categories/energy/crude-oil/brent",
    "softs":         "03-commodities/categories/softs/coffee/arabica",
    "metals":        "03-commodities/categories/metals/copper/cathode",
    "metal":         "03-commodities/categories/metals/copper/cathode",
    "wti":           "03-commodities/categories/energy/crude-oil/wti",
    "brent":         "03-commodities/categories/energy/crude-oil/brent",
    "lng":           "03-commodities/categories/energy/lng/spot",
    "lpg":           "03-commodities/categories/energy/natural-gas/lpg",
    "natural-gas":   "03-commodities/categories/energy/natural-gas/pipeline",
    "wheat":         "03-commodities/categories/agri/wheat/durum",
    "rice":          "03-commodities/categories/agri/rice/basmati",
    "corn":          "03-commodities/categories/agri/corn/yellow",
    "soybean":       "03-commodities/categories/agri/soybeans/non-gmo",
    "soybeans":      "03-commodities/categories/agri/soybeans/non-gmo",
    "sugar":         "03-commodities/categories/softs/sugar/raw",
    "cocoa":         "03-commodities/categories/softs/cocoa/beans",
    "coffee":        "03-commodities/categories/softs/coffee/arabica",
    "cotton":        "03-commodities/categories/softs/cotton/upland",
    "steel":         "03-commodities/categories/metals/steel/rebar",
    "copper":        "03-commodities/categories/metals/copper/cathode",
    "aluminum":      "03-commodities/categories/metals/aluminum/ingot",
    "aluminium":     "03-commodities/categories/metals/aluminum/ingot",
    # ─── Industrial ───
    "industrial":    "04-industrial/categories/safety/ppe/helmets",
    "chemicals":     "04-industrial/categories/chemicals/polymers/abs",
    "chemical":      "04-industrial/categories/chemicals/polymers/abs",
    "polymers":      "04-industrial/categories/chemicals/polymers/abs",
    "acids":         "04-industrial/categories/chemicals/acids/acetic",
    "solvents":      "04-industrial/categories/chemicals/solvents/acetone",
    "machinery":     "04-industrial/categories/safety/ppe/helmets",
    "machine":       "04-industrial/categories/safety/ppe/helmets",
    "safety":        "04-industrial/categories/safety/ppe/helmets",
    "ppe":           "04-industrial/categories/safety/ppe/helmets",
    "helmet":        "04-industrial/categories/safety/ppe/helmets",
    "mro":           "04-industrial/categories/safety/ppe/helmets",
    "bearings":      "04-industrial/categories/safety/ppe/helmets",
    "lockout":       "04-industrial/categories/safety/lockout/valve-locks",
    "fire":          "04-industrial/categories/safety/fire/extinguishers",
    "extinguisher":  "04-industrial/categories/safety/fire/extinguishers",
    # ─── Minerals ───
    "minerals":      "03-commodities/categories/metals/copper/cathode",
    "mineral":       "03-commodities/categories/metals/copper/cathode",
    "iron":          "03-commodities/categories/metals/steel/rebar",
    "ore":           "03-commodities/categories/metals/copper/cathode",
    "mining":        "03-commodities/categories/metals/copper/cathode",
    "coal":          "03-commodities/categories/energy/crude-oil/brent",
    "uranium":       "03-commodities/categories/energy/crude-oil/brent",
    "lithium":       "03-commodities/categories/metals/copper/cathode",
    "precious":      "03-commodities/categories/metals/copper/cathode",
    "gold":          "03-commodities/categories/metals/copper/cathode",
    "silver":        "03-commodities/categories/metals/aluminum/ingot",
    "platinum":      "03-commodities/categories/metals/aluminum/ingot",
    "sand":          "03-commodities/categories/agri/wheat/durum",
    "gravel":        "03-commodities/categories/metals/steel/rebar",
    "limestone":     "03-commodities/categories/metals/steel/rebar",
    "zinc":          "03-commodities/categories/metals/aluminum/ingot",
    "nickel":        "03-commodities/categories/metals/copper/cathode",
    "battery":       "03-commodities/categories/metals/copper/cathode",
    # ─── Oil & Gas ───
    "oil-gas":       "03-commodities/categories/energy/crude-oil/brent",
    "oil":           "03-commodities/categories/energy/crude-oil/brent",
    "gas":           "03-commodities/categories/energy/natural-gas/pipeline",
    "upstream":      "03-commodities/categories/energy/crude-oil/brent",
    "midstream":     "03-commodities/categories/energy/natural-gas/pipeline",
    "downstream":    "03-commodities/categories/energy/crude-oil/brent",
    "exploration":   "03-commodities/categories/energy/crude-oil/brent",
    "drilling":      "03-commodities/categories/energy/crude-oil/brent",
    "osv":           "03-commodities/categories/energy/lng/spot",
    "pipeline":      "03-commodities/categories/energy/natural-gas/pipeline",
    "pipelines":     "03-commodities/categories/energy/natural-gas/pipeline",
    "refining":      "03-commodities/categories/energy/crude-oil/brent",
    "refinery":      "03-commodities/categories/energy/crude-oil/brent",
    "tanker":        "03-commodities/categories/energy/lng/spot",
    "ship":          "03-commodities/categories/energy/lng/spot",
    "terminal":      "03-commodities/categories/energy/lng/spot",
    "terminals":     "03-commodities/categories/energy/lng/spot",
    "storage":       "03-commodities/categories/energy/lng/spot",
    "trading":       "03-commodities/categories/metals/copper/cathode",
    "distribution":  "03-commodities/categories/energy/lng/spot",
    "petroleum":     "03-commodities/categories/energy/crude-oil/brent",
    "epc":           "04-industrial/categories/safety/ppe/helmets",
    "hse":           "04-industrial/categories/safety/ppe/helmets",
    "inspection":    "04-industrial/categories/safety/ppe/helmets",
    "fuel":          "03-commodities/categories/energy/crude-oil/brent",
    "truck":         "03-commodities/categories/energy/lng/spot",
    "rig":           "03-commodities/categories/energy/crude-oil/brent",
    # ─── Real Estate ───
    "real-estate":   "01-apparels/categories/home-textiles/bed-linen/sheets",
    "office":        "01-apparels/categories/home-textiles/bed-linen/sheets",
    "building":      "01-apparels/categories/home-textiles/bed-linen/sheets",
    "retail":        "01-apparels/categories/home-textiles/bed-linen/sheets",
    "wholesale":     "01-apparels/categories/home-textiles/bed-linen/sheets",
    "commercial":    "01-apparels/categories/home-textiles/bed-linen/sheets",
    "residential":   "01-apparels/categories/home-textiles/bed-linen/sheets",
    "apartments":    "01-apparels/categories/home-textiles/bed-linen/sheets",
    "villas":        "01-apparels/categories/home-textiles/bed-linen/sheets",
    "community":     "01-apparels/categories/home-textiles/bed-linen/sheets",
    "warehouses":    "01-apparels/categories/home-textiles/bed-linen/sheets",
    "parks":         "01-apparels/categories/home-textiles/bed-linen/sheets",
    "sez":           "01-apparels/categories/home-textiles/bed-linen/sheets",
    "fm":            "01-apparels/categories/home-textiles/bed-linen/sheets",
    "leasing":       "01-apparels/categories/home-textiles/bed-linen/sheets",
    "advisory":      "01-apparels/categories/home-textiles/bed-linen/sheets",
    "construction":  "04-industrial/categories/safety/ppe/helmets",
    "mall":          "01-apparels/categories/home-textiles/bed-linen/sheets",
    "logistics":     "03-commodities/categories/energy/lng/spot",
    # ─── Sourcing ───
    "sourcing":      "02-fmcg/categories/food/dairy/cheese",
    "supplier":      "02-fmcg/categories/food/dairy/cheese",
    "vetting":       "02-fmcg/categories/food/dairy/cheese",
    "negotiation":   "02-fmcg/categories/food/dairy/cheese",
    "quality":       "02-fmcg/categories/food/dairy/cheese",
    "inspections":   "04-industrial/categories/safety/ppe/helmets",
    "audits":        "02-fmcg/categories/food/dairy/cheese",
    "testing":       "04-industrial/categories/safety/ppe/helmets",
    "freight":       "03-commodities/categories/energy/lng/spot",
    "customs":       "02-fmcg/categories/food/dairy/cheese",
    "warehousing":   "03-commodities/categories/energy/lng/spot",
    "consulting":    "02-fmcg/categories/food/dairy/cheese",
    "strategy":      "02-fmcg/categories/food/dairy/cheese",
    "optimization":  "02-fmcg/categories/food/dairy/cheese",
    "risk":          "02-fmcg/categories/food/dairy/cheese",
    "label":         "02-fmcg/categories/food/dairy/cheese",
    "brand":         "02-fmcg/categories/food/dairy/cheese",
    "design":        "02-fmcg/categories/food/dairy/cheese",
    "cargo":         "03-commodities/categories/energy/lng/spot",
    "manufacturing": "04-industrial/categories/safety/ppe/helmets",
    "sustainable":   "02-fmcg/categories/food/dairy/cheese",
    "eco":           "02-fmcg/categories/food/dairy/cheese",
    "green":         "02-fmcg/categories/food/dairy/cheese",
    "government":    "02-fmcg/categories/food/dairy/cheese",
    "infrastructure": "04-industrial/categories/safety/ppe/helmets",
    # ─── Finance ───
    "finance":       "02-fmcg/categories/food/dairy/cheese",
    "lc":            "02-fmcg/categories/food/dairy/cheese",
    "sblc":          "02-fmcg/categories/food/dairy/cheese",
    "forfaiting":    "02-fmcg/categories/food/dairy/cheese",
    "hpay":          "02-fmcg/categories/food/dairy/cheese",
    "wallet":        "02-fmcg/categories/food/dairy/cheese",
    "wallets":       "02-fmcg/categories/food/dairy/cheese",
    "payments":      "02-fmcg/categories/food/dairy/cheese",
    "gateway":       "02-fmcg/categories/food/dairy/cheese",
    "invoicing":     "02-fmcg/categories/food/dairy/cheese",
    "invoice":       "02-fmcg/categories/food/dairy/cheese",
    "bills":         "02-fmcg/categories/food/dairy/cheese",
    "reconciliation":"02-fmcg/categories/food/dairy/cheese",
    "reports":       "02-fmcg/categories/food/dairy/cheese",
    "kyc":           "02-fmcg/categories/food/dairy/cheese",
    "aml":           "02-fmcg/categories/food/dairy/cheese",
    "scoring":       "02-fmcg/categories/food/dairy/cheese",
    "bank":          "02-fmcg/categories/food/dairy/cheese",
    "banking":       "02-fmcg/categories/food/dairy/cheese",
    "compliance":    "02-fmcg/categories/food/dairy/cheese",
    "analytics":     "02-fmcg/categories/food/dairy/cheese",
    # ─── AI & Tech ───
    "ai":            "02-fmcg/categories/food/dairy/cheese",
    "tech":          "02-fmcg/categories/food/dairy/cheese",
    "technology":    "02-fmcg/categories/food/dairy/cheese",
    "solutions":     "02-fmcg/categories/food/dairy/cheese",
    "forecasting":   "02-fmcg/categories/food/dairy/cheese",
    "vision":        "02-fmcg/categories/food/dairy/cheese",
    "chat":          "02-fmcg/categories/food/dairy/cheese",
    "nlp":           "02-fmcg/categories/food/dairy/cheese",
    "generative":    "02-fmcg/categories/food/dairy/cheese",
    "prediction":    "02-fmcg/categories/food/dairy/cheese",
    "data":          "02-fmcg/categories/food/dairy/cheese",
    "pipelines":     "02-fmcg/categories/food/dairy/cheese",
    "apis":          "02-fmcg/categories/food/dairy/cheese",
    "api":           "02-fmcg/categories/food/dairy/cheese",
    "integration":   "02-fmcg/categories/food/dairy/cheese",
    "erp":           "02-fmcg/categories/food/dairy/cheese",
    "e-commerce":    "02-fmcg/categories/food/dairy/cheese",
    "mobile":        "02-fmcg/categories/food/dairy/cheese",
    "support":       "02-fmcg/categories/food/dairy/cheese",
    "slas":          "02-fmcg/categories/food/dairy/cheese",
    "training":      "02-fmcg/categories/food/dairy/cheese",
    "docs":          "02-fmcg/categories/food/dairy/cheese",
    "blockchain":    "02-fmcg/categories/food/dairy/cheese",
    "ar-vr":         "02-fmcg/categories/food/dairy/cheese",
    "iot":           "02-fmcg/categories/food/dairy/cheese",
    "5g":            "02-fmcg/categories/food/dairy/cheese",
    # Protein/agri overlap
    "beef":          "02-fmcg/categories/food/meat-seafood/beef",
    "chicken":       "02-fmcg/categories/food/meat-seafood/chicken",
    "fish":          "02-fmcg/categories/food/meat-seafood/fish",
    "lamb":          "02-fmcg/categories/food/meat-seafood/lamb",
    "pork":          "02-fmcg/categories/food/meat-seafood/pork",
    "seafood":       "02-fmcg/categories/food/meat-seafood/shrimp",
    "meat":          "02-fmcg/categories/food/meat-seafood/beef",
    "poultry":       "02-fmcg/categories/food/meat-seafood/chicken",
}


def find_leaf_paths():
    """Return dict: relative-leaf-path-no-leafjpg -> public URL."""
    paths = {}
    for dp, _, files in os.walk(ROOT):
        if LEAF in files:
            rel = os.path.relpath(dp, ROOT)             # e.g. 01-apparels/categories/.../X
            url = f"/assets/verticals/{rel}/{LEAF}"
            paths[rel.replace(os.sep, "/")] = url
    return paths


def main():
    leaves = find_leaf_paths()
    print(f"Found {len(leaves)} leaf images")

    # All 10 verticals now have curated leaf.jpg images (FMCG + Apparels were
    # generated first; the others were generated with single-image-per-leaf
    # placeholders that are still relevant to their category, so including them
    # is safe.) The earlier fuzzy-substring matching has been removed, so we no
    # longer have the 'rock matches anything containing rock' bug.
    SAFE_VERTICALS = ("01-apparels/", "02-fmcg/", "03-commodities/", "04-industrial/",
                      "05-minerals/", "06-oil-gas/", "07-real-estate/", "08-sourcing/",
                      "09-finance/", "10-ai-tech/")
    safe_leaves = {rel: url for rel, url in leaves.items() if rel.startswith(SAFE_VERTICALS)}

    # Build keyword -> URL map
    keyword_to_url = {}

    # 1a. Each leaf folder name (last segment) becomes a keyword
    for rel, url in safe_leaves.items():
        leaf_name = rel.split("/")[-1].lower()
        keyword_to_url.setdefault(leaf_name, url)

    # 1b. ALSO register every PARENT folder name as a keyword pointing at the
    #     first leaf found below it. This handles URL slugs that hit an
    #     intermediate level (e.g. `/fmcg/personal-care/hygiene` where 'hygiene'
    #     is a category bucket, not a leaf).
    for rel, url in safe_leaves.items():
        segs = rel.split("/")
        # skip the vertical root (segs[0]) and 'categories' (segs[1])
        # last segment is the leaf itself — already handled in 1a
        for seg in segs[2:-1]:
            keyword_to_url.setdefault(seg.lower(), url)

    # 1c. Composite slug keys (e.g. 'personal-care', 'home-care', 'mens-wear')
    #     are already produced by 1b when the folder is named that way.

    # 2. Apply manual synonyms — these can point at ANY vertical so we look
    #    up against the full `leaves` map, not just safe_leaves.
    missing = []
    for kw, rel_path in SYNONYMS_TO_PATHS.items():
        if rel_path in leaves:
            keyword_to_url[kw] = leaves[rel_path]
        else:
            missing.append((kw, rel_path))

    if missing:
        print(f"WARNING — {len(missing)} synonym paths do NOT exist (those keywords will fall back to Unsplash):")
        for kw, p in missing[:30]:
            print(f"   {kw:18}  →  {p}")
        if len(missing) > 30:
            print(f"   ... +{len(missing) - 30} more")

    print(f"Built {len(keyword_to_url)} keyword mappings")

    # Sort for stable diffs
    items = sorted(keyword_to_url.items())

    body_lines = ["// AUTO-GENERATED by scripts/build_leaf_image_map.py — do not edit by hand.",
                  "// Maps catalog keyword (lowercase) -> public URL of a leaf.jpg.",
                  "",
                  "export const LEAF_IMAGE_MAP: Record<string, string> = {"]
    for k, v in items:
        # JSON-encode key to handle anything weird
        body_lines.append(f"  {json.dumps(k)}: {json.dumps(v)},")
    body_lines.append("};")
    body_lines.append("")
    body_lines.append("export function getLeafImage(keywords?: string): string | null {")
    body_lines.append("  if (!keywords) return null;")
    body_lines.append("  // Split on commas, spaces and slashes so 'Mens Wear', 'mens-wear', 'suit,men' all work.")
    body_lines.append("  const tokens = keywords.toLowerCase().split(/[\\s,\\/]+/).map(k => k.trim()).filter(Boolean);")
    body_lines.append("  // 1. Try whole string (after lowercase + dash normalisation) as one key.")
    body_lines.append("  const whole = keywords.toLowerCase().trim().replace(/\\s+/g, '-');")
    body_lines.append("  if (LEAF_IMAGE_MAP[whole]) return LEAF_IMAGE_MAP[whole];")
    body_lines.append("  // 2. EXACT token matches only.")
    body_lines.append("  for (const key of tokens) if (LEAF_IMAGE_MAP[key]) return LEAF_IMAGE_MAP[key];")
    body_lines.append("  return null;")
    body_lines.append("}")
    body_lines.append("")

    with open(OUT, "w") as f:
        f.write("\n".join(body_lines))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
