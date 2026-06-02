#!/usr/bin/env python3
"""Walk every leaf folder under public/assets/verticals/{vert}/categories/
and generate one HARVICS-branded hero image per leaf via /api/groq/process.

- Calls the existing Next.js route (which uses Cloudflare flux-1-schnell + Groq
  prompt enhancement under the HARVICS_PROMPT_ENGINEER_SYSTEM template).
- Saves to {leaf}/leaf.jpg
- Resumable: skips any leaf that already has leaf.jpg unless --force
- Filter: --vertical 01-apparels  to scope to one vertical (repeatable)
- Per-image retries (3x with backoff) on 5xx / network errors
- Logs running progress + final summary
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/public/assets/verticals"
ENDPOINT = "http://localhost:3000/api/groq/process"
LEAF_FILENAME = "leaf.jpg"
RESERVED_SUBDIRS = {"videos"}

# Direct Cloudflare path — bypasses Groq quota entirely.
CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
CF_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
CF_ENDPOINT = (
    f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/{CF_MODEL}"
)
VERTICAL_THEMES = {
    "01-apparels":   "dark moody luxury fashion atelier, draped fabrics, brass plaque engraved HARVICS, Armani/Dior aesthetic",
    "02-fmcg":       "bright clean white studio Carrara marble, premium consumer packs gold-embossed HARVICS label, Unilever/Nestle catalog",
    "03-commodities":"",  # handled by COMMODITIES_SUBTYPE_PROMPTS below
    "04-industrial": "dark chiaroscuro industrial photography, heavy machinery steel-blue tones, brushed metal plaque engraved HARVICS",
    "05-minerals":   "macro jewel lighting on black velvet, raw precious minerals, polished jeweler loupe engraved HARVICS",
    "06-oil-gas":    "cinematic golden hour offshore rig, fiery sunset, illuminated letters HARVICS on rig",
    "07-real-estate":"dusk-lit ultra-luxury penthouse interior, panoramic city skyline, key fob engraved HARVICS, Armani Casa aesthetic",
    "08-sourcing":   "aerial drone view global supply chain hub, glowing data overlay, signage HARVICS GLOBAL VENTURES",
    "09-finance":    "dark mode elite trading desk, candlestick charts, gold accents, central dashboard HARVICS FINANCE",
    "10-ai-tech":    "electric blue cyan neural network on deep dark background, holographic text HARVICS AI TECH",
}

# Commodities are bulk-trade assets, not consumer packshots. Each sub-tree gets a
# concrete photographic anchor. Strict negatives kill the watermark + cliche bugs.
COMMODITIES_SUBTYPE_PROMPTS = {
    # AGRI GRAINS
    "agri/wheat/durum":          "tight close-up of amber durum wheat kernels, hard glassy translucent grains, natural daylight, shallow depth of field, harvest field background blurred",
    "agri/wheat/hard-red":       "close-up pile of hard red winter wheat kernels, reddish-brown husk, rustic burlap sack background",
    "agri/wheat/soft-white":     "close-up of soft white wheat kernels, pale ivory tone, loose pile on wooden farm table",
    "agri/wheat/milling":        "flour-mill grade wheat in a stainless hopper, golden kernels cascading",
    "agri/wheat/feed":           "loose pile of feed-grade wheat in a farm storage bin, dusty light, agricultural setting",
    "agri/rice/basmati":         "long slender white basmati rice grains, top-down studio shot, fine grain detail visible",
    "agri/rice/jasmine":         "short pearly jasmine rice grains, soft natural light, ceramic bowl",
    "agri/rice/long-grain":      "loose pile of long-grain white rice on a burlap sack, daylight",
    "agri/rice/parboiled":       "pale yellow translucent parboiled rice grains, close-up macro shot",
    "agri/rice/broken":          "broken rice fragments, mixed lengths, packaged in a jute sack opening",
    "agri/corn/yellow":          "yellow dent corn kernels close-up, deep gold colour, harvest crate",
    "agri/corn/white":           "white corn kernels close-up, ivory tone, farm bench background",
    "agri/corn/sweet":           "sweet corn cobs with bright yellow kernels, husks pulled back, field setting",
    "agri/corn/feed":            "loose pile of feed corn in a grain silo chute, industrial agriculture",
    "agri/corn/food-grade":      "food-grade yellow corn kernels in a stainless steel hopper, clean and dry",
    "agri/soybeans/non-gmo":     "non-GMO yellow soybeans in a wooden scoop, farm-fresh, daylight",
    "agri/soybeans/gmo":         "yellow soybeans in an industrial grain elevator chute",
    "agri/soybeans/organic":     "organic soybeans in a green field with growing plants, natural sunlight",
    "agri/soybeans/oil-grade":   "yellow soybeans pouring into a stainless oil-extraction press, industrial close-up",
    "agri/soybeans/meal-grade":  "soybean meal flakes after oil extraction, golden brown texture, livestock-feed grade",
    # ENERGY CRUDE OIL
    "energy/crude-oil/wti":          "American crude oil pumpjack at sunset, west Texas shale field, golden-hour light",
    "energy/crude-oil/brent":        "North Sea offshore oil platform, cold blue ocean, industrial cinematic",
    "energy/crude-oil/dubai":        "Gulf desert oil pipeline at sunset, Middle East refinery silhouette",
    "energy/crude-oil/bonny-light":  "West African oil terminal jetty, light sweet crude tanker loading, tropical light",
    "energy/crude-oil/urals":        "Eastern European crude pipeline trunk line through pine forest, cold steel pipes",
    # ENERGY LNG / NATURAL GAS
    "energy/lng/spot":           "LNG carrier ship at terminal, cryogenic spheres, cool blue tones",
    "energy/lng/contract":       "LNG storage tank farm at industrial terminal, dawn light",
    "energy/lng/long-haul":      "LNG carrier ship under way at sea, cinematic",
    "energy/lng/peak-shaving":   "LNG peak-shaving plant with cryogenic tanks and pipework, industrial setting",
    "energy/natural-gas/pipeline": "above-ground natural gas pipeline trunk line crossing landscape, industrial",
    "energy/natural-gas/lng":    "LNG cryogenic storage spheres at night, lit industrial facility",
    "energy/natural-gas/cng":    "compressed natural gas cylinder bank, blue cylinders, industrial yard",
    "energy/natural-gas/lpg":    "LPG storage tanks, white horizontal cylinders, refinery setting",
    "energy/natural-gas/propane": "propane storage tank at industrial facility, white cylindrical, sunny day",
    # METALS
    "metals/aluminum/ingot":      "stack of bright silver aluminum ingots in a smelter warehouse, industrial light",
    "metals/aluminum/billet":     "aluminum billet stack, cylindrical bars, foundry yard",
    "metals/aluminum/sheet":      "coiled aluminum sheet rolls, polished surface, factory floor",
    "metals/aluminum/extrusion":  "aluminum extrusion profiles bundled in a metal yard, geometric cross-sections",
    "metals/aluminum/scrap":      "aluminum scrap heap in a recycling yard, crushed cans and offcuts",
    "metals/copper/cathode":      "stack of pure copper cathode sheets, deep brown-orange surface, warehouse rack",
    "metals/copper/concentrate":  "copper concentrate powder pile in a mining processing plant, dark grey-brown",
    "metals/copper/rod":          "coiled copper rod stock, bright orange-red metal, factory",
    "metals/copper/wire":         "copper wire spools stacked in a warehouse, bright copper colour",
    "metals/copper/scrap":        "copper scrap heap, mixed wire and pipe, recycling yard",
    "metals/steel/billet":        "steel billet stack, square bars in a mill yard, industrial",
    "metals/steel/rebar":         "bundles of steel reinforcement bar (rebar) at a construction yard",
    "metals/steel/hr-coil":       "hot-rolled steel coil stack, dark blue-grey, mill warehouse",
    "metals/steel/cr-coil":       "cold-rolled steel coil stack, bright shiny finish, factory",
    "metals/steel/structural":    "structural steel beams (I-beams) stacked at a construction site",
    # SOFTS COFFEE
    "softs/coffee/arabica":       "green arabica coffee beans in a jute sack, close-up, soft window light",
    "softs/coffee/robusta":       "robusta coffee beans pile, slightly larger and rounder than arabica, jute sack",
    "softs/coffee/green-bean":    "raw green coffee beans in burlap sack, unroasted, photographic",
    "softs/coffee/specialty":     "ripe red coffee cherries on the branch in a plantation, sunlight through leaves",
    "softs/coffee/instant":       "close-up macro of instant coffee soluble granules, dark amber crystals",
    # SOFTS COCOA
    "softs/cocoa/beans":          "cocoa pods on a tree branch, ripe yellow-orange pods, plantation",
    "softs/cocoa/butter":         "pale ivory blocks of cocoa butter on a wooden table, soft natural light",
    "softs/cocoa/liquor":         "molten dark cocoa liquor pouring into a stainless steel mould, factory",
    "softs/cocoa/nibs":           "cocoa nibs in a wooden bowl, dark brown fragments, top-down",
    "softs/cocoa/powder":         "fine dark cocoa powder pile, top-down studio shot, sieve dusting from above",
    # SOFTS COTTON
    "softs/cotton/upland":        "raw upland cotton bolls on plant in a field, white fluff bursting open",
    "softs/cotton/pima":          "long-staple pima cotton fibre close-up, silvery white",
    "softs/cotton/organic":       "organic cotton field with workers harvesting, sunny day",
    "softs/cotton/fair-trade":    "compressed cotton bales stacked in a warehouse, jute strapping",
    "softs/cotton/recycled":      "recycled cotton bale, mixed-tone fibres, sustainable textile mill",
    # SOFTS SUGAR
    "softs/sugar/raw":            "raw amber sugar crystals close-up, golden tone, top-down",
    "softs/sugar/refined":        "refined white sugar crystals macro close-up, sparkling",
    "softs/sugar/brown":          "pile of brown sugar, moist crystalline texture, wooden bowl",
    "softs/sugar/cane":           "sugarcane stalks in a tropical field, harvest scene, golden hour",
    "softs/sugar/organic":        "organic sugarcane field harvest by workers, natural daylight",
}

COMMODITIES_NEGATIVE = (
    " Photographic realism. The commodity itself fills 70-85% of the frame. "
    "Strictly NO text, captions, logos, brand names, watermarks, plaques, "
    "signage, magnifying glasses, gemstones, jewelry, penthouses, mall storefronts, "
    "shipping containers as a stand-in for the actual commodity, neon signs, "
    "typography compositions, illustrations, 3D renders, no humans unless explicitly "
    "required (cotton organic, sugar organic). Generic unbranded packaging only."
)


def find_leaves(verticals_filter):
    """Yield (vertical, rel_path, abs_path) for every leaf under categories/."""
    for vert in sorted(os.listdir(ROOT)):
        if verticals_filter and vert not in verticals_filter:
            continue
        cat_root = os.path.join(ROOT, vert, "categories")
        if not os.path.isdir(cat_root):
            continue

        def walk(d, rel):
            try:
                entries = os.listdir(d)
            except OSError:
                return
            subdirs = [e for e in entries
                       if os.path.isdir(os.path.join(d, e)) and e not in RESERVED_SUBDIRS]
            if not subdirs:
                yield (vert, rel, d)
                return
            for sd in subdirs:
                yield from walk(os.path.join(d, sd), f"{rel}/{sd}" if rel else sd)

        for top in sorted(os.listdir(cat_root)):
            full = os.path.join(cat_root, top)
            if os.path.isdir(full) and top not in RESERVED_SUBDIRS:
                yield from walk(full, top)


def build_prompt(vertical, rel_path):
    # Commodities: use sub-type-specific photographic anchor + negatives.
    if vertical == "03-commodities":
        anchor = COMMODITIES_SUBTYPE_PROMPTS.get(rel_path)
        if anchor:
            return anchor + COMMODITIES_NEGATIVE
        # Fallback: derive from rel_path tokens, still no watermark.
        pretty = rel_path.replace('-', ' ').replace('/', ' / ')
        return (
            f"photographic close-up of {pretty}, bulk commodity trading context, "
            f"natural light, real-world setting." + COMMODITIES_NEGATIVE
        )
    theme = VERTICAL_THEMES.get(vertical, "premium HARVICS branded product photography")
    pretty = rel_path.replace('-', ' ').replace('/', ' / ')
    return (
        f"VERTICAL: {vertical}. CATEGORY PATH: {pretty}. "
        f"THEME: {theme}. "
        f"Generate a single premium 1024x1024 hero image representing this leaf "
        f"category. Must include HARVICS branding in scene-appropriate placement. "
        f"masterpiece, best quality, 8k uhd, ultra-detailed, sharp focus, "
        f"professional commercial photography, no humans, no watermark text."
    )


def call_api_via_route(prompt, retries=3):
    """Original path: Next.js route (Groq + Cloudflare)."""
    body = json.dumps({"prompt": prompt}).encode()
    req = urllib.request.Request(ENDPOINT, data=body,
                                 headers={"Content-Type": "application/json"})
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            if "image" not in data:
                last_err = f"no image in response: {json.dumps(data)[:200]}"
                continue
            b64 = data["image"].split(",", 1)[1]
            return base64.b64decode(b64), None
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}"
            if e.code < 500 and e.code != 429:
                return None, last_err
        except Exception as e:
            last_err = f"exc: {e}"
        time.sleep(2 ** attempt)
    return None, last_err


def call_cloudflare_direct(prompt, retries=3):
    """Skip Groq. Hit Cloudflare flux-1-schnell directly with the template prompt."""
    if not CF_ACCOUNT_ID or not CF_API_TOKEN:
        return None, "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN missing"
    body = json.dumps({"prompt": prompt}).encode()
    req = urllib.request.Request(
        CF_ENDPOINT, data=body,
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {CF_API_TOKEN}"},
    )
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            b64 = (data or {}).get("result", {}).get("image")
            if not b64:
                last_err = f"no image: {json.dumps(data)[:200]}"
                continue
            return base64.b64decode(b64), None
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}"
            if e.code < 500 and e.code != 429:
                return None, last_err
        except Exception as e:
            last_err = f"exc: {e}"
        time.sleep(2 ** attempt)
    return None, last_err


def call_api(prompt, mode="route", retries=3):
    if mode == "direct":
        return call_cloudflare_direct(prompt, retries=retries)
    return call_api_via_route(prompt, retries=retries)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vertical", action="append", default=None,
                    help="Filter (repeatable). e.g. --vertical 01-apparels")
    ap.add_argument("--force", action="store_true",
                    help="Overwrite existing leaf.jpg")
    ap.add_argument("--limit", type=int, default=0,
                    help="Stop after N successful generations (0 = no limit)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Plan only — list leaves without generating")
    ap.add_argument("--mode", choices=["route", "direct"], default="route",
                    help="route=via /api/groq/process (Groq+CF). direct=Cloudflare only (no Groq)")
    ap.add_argument("--out-dir", default="",
                    help="Optional alternate root for writing leaf.jpg (mirrors vertical/rel structure). "
                         "Use for safe test runs, e.g. /tmp/regen-test")
    ap.add_argument("--only-rel", action="append", default=None,
                    help="Filter to specific rel paths (repeatable). e.g. --only-rel agri/rice/basmati")
    args = ap.parse_args()

    leaves = list(find_leaves(set(args.vertical) if args.vertical else None))
    if args.only_rel:
        only_set = set(args.only_rel)
        leaves = [(v, r, d) for (v, r, d) in leaves if r in only_set]
    total = len(leaves)
    print(f"Found {total} leaf folders" +
          (f" in {args.vertical}" if args.vertical else ""))
    if args.dry_run:
        for v, rel, _ in leaves[:30]:
            print(f"  {v}/{rel}")
        if total > 30:
            print(f"  ... and {total - 30} more")
        print(f"\nDRY-RUN: would generate {total} images.")
        return

    ok = skip = err = 0
    started = time.time()

    for i, (vert, rel, leaf_dir) in enumerate(leaves, 1):
        if args.out_dir:
            target_dir = os.path.join(args.out_dir, vert, rel)
            os.makedirs(target_dir, exist_ok=True)
            out_path = os.path.join(target_dir, LEAF_FILENAME)
        else:
            out_path = os.path.join(leaf_dir, LEAF_FILENAME)
        if os.path.exists(out_path) and not args.force:
            skip += 1
            continue

        prompt = build_prompt(vert, rel)
        t0 = time.time()
        img_bytes, err_msg = call_api(prompt, mode=args.mode)
        dt = time.time() - t0

        if img_bytes is None:
            err += 1
            print(f"[{i:4d}/{total}] FAIL  {vert}/{rel:<55s}  {err_msg}")
            continue

        with open(out_path, "wb") as f:
            f.write(img_bytes)
        ok += 1
        kb = len(img_bytes) // 1024
        print(f"[{i:4d}/{total}] OK   {vert}/{rel:<55s} {kb:>4d} KB  {dt:4.1f}s")

        if args.limit and ok >= args.limit:
            print(f"\n--limit {args.limit} reached")
            break

    total_dt = time.time() - started
    print("\n=== SUMMARY ===")
    print(f"  generated : {ok}")
    print(f"  skipped   : {skip}  (already had leaf.jpg)")
    print(f"  failed    : {err}")
    print(f"  total time: {total_dt/60:.1f} min")


if __name__ == "__main__":
    main()
