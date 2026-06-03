#!/usr/bin/env python3
"""Generate one leaf.jpg per Real Estate leaf folder.

Style: high-end architectural / property photography. Wide or
three-quarter angle showing the full building or space at eye-level
or slight elevation. Natural daylight, golden hour, or warm dusk
exteriors; bright daylight or warm interior light for interiors.
Generic unbranded buildings. No floor plans, no diagrams.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/07-real-estate/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

REAL_ESTATE_SYSTEM = (
    "You are an expert architectural and real-estate photography prompt "
    "engineer for a global B2B / B2C property catalogue (residential, "
    "commercial, industrial real estate, and land). Expand the user input "
    "into a single photorealistic image prompt. STYLE RULES: "
    "1. High-end architectural / property photography. STRONG PREFERENCE for "
    "EXTERIOR wide or three-quarter shots showing the full building in its "
    "context. Only use interior shots when the subject is intrinsically an "
    "interior space (coworking, mall atrium, hotel lobby). Eye-level or "
    "slight low-angle. NOT extreme close-ups, NOT abstract details. The "
    "building or space fills 60-80% of the frame. "
    "2. Lighting: warm golden-hour or twilight blue-hour for exteriors with "
    "interior lights glowing through windows, OR bright clean midday daylight "
    "for industrial / land. Interiors: bright natural daylight from large "
    "windows plus warm interior lighting. Realistic shadows. "
    "3. Architectural accuracy is essential: villas are detached low-rise "
    "houses with gardens; townhouses are attached multi-storey row houses; "
    "apartments are units inside multi-storey residential towers; condos are "
    "premium apartment towers; penthouse is the rooftop unit with terrace and "
    "skyline; studio is a compact single-room apartment; offices are "
    "glass-and-steel commercial towers; coworking is an open modern shared "
    "office interior; malls are large enclosed shopping centres; high street "
    "retail is street-level shopfronts; warehouses are large industrial "
    "shed-style buildings with loading docks; cold storage warehouses are "
    "insulated industrial buildings with refrigeration; container yards have "
    "stacked shipping containers; manufacturing facilities are industrial "
    "plants with cladding and chimneys; land plots are bare or partially "
    "developed parcels of land with boundary markers visible. "
    "4. Generic unbranded architecture. No real-world property developer "
    "logos, no real hotel-chain branding. "
    "5. NEGATIVE: do NOT include text, captions, logos, brand names, "
    "watermarks, signage with brand text, plaques, mock-up labels, fictional "
    "brand packaging, real-world third-party brands, floor plans, blueprints, "
    "architectural drawings, illustrations, 3D renders that look fake, "
    "cartoon style, surreal lighting, unrealistic colours. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # RESIDENTIAL / APARTMENTS =======================================
    ("residential/apartments/1-bed",      "modern one-bedroom apartment building exterior — contemporary mid-rise residential apartment building with balconies and landscaped entrance at golden hour"),
    ("residential/apartments/2-bed",      "modern two-bedroom apartment building exterior — contemporary mid-rise residential apartment block with balconies, glass facade and landscaped grounds at sunset"),
    ("residential/apartments/3-bed",      "modern family apartment building exterior — large contemporary residential apartment tower with family-sized balconies, parking and landscaping at golden hour"),
    ("residential/apartments/penthouse",  "luxury penthouse tower exterior — premium high-rise residential tower with rooftop penthouse terrace and infinity pool visible against city skyline at twilight"),
    ("residential/apartments/studio",     "studio apartment building exterior — compact modern urban studio-apartment building with painted facade and small balconies at street level, golden hour"),
    # RESIDENTIAL / CONDOS ===========================================
    ("residential/condos/affordable",     "affordable condominium tower exterior — clean modern mid-rise residential condo building in a suburban setting at golden hour"),
    ("residential/condos/luxury",         "luxury condominium tower exterior — premium high-rise glass condo tower with landscaped podium and infinity pool at twilight"),
    ("residential/condos/mid-range",      "mid-range condominium tower exterior — modern mid-rise residential condo development with landscaped grounds and pool at sunset"),
    ("residential/condos/serviced",       "serviced condominium tower exterior — premium serviced-residence tower with porte-cochere, doorman and landscaped pool deck at twilight"),
    # RESIDENTIAL / VILLAS ===========================================
    ("residential/villas/beachfront",     "beachfront luxury villa — modern beachfront villa with infinity pool, palm trees and direct ocean view at golden hour"),
    ("residential/villas/compound",       "private villa compound — gated luxury villa compound with multiple modern villas, landscaped gardens and central pool seen from above at golden hour"),
    ("residential/villas/detached",       "detached family villa — modern detached two-storey family villa with landscaped front lawn, driveway and double garage at sunset"),
    ("residential/villas/semi-detached",  "semi-detached villa pair — pair of modern semi-detached villas with shared driveway and landscaped front gardens in a suburban estate"),
    ("residential/villas/townhouse",      "modern townhouses — row of contemporary three-storey townhouses with attached garages and small front gardens at golden hour"),
    # COMMERCIAL / OFFICE ============================================
    ("commercial/office/business-park",   "modern business park — cluster of mid-rise glass-and-steel office buildings around landscaped plazas and water features at golden hour"),
    ("commercial/office/coworking",       "modern coworking office interior — open-plan coworking space with hot desks, breakout pods, plants and natural daylight"),
    ("commercial/office/grade-a",         "Grade-A office tower exterior — premium high-rise glass office tower in a financial district at twilight, lit lobby visible at base"),
    ("commercial/office/grade-b",         "Grade-B office building exterior — solid mid-rise commercial office building with glass curtain wall in a city business district at sunset"),
    ("commercial/office/headquarters",    "corporate headquarters building — landmark corporate headquarters tower with sculptural architecture and landscaped plaza at twilight"),
    # COMMERCIAL / RETAIL ============================================
    ("commercial/retail/anchor",          "anchor retail store — large anchor retail department-store building exterior with wide glass frontage and shoppers entering at dusk"),
    ("commercial/retail/high-street",     "high-street retail row — busy pedestrianised high street with row of generic unbranded shopfronts and cafes at golden hour"),
    ("commercial/retail/kiosk",           "modern retail kiosk — contemporary stand-alone retail kiosk inside a bright shopping mall atrium with glass roof"),
    ("commercial/retail/mall",            "shopping mall interior — bright multi-level shopping mall atrium with glass roof, escalators and retail storefronts on multiple floors"),
    ("commercial/retail/strip-mall",      "suburban strip mall — single-storey suburban strip mall with row of unbranded retail units and large parking lot in front at sunset"),
    # COMMERCIAL / HOSPITALITY =======================================
    ("commercial/hospitality/hostel",     "modern hostel building exterior — boutique urban hostel with painted facade, bicycles parked outside and lit lobby at twilight"),
    ("commercial/hospitality/hotel",      "luxury hotel exterior — grand modern luxury hotel building with illuminated facade, palm-lined drive and porte-cochere at twilight"),
    ("commercial/hospitality/resort",     "tropical resort — luxury beachfront resort with palm-lined infinity pool, low-rise villas and ocean view at golden hour"),
    ("commercial/hospitality/serviced-apartments", "serviced apartments tower — modern serviced-apartments tower exterior with landscaped pool deck and ground-floor restaurant at twilight"),
    # INDUSTRIAL / WAREHOUSE =========================================
    ("industrial-re/warehouse/bonded",    "bonded warehouse — secure customs bonded warehouse facility with high perimeter fence, gatehouse and trucks at the loading docks"),
    ("industrial-re/warehouse/cold",      "cold-storage warehouse — large insulated cold-storage warehouse exterior with refrigerated truck docks and frosty roller doors"),
    ("industrial-re/warehouse/dry",       "dry-goods warehouse — large modern dry-goods distribution warehouse exterior with multiple loading-dock doors and a truck parking yard"),
    ("industrial-re/warehouse/fulfillment","e-commerce fulfilment centre — vast modern fulfilment-centre warehouse exterior with extensive truck-loading docks and trailer yard"),
    ("industrial-re/warehouse/last-mile", "last-mile delivery hub — compact urban last-mile delivery warehouse with rows of small delivery vans being loaded at the docks"),
    # INDUSTRIAL / MANUFACTURING =====================================
    ("industrial-re/manufacturing/automotive","automotive manufacturing plant — large modern automotive assembly plant exterior with painted cladding, parking lot and finished-vehicle yard"),
    ("industrial-re/manufacturing/chemical",  "chemical manufacturing plant — industrial chemical processing plant with reactor vessels, distillation columns and steel pipework, at dusk"),
    ("industrial-re/manufacturing/food-grade","food-grade manufacturing facility — clean modern food-grade manufacturing plant exterior with white cladding and silos beside it"),
    ("industrial-re/manufacturing/heavy",     "heavy manufacturing plant — large heavy-industrial manufacturing plant with steel cladding, overhead cranes visible and finished-product yard"),
    ("industrial-re/manufacturing/light",     "light manufacturing facility — modern light-industrial manufacturing unit exterior with painted cladding and small loading docks in an industrial park"),
    # INDUSTRIAL / LOGISTICS =========================================
    ("industrial-re/logistics/container-yard","container yard — vast container yard with stacked shipping containers, reach-stackers and gantry cranes at a logistics terminal"),
    ("industrial-re/logistics/distribution-hub","logistics distribution hub — large modern logistics distribution hub with extensive truck-loading docks and trailer yard, drone view"),
    ("industrial-re/logistics/freight-yard",   "rail freight yard — large rail freight yard with intermodal containers, reach-stackers and freight trains at a logistics terminal"),
    # LAND / PLOTS ===================================================
    ("land/plots/agricultural",   "agricultural land plot — large fertile agricultural farmland plot with boundary markers, irrigation channels and a tractor in the distance"),
    ("land/plots/commercial",     "commercial land plot — flat cleared commercial land plot beside a main road with surveyor markers and adjacent commercial buildings"),
    ("land/plots/mixed-use",      "mixed-use land plot — cleared mixed-use development land plot at the edge of a growing city, surveyor markers and infrastructure roads visible"),
    ("land/plots/residential",    "residential land plot — flat cleared residential land plot in a new suburban subdivision with surveyor markers and surrounding new villas"),
    # LAND / DEVELOPMENT =============================================
    ("land/development/beachfront",    "beachfront development land — prime beachfront development land plot with palm trees, boundary markers and ocean view at golden hour"),
    ("land/development/gated",         "gated community development — newly built gated residential community with entrance gatehouse, boulevard and rows of villas under construction"),
    ("land/development/master-planned", "master-planned community — vast master-planned community development with mixed villas, apartments, parks and a lake, drone view at golden hour"),
    ("land/development/township",      "new township development — newly developed satellite township with grid streets, residential blocks, schools and parks, aerial view at golden hour"),
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
            {"role": "system", "content": REAL_ESTATE_SYSTEM},
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
