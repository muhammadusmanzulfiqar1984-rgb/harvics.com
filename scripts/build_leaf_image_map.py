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
    "metal":         "05-minerals/categories/metals/aluminum/ingot",
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
    "copper":        "05-minerals/categories/metals/copper/ore",
    "aluminum":      "05-minerals/categories/metals/aluminum/ingot",
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
    "iron":          "05-minerals/categories/metals/iron-ore/lumps",
    "ore":           "05-minerals/categories/metals/iron-ore/lumps",
    "mining":        "05-minerals/categories/metals/iron-ore/lumps",
    "coal":          "05-minerals/categories/energy/coal/thermal",
    "uranium":       "05-minerals/categories/energy/uranium/ore",
    "lithium":       "05-minerals/categories/energy/lithium/carbonate",
    "precious":      "03-commodities/categories/metals/copper/cathode",
    "gold":          "05-minerals/categories/precious/gold/bullion",
    "silver":        "05-minerals/categories/precious/silver/bullion",
    "platinum":      "05-minerals/categories/precious/platinum/ingot",
    "sand":          "05-minerals/categories/industrial/sand/construction",
    "gravel":        "05-minerals/categories/industrial/gravel/crushed",
    "limestone":     "05-minerals/categories/industrial/limestone/construction",
    "zinc":          "05-minerals/categories/metals/zinc/concentrate",
    "nickel":        "03-commodities/categories/metals/copper/cathode",
    "battery":       "03-commodities/categories/metals/copper/cathode",
    # ─── Oil & Gas ───
    "oil-gas":       "03-commodities/categories/energy/crude-oil/brent",
    "oil":           "03-commodities/categories/energy/crude-oil/brent",
    "gas":           "03-commodities/categories/energy/natural-gas/pipeline",
    "upstream":      "03-commodities/categories/energy/crude-oil/brent",
    "midstream":     "03-commodities/categories/energy/natural-gas/pipeline",
    "downstream":    "03-commodities/categories/energy/crude-oil/brent",
    "exploration":   "06-oil-gas/categories/upstream/exploration/seismic",
    "drilling":      "06-oil-gas/categories/services/drilling/onshore-rigs",
    "osv":           "06-oil-gas/categories/midstream/transport/tanker",
    "pipeline":      "06-oil-gas/categories/midstream/transport/pipeline",
    "pipelines":     "03-commodities/categories/energy/natural-gas/pipeline",
    "refining":      "03-commodities/categories/energy/crude-oil/brent",
    "refinery":      "06-oil-gas/categories/downstream/refining/distillation",
    "tanker":        "06-oil-gas/categories/midstream/transport/tanker",
    "ship":          "03-commodities/categories/energy/lng/spot",
    "terminal":      "03-commodities/categories/energy/lng/spot",
    "terminals":     "03-commodities/categories/energy/lng/spot",
    "storage":       "06-oil-gas/categories/midstream/storage/tank-farm",
    "trading":       "03-commodities/categories/metals/copper/cathode",
    "distribution":  "06-oil-gas/categories/midstream/transport/truck",
    "petroleum":     "03-commodities/categories/energy/crude-oil/brent",
    "epc":           "06-oil-gas/categories/services/maintenance/turnaround",
    "hse":           "06-oil-gas/categories/services/maintenance/inspection",
    "inspection":    "06-oil-gas/categories/services/maintenance/inspection",
    "fuel":          "06-oil-gas/categories/downstream/retail/diesel",
    "truck":         "03-commodities/categories/energy/lng/spot",
    "rig":           "06-oil-gas/categories/services/drilling/offshore-rigs",
    # ─── Real Estate ───
    "real-estate":   "07-real-estate/categories/commercial/office/grade-a",
    "office":        "07-real-estate/categories/commercial/office/grade-a",
    "building":      "07-real-estate/categories/commercial/office/grade-a",
    "retail":        "07-real-estate/categories/commercial/retail/anchor",
    "wholesale":     "07-real-estate/categories/commercial/retail/anchor",
    "commercial":    "07-real-estate/categories/commercial/office/grade-a",
    "residential":   "07-real-estate/categories/residential/apartments/2-bed",
    "apartments":    "07-real-estate/categories/residential/apartments/2-bed",
    "villas":        "07-real-estate/categories/residential/villas/detached",
    "community":     "07-real-estate/categories/residential/condos/affordable",
    "warehouses":    "07-real-estate/categories/industrial-re/warehouse/bonded",
    "parks":         "07-real-estate/categories/industrial-re/manufacturing/automotive",
    "sez":           "07-real-estate/categories/industrial-re/manufacturing/heavy",
    "fm":            "07-real-estate/categories/commercial/office/business-park",
    "leasing":       "07-real-estate/categories/commercial/office/grade-a",
    "advisory":      "07-real-estate/categories/commercial/office/headquarters",
    "construction":  "04-industrial/categories/safety/ppe/helmets",
    "mall":          "07-real-estate/categories/commercial/retail/anchor",
    "logistics":     "08-sourcing/categories/services/logistics/freight-forward",
    # ─── Sourcing ───
    "sourcing":      "08-sourcing/categories/services/supplier-discovery/vetting",
    "supplier":      "08-sourcing/categories/services/supplier-discovery/vetting",
    "vetting":       "08-sourcing/categories/services/supplier-discovery/vetting",
    "negotiation":   "08-sourcing/categories/services/supplier-discovery/rfq",
    "rfq":           "08-sourcing/categories/services/supplier-discovery/rfq",
    "sample":        "08-sourcing/categories/services/supplier-discovery/sample",
    "quality":       "08-sourcing/categories/services/quality-control/lab-test",
    "quality-control":"08-sourcing/categories/services/quality-control/lab-test",
    "inspections":   "08-sourcing/categories/services/quality-control/in-line",
    "in-line":       "08-sourcing/categories/services/quality-control/in-line",
    "lab-test":      "08-sourcing/categories/services/quality-control/lab-test",
    "pre-shipment":  "08-sourcing/categories/services/quality-control/pre-shipment",
    "audits":        "08-sourcing/categories/services/supplier-discovery/audit",
    "testing":       "08-sourcing/categories/services/quality-control/lab-test",
    "freight":       "08-sourcing/categories/services/logistics/freight-forward",
    "freight-forward":"08-sourcing/categories/services/logistics/freight-forward",
    "customs":       "08-sourcing/categories/services/logistics/customs",
    "warehousing":   "08-sourcing/categories/services/logistics/warehousing",
    "last-mile":     "08-sourcing/categories/services/logistics/last-mile",
    "consulting":    "08-sourcing/categories/services/supplier-discovery/audit",
    "strategy":      "08-sourcing/categories/services/supplier-discovery/audit",
    "optimization":  "10-ai-tech/categories/emerging/quantum/optimization",
    "risk":          "10-ai-tech/categories/ai-services/prediction/fraud",
    "label":         "08-sourcing/categories/services/quality-control/certification",
    "certification": "08-sourcing/categories/services/quality-control/certification",
    "brand":         "08-sourcing/categories/categories/textile-sourcing/garment",
    "design":        "01-apparels/categories/apparel/womens-wear/dresses",
    "cargo":         "08-sourcing/categories/services/logistics/freight-forward",
    "manufacturing": "08-sourcing/categories/categories/industrial-sourcing/machinery",
    "sustainable":   "08-sourcing/categories/services/quality-control/certification",
    "eco":           "08-sourcing/categories/services/quality-control/certification",
    "green":         "08-sourcing/categories/services/quality-control/certification",
    "government":    "08-sourcing/categories/services/supplier-discovery/audit",
    "infrastructure":"10-ai-tech/categories/infrastructure/cloud/compute",
    # ─── Finance ───
    "finance":       "09-finance/categories/banking/corporate/term-loans",
    "lc":            "09-finance/categories/banking/corporate/trade-finance",
    "sblc":          "09-finance/categories/banking/corporate/trade-finance",
    "letter-of-credit":"09-finance/categories/banking/corporate/trade-finance",
    "trade-finance": "09-finance/categories/banking/corporate/trade-finance",
    "forfaiting":    "09-finance/categories/banking/corporate/trade-finance",
    "factoring":     "09-finance/categories/banking/corporate/working-capital",
    "escrow":        "09-finance/categories/hpay/settlement/escrow",
    "hpay":          "09-finance/categories/hpay/wallet/consumer",
    "wallet":        "09-finance/categories/hpay/wallet/consumer",
    "wallets":       "09-finance/categories/hpay/wallet/consumer",
    "digital":       "09-finance/categories/hpay/wallet/consumer",
    "consumer":      "09-finance/categories/hpay/wallet/consumer",
    "merchant":      "09-finance/categories/hpay/wallet/merchant",
    "payments":      "09-finance/categories/hpay/settlement/b2b",
    "settlement":    "09-finance/categories/hpay/settlement/b2b",
    "transfer":      "09-finance/categories/hpay/transfers/cross-border",
    "transfers":     "09-finance/categories/hpay/transfers/cross-border",
    "cross-border":  "09-finance/categories/hpay/transfers/cross-border",
    "domestic":      "09-finance/categories/hpay/transfers/domestic",
    "instant":       "09-finance/categories/hpay/transfers/instant",
    "gateway":       "09-finance/categories/hpay/settlement/b2b",
    "invoicing":     "09-finance/categories/banking/corporate/working-capital",
    "invoice":       "09-finance/categories/banking/corporate/working-capital",
    "bills":         "09-finance/categories/banking/corporate/working-capital",
    "reconciliation":"09-finance/categories/hpay/settlement/reconciliation",
    "reports":       "09-finance/categories/banking/corporate/cash-mgmt",
    "kyc":           "09-finance/categories/banking/retail/personal-loans",
    "aml":           "09-finance/categories/banking/retail/personal-loans",
    "scoring":       "09-finance/categories/banking/retail/personal-loans",
    "fraud":         "10-ai-tech/categories/ai-services/prediction/fraud",
    "bank":          "09-finance/categories/banking/retail/deposits",
    "banking":       "09-finance/categories/banking/retail/deposits",
    "deposits":      "09-finance/categories/banking/retail/deposits",
    "mortgage":      "09-finance/categories/banking/retail/mortgages",
    "mortgages":     "09-finance/categories/banking/retail/mortgages",
    "loan":          "09-finance/categories/banking/retail/personal-loans",
    "loans":         "09-finance/categories/banking/retail/personal-loans",
    "personal-loans":"09-finance/categories/banking/retail/personal-loans",
    "term-loans":    "09-finance/categories/banking/corporate/term-loans",
    "working-capital":"09-finance/categories/banking/corporate/working-capital",
    "cash-mgmt":     "09-finance/categories/banking/corporate/cash-mgmt",
    "ipo":           "09-finance/categories/capital-markets/equity/ipo",
    "m-and-a":       "09-finance/categories/advisory/corporate/m-and-a",
    "restructuring": "09-finance/categories/advisory/corporate/restructuring",
    "valuation":     "09-finance/categories/advisory/corporate/valuation",
    "estate":        "09-finance/categories/advisory/wealth/estate",
    "family-office": "09-finance/categories/advisory/wealth/family-office",
    "portfolio":     "09-finance/categories/advisory/wealth/portfolio",
    "private-banking":"09-finance/categories/advisory/wealth/private-banking",
    "wealth":        "09-finance/categories/advisory/wealth/portfolio",
    "islamic":       "09-finance/categories/banking/islamic/sukuk",
    "ijara":         "09-finance/categories/banking/islamic/ijara",
    "murabaha":      "09-finance/categories/banking/islamic/murabaha",
    "sukuk":         "09-finance/categories/banking/islamic/sukuk",
    "takaful":       "09-finance/categories/banking/islamic/takaful",
    "sharia":        "09-finance/categories/banking/islamic/sukuk",
    "compliance":    "09-finance/categories/banking/retail/personal-loans",
    "bonds":         "09-finance/categories/capital-markets/debt/bonds",
    "commercial-paper":"09-finance/categories/capital-markets/debt/commercial-paper",
    "notes":         "09-finance/categories/capital-markets/debt/notes",
    "derivatives":   "09-finance/categories/capital-markets/derivatives/equity",
    "equity":        "09-finance/categories/capital-markets/equity/listed",
    "fx":            "09-finance/categories/capital-markets/derivatives/fx",
    "interest-rate": "09-finance/categories/capital-markets/derivatives/interest-rate",
    "btc":           "09-finance/categories/hpay/crypto/btc",
    "eth":           "09-finance/categories/hpay/crypto/eth",
    "stablecoin":    "09-finance/categories/hpay/crypto/stablecoin",
    "crypto":        "09-finance/categories/hpay/crypto/btc",
    "harvicoin":     "09-finance/categories/hpay/crypto/harvicoin",
    "cards":         "09-finance/categories/banking/retail/cards",
    "credit-card":   "09-finance/categories/banking/retail/cards",
    "agent":         "09-finance/categories/hpay/wallet/agent",
    "business":      "09-finance/categories/hpay/wallet/business",
    # ─── AI & Tech ───
    "ai":            "10-ai-tech/categories/ai-services/prediction/fraud",
    "ai-services":   "10-ai-tech/categories/ai-services/prediction/fraud",
    "tech":          "10-ai-tech/categories/infrastructure/cloud/compute",
    "technology":    "10-ai-tech/categories/infrastructure/cloud/compute",
    "solutions":     "10-ai-tech/categories/platforms/saas/horizontal",
    "forecasting":   "10-ai-tech/categories/ai-services/prediction/demand",
    "demand":        "10-ai-tech/categories/ai-services/prediction/demand",
    "churn":         "10-ai-tech/categories/ai-services/prediction/churn",
    "price":         "10-ai-tech/categories/ai-services/prediction/price",
    "vision":        "10-ai-tech/categories/ai-services/vision/object-detection",
    "object-detection":"10-ai-tech/categories/ai-services/vision/object-detection",
    "ocr":           "10-ai-tech/categories/ai-services/vision/ocr",
    "face":          "10-ai-tech/categories/ai-services/vision/face",
    "scene":         "10-ai-tech/categories/ai-services/vision/scene",
    "computer-vision":"10-ai-tech/categories/ai-services/vision/object-detection",
    "chat":          "10-ai-tech/categories/ai-services/nlp/chatbot",
    "chatbot":       "10-ai-tech/categories/ai-services/nlp/chatbot",
    "nlp":           "10-ai-tech/categories/ai-services/nlp/chatbot",
    "translation":   "10-ai-tech/categories/ai-services/nlp/translation",
    "summarization": "10-ai-tech/categories/ai-services/nlp/summarization",
    "sentiment":     "10-ai-tech/categories/ai-services/nlp/sentiment",
    "generative":    "10-ai-tech/categories/ai-services/generative/text",
    "image-gen":     "10-ai-tech/categories/ai-services/generative/image",
    "video-gen":     "10-ai-tech/categories/ai-services/generative/video",
    "voice-gen":     "10-ai-tech/categories/ai-services/generative/voice",
    "prediction":    "10-ai-tech/categories/ai-services/prediction/demand",
    "data":          "10-ai-tech/categories/platforms/data-platform/warehouse",
    "data-warehouse":"10-ai-tech/categories/platforms/data-platform/warehouse",
    "data-lake":     "10-ai-tech/categories/platforms/data-platform/lake",
    "ingestion":     "10-ai-tech/categories/platforms/data-platform/ingestion",
    "governance":    "10-ai-tech/categories/platforms/data-platform/governance",
    "pipelines":     "10-ai-tech/categories/platforms/data-platform/ingestion",
    "apis":          "10-ai-tech/categories/platforms/saas/horizontal",
    "api":           "10-ai-tech/categories/platforms/saas/horizontal",
    "integration":   "10-ai-tech/categories/platforms/erp-os/crm",
    "erp":           "10-ai-tech/categories/platforms/erp-os/finance",
    "crm":           "10-ai-tech/categories/platforms/erp-os/crm",
    "hr":            "10-ai-tech/categories/platforms/erp-os/hr",
    "scm":           "10-ai-tech/categories/platforms/erp-os/scm",
    "saas":          "10-ai-tech/categories/platforms/saas/horizontal",
    "horizontal":    "10-ai-tech/categories/platforms/saas/horizontal",
    "vertical-saas": "10-ai-tech/categories/platforms/saas/vertical",
    "e-commerce":    "10-ai-tech/categories/platforms/saas/b2c",
    "mobile":        "10-ai-tech/categories/platforms/saas/b2c",
    "support":       "10-ai-tech/categories/ai-services/nlp/chatbot",
    "slas":          "10-ai-tech/categories/platforms/saas/horizontal",
    "docs":          "10-ai-tech/categories/ai-services/nlp/summarization",
    "analytics":     "10-ai-tech/categories/platforms/saas/b2b",
    "blockchain":    "10-ai-tech/categories/emerging/blockchain/contracts",
    "smart-contracts":"10-ai-tech/categories/emerging/blockchain/contracts",
    "identity":      "10-ai-tech/categories/emerging/blockchain/identity",
    "supply-chain":  "10-ai-tech/categories/emerging/blockchain/supply-chain",
    "ar-vr":         "10-ai-tech/categories/emerging/ar-vr/gaming",
    "ar":            "10-ai-tech/categories/emerging/ar-vr/gaming",
    "vr":            "10-ai-tech/categories/emerging/ar-vr/gaming",
    "gaming":        "10-ai-tech/categories/emerging/ar-vr/gaming",
    "quantum":       "10-ai-tech/categories/emerging/quantum/cryptography",
    "cryptography":  "10-ai-tech/categories/emerging/quantum/cryptography",
    "simulation":    "10-ai-tech/categories/emerging/quantum/simulation",
    "robotics":      "10-ai-tech/categories/emerging/robotics/manufacturing",
    "iot":           "10-ai-tech/categories/platforms/iot/sensors",
    "sensors":       "10-ai-tech/categories/platforms/iot/sensors",
    "gateways":      "10-ai-tech/categories/platforms/iot/gateways",
    "monitoring":    "10-ai-tech/categories/infrastructure/devops/monitoring",
    "twin":          "10-ai-tech/categories/platforms/iot/twin",
    "5g":            "10-ai-tech/categories/infrastructure/edge/5g",
    "edge":          "10-ai-tech/categories/infrastructure/edge/edge-compute",
    "cdn":           "10-ai-tech/categories/infrastructure/edge/cdn",
    "fog":           "10-ai-tech/categories/infrastructure/edge/fog",
    "cloud":         "10-ai-tech/categories/infrastructure/cloud/compute",
    "compute":       "10-ai-tech/categories/infrastructure/cloud/compute",
    "network":       "10-ai-tech/categories/infrastructure/cloud/network",
    "security":      "10-ai-tech/categories/infrastructure/cloud/security",
    "storage-cloud": "10-ai-tech/categories/infrastructure/cloud/storage",
    "devops":        "10-ai-tech/categories/infrastructure/devops/ci-cd",
    "ci-cd":         "10-ai-tech/categories/infrastructure/devops/ci-cd",
    "observability": "10-ai-tech/categories/infrastructure/devops/observability",
    "sre":           "10-ai-tech/categories/infrastructure/devops/sre",
    "training":      "10-ai-tech/categories/emerging/ar-vr/training",
    "kyc":           "09-finance/categories/banking/retail/personal-loans",
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
