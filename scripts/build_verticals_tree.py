#!/usr/bin/env python3
"""HARVICS verticals — build T2-T4 tree + /videos/ leaf siblings.

Usage:
  python3 build_verticals_tree.py            # dry-run (default)
  python3 build_verticals_tree.py --apply    # actually create / rename
"""
import os, sys, shutil

ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/public/assets/verticals"

# ---------------------------------------------------------------------------
# Full T1 -> T4 tree.  Format: { vertical_dir : { T2 : { T3 : [T4, T4, ...] } } }
# ---------------------------------------------------------------------------
TREE = {
    "01-apparels": {
        "apparel": {
            "mens-wear":   ["shirts","trousers","suits","t-shirts","denim","knitwear","outerwear","ethnic"],
            "ladies-wear": ["tops","dresses","abayas","trousers","knitwear","ethnic","lingerie","outerwear"],
            "kids-wear":   ["boys","girls","infants","toddlers","school-uniforms"],
            "sportswear":  ["activewear","tracksuits","swimwear","performance-tees","sports-bras"],
        },
        "home-textiles": {
            "bed-linen":  ["sheets","duvets","pillowcases","comforters","bedspreads"],
            "bath-linen": ["towels","bathrobes","bath-mats","washcloths"],
            "curtains":   ["blackout","sheer","panel","eyelet","drapes"],
            "kitchen":    ["aprons","tea-towels","oven-mitts","table-cloths","placemats"],
        },
        "fabrics": {
            "cotton":    ["woven","knit","organic","dyed","printed"],
            "polyester": ["woven","knit","fleece","micro-fiber"],
            "blends":    ["poly-cotton","cvc","tc","modal-blend"],
            "denim":     ["raw","washed","stretch","selvedge","recycled"],
        },
        "accessories": {
            "scarves": ["silk","wool","cotton","pashmina","printed"],
            "bags":    ["totes","handbags","backpacks","duffels","clutches"],
            "belts":   ["leather","fabric","woven","designer"],
            "shoes":   ["casual","formal","sports","sandals","boots"],
        },
    },

    "02-fmcg": {
        # food categories already exist directly under categories/ (bakery, beverages, ...)
        # we ADD three new divisions ALONGSIDE them.  Existing folders untouched.
        "personal-care": {
            "skincare":  ["face-wash","moisturizers","sunscreen","serums","masks"],
            "haircare":  ["shampoo","conditioner","oils","color","treatments"],
            "hygiene":   ["soaps","sanitizers","deodorants","oral-care","feminine-care"],
            "cosmetics": ["lipstick","foundation","eye-makeup","nail-polish","fragrance"],
        },
        "home-care": {
            "detergents": ["laundry-powder","liquid","fabric-softener","stain-remover"],
            "cleaners":   ["floor","glass","kitchen","bathroom","disinfectant"],
            "paper":      ["tissue","toilet-paper","kitchen-towel","wipes","napkins"],
            "tools":      ["brooms","mops","brushes","sponges","gloves"],
        },
        "distribution": {
            "retail":    ["supermarket","convenience","specialty","kiosk"],
            "wholesale": ["cash-and-carry","bulk","horeca","b2b"],
            "logistics": ["cold-chain","ambient","last-mile","freight"],
            "storage":   ["warehouse","distribution-center","fulfillment","bonded"],
        },
    },

    "03-commodities": {
        "agri": {
            "wheat":    ["hard-red","soft-white","durum","milling","feed"],
            "rice":     ["basmati","jasmine","long-grain","parboiled","broken"],
            "corn":     ["yellow","white","feed","food-grade","sweet"],
            "soybeans": ["oil-grade","meal-grade","gmo","non-gmo","organic"],
        },
        "energy": {
            "crude-oil":   ["brent","wti","dubai","urals","bonny-light"],
            "natural-gas": ["pipeline","lng","lpg","cng","propane"],
            "lng":         ["contract","spot","long-haul","peak-shaving"],
        },
        "softs": {
            "coffee": ["arabica","robusta","green-bean","instant","specialty"],
            "cocoa":  ["beans","butter","powder","liquor","nibs"],
            "sugar":  ["raw","refined","brown","organic","cane"],
            "cotton": ["upland","pima","organic","recycled","fair-trade"],
        },
        "metals": {
            "steel":    ["hr-coil","cr-coil","rebar","billet","structural"],
            "copper":   ["cathode","scrap","rod","wire","concentrate"],
            "aluminum": ["ingot","billet","sheet","scrap","extrusion"],
        },
    },

    "04-industrial": {
        "chemicals": {
            "polymers": ["pp","pe","pvc","ps","abs","pet"],
            "acids":    ["sulfuric","hydrochloric","nitric","phosphoric","acetic"],
            "solvents": ["acetone","toluene","xylene","methanol","ipa"],
        },
        "machinery": {
            "textile":         ["spinning","weaving","dyeing","finishing","knitting"],
            "food-processing": ["mixers","ovens","fillers","packers","conveyors"],
            "packaging":       ["labelers","palletizers","shrink-wrap","carton-erectors","sealers"],
        },
        "safety": {
            "ppe":     ["helmets","gloves","goggles","masks","footwear"],
            "lockout": ["padlocks","hasps","valve-locks","tags","kits"],
            "fire":    ["extinguishers","alarms","sprinklers","suppressants","doors"],
        },
        "mro": {
            "bearings": ["ball","roller","thrust","needle","linear"],
            "belts":    ["v-belt","timing","flat","ribbed","conveyor"],
            "tools":    ["hand","power","cutting","measuring","electrical"],
        },
    },

    "05-minerals": {
        "metals": {
            "iron-ore": ["hematite","magnetite","pellets","fines","lumps"],
            "copper":   ["concentrate","cathode","ore","refined","scrap"],
            "aluminum": ["bauxite","alumina","ingot","scrap","primary"],
            "zinc":     ["concentrate","slab","dust","oxide","alloy"],
        },
        "energy": {
            "coal":    ["thermal","coking","anthracite","lignite","met-coal"],
            "uranium": ["yellowcake","enriched","depleted","ore","hexafluoride"],
            "lithium": ["carbonate","hydroxide","spodumene","brine","battery-grade"],
        },
        "precious": {
            "gold":     ["bullion","jewelry-grade","scrap","dore","bars"],
            "silver":   ["bullion","industrial","jewelry","scrap","granules"],
            "platinum": ["sponge","ingot","catalyst","jewelry","scrap"],
        },
        "industrial": {
            "sand":      ["silica","frac","construction","foundry","glass"],
            "gravel":    ["crushed","river","pea","drainage","decorative"],
            "limestone": ["high-calcium","dolomitic","agricultural","construction","cement"],
        },
    },

    "06-oil-gas": {
        "upstream": {
            "exploration": ["seismic","drilling","appraisal","geology"],
            "production":  ["onshore","offshore","shale","deepwater"],
        },
        "midstream": {
            "transport": ["pipeline","tanker","rail","truck"],
            "storage":   ["tank-farm","lng-terminal","spr","gas-storage"],
        },
        "downstream": {
            "refining":        ["distillation","cracking","reforming","blending"],
            "petrochemicals":  ["olefins","aromatics","fertilizers","methanol"],
            "retail":          ["gasoline","diesel","lubricants","lpg"],
        },
        "services": {
            "drilling":    ["onshore-rigs","offshore-rigs","directional","completion"],
            "maintenance": ["inspection","turnaround","repair","monitoring"],
        },
    },

    "07-real-estate": {
        "residential": {
            "apartments": ["studio","1-bed","2-bed","3-bed","penthouse"],
            "villas":     ["detached","semi-detached","townhouse","compound","beachfront"],
            "condos":     ["luxury","mid-range","affordable","serviced"],
        },
        "commercial": {
            "office":      ["grade-a","grade-b","coworking","business-park","headquarters"],
            "retail":      ["mall","high-street","strip-mall","kiosk","anchor"],
            "hospitality": ["hotel","resort","serviced-apartments","hostel"],
        },
        "industrial-re": {
            "warehouse":     ["dry","cold","bonded","fulfillment","last-mile"],
            "manufacturing": ["light","heavy","food-grade","chemical","automotive"],
            "logistics":     ["freight-yard","container-yard","distribution-hub"],
        },
        "land": {
            "plots":       ["residential","commercial","agricultural","mixed-use"],
            "development": ["master-planned","township","gated","beachfront"],
        },
    },

    "08-sourcing": {
        "services": {
            "supplier-discovery": ["audit","vetting","rfq","sample"],
            "quality-control":    ["pre-shipment","in-line","lab-test","certification"],
            "logistics":          ["freight-forward","customs","warehousing","last-mile"],
            "trade-finance":      ["lc","ucp600","factoring","escrow"],
        },
        "categories": {
            "textile-sourcing":     ["fabric","garment","accessories","home-textile"],
            "fmcg-sourcing":        ["food","beverage","personal-care","home-care"],
            "industrial-sourcing":  ["machinery","chemicals","mro","safety"],
            "commodity-sourcing":   ["agri","energy","metals","softs"],
        },
        "regions": {
            "asia":        ["china","india","vietnam","bangladesh","pakistan","indonesia"],
            "middle-east": ["uae","saudi","qatar","oman","kuwait"],
            "africa":      ["egypt","kenya","nigeria","south-africa","morocco"],
            "europe":      ["turkey","italy","germany","spain","poland"],
        },
    },

    "09-finance": {
        "banking": {
            "corporate": ["working-capital","term-loans","trade-finance","cash-mgmt"],
            "retail":    ["deposits","mortgages","personal-loans","cards"],
            "islamic":   ["murabaha","ijara","sukuk","takaful"],
        },
        "hpay": {
            "wallet":     ["consumer","merchant","agent","business"],
            "transfers":  ["domestic","cross-border","bulk","instant"],
            "crypto":     ["stablecoin","btc","eth","harvicoin"],
            "settlement": ["b2b","b2c","escrow","reconciliation"],
        },
        "capital-markets": {
            "equity":      ["listed","private","ipo","secondary"],
            "debt":        ["bonds","sukuk","commercial-paper","notes"],
            "derivatives": ["fx","commodity","interest-rate","equity"],
        },
        "advisory": {
            "corporate": ["m-and-a","ipo","restructuring","valuation"],
            "wealth":    ["private-banking","family-office","portfolio","estate"],
        },
    },

    "10-ai-tech": {
        "ai-services": {
            "nlp":        ["chatbot","translation","sentiment","summarization"],
            "vision":     ["ocr","object-detection","face","scene"],
            "prediction": ["demand","price","churn","fraud"],
            "generative": ["text","image","video","voice"],
        },
        "platforms": {
            "erp-os":        ["finance","hr","crm","scm"],
            "data-platform": ["ingestion","warehouse","lake","governance"],
            "iot":           ["sensors","gateways","monitoring","twin"],
            "saas":          ["b2b","b2c","vertical","horizontal"],
        },
        "infrastructure": {
            "cloud":  ["compute","storage","network","security"],
            "edge":   ["cdn","edge-compute","5g","fog"],
            "devops": ["ci-cd","monitoring","observability","sre"],
        },
        "emerging": {
            "blockchain": ["supply-chain","identity","payments","contracts"],
            "quantum":    ["simulation","cryptography","optimization"],
            "robotics":   ["manufacturing","logistics","agri","service"],
            "ar-vr":      ["training","retail","real-estate","gaming"],
        },
    },
}

# Wrapper consolidation plan: empty existing wrappers that should become 'categories'
# For verticals with ONE empty wrapper -> rename it.
# For verticals with MULTIPLE empty wrappers -> delete all, fresh 'categories' is created.
RENAME = [
    ("06-oil-gas/operations",       "06-oil-gas/categories"),
    ("08-sourcing/services",        "08-sourcing/categories"),
]
DELETE_EMPTY = [
    "09-finance/hpay",
    "09-finance/trade-finance",
    "10-ai-tech/automation",
    "10-ai-tech/machine-learning",
]

# ---------------------------------------------------------------------------

def plan():
    rename_actions = []
    delete_actions = []
    create_actions = []  # list of absolute paths to create

    # 1) renames
    for src_rel, dst_rel in RENAME:
        src = os.path.join(ROOT, src_rel)
        dst = os.path.join(ROOT, dst_rel)
        if os.path.isdir(src) and not os.path.exists(dst):
            rename_actions.append((src, dst))

    # 2) deletes (only if truly empty)
    for rel in DELETE_EMPTY:
        p = os.path.join(ROOT, rel)
        if os.path.isdir(p):
            if not any(os.scandir(p)):
                delete_actions.append(p)
            else:
                print(f"WARN: {rel} not empty — skipping delete", file=sys.stderr)

    # 3) creates: {vertical}/categories/{T2}/{T3}/{T4}  +  {T4}/videos
    for vertical, divisions in TREE.items():
        v_cat = os.path.join(ROOT, vertical, "categories")
        create_actions.append(v_cat)
        for t2, cats in divisions.items():
            t2_path = os.path.join(v_cat, t2)
            create_actions.append(t2_path)
            for t3, leaves in cats.items():
                t3_path = os.path.join(t2_path, t3)
                create_actions.append(t3_path)
                for t4 in leaves:
                    t4_path = os.path.join(t3_path, t4)
                    create_actions.append(t4_path)
                    create_actions.append(os.path.join(t4_path, "videos"))

    return rename_actions, delete_actions, create_actions


def report(rename_actions, delete_actions, create_actions):
    print("=" * 72)
    print("HARVICS VERTICALS — BUILD PLAN")
    print("=" * 72)

    print(f"\n[1] RENAME ({len(rename_actions)}):")
    for s, d in rename_actions:
        print(f"  mv  {os.path.relpath(s, ROOT)}  ->  {os.path.relpath(d, ROOT)}")

    print(f"\n[2] DELETE empty wrappers ({len(delete_actions)}):")
    for p in delete_actions:
        print(f"  rmdir  {os.path.relpath(p, ROOT)}")

    # Categorise creates
    t2_count, t3_count, t4_count, videos_count, wrappers_count = 0, 0, 0, 0, 0
    already_exists = 0
    will_create = 0
    for p in create_actions:
        rel = os.path.relpath(p, ROOT)
        parts = rel.split(os.sep)
        # parts: [vertical, 'categories', T2?, T3?, T4?, 'videos'?]
        depth_after_categories = len(parts) - 2  # 0=categories, 1=T2, 2=T3, 3=T4, 4=videos
        if depth_after_categories == 0:
            wrappers_count += 1
        elif depth_after_categories == 1:
            t2_count += 1
        elif depth_after_categories == 2:
            t3_count += 1
        elif depth_after_categories == 3:
            t4_count += 1
        elif parts[-1] == "videos":
            videos_count += 1

        if os.path.isdir(p):
            already_exists += 1
        else:
            will_create += 1

    print(f"\n[3] CREATE ({len(create_actions)} target paths):")
    print(f"     wrappers ('categories') ...... {wrappers_count}")
    print(f"     T2 (divisions) ............... {t2_count}")
    print(f"     T3 (categories) .............. {t3_count}")
    print(f"     T4 (subcategories / leaves) .. {t4_count}")
    print(f"     /videos siblings ............. {videos_count}")
    print(f"     ----------------------------------------")
    print(f"     already exist ................ {already_exists}")
    print(f"     NEW folders to create ........ {will_create}")
    print(f"     TOTAL paths in plan .......... {len(create_actions)}")
    print()


def apply(rename_actions, delete_actions, create_actions):
    for s, d in rename_actions:
        os.rename(s, d)
        print(f"renamed: {os.path.relpath(s, ROOT)} -> {os.path.relpath(d, ROOT)}")
    for p in delete_actions:
        os.rmdir(p)
        print(f"deleted: {os.path.relpath(p, ROOT)}")
    created = 0
    for p in create_actions:
        if not os.path.isdir(p):
            os.makedirs(p, exist_ok=True)
            created += 1
    print(f"\nCreated {created} new folders.")


def main():
    apply_mode = "--apply" in sys.argv
    rename_actions, delete_actions, create_actions = plan()
    report(rename_actions, delete_actions, create_actions)
    if apply_mode:
        print("APPLYING...\n")
        apply(rename_actions, delete_actions, create_actions)
        print("DONE.")
    else:
        print("DRY-RUN ONLY.  Re-run with --apply to execute.")


if __name__ == "__main__":
    main()
