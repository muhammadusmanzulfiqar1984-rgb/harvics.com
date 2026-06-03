#!/usr/bin/env python3
"""Generate one leaf.jpg per Oil & Gas leaf folder.

Style: industrial cinematic real-world oil-and-gas photography.
Subject fills 50-65% of frame at eye-level / three-quarter distance,
environmental context (rig, refinery, pipeline corridor, terminal,
control room, tank farm) visible. Natural daylight or hard industrial
lighting. No macro, no jewel-lighting.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/06-oil-gas/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

OIL_GAS_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B "
    "OIL & GAS trading and services catalogue (upstream exploration & "
    "production, midstream transport & storage, downstream refining & "
    "petrochemicals & retail, and oilfield services). Expand the user input "
    "into a single photorealistic image prompt. STYLE RULES: "
    "1. Industrial cinematic real-world oil-and-gas photography. The subject "
    "fills 50-65% of the frame at normal eye-level or slight three-quarter "
    "distance — NOT extreme macro, NOT jewel-lit close-ups. Environmental "
    "context (drilling rig, offshore platform, refinery cracker, pipeline "
    "right-of-way, LNG terminal, tank farm, control room, service-truck yard) "
    "must be visible behind or around the subject. "
    "2. Lighting: harsh industrial overhead light, natural daylight, dawn or "
    "golden-hour cinematic light, or moody dusk floodlights on plant. "
    "Realistic shadows, atmospheric haze acceptable, steam plumes acceptable. "
    "No black velvet, no jewel spotlights. "
    "3. Technical accuracy is essential: onshore rigs are tall steel derricks "
    "over a wellhead in dusty terrain; offshore rigs are massive steel jackets "
    "or semi-submersibles in open sea; refineries are dense networks of "
    "distillation columns, fractionators, flare stacks and silver pipework; "
    "LNG terminals have spherical or full-containment cryogenic tanks and "
    "loading jetties; tank farms are clusters of large white cylindrical "
    "storage tanks with bunds; pipelines are buried or above-ground steel "
    "lines on supports through arid or forested terrain; gasoline / diesel / "
    "LPG retail is fuel pumps and tanker trucks at a forecourt; lubricants "
    "are stacked plain steel drums in a warehouse; methanol and aromatics and "
    "olefins and fertilizers are petrochemical plants with reactors and "
    "spheres; seismic is survey trucks and geophones in field; geology is "
    "core-sample boxes and rock chips on a wellsite geologist's bench. "
    "4. Generic unbranded products only. Plain unmarked drums, generic "
    "tankers, generic forecourts, no real oil-company logos. "
    "5. NEGATIVE: do NOT include text, captions, logos, brand names, "
    "watermarks, signage, plaques, mock-up labels, fictional brand packaging, "
    "real-world third-party brands (Shell, BP, Exxon, Aramco, etc.), neon "
    "signs, illustrations, 3D renders, cartoon style, surreal lighting. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # UPSTREAM / EXPLORATION =========================================
    ("upstream/exploration/appraisal",  "appraisal well — onshore appraisal drilling rig with crew running drill pipe, oil-and-gas wellsite at golden hour"),
    ("upstream/exploration/drilling",   "exploration drilling — tall onshore drilling derrick over wellhead, mud pumps and pipe racks visible at an active wildcat well"),
    ("upstream/exploration/geology",    "petroleum geology — wellsite geologist examining drill-core boxes and rock chips on a bench inside a mud-logging cabin"),
    ("upstream/exploration/seismic",    "seismic survey — vibroseis seismic trucks and geophone cables laid across an arid landscape during an oil-and-gas seismic acquisition"),
    # UPSTREAM / PRODUCTION ==========================================
    ("upstream/production/deepwater",   "deepwater production — massive deepwater semi-submersible production platform on the open ocean with helideck and flare boom"),
    ("upstream/production/offshore",    "offshore production — fixed-leg offshore oil platform with drilling derrick and accommodation block in calm sea, supply vessel nearby"),
    ("upstream/production/onshore",     "onshore oil production — pumpjack nodding over a wellhead in a desert oilfield with storage tanks and gathering lines"),
    ("upstream/production/shale",       "shale oil production — multi-well shale pad with hydraulic fracturing equipment, sand silos and fracking pumps in active operation"),
    # MIDSTREAM / TRANSPORT ==========================================
    ("midstream/transport/pipeline",    "oil and gas pipeline — large diameter coated steel pipeline on supports running through arid terrain to a pump station"),
    ("midstream/transport/rail",        "crude oil rail transport — line of black tank cars loaded with crude oil at a rail crude-loading terminal"),
    ("midstream/transport/tanker",      "crude oil tanker — VLCC very-large crude carrier ship at a marine oil terminal jetty during loading operations"),
    ("midstream/transport/truck",       "tanker truck — articulated stainless-steel fuel tanker truck at a refinery loading rack, multiple loading bays visible"),
    # MIDSTREAM / STORAGE ============================================
    ("midstream/storage/gas-storage",   "natural gas storage — underground gas-storage wellheads and compressor station with valves and meter runs in a gas storage field"),
    ("midstream/storage/lng-terminal",  "LNG terminal — large spherical and full-containment LNG storage tanks beside a marine loading jetty with LNG carrier moored"),
    ("midstream/storage/spr",           "strategic petroleum reserve — vast cluster of huge white crude-oil storage tanks in a strategic petroleum reserve facility"),
    ("midstream/storage/tank-farm",     "tank farm — rows of large white cylindrical petroleum storage tanks within bund walls at an oil terminal, pipework and walkways"),
    # SERVICES / DRILLING ============================================
    ("services/drilling/completion",    "well completion — completion crew running tubing and christmas-tree wellhead onto an oil and gas well at a wellsite"),
    ("services/drilling/directional",   "directional drilling — directional drilling control cabin with measurement-while-drilling screens, drill floor visible through window"),
    ("services/drilling/offshore-rigs", "offshore drilling rig — semi-submersible offshore drilling rig under tow in open sea with derrick and helideck silhouetted"),
    ("services/drilling/onshore-rigs",  "onshore drilling rig — large onshore land drilling rig with tall derrick, mud system and pipe rack at a remote drilling location"),
    # SERVICES / MAINTENANCE =========================================
    ("services/maintenance/inspection", "pipeline inspection — inspection technician with ultrasonic test equipment examining a pipe weld at an above-ground pipeline section"),
    ("services/maintenance/monitoring", "refinery monitoring — control-room operators at a wall of SCADA screens monitoring a refinery and pipeline network in real time"),
    ("services/maintenance/repair",     "refinery repair — maintenance crew in fire-retardant coveralls and hardhats repairing a heat exchanger at a refinery turnaround"),
    ("services/maintenance/turnaround", "refinery turnaround — large refinery turnaround in progress with cranes, scaffolding and hundreds of contractors around a cracker unit"),
    # DOWNSTREAM / REFINING ==========================================
    ("downstream/refining/blending",    "fuel blending — fuel-blending facility with stainless-steel blending headers, sample lines and storage tanks at a refinery blender"),
    ("downstream/refining/cracking",    "fluid catalytic cracker — towering FCC fluid catalytic cracking unit with regenerator and reactor at a large oil refinery at dusk"),
    ("downstream/refining/distillation","crude distillation — tall crude distillation column with insulated trays and silver pipework at an oil refinery, steam plumes"),
    ("downstream/refining/reforming",   "catalytic reforming — catalytic reformer reactors and heater stacks at a petroleum refinery reforming complex"),
    # DOWNSTREAM / PETROCHEMICALS ====================================
    ("downstream/petrochemicals/aromatics",   "aromatics petrochemical plant — benzene and xylene aromatics plant with distillation columns and storage spheres at dawn"),
    ("downstream/petrochemicals/fertilizers", "ammonia urea fertilizer plant — large urea fertilizer petrochemical plant with reformer, ammonia reactors and granulation tower"),
    ("downstream/petrochemicals/methanol",    "methanol plant — methanol petrochemical plant with reformer, methanol synthesis loop and storage spheres, steam plumes"),
    ("downstream/petrochemicals/olefins",     "ethylene olefins cracker — large ethylene steam cracker plant with cracking furnaces and tall product fractionators at twilight"),
    # DOWNSTREAM / RETAIL ============================================
    ("downstream/retail/diesel",        "diesel retail — generic unbranded service-station forecourt with diesel pumps and a tanker truck refilling underground tanks at dusk"),
    ("downstream/retail/gasoline",      "gasoline retail — generic unbranded service-station forecourt with gasoline pumps and overhead canopy, customer car at pump"),
    ("downstream/retail/lpg",           "LPG retail distribution — LPG cylinder filling and distribution yard with stacked steel LPG cylinders and a bulk LPG bobtail truck"),
    ("downstream/retail/lubricants",    "lubricants warehouse — pallets of plain unbranded steel lubricant drums and totes stacked in a lubricants distribution warehouse"),
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
            {"role": "system", "content": OIL_GAS_SYSTEM},
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
