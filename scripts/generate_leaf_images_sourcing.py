#!/usr/bin/env python3
"""Generate one leaf.jpg per Sourcing leaf folder.

Style: realistic global trade / sourcing photography. Subject 50-65%
of frame, environmental context (factory floor, port, warehouse, lab,
souk, sourcing office). Natural daylight or industrial light.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/08-sourcing/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

SOURCING_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B "
    "SOURCING and TRADE catalogue (commodity sourcing, FMCG sourcing, "
    "industrial sourcing, textile sourcing, country-of-origin sourcing hubs, "
    "and trade services like logistics / QC / supplier discovery / trade "
    "finance). Expand the user input into a single photorealistic image "
    "prompt. STYLE RULES: "
    "1. Realistic real-world global-trade photography. The subject fills "
    "50-65% of the frame at normal eye-level or three-quarter distance — NOT "
    "extreme macro. Environmental context (factory floor, port container "
    "yard, warehouse, QC laboratory, souk / wholesale market, sourcing "
    "office, freight forwarder counter, customs clearance hall, pre-shipment "
    "inspection table, trade-finance bank office) must be visible behind or "
    "around the subject. "
    "2. Lighting: natural daylight, industrial overhead lighting, or warm "
    "office lighting. Realistic shadows. "
    "3. For country / region sourcing pages: show an iconic recognisable "
    "industrial / port / wholesale-market scene from that country (Pakistan "
    "= Karachi port and textile mills; India = Mumbai port and garment "
    "factories; China = Shenzhen/Shanghai port and electronics manufacturing; "
    "Bangladesh = garment factory floor in Dhaka; Vietnam = Hai Phong port "
    "and electronics; Turkey = Istanbul textile sourcing and Bosphorus "
    "shipping; UAE = Jebel Ali port; Saudi = Jeddah port; Egypt = Alexandria "
    "port; Kenya = Mombasa port; South Africa = Durban port; Nigeria = Apapa "
    "port; Morocco = Casablanca port; Italy = Milan textile and Genoa port; "
    "Germany = Hamburg port and machinery; Spain = Barcelona port; Poland = "
    "manufacturing; Indonesia = Jakarta port). "
    "4. Generic unbranded products only. No real-world brand names or "
    "recognisable corporate logos. "
    "5. NEGATIVE: do NOT include text, captions, logos, brand names, "
    "watermarks, signage with brand text, plaques, mock-up labels, fictional "
    "brand packaging, real-world third-party brands, magnifying glasses, "
    "neon signs, illustrations, 3D renders, cartoon style, surreal lighting, "
    "fantasy elements. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # CATEGORIES / COMMODITY SOURCING ================================
    ("categories/commodity-sourcing/agri",   "agricultural commodity sourcing — bulk grain stockpile and bagged pulses on pallets at a commodity sourcing warehouse, broker inspecting"),
    ("categories/commodity-sourcing/energy", "energy commodity sourcing — crude oil sample bottles and energy contracts on a desk at a commodity trading sourcing office, screens behind"),
    ("categories/commodity-sourcing/metals", "metals commodity sourcing — copper cathode sheets and steel coils on a sourcing inspection floor at a metals trading warehouse"),
    ("categories/commodity-sourcing/softs",  "soft commodities sourcing — burlap sacks of coffee, cocoa beans and raw sugar at a soft-commodities sourcing warehouse"),
    # CATEGORIES / FMCG SOURCING =====================================
    ("categories/fmcg-sourcing/beverage",     "beverage sourcing — pallets of unbranded beverage bottles and cans being inspected at an FMCG sourcing warehouse"),
    ("categories/fmcg-sourcing/food",         "packaged food sourcing — pallets of unbranded packaged food cartons and shrink-wrapped goods at an FMCG sourcing distribution centre"),
    ("categories/fmcg-sourcing/home-care",    "home care products sourcing — pallets of unbranded detergent bottles and home-care cartons at an FMCG sourcing warehouse"),
    ("categories/fmcg-sourcing/personal-care","personal care sourcing — pallets of unbranded shampoo and personal-care bottles being inspected at an FMCG sourcing warehouse"),
    # CATEGORIES / INDUSTRIAL SOURCING ===============================
    ("categories/industrial-sourcing/chemicals", "industrial chemicals sourcing — rows of unmarked chemical drums and IBC totes at an industrial chemicals sourcing warehouse, forklift visible"),
    ("categories/industrial-sourcing/machinery", "industrial machinery sourcing — large CNC machines and industrial pumps on the floor at a machinery sourcing warehouse, sourcing agent inspecting"),
    ("categories/industrial-sourcing/mro",       "MRO industrial supplies sourcing — racks of bearings, valves and industrial spare parts at an MRO sourcing warehouse"),
    ("categories/industrial-sourcing/safety",    "industrial safety products sourcing — pallets of unbranded hardhats, safety boots, gloves and harnesses at an industrial safety sourcing warehouse"),
    # CATEGORIES / TEXTILE SOURCING ==================================
    ("categories/textile-sourcing/accessories",  "textile accessories sourcing — bins of zippers, buttons, labels and trims on a sourcing buyer's table at a garment accessories sourcing showroom"),
    ("categories/textile-sourcing/fabric",       "fabric sourcing — rolls of woven cotton, denim and polyester fabric stacked on shelves at a fabric sourcing showroom, buyers inspecting"),
    ("categories/textile-sourcing/garment",      "garment sourcing — finished garments hanging on rails at a garment sourcing showroom, buyer inspecting samples"),
    ("categories/textile-sourcing/home-textile", "home textile sourcing — folded bed linens, towels and curtains stacked at a home-textile sourcing showroom, buyer inspecting"),
    # REGIONS / AFRICA ===============================================
    ("regions/africa/egypt",       "Egypt sourcing hub — Alexandria port container terminal with cranes loading container ships, Egyptian flag visible on a tug"),
    ("regions/africa/kenya",       "Kenya sourcing hub — Mombasa port container terminal with gantry cranes and stacked containers, container ship docked"),
    ("regions/africa/morocco",     "Morocco sourcing hub — Casablanca port container terminal with cranes, container stacks and a moored container ship"),
    ("regions/africa/nigeria",     "Nigeria sourcing hub — Apapa Lagos port container terminal with cranes, container stacks and trucks queueing at gates"),
    ("regions/africa/south-africa","South Africa sourcing hub — Durban port container terminal with gantry cranes, container ship docked, harbour view"),
    # REGIONS / ASIA =================================================
    ("regions/asia/bangladesh", "Bangladesh sourcing hub — large garment factory floor in Dhaka with rows of sewing machines and workers producing garments"),
    ("regions/asia/china",      "China sourcing hub — Shanghai or Shenzhen container port with massive gantry cranes loading huge container ships, dense container yard"),
    ("regions/asia/india",      "India sourcing hub — Mumbai Nhava Sheva port container terminal with gantry cranes and stacked containers"),
    ("regions/asia/indonesia",  "Indonesia sourcing hub — Jakarta Tanjung Priok port container terminal with cranes loading a container ship"),
    ("regions/asia/pakistan",   "Pakistan sourcing hub — Karachi port container terminal with gantry cranes loading a container ship, Pakistani flag visible on a port tug"),
    ("regions/asia/vietnam",    "Vietnam sourcing hub — Hai Phong or Cat Lai container port with gantry cranes, stacked containers and a container ship docked"),
    # REGIONS / EUROPE ===============================================
    ("regions/europe/germany", "Germany sourcing hub — Hamburg container port terminal with massive gantry cranes loading a container ship, harbour buildings beyond"),
    ("regions/europe/italy",   "Italy sourcing hub — Genoa container port with cranes and stacked containers, hills behind the harbour"),
    ("regions/europe/poland",  "Poland sourcing hub — Gdansk container port terminal with gantry cranes loading a container ship at sunset"),
    ("regions/europe/spain",   "Spain sourcing hub — Port of Barcelona container terminal with gantry cranes, Mediterranean harbour view"),
    ("regions/europe/turkey",  "Turkey sourcing hub — Istanbul Bosphorus with container ships passing the strait, Galata bridge and city skyline visible"),
    # REGIONS / MIDDLE EAST ==========================================
    ("regions/middle-east/kuwait", "Kuwait sourcing hub — Shuwaikh or Shuaiba port container terminal with cranes, stacked containers and Kuwait City skyline"),
    ("regions/middle-east/oman",   "Oman sourcing hub — Sohar or Salalah port container terminal with cranes loading a large container ship, mountains in distance"),
    ("regions/middle-east/qatar",  "Qatar sourcing hub — Hamad port container terminal with gantry cranes, container stacks and Doha skyline visible far away"),
    ("regions/middle-east/saudi",  "Saudi Arabia sourcing hub — Jeddah Islamic Port container terminal with massive gantry cranes loading container ships"),
    ("regions/middle-east/uae",    "UAE sourcing hub — Jebel Ali port container terminal with rows of huge gantry cranes loading container ships, Dubai skyline in the distance"),
    # SERVICES / LOGISTICS ===========================================
    ("services/logistics/customs",         "customs clearance — customs officer at a clearance counter inspecting shipping documents at a port customs office, container yard outside"),
    ("services/logistics/freight-forward", "freight forwarding — freight forwarder agent at a desk with shipping bills of lading and a container yard visible through the window"),
    ("services/logistics/last-mile",       "last-mile delivery — fleet of small delivery vans being loaded with parcels at a last-mile distribution depot"),
    ("services/logistics/warehousing",     "third-party logistics warehousing — large 3PL warehouse interior with high-bay racking, forklift moving pallets"),
    # SERVICES / QUALITY CONTROL =====================================
    ("services/quality-control/certification", "quality certification — auditor stamping a quality certificate at a desk in a QC office, certified samples on the table"),
    ("services/quality-control/in-line",       "in-line inspection — QC inspector with checklist examining products on a moving production line at a manufacturing facility"),
    ("services/quality-control/lab-test",      "QC laboratory testing — laboratory technician testing product samples with lab instruments at a quality-control testing lab"),
    ("services/quality-control/pre-shipment",  "pre-shipment inspection — QC inspector checking finished cartons and randomly selected samples in a warehouse before shipment"),
    # SERVICES / SUPPLIER DISCOVERY ==================================
    ("services/supplier-discovery/audit",   "factory audit — auditor with clipboard inspecting a factory production floor with workers and machinery, audit checklist visible"),
    ("services/supplier-discovery/rfq",     "request for quotation — sourcing buyer at a desk reviewing RFQ documents on a laptop with product samples spread out, sourcing office"),
    ("services/supplier-discovery/sample",  "sample sourcing — buyer examining a tray of unbranded product samples on a sourcing showroom table"),
    ("services/supplier-discovery/vetting", "supplier vetting — sourcing professional reviewing supplier profiles on a laptop with factory dossiers spread on the desk in a sourcing office"),
    # SERVICES / TRADE FINANCE =======================================
    ("services/trade-finance/escrow",    "trade-finance escrow — banker reviewing escrow documents at a corporate banking desk, multiple monitors showing settlement screens"),
    ("services/trade-finance/factoring", "invoice factoring — finance officer reviewing invoice ledgers and bank statements at a corporate trade-finance bank office"),
    ("services/trade-finance/lc",        "letter of credit — banker reviewing a letter of credit document with an importer at a corporate trade-finance bank desk"),
    ("services/trade-finance/ucp600",    "UCP600 trade finance — banker examining LC documents and UCP600 reference book at a trade-finance bank office desk"),
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
            {"role": "system", "content": SOURCING_SYSTEM},
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
            # try with leading "categories/" prefix (sourcing has nested categories/categories)
            alt = os.path.join(ROOT, "categories", rel)
            if os.path.isdir(alt):
                out_dir = alt
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
