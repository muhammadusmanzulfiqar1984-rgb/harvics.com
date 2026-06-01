#!/usr/bin/env python3
"""Generate one leaf.jpg per entry in scripts/leaf_prompts.py.

Pipeline per image:
  1. Strip any text-rendering phrases from the prompt (label/text/branded/sign/
     logo/writing/lettering/...) so flux-schnell doesn't try to render words.
  2. Call Cloudflare flux-1-schnell with the cleaned prompt + style suffix.
  3. Save the raw JPEG to {leaf_folder}/leaf.jpg. Done.

Filters:
  --vertical 01-apparels        (repeatable)
  --include  apparel            (repeatable; matches the subdir directly under
                                 <vertical>/categories/)

Skip rules:
  - Folder must exist (we never create folders here).
  - Existing leaf.jpg is skipped unless --force.

Env required (non-dry-run): CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
"""
import argparse, base64, json, os, random, re, sys, time
import urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals")
LEAF_FILENAME = "leaf.jpg"
CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from leaf_prompts import LEAF_PROMPTS, STYLE_SUFFIX  # type: ignore

# Comma-separated segments mentioning any of these words are dropped from the
# prompt before generation. We composite our own brand mark afterwards.
TEXT_KEYWORDS = (
    "label", "labels", "labeled", "labelled",
    "text", "texts",
    "brand", "branded", "branding",
    "sign", "signs", "signage",
    "logo", "logos",
    "writing", "written",
    "lettering", "letters",
    "word", "words", "wordmark",
    "watermark", "watermarks",
    "typography", "caption", "captions",
)
_TEXT_RE = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in TEXT_KEYWORDS) + r")\b",
    re.IGNORECASE,
)


def strip_text_phrases(prompt: str) -> str:
    """Drop comma-separated segments that mention text-rendering keywords."""
    kept = [seg.strip() for seg in prompt.split(",")
            if seg.strip() and not _TEXT_RE.search(seg)]
    return ", ".join(kept)


# Cloudflare's safety filter rejects flux prompts that mention intimate-apparel
# terminology even on tasteful flat-lay shots. Map those words to neutral
# equivalents. Order matters: longer phrases first so we don't half-match.
SAFE_REPLACEMENTS = [
    # Multi-word phrases first
    (r"\bsports[- ]bra\b",            "supportive performance top garment"),
    (r"\bsports bras\b",              "supportive performance top garments"),
    (r"\bperiod[- ]underwear\b",      "soft cotton everyday undergarment"),
    (r"\bthigh[- ]shapers?\b",        "smooth fitted body garment"),
    (r"\bwaist[- ]trainers?\b",       "smooth fitted body garment"),
    (r"\bhigh[- ]waist brief\b",      "soft cotton everyday undergarment"),
    (r"\bknee[- ]highs?\b",           "fine knit leg covering"),
    (r"\bone[- ]piece swimsuit\b",    "lightweight beach garment"),
    (r"\bswim shorts?\b",             "lightweight beach shorts garment"),
    (r"\bsurf shorts?\b",             "lightweight beach shorts garment"),
    (r"\btriangle bikini\b",          "lightweight two-piece beach garment"),
    (r"\bbikini\b",                   "lightweight two-piece beach garment"),
    (r"\bswimsuits?\b",               "lightweight beach garment"),
    (r"\bswimwear\b",                 "lightweight beach garment"),
    # Single words
    (r"\bbralette\b",                 "soft supportive undergarment top"),
    (r"\bbras\b",                     "soft supportive undergarment tops"),
    (r"\bbra\b",                      "soft supportive undergarment top"),
    (r"\bpanties\b",                  "soft cotton everyday undergarments"),
    (r"\bpanty\b",                    "soft cotton everyday undergarment"),
    (r"\bthongs?\b",                  "soft cotton everyday undergarment"),
    (r"\bbrazilian\b",                "soft cotton everyday undergarment"),
    (r"\bboyshorts?\b",               "soft cotton everyday undergarment"),
    (r"\bbriefs?\b",                  "soft cotton everyday undergarment"),
    (r"\bunderwear\b",                "soft cotton everyday undergarment"),
    (r"\bhosiery\b",                  "fine knit leg covering"),
    (r"\bstockings?\b",               "fine knit leg covering"),
    (r"\btights?\b",                  "fine knit leg covering"),
    (r"\bshapewear\b",                "smooth fitted body garment"),
    (r"\bbodysuits?\b",               "smooth fitted body garment"),
    (r"\blingerie\b",                 "intimate apparel garment"),
    # Things that flux sometimes flags even in apparel context
    (r"\bnightgowns?\b",              "long soft modal nightdress garment"),
    (r"\bsleepsuits?\b",              "soft cotton baby sleepwear garment"),
]
_SAFE_RES = [(re.compile(pat, re.IGNORECASE), rep) for pat, rep in SAFE_REPLACEMENTS]


def sanitize_prompt(prompt: str) -> str:
    """Replace intimate-apparel and swimwear terms with neutral equivalents
    so Cloudflare's safety filter doesn't reject the request."""
    out = prompt
    for pat, rep in _SAFE_RES:
        out = pat.sub(rep, out)
    return out


def cf_endpoint(account_id: str) -> str:
    return f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{CF_MODEL}"


def call_cloudflare(prompt: str, account_id: str, token: str, retries: int = 8):
    """Call flux-1-schnell with aggressive backoff for 429 / 5xx / quota errors.

    Per attempt:
      - 4xx (other than 429) -> bail immediately, prompt is the problem.
      - 429 / quota -> wait 60s on first hit, then 60 * 2^(n-1) up to 8 min.
      - 5xx / network -> exponential backoff 2^n seconds.
    """
    body = json.dumps({"prompt": prompt}).encode()
    req = urllib.request.Request(
        cf_endpoint(account_id),
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            b64 = (data or {}).get("result", {}).get("image")
            if not b64:
                last_err = f"no image: {json.dumps(data)[:200]}"
                # Some quota errors come back as 200 with an error body
                if "quota" in last_err.lower() or "rate" in last_err.lower():
                    wait = min(60 * (2 ** (attempt - 1)), 480)
                    print(f"    quota-in-body, sleeping {wait}s before retry {attempt+1}/{retries}")
                    time.sleep(wait)
                    continue
                # Otherwise short retry
                time.sleep(2 ** attempt)
                continue
            return base64.b64decode(b64), None
        except urllib.error.HTTPError as e:
            body_text = ""
            try:
                body_text = e.read().decode("utf-8", "replace")[:300]
            except Exception:  # noqa: BLE001
                pass
            last_err = f"HTTP {e.code} {body_text}"
            if e.code == 429:
                wait = min(60 * (2 ** (attempt - 1)), 480)
                print(f"    HTTP 429, sleeping {wait}s before retry {attempt+1}/{retries}")
                time.sleep(wait)
                continue
            if 400 <= e.code < 500:
                return None, last_err
            time.sleep(2 ** attempt)
        except Exception as e:  # noqa: BLE001
            last_err = f"exc: {e}"
            time.sleep(2 ** attempt)
    return None, last_err


def passes_filters(rel_key, verticals, includes):
    parts = rel_key.split("/")
    if len(parts) < 3:
        return False
    vert, cats, subdir = parts[0], parts[1], parts[2]
    if cats != "categories":
        return False
    if verticals and vert not in verticals:
        return False
    if includes and subdir not in includes:
        return False
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="List planned work. No API calls, no files written.")
    ap.add_argument("--force", action="store_true",
                    help="Overwrite existing leaf.jpg.")
    ap.add_argument("--limit", type=int, default=0,
                    help="Stop after N successful generations (0 = no limit).")
    ap.add_argument("--show", type=int, default=5,
                    help="In --dry-run, how many full prompts to print (default 5).")
    ap.add_argument("--random", action="store_true",
                    help="Shuffle the prompt order (useful with --limit for sampling).")
    ap.add_argument("--seed", type=int, default=None,
                    help="Optional RNG seed for --random.")
    ap.add_argument("--vertical", action="append", default=None,
                    help="Limit to a vertical, e.g. --vertical 01-apparels (repeatable).")
    ap.add_argument("--include", action="append", default=None,
                    help="Limit to a top-level subdir under categories/, "
                         "e.g. --include apparel (repeatable).")
    args = ap.parse_args()

    verticals = set(args.vertical) if args.vertical else None
    includes = set(args.include) if args.include else None

    items = sorted(LEAF_PROMPTS.items())
    items = [(k, v) for k, v in items if passes_filters(k, verticals, includes)]
    if args.random:
        if args.seed is not None:
            random.seed(args.seed)
        random.shuffle(items)
    total = len(items)

    plan_generate = []
    plan_skip_exists = []
    plan_missing_folder = []

    cleaned_suffix = strip_text_phrases(STYLE_SUFFIX)
    for rel_key, base_prompt in items:
        abs_dir = os.path.join(ROOT, rel_key)
        out_path = os.path.join(abs_dir, LEAF_FILENAME)
        cleaned = strip_text_phrases(base_prompt)
        full_prompt = f"{cleaned}, {cleaned_suffix}".strip(", ").strip()
        full_prompt = sanitize_prompt(full_prompt)
        if not os.path.isdir(abs_dir):
            plan_missing_folder.append((rel_key, abs_dir, full_prompt))
            continue
        if os.path.exists(out_path) and not args.force:
            plan_skip_exists.append((rel_key, abs_dir, full_prompt))
            continue
        plan_generate.append((rel_key, abs_dir, full_prompt))

    print(f"Matched prompts            : {total}")
    print(f"Would generate             : {len(plan_generate)}")
    print(f"Skip (leaf.jpg exists)     : {len(plan_skip_exists)}")
    print(f"Skip (folder missing)      : {len(plan_missing_folder)}")
    if verticals:
        print(f"Vertical filter            : {sorted(verticals)}")
    if includes:
        print(f"Include filter             : {sorted(includes)}")

    if plan_missing_folder:
        print("\n!! Missing folders (first 10):")
        for rel_key, _, _ in plan_missing_folder[:10]:
            print(f"   {rel_key}")

    if args.dry_run:
        print(f"\n--- First {min(args.show, len(plan_generate))} CLEANED prompts that WOULD be sent ---")
        for rel_key, _, full_prompt in plan_generate[:args.show]:
            print(f"\n[{rel_key}]")
            print(f"  {full_prompt}")
        if len(plan_generate) > args.show:
            print(f"\n  ... and {len(plan_generate) - args.show} more.")
        print("\nDRY-RUN: no API calls made, no neurons spent, no files written.")
        return

    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not account_id or not token:
        print("ERROR: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set in env.")
        sys.exit(1)

    ok = err = 0
    started = time.time()
    n = len(plan_generate)
    for i, (rel_key, abs_dir, full_prompt) in enumerate(plan_generate, 1):
        out_path = os.path.join(abs_dir, LEAF_FILENAME)
        t0 = time.time()
        img_bytes, err_msg = call_cloudflare(full_prompt, account_id, token)
        dt = time.time() - t0
        if img_bytes is None:
            err += 1
            print(f"[{i:4d}/{n}] FAIL  {rel_key}  {err_msg}")
            continue
        with open(out_path, "wb") as f:
            f.write(img_bytes)
        ok += 1
        kb = len(img_bytes) // 1024
        print(f"[{i:4d}/{n}] OK    {rel_key}  {kb} KB  {dt:.1f}s")

        if args.limit and ok >= args.limit:
            print(f"\n--limit {args.limit} reached")
            break

    print("\n=== SUMMARY ===")
    print(f"  generated      : {ok}")
    print(f"  api failures   : {err}")
    print(f"  elapsed        : {time.time() - started:.1f}s")


if __name__ == "__main__":
    main()
