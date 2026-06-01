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
    "03-commodities":"epic aerial golden hour, vast cargo port at sunset, containers stenciled HARVICS, majestic global trade",
    "04-industrial": "dark chiaroscuro industrial photography, heavy machinery steel-blue tones, brushed metal plaque engraved HARVICS",
    "05-minerals":   "macro jewel lighting on black velvet, raw precious minerals, polished jeweler loupe engraved HARVICS",
    "06-oil-gas":    "cinematic golden hour offshore rig, fiery sunset, illuminated letters HARVICS on rig",
    "07-real-estate":"dusk-lit ultra-luxury penthouse interior, panoramic city skyline, key fob engraved HARVICS, Armani Casa aesthetic",
    "08-sourcing":   "aerial drone view global supply chain hub, glowing data overlay, signage HARVICS GLOBAL VENTURES",
    "09-finance":    "dark mode elite trading desk, candlestick charts, gold accents, central dashboard HARVICS FINANCE",
    "10-ai-tech":    "electric blue cyan neural network on deep dark background, holographic text HARVICS AI TECH",
}


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
    args = ap.parse_args()

    leaves = list(find_leaves(set(args.vertical) if args.vertical else None))
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
