#!/usr/bin/env python3
"""Generate one leaf.jpg per Finance leaf folder.

Style: high-end financial / banking / capital-markets photography.
Subject 50-65% of frame. Trading floors, banking halls, vault interiors,
private banker offices, fintech UI shots. Cinematic warm lighting.
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/09-finance/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

FINANCE_SYSTEM = (
    "You are an expert documentary photography prompt engineer for a global "
    "FINANCE catalogue. Expand the user input into a single photorealistic "
    "image prompt. STYLE RULES: "
    "1. DOCUMENTARY / EDITORIAL REALISM in the style of Reuters, AP and "
    "Bloomberg news photography. Plain real-world bank branches, real "
    "trading-room desks (rows of normal flat-screen monitors on plain "
    "desks under fluorescent ceiling tiles), real cars and real machinery "
    "and real buildings being financed, real cash counters, real ATM "
    "lobbies, real merchant counters with normal POS terminals. People "
    "in plain shirts / business attire. "
    "2. STRONGLY AVOID staged 'luxury props' — NO fountain pens, NO gold "
    "pens, NO wax seals, NO ornate engraved certificates, NO ceremonial "
    "scrolls, NO prayer beads, NO calligraphy backdrops, NO Arabic-prop "
    "styling for Islamic finance (just normal modern bank). NO curved "
    "futuristic video walls, NO holographic dashboards, NO neon "
    "cyberpunk colour grading, NO theatrical blue-uplight 'cinematic' "
    "trading floors. Keep colours natural. "
    "3. Subject specificity for Islamic finance: ijara is a generic "
    "modern bank handing over a leased asset (a car key, a forklift, a "
    "tractor, a property) to a customer at a bank desk; murabaha is a "
    "modern bank approving a goods-purchase facility with a normal "
    "invoice and bank desk; sukuk is a normal modern Islamic-bank "
    "office with a printed prospectus and laptop; takaful is a normal "
    "modern insurance office handing a printed policy to a customer. "
    "4. Subject specificity for capital markets: trading floors look "
    "like real Bloomberg / Reuters newsroom photos — rows of normal "
    "monitors on plain desks, traders in shirts, fluorescent overhead "
    "light, NOT a glowing video-wall set. "
    "5. Generic unbranded everything. NO real bank logos, NO real "
    "cryptocurrency logos. "
    "6. NEGATIVE: do NOT include readable text captions, brand-name "
    "logos, watermarks, signage with brand text, real-world third-party "
    "brands, real-world bank logos, real cryptocurrency logos, neon "
    "signs, illustrations, 3D renders, cartoon style, surreal lighting, "
    "fountain pens, wax seals, ornate scrolls, ceremonial props. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # ADVISORY / CORPORATE ===========================================
    ("advisory/corporate/ipo",            "IPO advisory — corporate finance team in a normal modern boardroom reviewing a printed IPO prospectus and laptops, daylight from city windows, plain office, no theatrical lighting"),
    ("advisory/corporate/m-and-a",        "M&A advisory — two business executives shaking hands at a normal modern boardroom table after signing merger documents, plain corporate boardroom, daylight"),
    ("advisory/corporate/restructuring",  "corporate restructuring — restructuring advisors and a CFO at a plain modern meeting table reviewing thick binders of restructuring plans and laptops, daylight, plain corporate office"),
    ("advisory/corporate/valuation",      "corporate valuation — analyst at a plain office desk with two normal monitors showing a DCF spreadsheet, printed valuation report and a regular ballpoint pen, daylight"),
    # ADVISORY / WEALTH ==============================================
    ("advisory/wealth/estate",         "estate planning — wealth advisor sitting with an older couple at a normal modern desk reviewing printed estate-planning trust documents, plain advisory office, daylight"),
    ("advisory/wealth/family-office",  "family office — small family-office team in a plain modern meeting room reviewing portfolio reports and laptops, normal office daylight"),
    ("advisory/wealth/portfolio",      "portfolio management — wealth manager at a plain modern desk with two normal monitors showing portfolio asset-allocation pie charts, daylight, plain office"),
    ("advisory/wealth/private-banking","private banking — private banker meeting with a client across a plain modern desk in a private-banking office, laptop and printed account statement, daylight"),
    # BANKING / CORPORATE ============================================
    ("banking/corporate/cash-mgmt",     "corporate cash management — corporate banker at a plain modern desk with two monitors showing a cash-position dashboard and printed treasury reports, daylight, plain office"),
    ("banking/corporate/term-loans",    "corporate term loan — CFO and corporate banker shaking hands across a plain modern desk after signing a term-loan agreement, plain bank meeting room, daylight"),
    ("banking/corporate/trade-finance", "corporate trade finance — trade-finance banker at a plain modern desk reviewing printed letter-of-credit documents and bills of lading, container-port photo on the wall, daylight"),
    ("banking/corporate/working-capital","corporate working capital — corporate banker reviewing printed invoice ledgers and a working-capital facility agreement at a plain modern bank desk, daylight"),
    # BANKING / ISLAMIC ==============================================
    ("banking/islamic/ijara",   "Islamic ijara asset-finance — Islamic banker handing over generic car keys to a customer across a plain modern Islamic-bank desk after signing an ijara lease agreement, parked sedan visible through window, daylight, plain bank branch"),
    ("banking/islamic/murabaha","Islamic murabaha goods financing — Islamic banker reviewing a printed goods-purchase invoice with a corporate customer at a plain modern Islamic-bank desk, daylight, plain bank branch"),
    ("banking/islamic/sukuk",   "Islamic sukuk — Islamic-bank capital-markets banker reviewing a plain printed sukuk prospectus and laptop at a plain modern desk in an Islamic-finance office, daylight"),
    ("banking/islamic/takaful", "Islamic takaful insurance — Islamic-finance insurance officer handing a printed takaful policy to a customer at a plain modern desk in an Islamic-finance branch, daylight"),
    # BANKING / RETAIL ===============================================
    ("banking/retail/cards",         "retail debit and credit cards — close shot of three generic unbranded plastic credit and debit cards lying on a plain bank counter beside a normal POS terminal, daylight"),
    ("banking/retail/deposits",      "retail bank deposits — retail bank teller behind a normal counter handing a deposit slip and receipt to a customer, plain modern bank-branch interior, daylight"),
    ("banking/retail/mortgages",     "retail mortgage — young couple receiving generic house keys across a plain modern bank desk from a mortgage banker after signing a home-loan agreement, daylight, plain bank branch"),
    ("banking/retail/personal-loans","retail personal loans — retail loan officer reviewing a printed personal-loan application with a customer at a plain modern bank desk, daylight, plain bank branch"),
    # CAPITAL MARKETS / DEBT =========================================
    ("capital-markets/debt/bonds",            "corporate bonds — bond trader at a plain trading-room desk with four normal flat-screen monitors showing bond yield-curve charts, fluorescent overhead light, real trading-room"),
    ("capital-markets/debt/commercial-paper", "commercial paper — money-market dealer at a plain trading-room desk with multiple normal flat-screen monitors showing short-term commercial-paper rates, fluorescent overhead light"),
    ("capital-markets/debt/notes",            "structured notes — capital-markets structurer at a plain office desk with two normal monitors showing a structured-note pricing model and printed term sheets, daylight"),
    ("capital-markets/debt/sukuk",            "sukuk capital markets — Islamic-finance capital-markets banker at a plain modern desk reviewing a plain printed sukuk prospectus and laptop, plain office, daylight"),
    # CAPITAL MARKETS / DERIVATIVES ==================================
    ("capital-markets/derivatives/commodity",     "commodities derivatives trading room — wide documentary shot of a real commodities trading room with rows of plain desks each with four to six normal flat-screen monitors showing oil and grain charts, traders in shirts, fluorescent ceiling light"),
    ("capital-markets/derivatives/equity",        "equity options trading room — wide documentary shot of a real equity-options trading room with rows of plain desks each with four to six normal flat-screen monitors showing options chains, traders in shirts, fluorescent ceiling light"),
    ("capital-markets/derivatives/fx",            "FX trading room — wide documentary shot of a real FX trading room with rows of plain desks each with four to six normal flat-screen monitors showing currency-pair charts, traders in shirts, fluorescent ceiling light, plain office carpet"),
    ("capital-markets/derivatives/interest-rate", "interest-rate derivatives trading room — wide documentary shot of a real interest-rate-swaps trading room with rows of plain desks each with four to six normal flat-screen monitors showing yield curves, traders in shirts, fluorescent ceiling light"),
    # CAPITAL MARKETS / EQUITY =======================================
    ("capital-markets/equity/ipo",       "stock-exchange IPO listing day — documentary shot of a stock-exchange trading floor on a listing day with traders at normal monitor desks watching tickers on overhead boards, no confetti theatrics"),
    ("capital-markets/equity/listed",    "stock-exchange trading floor — documentary shot of a real stock-exchange trading floor with traders at rows of normal monitor desks below large overhead ticker boards, fluorescent overhead light"),
    ("capital-markets/equity/private",   "private equity — private-equity dealmakers in a plain modern boardroom reviewing buyout deal documents on the table, daylight, plain corporate office"),
    ("capital-markets/equity/secondary", "secondary equity market — broker at a plain trading-room desk with multiple normal flat-screen monitors showing aftermarket trading screens, fluorescent ceiling light"),
    # HPAY / CRYPTO ==================================================
    ("hpay/crypto/btc",        "Bitcoin mining facility — documentary shot of a real industrial crypto-mining warehouse with long rows of ASIC mining rigs in plain metal racks, normal LED lighting, no logos, no neon"),
    ("hpay/crypto/eth",        "Ethereum staking data centre — documentary shot of a real data-centre hall with rows of GPU servers in plain server racks under cool overhead LED light, no logos, no neon"),
    ("hpay/crypto/harvicoin",  "crypto operations centre — documentary shot of a plain modern fintech operations room with two operators at plain desks with normal monitors showing generic blockchain dashboards, no logos"),
    ("hpay/crypto/stablecoin", "stablecoin treasury — close shot of a generic black hardware crypto wallet device on a plain office desk beside a printed stablecoin-reserve treasury report, daylight"),
    # HPAY / SETTLEMENT ==============================================
    ("hpay/settlement/b2b",            "B2B payments operations — fintech operations team at plain desks with normal monitors processing high-value B2B payments, plain modern open-plan operations room, daylight"),
    ("hpay/settlement/b2c",            "B2C payments operations — fintech operations team at plain desks with normal monitors monitoring real-time consumer payment-settlement dashboards, plain modern operations room, daylight"),
    ("hpay/settlement/escrow",         "escrow settlement — close shot of a printed escrow agreement and a generic key on a plain office desk beside a laptop showing an escrow dashboard, daylight"),
    ("hpay/settlement/reconciliation", "payments reconciliation — operations analyst at a plain office desk with two normal monitors showing a payments-reconciliation dashboard and printed payment ledgers, daylight"),
    # HPAY / TRANSFERS ===============================================
    ("hpay/transfers/bulk",         "bulk payments — fintech operations dashboard on a plain monitor showing bulk payroll and supplier-payment runs at a plain office desk, daylight"),
    ("hpay/transfers/cross-border", "cross-border transfers — fintech operations team at plain desks with normal monitors showing a global cross-border-payments routing dashboard with a world map, plain modern operations room, daylight"),
    ("hpay/transfers/domestic",     "domestic instant payments — close hands shot of a customer holding a smartphone showing a generic instant-payments confirmation screen at a plain bank counter, daylight"),
    ("hpay/transfers/instant",      "instant payments — close hands shot of a customer holding a smartphone showing a generic instant-payments confirmation screen at a plain cafe counter, daylight"),
    # HPAY / WALLET ==================================================
    ("hpay/wallet/agent",     "agent banking kiosk — documentary shot of a small corner-shop agent banking kiosk in a developing-country street with the agent serving a customer using a generic mobile-wallet POS device on the counter"),
    ("hpay/wallet/business",  "business mobile wallet — close shot of a small-business owner at a plain shop counter using a generic business mobile-wallet app on a smartphone, normal POS terminal beside, daylight"),
    ("hpay/wallet/consumer",  "consumer mobile wallet — close hands shot of a customer holding a smartphone showing a generic consumer mobile-wallet payment screen at a plain cafe counter, daylight"),
    ("hpay/wallet/merchant",  "merchant tap-to-pay — close hands shot of a customer's plastic card tapping a generic merchant POS terminal at a plain retail counter, daylight"),
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
            {"role": "system", "content": FINANCE_SYSTEM},
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
