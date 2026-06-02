#!/usr/bin/env python3
"""Generate one leaf.jpg per Minerals leaf folder.

Style: natural real-world mining / refinery / metallurgy photography.
Subject fills 50-65% of frame at normal eye-level distance, environmental
context (mine site, smelter, refinery, vault, lab) visible. No macro,
no jewel-lighting, no black velvet.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/05-minerals/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

MINERALS_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B "
    "MINERALS trading catalogue (industrial minerals, metals, precious metals, "
    "energy minerals). Expand the user input into a single photorealistic image "
    "prompt. STYLE RULES: "
    "1. Natural, believable real-world mining / refinery / metallurgy "
    "photography. The subject fills 50-65% of the frame at normal eye-level or "
    "slight three-quarter distance — NOT extreme macro, NOT jewel-lit close-ups. "
    "Environmental context (open-pit mine, processing plant, smelter, "
    "ore-stockpile yard, refinery, secure vault, assay lab) must be visible "
    "behind or around the subject. "
    "2. Lighting: natural daylight, hard industrial overhead light, or warm "
    "cinematic golden hour. No black velvet, no jewel spotlights. Realistic "
    "shadows. "
    "3. Technical accuracy is essential: bauxite is reddish-brown lumpy ore, "
    "alumina is fine white powder, iron-ore lumps are dark grey-red rocks, "
    "magnetite is black metallic, hematite is reddish-grey, gold dore bars are "
    "rough impure castings, gold bullion bars are smooth refined ingots, silver "
    "granules are small shot pellets, platinum sponge is dull grey porous mass, "
    "lithium carbonate is fine white powder, spodumene is greenish crystalline "
    "rock, yellowcake uranium is bright yellow powder in a sealed drum, coking "
    "coal is shiny black lumps, thermal coal is duller black lumps, lignite is "
    "soft brown coal, anthracite is hard glossy black coal. "
    "4. Generic unbranded products only. Plain unmarked drums, generic ingots. "
    "5. NEGATIVE: do NOT include text, captions, logos, brand names, watermarks, "
    "signage, plaques, mock-up labels, fictional brand packaging, real-world "
    "third-party brands, magnifying glasses, neon signs, illustrations, 3D "
    "renders, cartoon style, surreal lighting, fantasy gemstones. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # ENERGY MINERALS ================================================
    ("energy/coal/anthracite", "anthracite coal — hard glossy black coal lumps in a stockpile at a coal yard, conveyor visible"),
    ("energy/coal/coking",     "coking metallurgical coal — shiny black coal lumps stockpiled at a steel-mill coal yard, hopper above"),
    ("energy/coal/lignite",    "lignite brown coal — soft crumbly brown coal piled at an open-pit lignite mine, excavator in distance"),
    ("energy/coal/met-coal",   "metallurgical coal — premium black coking coal stockpile at a coal preparation plant, conveyor system"),
    ("energy/coal/thermal",    "thermal steam coal — dull black coal stockpile at a power-station coal yard with reclaimer machine"),
    ("energy/lithium/battery-grade","battery-grade lithium carbonate fine white powder in a clean lined steel drum at a lithium processing plant"),
    ("energy/lithium/brine",   "lithium brine evaporation pond — pale turquoise lithium brine ponds at a salt-flat lithium operation, drone view"),
    ("energy/lithium/carbonate","lithium carbonate fine white powder being scooped into a sample bag at a lithium processing plant"),
    ("energy/lithium/hydroxide","lithium hydroxide white crystalline flakes in a stainless-steel hopper at a lithium refinery"),
    ("energy/lithium/spodumene","spodumene lithium ore — greenish-grey crystalline rock chunks at a hard-rock lithium mine ore stockpile"),
    ("energy/uranium/depleted","depleted uranium — heavy dull grey metal ingot in a controlled radiological storage facility"),
    ("energy/uranium/enriched","enriched uranium fuel pellets — small dark cylindrical pellets in a sealed nuclear fuel container, nuclear fabrication facility"),
    ("energy/uranium/hexafluoride","uranium hexafluoride UF6 — heavy steel transport cylinder on a stand at a nuclear conversion plant"),
    ("energy/uranium/ore",     "uranium ore — yellow-streaked dark rock chunks at a uranium mine ore stockpile, hauler in distance"),
    ("energy/uranium/yellowcake","yellowcake uranium — bright yellow uranium oxide powder in a sealed steel drum at a uranium milling facility"),
    # INDUSTRIAL MINERALS ============================================
    ("industrial/gravel/crushed",   "crushed stone gravel — angular grey crushed-rock aggregate piled at a quarry stockyard, conveyor visible"),
    ("industrial/gravel/decorative","decorative landscaping gravel — multi-coloured rounded pebbles in a garden-supply yard"),
    ("industrial/gravel/drainage",  "drainage gravel — clean washed coarse stone aggregate in a quarry storage bay"),
    ("industrial/gravel/pea",       "pea gravel — small smooth rounded pebbles piled at a building-supplies yard"),
    ("industrial/gravel/river",     "river-rock gravel — smooth rounded river stones in mixed earth tones at a landscaping yard"),
    ("industrial/limestone/agricultural","agricultural limestone — fine white-grey ground limestone powder pile at a lime plant, bulk bags nearby"),
    ("industrial/limestone/cement",     "cement-grade limestone — pale grey crushed limestone aggregate at a cement plant feed stockpile, kiln in distance"),
    ("industrial/limestone/construction","construction limestone blocks — large pale-grey cut limestone blocks stacked at a quarry yard"),
    ("industrial/limestone/dolomitic",  "dolomitic limestone — pale tan-grey crushed dolomitic limestone pile at an industrial minerals quarry"),
    ("industrial/limestone/high-calcium","high-calcium limestone — bright white-grey high-purity limestone chips at a lime processing plant"),
    ("industrial/sand/construction","construction sand — golden tan construction sand pile at a building materials yard, loader visible"),
    ("industrial/sand/foundry",     "foundry sand — fine dark grey foundry casting sand in a metal foundry sand bin"),
    ("industrial/sand/frac",        "frac sand — clean rounded white silica frac sand piled at a frac-sand plant, rail loadout in distance"),
    ("industrial/sand/glass",       "glass-grade silica sand — fine pure white silica sand at a glass plant raw-materials silo"),
    ("industrial/sand/silica",      "high-purity silica sand — bright white silica sand in a sample bag at a silica processing facility"),
    # METALS =========================================================
    ("metals/aluminum/alumina", "alumina — fine white aluminium oxide powder pouring from a chute into a bulk container at an alumina refinery"),
    ("metals/aluminum/bauxite", "bauxite ore — reddish-brown lumpy bauxite ore at a bauxite mine stockpile, hauler in distance"),
    ("metals/aluminum/ingot",   "primary aluminium ingots — stacked unmarked aluminium ingots at a smelter casting yard"),
    ("metals/aluminum/primary", "primary aluminium — freshly cast aluminium T-bars in a smelter casthouse, glowing pots in distance"),
    ("metals/aluminum/scrap",   "aluminium scrap — pile of aluminium turnings and crushed cans at a metal recycling yard"),
    ("metals/copper/cathode",   "copper cathodes — orange-red electrolytic copper cathode plates on a rack at a copper refinery"),
    ("metals/copper/concentrate","copper concentrate — dark green-grey copper concentrate powder pile at a copper mine processing plant"),
    ("metals/copper/ore",       "copper ore — green-blue malachite-streaked copper ore rocks at an open-pit copper mine stockpile"),
    ("metals/copper/refined",   "refined copper wire-bar — smooth bright orange-red refined copper bars stacked at a copper rod plant"),
    ("metals/copper/scrap",     "copper scrap — bright orange-red copper wire and pipe scrap heap at a recycling yard"),
    ("metals/iron-ore/fines",   "iron ore fines — dark red-brown fine iron-ore fines pile at an iron-ore export terminal, ship loader visible"),
    ("metals/iron-ore/hematite","hematite iron ore — reddish-grey metallic hematite ore lumps at a hematite mine stockpile"),
    ("metals/iron-ore/lumps",   "iron-ore lumps — large dark grey-red iron-ore lump rocks at an iron-ore mine ore stockyard"),
    ("metals/iron-ore/magnetite","magnetite iron ore — black metallic magnetite ore rocks at an iron-ore concentrator plant"),
    ("metals/iron-ore/pellets", "iron-ore pellets — small uniform grey-black iron-ore pellets piled at a pelletising plant outfeed"),
    ("metals/zinc/alloy",       "zinc alloy ingots — silvery-grey zinc alloy ingots stacked at a zinc smelter casting yard"),
    ("metals/zinc/concentrate", "zinc concentrate — fine grey zinc concentrate powder pile at a zinc mine concentrator plant"),
    ("metals/zinc/dust",        "zinc dust — fine grey zinc metal powder in a sealed industrial drum at a zinc dust facility"),
    ("metals/zinc/oxide",       "zinc oxide — bright white zinc oxide powder in a clean industrial sack at a zinc oxide plant"),
    ("metals/zinc/slab",        "zinc slab ingots — large silvery zinc slabs stacked at a zinc refinery casting bay"),
    # PRECIOUS METALS =================================================
    ("precious/gold/bars",      "investment gold bars — stacked unmarked refined gold bars on a steel shelf in a secure precious-metals vault"),
    ("precious/gold/bullion",   "gold bullion — large refined gold bullion bars stacked on a vault shelf in a high-security bullion vault"),
    ("precious/gold/dore",      "gold dore bars — rough impure cast dore gold bars on a steel rack at a gold refinery, fume hood visible"),
    ("precious/gold/jewelry-grade","jewellery-grade refined gold — smooth polished refined gold bars on a jeweller's bench in a precious-metals workshop"),
    ("precious/gold/scrap",     "gold scrap — assorted broken gold jewellery and gold scrap pieces on a refinery sorting tray"),
    ("precious/platinum/catalyst","spent platinum catalyst — grey honeycomb catalyst monoliths on a sorting bench at a precious-metals recycler"),
    ("precious/platinum/ingot", "platinum ingots — silvery-white platinum ingots stacked on a refinery scale, precious-metals plant"),
    ("precious/platinum/jewelry","jewellery-grade platinum — polished platinum rods and small ingots on a jeweller's bench"),
    ("precious/platinum/scrap", "platinum scrap — broken platinum-bearing components on a sorting bench at a platinum-group-metals recycler"),
    ("precious/platinum/sponge","platinum sponge — dull grey porous platinum sponge powder in a clean steel sample tray at a refinery"),
    ("precious/silver/bullion", "silver bullion — stacked refined silver bullion bars on a vault shelf in a precious-metals storage vault"),
    ("precious/silver/granules","silver granules — small shiny silver shot pellets pouring into a sample tray at a precious-metals refinery"),
    ("precious/silver/industrial","industrial silver — silver wire coils and silver paste containers on a workbench at an electronics-grade silver supplier"),
    ("precious/silver/jewelry", "jewellery-grade silver — polished sterling silver rods and small ingots on a jeweller's bench"),
    ("precious/silver/scrap",   "silver scrap — assorted broken silver jewellery and silver-coated components on a refinery sorting tray"),
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
            {"role": "system", "content": MINERALS_SYSTEM},
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
    p.add_argument("--filter", default="")
    p.add_argument("--force", action="store_true")
    p.add_argument("--limit", type=int, default=0)
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
            print(f"[{i}/{len(jobs)}] {rel}: SKIP (exists)")
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
            time.sleep(4.0)
        except Exception as e:
            print(f"[{i}/{len(jobs)}] {rel}: EXC {e}")
            summary.append((rel, "EXC", 0, time.time() - t0))

    ok = sum(1 for s in summary if s[1] == "OK")
    err = sum(1 for s in summary if s[1] == "EXC")
    skip = sum(1 for s in summary if s[1] == "SKIP")
    print(f"\n=== SUMMARY === OK:{ok} ERR:{err} SKIP:{skip} TOTAL:{len(summary)}")
    for rel, s, n, t in summary:
        if s == "EXC":
            print(f"  EXC  {rel}")


if __name__ == "__main__":
    main()
