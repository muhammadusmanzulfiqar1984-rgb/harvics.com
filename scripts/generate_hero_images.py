#!/usr/bin/env python3
"""Generate one hero image per vertical via /api/groq/process."""
import json, base64, time, os, sys, urllib.request

ENDPOINT = "http://localhost:3000/api/groq/process"
ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/public/assets/verticals"

JOBS = [
    ("01-apparels",
     "masterpiece, best quality, cinematic photography, 8k uhd, ultra-detailed, sharp focus, dramatic studio lighting, close-up hyper-luxury fashion atelier, rich draped silk velvet cashmere fabrics deep emerald black tones, intricate gold thread embroidery, bespoke garment on polished brass hanger, moody dark studio Armani Dior aesthetic, sophisticated brass plaque engraved HARVICS, hyper-realistic exquisite texture",
     "blurry, people, low quality, watermark, cartoon, text"),
    ("02-fmcg",
     "masterpiece, best quality, product photography, 8k uhd, ultra-detailed, sharp focus, bright studio lighting, premium consumer products on seamless polished white Carrara marble, luxury skincare bottles gourmet glass jars organic packaging arranged with artistic precision, Nestle Unilever catalog style, central product gold embossed label HARVICS, pristine flawless presentation",
     "blurry, people, dark background, low quality, watermark, text"),
    ("03-commodities",
     "masterpiece, best quality, aerial photography, 8k uhd, cinematic, golden hour, epic scale, wide aerial drone view massive international cargo port sunset, thousands shipping containers intricate patterns, deep-sea container ship loading, fiery orange purple clouds sky, container stenciled clean white letters HARVICS, majestic global trade aesthetic",
     "blurry, low quality, watermark, night, dark, text"),
    ("04-industrial",
     "masterpiece, best quality, industrial photography, 8k uhd, chiaroscuro lighting, ultra-detailed, hyperrealistic, massive complex heavy machinery automated CNC mills giant robotic arms, dramatic high-contrast deep shadows intense metallic highlights, severe steel blue tones, brushed metal plaque prominently engraved HARVICS, raw engineering power aesthetic",
     "blurry, people, low quality, watermark, bright colors, text"),
    ("05-minerals",
     "masterpiece, best quality, macro photography, 8k uhd, ultra-detailed, jewel lighting, luxury catalog, raw gold nuggets uncut precious minerals raw diamonds sapphire emerald, deep plush black velvet backdrop, high-contrast jewel lighting natural brilliance rough textures, polished jeweler loupe engraved HARVICS nearby, sophisticated luxury macro detail",
     "blurry, people, low quality, watermark, white background, text"),
    ("06-oil-gas",
     "masterpiece, best quality, cinematic landscape photography, 8k uhd, dramatic lighting, epic scale, golden hour, massive offshore oil rig facility restless ocean, violent beautiful sunset dramatic fiery clouds, ocean surface reflects deep oranges, illuminated glowing letters on main rig structure HARVICS, high-end corporate documentary aesthetic",
     "blurry, low quality, watermark, daytime, calm sea, text"),
    ("07-real-estate",
     "masterpiece, best quality, interior architecture photography, 8k uhd, ultra-detailed, luxury aesthetic, dusk lighting, ultra-luxury penthouse living room, floor-to-ceiling windows panoramic city skyline dusk lights twinkling, minimal sleek furniture velvet polished marble gold accents, luxury key fob console table engraved HARVICS, Armani Casa aesthetic exceptional luxury",
     "blurry, people, low quality, watermark, daytime, text"),
    ("08-sourcing",
     "masterpiece, best quality, aerial drone photography, 8k uhd, epic scale, cinematic logistics aesthetic, vast global supply chain hub aerial view, massive warehouses cargo planes runway lines semi-trucks, glowing digital lines global supply chain matrix overlay, largest building prominent signage HARVICS GLOBAL VENTURES, majestic scale complex",
     "blurry, low quality, watermark, ground level, dark, text"),
    ("09-finance",
     "masterpiece, best quality, macro photography, 8k uhd, ultra-detailed, dark mode, gold accents, elite finance aesthetic, sophisticated high-end trading setup triple monitor array, complex dark mode interfaces real-time candlestick charts financial matrices global market numbers, sharp gold accent lines, central dashboard displays HARVICS FINANCE logo, serious elite vibe",
     "blurry, bright colors, low quality, watermark, people, text"),
    ("10-ai-tech",
     "masterpiece, best quality, digital art, 8k uhd, cinematic, electric blue cyan, deep dark background, abstract neural network visualization, glowing electric blue cyan nodes data pathways pure deep dark background, vast sophisticated abstract complexity, central hub projects holographic text HARVICS AI TECH, high-tech sophisticated presentation",
     "blurry, bright background, low quality, watermark, people, white background, text"),
]

def main():
    summary = []
    for vertical, prompt, negative in JOBS:
        out_dir = os.path.join(ROOT, vertical, "hero")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "hero.jpg")
        full = f"{prompt}. NEGATIVE: {negative}"
        body = json.dumps({"prompt": full}).encode()
        req = urllib.request.Request(ENDPOINT, data=body, headers={"Content-Type": "application/json"})
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
            if "image" not in data:
                print(f"[{vertical}] ERROR: {json.dumps(data)[:300]}")
                summary.append((vertical, "ERR", 0, time.time()-t0))
                continue
            b64 = data["image"].split(",", 1)[1]
            buf = base64.b64decode(b64)
            with open(out_path, "wb") as f:
                f.write(buf)
            elapsed = time.time() - t0
            print(f"[{vertical}]  OK  {len(buf)//1024} KB  in {elapsed:.1f}s  ->  {out_path}")
            summary.append((vertical, "OK", len(buf), elapsed))
        except Exception as e:
            print(f"[{vertical}] EXC: {e}")
            summary.append((vertical, "EXC", 0, time.time()-t0))

    print("\n=== SUMMARY ===")
    ok = sum(1 for s in summary if s[1] == "OK")
    print(f"  generated: {ok}/{len(summary)}")
    for v, s, n, t in summary:
        print(f"  {v:<16} {s:<3}  {n//1024:>6} KB  {t:>5.1f}s")

if __name__ == "__main__":
    main()
