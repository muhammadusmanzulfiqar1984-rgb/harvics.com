#!/usr/bin/env python3
"""Generate one leaf.jpg per AI / Tech leaf folder.

Style: modern realistic technology photography. Data centres,
server racks, modern dev workstations, robotics on factory floors,
operations centres, IoT sensors in real industrial context. No fantasy
cyberpunk neon. No literal floating brain illustrations.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/10-ai-tech/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

AI_TECH_SYSTEM = (
    "You are an expert documentary photography prompt engineer for a global "
    "AI & TECHNOLOGY catalogue. Expand the user input into a single "
    "photorealistic image prompt. STYLE RULES: "
    "1. DOCUMENTARY / EDITORIAL REALISM in the style of Reuters, AP and "
    "WIRED feature photography. Plain real data centres with metal server "
    "racks under normal cool LED light, real Network Operations Centre "
    "rooms with rows of plain monitors and a normal projector wall, real "
    "factory floors with real industrial robots, real research labs, real "
    "telecom rooftops with real 5G antennas, real engineers in normal "
    "shirts at plain office desks with normal flat-screen monitors. "
    "2. STRONGLY AVOID neon cyberpunk colour grading, glowing purple/pink/"
    "teal mood lighting, theatrical fog, holographic floating UI, glowing "
    "transparent cubes, glowing brains, abstract swirling particles, "
    "futuristic curved video walls, sci-fi sets. Keep colours natural. "
    "3. Subject specificity: data centres look like real photographs of "
    "real data centres (metal server racks, structured cabling overhead, "
    "cool LED ceiling); robotics shots show real industrial robots on "
    "real factory lines (orange/yellow KUKA-style arms, autonomous mobile "
    "robots in real warehouses, real agricultural robots in real fields); "
    "AR-VR shots show a real person wearing a real generic VR headset in "
    "a real space; quantum shots show a real dilution-refrigerator "
    "quantum computer in a real research lab; IoT shots show small "
    "generic sensor devices on real industrial equipment; UI screenshots "
    "are clean generic dashboards on a single normal monitor in a plain "
    "office (NOT a wall of giant theatrical screens). "
    "4. Generic unbranded everything. NO real tech-company logos (Google, "
    "Microsoft, AWS, NVIDIA, Apple, OpenAI, IBM, Meta), NO real "
    "cryptocurrency logos. "
    "5. NEGATIVE: do NOT include readable text captions, brand-name logos, "
    "watermarks, signage with brand text, real-world third-party brands, "
    "real-world tech-company logos, neon cyberpunk lighting, fantasy "
    "floating cubes, glowing brains, holograms (unless leaf is "
    "specifically AR-VR), abstract swirling particles, illustrations, 3D "
    "renders that look fake, cartoon style, surreal lighting. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # AI SERVICES / GENERATIVE =======================================
    ("ai-services/generative/image","generative AI image studio — designer at a plain office desk with a normal monitor displaying AI-generated photographs, plain creative office, daylight"),
    ("ai-services/generative/text", "generative AI text — close shot of a single normal monitor showing a clean generic large-language-model chat interface with a long response, plain office, daylight"),
    ("ai-services/generative/video","generative AI video — video editor at a plain editing desk with a normal monitor showing an AI-generated video frame, plain post-production studio, daylight"),
    ("ai-services/generative/voice","generative AI voice — audio engineer at a plain studio desk with a normal microphone on a boom arm and a monitor showing voice waveforms, plain studio, normal lighting"),
    # AI SERVICES / NLP ==============================================
    ("ai-services/nlp/chatbot",       "AI chatbot — close hands shot of a customer holding a smartphone showing a generic clean chatbot conversation UI, plain office background, daylight"),
    ("ai-services/nlp/sentiment",     "NLP sentiment analysis — close shot of a single normal monitor showing a clean generic sentiment-analysis dashboard with green and red bars, plain office, daylight"),
    ("ai-services/nlp/summarization", "NLP text summarisation — close shot of a single normal monitor showing a generic document-summarisation interface with full text on the left and a bullet summary on the right, plain office"),
    ("ai-services/nlp/translation",   "NLP machine translation — close hands shot of a smartphone showing a generic translation app with two languages side by side, plain background"),
    # AI SERVICES / PREDICTION =======================================
    ("ai-services/prediction/churn",  "AI churn prediction — close shot of a single normal monitor showing a clean generic customer-churn-prediction dashboard with risk segments, plain office, daylight"),
    ("ai-services/prediction/demand", "AI demand forecasting — close shot of a single normal monitor showing a clean generic demand-forecasting dashboard with time-series charts, plain office, daylight"),
    ("ai-services/prediction/fraud",  "AI fraud detection — fintech security analyst at a plain desk with two normal monitors showing a fraud-alert dashboard with flagged transactions, plain office, daylight"),
    ("ai-services/prediction/price",  "AI price prediction — close shot of a single normal monitor showing a clean generic AI price-prediction dashboard with predicted-vs-actual charts, plain office"),
    # AI SERVICES / VISION ===========================================
    ("ai-services/vision/face",            "computer vision face recognition — single normal monitor at an airport security desk showing a generic face-recognition interface with detection boxes around faces in a queue, plain terminal background"),
    ("ai-services/vision/object-detection","computer vision object detection — single normal monitor at a logistics hub showing live camera footage with bright bounding boxes around vehicles and people on a real warehouse loading dock"),
    ("ai-services/vision/ocr",             "computer vision OCR — close hands shot of a smartphone scanning a paper invoice on a plain office desk, screen showing extracted structured invoice fields, daylight"),
    ("ai-services/vision/scene",           "computer vision scene understanding — single normal monitor showing a real city street scene with semantic-segmentation colour overlays, plain research office, daylight"),
    # EMERGING / AR-VR ===============================================
    ("emerging/ar-vr/gaming",     "AR-VR gaming — young gamer in a plain living room wearing a generic black VR headset and holding controllers, arms reaching out, daylight"),
    ("emerging/ar-vr/real-estate","AR-VR real estate — property buyer wearing a generic VR headset standing in a plain real-estate agency office, agent watching beside her, daylight"),
    ("emerging/ar-vr/retail",     "AR-VR retail — shopper wearing a generic VR headset reaching toward a virtual product in a plain modern retail showroom, daylight"),
    ("emerging/ar-vr/training",   "AR-VR industrial training — industrial trainee in coveralls wearing a generic VR headset standing at a real machine in a plain industrial training centre, daylight"),
    # EMERGING / BLOCKCHAIN ==========================================
    ("emerging/blockchain/contracts",   "blockchain smart contracts — close shot of a single normal monitor showing a generic smart-contract code editor and a transaction ledger UI, plain office, daylight"),
    ("emerging/blockchain/identity",    "blockchain digital identity — close hands shot of a customer holding a smartphone showing a generic decentralised digital-identity QR scan screen, plain government counter behind, daylight"),
    ("emerging/blockchain/payments",    "blockchain payments — close hands shot of a smartphone showing a generic blockchain payment confirmation screen, plain shop counter background, daylight"),
    ("emerging/blockchain/supply-chain","blockchain supply chain — warehouse worker scanning a QR code on a plain shipping crate with a tablet showing a generic blockchain traceability ledger, plain warehouse, daylight"),
    # EMERGING / QUANTUM =============================================
    ("emerging/quantum/cryptography","quantum cryptography lab — real-looking quantum-computing research lab with a real dilution-refrigerator quantum computer hanging in a clean room, monitor showing a generic quantum-key-distribution dashboard"),
    ("emerging/quantum/optimization","quantum optimisation lab — real quantum-computing research lab with a real dilution-refrigerator quantum computer in a clean room, monitor showing optimisation results"),
    ("emerging/quantum/simulation",  "quantum simulation lab — real quantum-computing research lab with a real dilution-refrigerator quantum computer in a clean room, monitor showing molecular simulation results"),
    # EMERGING / ROBOTICS ============================================
    ("emerging/robotics/agri",         "agricultural robotics — real four-wheeled autonomous agricultural robot tending crop rows in a real farm field, daylight"),
    ("emerging/robotics/logistics",    "logistics robotics — real autonomous mobile robots ferrying plain totes through long aisles in a real e-commerce fulfilment warehouse, normal warehouse lighting"),
    ("emerging/robotics/manufacturing","industrial manufacturing robotics — row of real orange industrial robotic arms welding car bodies on a real automotive assembly line, normal factory lighting"),
    ("emerging/robotics/service",      "service robotics — real humanoid service robot serving drinks on a tray in a plain modern hotel lobby, daylight"),
    # INFRASTRUCTURE / CLOUD =========================================
    ("infrastructure/cloud/compute", "cloud compute data centre — real hyperscale data-centre hall with rows of GPU server racks under normal cool LED ceiling light, structured cabling overhead"),
    ("infrastructure/cloud/network", "cloud networking — close shot of a real fibre-optic patch panel in a data centre with rows of plugged blue and orange fibre patch cables, normal lighting"),
    ("infrastructure/cloud/security","cloud security operations centre — real security operations centre with rows of plain desks and monitors showing world-map cyber-threat dashboards, normal office lighting"),
    ("infrastructure/cloud/storage", "cloud storage data centre — real hyperscale data-centre storage hall with rows of high-density storage server racks under normal cool LED light, structured cabling overhead"),
    # INFRASTRUCTURE / DEVOPS ========================================
    ("infrastructure/devops/ci-cd",         "DevOps CI/CD pipeline — close shot of a single normal monitor showing a generic CI/CD pipeline graph with green build stages, plain engineering office, daylight"),
    ("infrastructure/devops/monitoring",    "DevOps monitoring — real network operations centre with rows of plain desks and monitors showing infrastructure-monitoring dashboards, normal office lighting"),
    ("infrastructure/devops/observability", "DevOps observability — close shot of a single normal monitor showing a generic distributed-tracing flame graph and dependency map, plain engineering office, daylight"),
    ("infrastructure/devops/sre",           "site reliability engineering incident response — real SRE incident war-room with engineers at plain desks responding to a production incident on monitors, normal lighting"),
    # INFRASTRUCTURE / EDGE ==========================================
    ("infrastructure/edge/5g",          "5G edge antenna — real 5G base-station antenna array on a city rooftop with a real city skyline behind, daylight"),
    ("infrastructure/edge/cdn",         "CDN edge node — real small edge data-centre rack room with rows of edge servers, normal lighting"),
    ("infrastructure/edge/edge-compute","edge compute cabinet — real ruggedised edge-compute cabinet installed on a real factory floor beside heavy machinery, normal factory lighting"),
    ("infrastructure/edge/fog",         "fog compute street cabinet — real telecom-grade fog-compute street cabinet on a real city street, daylight"),
    # PLATFORMS / DATA PLATFORM ======================================
    ("platforms/data-platform/governance","data governance — close shot of a single normal monitor showing a clean generic data-governance dashboard with data-quality metrics, plain office, daylight"),
    ("platforms/data-platform/ingestion", "data ingestion pipelines — close shot of a single normal monitor showing a generic real-time stream-processing pipeline dashboard, plain office, daylight"),
    ("platforms/data-platform/lake",      "data lake — close shot of a single normal monitor showing a generic data-lake catalogue UI, real data-centre racks visible through the door behind, normal lighting"),
    ("platforms/data-platform/warehouse", "data warehouse — close shot of a single normal monitor showing a generic cloud-data-warehouse query console with a query result table, plain office, daylight"),
    # PLATFORMS / ERP-OS =============================================
    ("platforms/erp-os/crm",     "ERP CRM platform — close shot of a single normal monitor showing a generic clean CRM pipeline dashboard with deal cards, plain office, daylight"),
    ("platforms/erp-os/finance", "ERP finance platform — close shot of a single normal monitor showing a generic clean ERP finance dashboard with general-ledger and P&L charts, plain office, daylight"),
    ("platforms/erp-os/hr",      "ERP HR platform — close shot of a single normal monitor showing a generic clean HRIS people-analytics dashboard, plain office, daylight"),
    ("platforms/erp-os/scm",     "ERP supply-chain platform — close shot of a single normal monitor showing a generic clean SCM control-tower dashboard with a global shipment map, plain office, daylight"),
    # PLATFORMS / IOT ================================================
    ("platforms/iot/gateways",  "IoT gateway device — close shot of a small industrial IoT gateway device mounted on a control panel inside a real factory floor with machinery in soft focus behind"),
    ("platforms/iot/monitoring","IoT monitoring — real industrial operations centre with rows of plain desks and monitors showing IoT telemetry dashboards and a global asset map, normal lighting"),
    ("platforms/iot/sensors",   "IoT industrial sensors — close shot of small generic IoT sensor devices clamped onto a real factory pipeline and motor with cabling, real factory floor in soft focus"),
    ("platforms/iot/twin",      "IoT digital twin — engineer at a plain industrial-operations desk with a normal monitor showing a 3D digital-twin model of a real factory, normal lighting"),
    # PLATFORMS / SAAS ===============================================
    ("platforms/saas/b2b",       "B2B SaaS analytics — close shot of a single normal monitor showing a generic clean B2B SaaS analytics dashboard with revenue and usage charts, plain office, daylight"),
    ("platforms/saas/b2c",       "B2C SaaS app — close hands shot of a customer holding a smartphone showing a generic clean consumer SaaS app screen, plain cafe background, daylight"),
    ("platforms/saas/horizontal","horizontal SaaS suite — close shot of a single normal monitor showing a generic clean horizontal SaaS productivity-suite home page with multiple app tiles, plain office"),
    ("platforms/saas/vertical",  "vertical SaaS — close shot of a single normal monitor showing a generic clean vertical-SaaS dashboard tailored to a specific industry, plain office, daylight"),
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
            {"role": "system", "content": AI_TECH_SYSTEM},
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
