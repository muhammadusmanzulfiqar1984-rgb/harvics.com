#!/usr/bin/env python3
"""Generate one leaf.jpg per Commodities leaf folder.

Pipeline: Groq (commodities-specific system prompt -> photographic prompt) ->
Cloudflare flux-1-schnell -> leaf.jpg.

Reads keys from .env.local. Saves to:
  public/assets/verticals/03-commodities/categories/<cat>/<variety>/<sub>/leaf.jpg
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/03-commodities/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

# Mirrors HARVICS_COMMODITIES_PROMPT_SYSTEM in src/lib/promptTemplates.ts.
COMMODITIES_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B "
    "COMMODITIES trading catalogue. Expand the user input into a single "
    "photorealistic image prompt showing the commodity in its real bulk-trade "
    "form. RULES: "
    "1. The commodity itself must fill 70-85% of the frame as the sole focal point. "
    "2. Match the framing to the commodity sub-type: "
    "AGRI GRAINS -> tight close-up of the actual grain/kernel/bean (loose pile, "
    "burlap sack opening, or harvest field), natural daylight, shallow depth of "
    "field. The grain texture must be visible. Differentiate varieties by colour, "
    "length, and shape (basmati = long slender white, jasmine = short pearly, "
    "parboiled = pale yellow translucent, durum = amber hard, hard-red = reddish "
    "brown). "
    "ENERGY CRUDE OIL -> industrial setting: oil pumpjack at sunset, refinery "
    "distillation column, oil storage tank farm, or close-up of dark crude pouring "
    "(WTI = American shale field, Brent = North Sea offshore platform, Dubai = "
    "Gulf desert pipeline, Bonny Light = West African terminal, Urals = Eastern "
    "European pipeline). "
    "ENERGY LNG / NATURAL GAS -> LNG carrier ship at terminal, cryogenic storage "
    "tank, gas pipeline manifold, or compressor station. Cool blue tones. "
    "CNG/LPG = pressurised cylinder bank; pipeline = above-ground gas trunk line. "
    "METALS -> industrial yard or warehouse: stacked ingots, coiled sheet, billet "
    "stacks, rebar bundles, copper cathode racks, scrap yard heaps. Mill or "
    "foundry context, hard industrial light, metallic sheen. "
    "SOFTS COFFEE -> green coffee beans in a jute sack (green-bean/arabica/"
    "robusta), specialty cherries on the branch, instant coffee = soluble granule "
    "close-up. "
    "SOFTS COCOA -> cocoa pods on tree (beans), open pod with wet beans (raw "
    "beans), brown nibs in a wooden bowl (nibs), cocoa butter blocks (butter), "
    "molten dark cocoa liquor flow (liquor), fine brown powder (powder). "
    "SOFTS COTTON -> raw cotton bolls on plant or compressed cotton bales in a "
    "warehouse. Differentiate: pima = long staple silvery, organic = field with "
    "workers, recycled = mixed-tone reclaimed bale. "
    "SOFTS SUGAR -> raw amber crystals (raw), white refined crystals close-up "
    "(refined), brown sugar pile (brown), cane stalks in field (cane), organic = "
    "green field cane harvest. "
    "3. Tone: epic golden-hour or industrial-cinematic. Photographic realism only. "
    "4. NEGATIVE: do NOT include text, captions, logos, brand names, watermarks, "
    "signage, plaques, mock-up labels, fictional brand packaging, real-world "
    "third-party brands, magnifying glasses, jewelry/gemstones, penthouses, mall "
    "storefronts, neon signs, illustrations, 3D renders. "
    "5. If packaging is shown it must be generic unbranded (plain jute sack, plain "
    "steel drum, plain warehouse pallet). "
    "Output ONLY the final prompt string."
)

# (relative path under categories/, short seed phrase for Groq)
LEAVES = [
    # AGRI ============================================================
    ("agri/corn/feed",         "yellow feed corn kernels — coarse, deep yellow, livestock-grade, in a jute sack opening with kernels spilling onto rough wood"),
    ("agri/corn/food-grade",   "food-grade yellow corn kernels — clean uniform bright yellow, polished texture, in a small wooden scoop on burlap"),
    ("agri/corn/sweet",        "fresh sweet corn — pale yellow plump kernels still on the cob with green husk peeled back, harvest field background"),
    ("agri/corn/white",        "white corn kernels — pearly ivory color, uniform size, loose pile in a rustic wooden bowl"),
    ("agri/corn/yellow",       "premium yellow dent corn kernels — bright golden yellow, slight dimple on top, loose pile close-up"),
    ("agri/rice/basmati",      "long slender white basmati rice grains — extra-long, needle-like, polished pearl white, scattered on dark stone"),
    ("agri/rice/broken",       "broken white rice fragments — short irregular pieces, milled white, in a burlap sack opening"),
    ("agri/rice/jasmine",      "short pearly jasmine rice grains — translucent white with slight bluish tint, plump and short, in a small wooden scoop"),
    ("agri/rice/long-grain",   "long-grain white rice — slender uniform white grains, polished, scattered close-up on linen"),
    ("agri/rice/parboiled",    "parboiled rice — pale translucent yellow grains, slightly glassy, loose pile in a jute sack opening"),
    ("agri/soybeans/gmo",      "yellow soybeans — round plump beans, uniform size, loose pile in an industrial agri silo, golden hour light"),
    ("agri/soybeans/meal-grade","crushed soybean meal flakes — coarse golden-brown flake texture, in a metal feed scoop"),
    ("agri/soybeans/non-gmo",  "non-GMO yellow soybeans — clean round beans on a hessian sack, harvest field background"),
    ("agri/soybeans/oil-grade","oil-grade soybeans — glossy plump yellow beans, with a clear glass jar of soybean oil softly out of focus behind"),
    ("agri/soybeans/organic",  "organic soybeans — natural matte yellow beans on a wooden farm tray, soft daylight, organic farm context"),
    ("agri/wheat/durum",       "durum wheat kernels — hard amber-coloured glassy grains, elongated shape, close-up loose pile"),
    ("agri/wheat/feed",        "coarse feed wheat — mixed brown-amber grains, livestock-grade, in a metal feed bin"),
    ("agri/wheat/hard-red",    "hard red wheat kernels — reddish-brown firm grains, loose pile on rough burlap"),
    ("agri/wheat/milling",     "milling-grade wheat — uniform amber kernels with a soft dusting of flour, beside a stone mill"),
    ("agri/wheat/soft-white",  "soft white wheat kernels — pale ivory soft grains, loose pile close-up on natural linen"),
    # ENERGY ==========================================================
    ("energy/crude-oil/bonny-light", "Bonny Light crude oil terminal — West African coastal export terminal, sun-bleached storage tanks, palm trees in distance"),
    ("energy/crude-oil/brent",      "Brent crude oil — North Sea offshore oil platform at dramatic sunset, rough grey ocean, industrial cinematic"),
    ("energy/crude-oil/dubai",      "Dubai crude oil — Gulf desert pipeline crossing sand dunes at golden hour, pumping station in distance"),
    ("energy/crude-oil/urals",      "Urals crude oil — Eastern European pipeline crossing snow-dusted plains, industrial valves and metering station"),
    ("energy/crude-oil/wti",        "WTI crude oil — American shale field with oil pumpjack silhouetted against fiery orange sunset, dust haze"),
    ("energy/lng/contract",         "LNG long-term contract — large LNG carrier ship docked at a brightly lit cryogenic terminal at dusk, cool blue tones"),
    ("energy/lng/long-haul",        "long-haul LNG — massive LNG tanker ship at sea under cloudy sky, spherical insulated tanks visible on deck"),
    ("energy/lng/peak-shaving",     "LNG peak-shaving facility — small cryogenic LNG storage tanks beside a power plant, blue cinematic light"),
    ("energy/lng/spot",             "LNG spot cargo — LNG carrier loading at a busy export terminal at dawn, gantry cranes overhead"),
    ("energy/natural-gas/cng",      "CNG compressed natural gas — bank of high-pressure CNG cylinders at a refuelling station, industrial steel"),
    ("energy/natural-gas/lng",      "LNG cryogenic storage tank — massive insulated LNG tank with frost on the side, blue industrial mood"),
    ("energy/natural-gas/lpg",      "LPG cylinder bank — rows of pressurised LPG steel cylinders in an industrial storage yard, hard light"),
    ("energy/natural-gas/pipeline", "natural gas pipeline — above-ground steel gas trunk line crossing open landscape, valve manifold close-up"),
    ("energy/natural-gas/propane",  "propane storage — large white horizontal propane tank in a fenced industrial yard, clear blue sky"),
    # METALS ==========================================================
    ("metals/aluminum/billet",    "aluminum billets — neat stack of cylindrical aluminum billets in a smelter yard, hard industrial overhead light"),
    ("metals/aluminum/extrusion", "aluminum extrusions — bundles of long aluminum extruded profiles stacked in a warehouse, bright metallic sheen"),
    ("metals/aluminum/ingot",     "aluminum ingots — stacked rectangular aluminum ingots with smelter mark, foundry context, hard cool light"),
    ("metals/aluminum/scrap",     "aluminum scrap heap — pile of crushed aluminum scrap and turnings in a recycling yard"),
    ("metals/aluminum/sheet",     "aluminum sheet coils — large coiled aluminum sheet rolls in a metal stockyard, polished mirror sheen"),
    ("metals/copper/cathode",     "copper cathodes — racks of bright orange-red copper cathode plates in a refinery, vivid metallic glow"),
    ("metals/copper/concentrate", "copper concentrate — dark grey-green copper concentrate powder pile at a mining processing plant"),
    ("metals/copper/rod",         "copper rod coils — large coils of bright drawn copper rod stacked in a wire mill, warm metallic shine"),
    ("metals/copper/scrap",       "copper scrap heap — bright copper wire and pipe scrap in a recycling yard, vivid orange-red tones"),
    ("metals/copper/wire",        "copper wire spools — large industrial spools of bare bright copper wire in a manufacturing plant"),
    ("metals/steel/billet",       "steel billets — square section steel billets stacked in a hot rolling mill, glowing orange ends, sparks"),
    ("metals/steel/cr-coil",      "cold-rolled steel coils — stacked bright cold-rolled steel coils with mirror sheen in a stockyard"),
    ("metals/steel/hr-coil",      "hot-rolled steel coils — large dark grey hot-rolled steel coils with mill scale, stockyard rows"),
    ("metals/steel/rebar",        "steel rebar bundles — bundles of ribbed reinforcing steel bars stacked in a construction supply yard"),
    ("metals/steel/structural",   "structural steel — stacks of I-beams and H-beams in a steel fabrication yard, hard industrial light"),
    # SOFTS ===========================================================
    ("softs/cocoa/beans",   "raw cocoa beans — open cocoa pod with fresh wet white-pulp covered cocoa beans, on a banana leaf"),
    ("softs/cocoa/butter",  "cocoa butter — pale ivory blocks of pure cocoa butter on parchment paper, soft warm light"),
    ("softs/cocoa/liquor",  "cocoa liquor — molten dark glossy cocoa liquor flowing from a stainless steel chute"),
    ("softs/cocoa/nibs",    "cocoa nibs — small brown crushed cocoa nibs in a wooden bowl close-up, rich texture"),
    ("softs/cocoa/powder",  "cocoa powder — fine deep brown cocoa powder in a wooden bowl with a wooden spoon, soft sift mound"),
    ("softs/coffee/arabica",    "arabica coffee beans — green unroasted arabica beans in a jute sack opening close-up"),
    ("softs/coffee/green-bean", "green coffee beans — pale green raw unroasted coffee beans piled in a burlap sack"),
    ("softs/coffee/instant",    "instant coffee — soluble dark brown coffee granules close-up in a glass jar, macro detail"),
    ("softs/coffee/robusta",    "robusta coffee beans — round dark green-brown robusta beans in a jute sack opening"),
    ("softs/coffee/specialty",  "specialty coffee cherries — bright red ripe coffee cherries on the branch with green leaves, plantation"),
    ("softs/cotton/fair-trade", "fair-trade cotton — workers gently picking white cotton bolls in a sunny field, ethical farm context"),
    ("softs/cotton/organic",    "organic cotton bolls — fluffy white cotton bolls on the plant in a green organic farm field"),
    ("softs/cotton/pima",       "pima cotton — long-staple silvery white cotton fibres compressed into a warehouse bale"),
    ("softs/cotton/recycled",   "recycled cotton bale — mixed multi-tone reclaimed cotton fibres compressed into a bale, recycling yard"),
    ("softs/cotton/upland",     "upland cotton bales — stacked compressed white cotton bales in a cotton gin warehouse"),
    ("softs/sugar/brown",   "brown sugar — moist dark brown sugar piled in a wooden bowl, sticky crystals, warm light"),
    ("softs/sugar/cane",    "sugar cane stalks — green sugar cane stalks in a sunny harvest field, golden hour"),
    ("softs/sugar/organic", "organic sugar cane — green organic sugar cane field with a worker harvesting at golden hour"),
    ("softs/sugar/raw",     "raw sugar — coarse amber raw sugar crystals piled in a wooden bowl close-up"),
    ("softs/sugar/refined", "refined white sugar — fine pure white refined sugar crystals close-up macro, sparkling"),
]


def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def groq_enhance(prompt, key):
    body = json.dumps({
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": COMMODITIES_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 380,
        "temperature": 0.6,
    }).encode()
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "User-Agent": "harvics-image-gen/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
    return data["choices"][0]["message"]["content"].strip().strip('"')


def cf_image(prompt, account_id, token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{CF_MODEL}"
    body = json.dumps({"prompt": prompt}).encode()
    last_err = None
    for attempt in range(8):
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            return data["result"]["image"]
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429:
                wait = 30 + 30 * attempt
                print(f"    429 rate-limited, sleeping {wait}s (attempt {attempt+1}/8)")
                time.sleep(wait)
                continue
            raise
    raise last_err


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--filter", default="", help="only generate paths containing this substring")
    p.add_argument("--force", action="store_true", help="overwrite existing leaf.jpg")
    p.add_argument("--limit", type=int, default=0, help="cap number of leaves processed (0 = all)")
    args = p.parse_args()

    env = load_env()
    groq_key = env.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY")
    cf_token = env.get("CLOUDFLARE_API_TOKEN") or os.environ.get("CLOUDFLARE_API_TOKEN")
    cf_account = env.get("CLOUDFLARE_ACCOUNT_ID") or os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not (groq_key and cf_token and cf_account):
        print("Missing keys in .env.local")
        sys.exit(1)

    jobs = [(rel, seed) for rel, seed in LEAVES if args.filter in rel]
    if args.limit:
        jobs = jobs[: args.limit]

    summary = []
    for i, (rel, seed) in enumerate(jobs, 1):
        out_dir = os.path.join(ROOT, rel)
        if not os.path.isdir(out_dir):
            print(f"[{i}/{len(jobs)}] {rel}: SKIP (folder missing)")
            summary.append((rel, "SKIP", 0, 0))
            continue
        out_path = os.path.join(out_dir, "leaf.jpg")
        if os.path.exists(out_path) and not args.force:
            print(f"[{i}/{len(jobs)}] {rel}: SKIP (exists, use --force)")
            summary.append((rel, "SKIP", 0, 0))
            continue
        t0 = time.time()
        try:
            enhanced = groq_enhance(seed, groq_key)
            b64 = cf_image(enhanced, cf_account, cf_token)
            buf = base64.b64decode(b64)
            with open(out_path, "wb") as f:
                f.write(buf)
            elapsed = time.time() - t0
            print(f"[{i}/{len(jobs)}] {rel}: OK {len(buf)//1024} KB in {elapsed:.1f}s")
            summary.append((rel, "OK", len(buf), elapsed))
            time.sleep(2.0)
        except Exception as e:
            print(f"[{i}/{len(jobs)}] {rel}: EXC {e}")
            summary.append((rel, "EXC", 0, time.time() - t0))

    ok = sum(1 for s in summary if s[1] == "OK")
    err = sum(1 for s in summary if s[1] == "EXC")
    skip = sum(1 for s in summary if s[1] == "SKIP")
    print(f"\n=== SUMMARY ===  OK:{ok}  ERR:{err}  SKIP:{skip}  TOTAL:{len(summary)}")
    for rel, s, n, t in summary:
        if s != "OK":
            print(f"  {s:<4} {rel}")


if __name__ == "__main__":
    main()
