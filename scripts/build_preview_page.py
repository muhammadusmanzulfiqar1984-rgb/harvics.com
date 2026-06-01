#!/usr/bin/env python3
"""Build a single HTML contact sheet of every hero + leaf image.

Output: public/_preview_verticals.html
Open at: http://localhost:3000/_preview_verticals.html
"""
import os, html

ROOT = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/public/assets/verticals"
OUT  = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/public/_preview_verticals.html"

def walk_leaves(cat_root):
    for d, _, files in os.walk(cat_root):
        if "leaf.jpg" in files:
            rel = os.path.relpath(d, ROOT)
            yield rel

verticals = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))

parts = ["""<!doctype html>
<html><head><meta charset="utf-8"><title>HARVICS Verticals Preview</title>
<style>
  body{font:14px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;margin:0;background:#0b0b0d;color:#eee}
  header{padding:24px 32px;background:#15151a;position:sticky;top:0;z-index:10;border-bottom:1px solid #2a2a30}
  h1{margin:0;font-size:18px;font-weight:600;letter-spacing:.5px}
  h2{margin:32px 32px 12px;font-size:16px;color:#c9a961;border-left:3px solid #c9a961;padding-left:10px}
  .hero{margin:8px 32px 24px;display:grid;grid-template-columns:1fr 3fr;gap:16px;align-items:center;background:#15151a;padding:16px;border-radius:8px}
  .hero img{width:100%;border-radius:6px;display:block}
  .hero .meta{font-size:12px;color:#888}
  .leaves{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin:0 32px 40px}
  .leaf{background:#15151a;border-radius:6px;overflow:hidden;border:1px solid #2a2a30}
  .leaf img{width:100%;height:160px;object-fit:cover;display:block}
  .leaf .cap{padding:6px 8px;font-size:11px;color:#aaa;font-family:ui-monospace,monospace;line-height:1.3;word-break:break-word}
  .nav{margin:0 32px 16px;padding:12px;background:#15151a;border-radius:8px}
  .nav a{display:inline-block;margin:4px 8px;color:#c9a961;text-decoration:none;font-size:12px}
  .nav a:hover{text-decoration:underline}
  .count{color:#666;font-size:11px;font-weight:normal}
</style></head><body>
<header><h1>HARVICS — Verticals Image Preview</h1></header>
<div class="nav">
"""]

for v in verticals:
    parts.append(f'<a href="#{v}">{v}</a>')

parts.append("</div>")

total = 0
for v in verticals:
    vroot = os.path.join(ROOT, v)
    cat_root = os.path.join(vroot, "categories")
    leaves = sorted(walk_leaves(cat_root)) if os.path.isdir(cat_root) else []
    hero_path = os.path.join(vroot, "hero", "hero.jpg")
    hero_rel = f"/assets/verticals/{v}/hero/hero.jpg" if os.path.exists(hero_path) else None
    total += len(leaves)

    parts.append(f'<h2 id="{v}">{v} <span class="count">({len(leaves)} leaves)</span></h2>')
    if hero_rel:
        parts.append(f'<div class="hero"><img src="{hero_rel}"><div><div style="font-size:13px;color:#c9a961">HERO</div><div class="meta">{hero_rel}</div></div></div>')

    if leaves:
        parts.append('<div class="leaves">')
        for rel in leaves:
            url = "/assets/verticals/" + rel + "/leaf.jpg"
            label = rel.replace(f"{v}/categories/", "")
            parts.append(f'<div class="leaf"><img loading="lazy" src="{html.escape(url)}"><div class="cap">{html.escape(label)}</div></div>')
        parts.append("</div>")

parts.append(f'<div style="padding:24px 32px;color:#666;font-size:12px">Total leaf images: {total}</div>')
parts.append("</body></html>")

with open(OUT, "w") as f:
    f.write("\n".join(parts))
print("Wrote", OUT, "with", total, "leaves +", len(verticals), "verticals")
