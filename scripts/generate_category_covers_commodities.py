#!/usr/bin/env python3
"""Generate the 4 category cover images for the Commodities vertical.

Direct pipeline: Groq (prompt enhancement, commodities system prompt) -> Cloudflare
Workers AI flux-1-schnell. Reads keys from .env.local. Saves to:
  public/assets/verticals/03-commodities/categories/<cat>/cover.jpg
"""
import base64, json, os, sys, time, urllib.request

ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
OUT_BASE = os.path.join(ROOT, "public/assets/verticals/03-commodities/categories")
ENV_FILE = os.path.join(ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

# Commodities-specific system prompt (mirrors src/lib/promptTemplates.ts).
COMMODITIES_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B COMMODITIES "
    "trading catalogue. Expand the user input into a single photorealistic image prompt showing "
    "the commodity in its real bulk-trade form. The subject must fill 70-85% of the frame, sole "
    "focal point. Tone: epic golden-hour or industrial-cinematic. Photographic realism only. "
    "NEGATIVE: do NOT include text, captions, logos, brand names, watermarks, signage, plaques, "
    "mock-up labels, fictional brand packaging, real-world third-party brands, magnifying glasses, "
    "jewelry/gemstones, penthouses, mall storefronts, neon signs, illustrations, 3D renders. "
    "Output ONLY the final prompt string."
)

JOBS = [
    ("agri",
     "Wide hero shot of a bulk agricultural grains trading scene at golden hour: massive grain "
     "silos and harvest field overflowing with golden wheat kernels, jute sacks brimming with "
     "rice and corn in foreground, soybeans cascading from a chute, warm cinematic backlight, "
     "dust motes in the air, photographic realism."),
    ("energy",
     "Cinematic wide shot of a global energy trading hub at sunset: oil refinery distillation "
     "columns and storage tank farm on the left, an LNG carrier ship docked at a cryogenic "
     "terminal on the right, an oil pumpjack silhouetted against fiery orange clouds, "
     "industrial steam and pipeline manifolds, dramatic golden-hour light."),
    ("metals",
     "Industrial yard hero shot: stacked aluminum ingots, coiled steel sheet, copper cathode "
     "racks gleaming, neat billet stacks and rebar bundles, hard industrial overhead light, "
     "metallic sheen, mill foundry context, photographic realism."),
    ("softs",
     "Soft commodities trading scene at golden hour: jute sacks of green coffee beans open at "
     "the top, cocoa pods split to show wet beans, compressed cotton bales in a warehouse, "
     "raw amber sugar crystals piled in a wooden bowl, warm natural daylight, rich textures, "
     "photographic realism."),
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
        "max_tokens": 400,
        "temperature": 0.7,
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
    return data["choices"][0]["message"]["content"].strip()


def cf_image(prompt, account_id, token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{CF_MODEL}"
    body = json.dumps({"prompt": prompt}).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read())
    return data["result"]["image"]


def main():
    env = load_env()
    groq_key = env.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY")
    cf_token = env.get("CLOUDFLARE_API_TOKEN") or os.environ.get("CLOUDFLARE_API_TOKEN")
    cf_account = env.get("CLOUDFLARE_ACCOUNT_ID") or os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    missing = [n for n, v in [("GROQ_API_KEY", groq_key),
                              ("CLOUDFLARE_API_TOKEN", cf_token),
                              ("CLOUDFLARE_ACCOUNT_ID", cf_account)] if not v]
    if missing:
        print(f"Missing env: {', '.join(missing)}")
        sys.exit(1)

    summary = []
    for cat, prompt in JOBS:
        out_dir = os.path.join(OUT_BASE, cat)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "cover.jpg")
        t0 = time.time()
        try:
            enhanced = groq_enhance(prompt, groq_key)
            print(f"[{cat}] enhanced: {enhanced[:120]}...")
            b64 = cf_image(enhanced, cf_account, cf_token)
            buf = base64.b64decode(b64)
            with open(out_path, "wb") as f:
                f.write(buf)
            elapsed = time.time() - t0
            print(f"[{cat}]  OK  {len(buf)//1024} KB  in {elapsed:.1f}s  ->  {out_path}")
            summary.append((cat, "OK", len(buf), elapsed))
        except Exception as e:
            print(f"[{cat}] EXC: {e}")
            summary.append((cat, "EXC", 0, time.time() - t0))

    print("\n=== SUMMARY ===")
    ok = sum(1 for s in summary if s[1] == "OK")
    print(f"  generated: {ok}/{len(summary)}")
    for c, s, n, t in summary:
        print(f"  {c:<8} {s:<3}  {n//1024:>6} KB  {t:>5.1f}s")


if __name__ == "__main__":
    main()
