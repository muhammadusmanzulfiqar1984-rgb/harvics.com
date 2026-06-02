#!/usr/bin/env python3
"""Generate one leaf.jpg per Industrial leaf folder.

Style: natural real-world product photography. Subject fills 50-65% of frame,
normal eye-level distance, environmental context visible (factory, workshop,
warehouse, lab). Cinematic but believable, not macro / not jewel-lit.

Pipeline: Groq enhances the seed phrase using INDUSTRIAL_SYSTEM, then
Cloudflare flux-1-schnell renders. Saved to:
  public/assets/verticals/04-industrial/categories/<cat>/<group>/<product>/leaf.jpg
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

REPO_ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO_ROOT, "public/assets/verticals/04-industrial/categories")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
GROQ_MODEL = "llama-3.1-8b-instant"

INDUSTRIAL_SYSTEM = (
    "You are an expert commercial photography prompt engineer for a global B2B "
    "INDUSTRIAL trading catalogue (chemicals, machinery, MRO spares, safety "
    "equipment). Expand the user input into a single photorealistic image prompt. "
    "STYLE RULES: "
    "1. Natural, believable real-world product photography. The subject fills "
    "50-65% of the frame at normal eye-level or slight three-quarter distance — "
    "NOT extreme macro, NOT jewel-lit close-ups. Environmental context "
    "(factory floor, workshop, warehouse, chemistry lab, packaging line, PPE "
    "storage rack) must be visible behind or around the subject. "
    "2. Lighting: natural industrial daylight, soft overhead factory light, or "
    "warm workshop lighting. No dramatic spotlights. No black velvet. No glossy "
    "studio sweep. Realistic shadows. "
    "3. The product itself must be technically accurate: a hydrochloric-acid "
    "drum looks different to a sulfuric-acid drum, a v-belt is not a flat belt, "
    "a thrust bearing is not a ball bearing, a fire extinguisher is not a fire "
    "alarm. Show clear distinguishing features. "
    "4. Generic unbranded products only. Plain unmarked drums, unbranded "
    "machines, generic safety gear. "
    "5. NEGATIVE: do NOT include text, captions, logos, brand names, watermarks, "
    "signage, plaques, mock-up labels, fictional brand packaging, real-world "
    "third-party brands, magnifying glasses, jewelry, neon signs, illustrations, "
    "3D renders, cartoon style, surreal lighting. "
    "Output ONLY the final prompt string."
)

LEAVES = [
    # CHEMICALS / ACIDS ===============================================
    ("chemicals/acids/acetic",        "industrial acetic acid in a 200-litre plain blue plastic drum on a wooden pallet in a chemical warehouse, faint hazard symbols"),
    ("chemicals/acids/hydrochloric",  "industrial hydrochloric acid in a 25-litre HDPE jerry can with venting cap on a steel rack in a chemical store, slight yellow tint visible"),
    ("chemicals/acids/nitric",        "concentrated nitric acid in a brown amber glass bottle on a stainless steel chemistry lab bench, fume hood softly visible behind"),
    ("chemicals/acids/phosphoric",    "industrial phosphoric acid in a 1000-litre IBC tote container in a chemical plant tank yard, bright daylight, gantry pipework around"),
    ("chemicals/acids/sulfuric",      "concentrated sulfuric acid in a heavy-duty steel drum on a chemical plant floor, bunding around it, oily reflective surface"),
    # CHEMICALS / POLYMERS ============================================
    ("chemicals/polymers/abs",   "ABS polymer pellets — small ivory-cream beads pouring from a hopper into a bulk bag at a polymer compounding plant"),
    ("chemicals/polymers/pe",    "polyethylene PE plastic pellets — translucent white-clear beads in a clear plastic sample bag on a factory bench"),
    ("chemicals/polymers/pet",   "PET polymer chips — clear glass-like flakes filling a stainless steel feed hopper at a bottle preform plant"),
    ("chemicals/polymers/pp",    "polypropylene PP pellets — milky-white round granules in a 25kg plain woven sack opening on a warehouse floor"),
    ("chemicals/polymers/ps",    "polystyrene PS pellets — clear translucent crystal granules in a clear sample jar on a polymer trading desk"),
    ("chemicals/polymers/pvc",   "PVC resin powder — fine off-white free-flowing powder in a paper-laminated 25kg sack with the top folded open, plain warehouse"),
    # CHEMICALS / SOLVENTS ============================================
    ("chemicals/solvents/acetone",  "industrial acetone solvent in a clean unlabelled steel drum with a yellow grounding wire, in a solvent storage cabinet"),
    ("chemicals/solvents/ipa",      "isopropyl alcohol IPA solvent in a stainless steel drum on a stillage with bunding, clean industrial solvent room"),
    ("chemicals/solvents/methanol", "methanol industrial solvent in a galvanised steel drum on a wooden pallet in a vented chemical warehouse"),
    ("chemicals/solvents/toluene",  "toluene industrial solvent in a tightly sealed unmarked metal drum, drum rack with grounding strap, chemical store"),
    ("chemicals/solvents/xylene",   "xylene industrial solvent in a 200-litre red unmarked metal drum on a pallet, paint and coatings warehouse context"),
    # MACHINERY / FOOD-PROCESSING =====================================
    ("machinery/food-processing/conveyors", "stainless steel sanitary food-grade conveyor belt running through a food production line, modular plastic belt visible"),
    ("machinery/food-processing/fillers",   "rotary food filling machine filling clear plastic bottles with liquid on a hygienic stainless steel production line"),
    ("machinery/food-processing/mixers",    "large stainless steel industrial food mixer with twin paddles in a bakery production hall, hopper visible above"),
    ("machinery/food-processing/ovens",     "long industrial tunnel baking oven with a conveyor exiting through a stainless hood, glowing interior heat, bakery setting"),
    ("machinery/food-processing/packers",   "automated food packaging machine sealing trays of fresh product on a high-speed line in a clean food factory"),
    # MACHINERY / PACKAGING ===========================================
    ("machinery/packaging/carton-erectors", "carton-erecting machine forming flat cardboard blanks into open cartons on an end-of-line packaging machine"),
    ("machinery/packaging/labelers",        "high-speed bottle labelling machine applying wraparound plain labels to clear glass bottles on a conveyor"),
    ("machinery/packaging/palletizers",     "robotic palletizer arm stacking sealed cartons onto a wooden pallet at the end of a packaging line"),
    ("machinery/packaging/sealers",         "industrial heat sealer machine sealing pouches at the end of a food packaging line, stainless steel housing"),
    ("machinery/packaging/shrink-wrap",     "automatic shrink-wrap tunnel with bottles passing through and clear film tightening around them under heat"),
    # MACHINERY / TEXTILE =============================================
    ("machinery/textile/dyeing",    "industrial textile dyeing machine — large stainless steel jet dye vessel in a textile mill, dye solution swirling visible"),
    ("machinery/textile/finishing", "textile finishing stenter frame machine pulling fabric through a heated chamber in a textile mill"),
    ("machinery/textile/knitting",  "circular knitting machine producing tubular knitted fabric in a knitting mill, yarn cones feeding overhead"),
    ("machinery/textile/spinning",  "textile spinning frame ring-spinning yarn from white roving in a busy spinning mill, rows of spindles"),
    ("machinery/textile/weaving",   "industrial high-speed weaving loom in operation in a textile mill, warp threads under tension and fabric forming"),
    # MRO / BEARINGS ==================================================
    ("mro/bearings/ball",   "deep-groove ball bearing — single steel ball bearing on a clean workshop bench, balls visible through the cage"),
    ("mro/bearings/linear", "linear motion bearing — linear rail with a ball-cage carriage block on an automation assembly bench"),
    ("mro/bearings/needle", "needle roller bearing — slim cylindrical needle bearing with thin rollers visible, on a workshop bench"),
    ("mro/bearings/roller", "tapered roller bearing — large industrial roller bearing on a maintenance workbench, conical rollers visible"),
    ("mro/bearings/thrust", "thrust bearing — flat washer-style thrust bearing assembly with caged balls on a workshop bench, cross-section visible"),
    # MRO / BELTS =====================================================
    ("mro/belts/conveyor", "industrial rubber conveyor belt — black fabric-reinforced conveyor belt on a roller frame in a factory"),
    ("mro/belts/flat",     "flat industrial drive belt — wide flat rubber-and-fabric belt running between two large pulleys in a workshop"),
    ("mro/belts/ribbed",   "ribbed multi-V drive belt — black ribbed serpentine belt on a workshop bench beside a pulley"),
    ("mro/belts/timing",   "industrial timing belt — black toothed timing belt with visible cogs on a workshop bench beside a toothed pulley"),
    ("mro/belts/v-belt",   "classic V-belt — black trapezoidal cross-section drive belt looped beside its grooved pulley on a workshop bench"),
    # MRO / TOOLS =====================================================
    ("mro/tools/cutting",   "set of industrial cutting tools — milling cutters and end mills laid out on a clean machinist's bench in a workshop"),
    ("mro/tools/electrical","selection of industrial electrical maintenance tools — insulated screwdrivers, pliers, multimeter on an electrician's bench"),
    ("mro/tools/hand",      "set of professional hand tools — wrenches, screwdrivers and pliers neatly laid out on a wooden mechanic's workbench"),
    ("mro/tools/measuring", "industrial precision measuring tools — vernier caliper, micrometer and steel rule on a metrology bench"),
    ("mro/tools/power",     "industrial power tools — cordless drill, angle grinder and impact wrench on a heavy-duty workshop bench"),
    # SAFETY / FIRE ===================================================
    ("safety/fire/alarms",       "industrial fire alarm — red wall-mounted manual call-point and overhead smoke detector in a clean warehouse corridor"),
    ("safety/fire/doors",        "industrial fire door — heavy steel red fire-rated door with vision panel and panic bar in a factory corridor"),
    ("safety/fire/extinguishers","red industrial CO2 fire extinguisher mounted on a workshop wall beside a fire blanket cabinet"),
    ("safety/fire/sprinklers",   "industrial ceiling sprinkler head — chrome pendant sprinkler under a warehouse ceiling, pipework visible"),
    ("safety/fire/suppressants", "industrial fire suppression system — red cylinder bank with manifold piping in a server room or kitchen"),
    # SAFETY / LOCKOUT ================================================
    ("safety/lockout/hasps",       "lockout-tagout hasp — red multi-padlock hasp clamped onto a lockout point on an electrical panel"),
    ("safety/lockout/kits",        "lockout-tagout kit — red portable case with padlocks, hasps and tags laid out on a maintenance bench"),
    ("safety/lockout/padlocks",    "lockout-tagout padlocks — set of coloured safety padlocks with keys on a maintenance bench"),
    ("safety/lockout/tags",        "lockout-tagout tags — red 'do not operate' tags hanging from a locked-out machine isolator switch"),
    ("safety/lockout/valve-locks", "valve lockout device — yellow gate-valve lockout clamped onto an industrial pipeline valve"),
    # SAFETY / PPE ====================================================
    ("safety/ppe/footwear", "industrial safety boots — pair of black steel-toe-cap safety boots on a factory floor near a workbench"),
    ("safety/ppe/gloves",   "industrial cut-resistant safety gloves — pair of grey palm-coated work gloves on a workshop bench beside a sheet of metal"),
    ("safety/ppe/goggles",  "industrial safety goggles — clear polycarbonate safety goggles on a chemistry lab bench beside a Bunsen burner"),
    ("safety/ppe/helmets",  "industrial safety helmet — yellow hard hat hanging on a hook in a construction site cabin"),
    ("safety/ppe/masks",    "industrial respirator — half-face P3 respirator with twin filter cartridges on a workshop bench"),
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
            {"role": "system", "content": INDUSTRIAL_SYSTEM},
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
