#!/usr/bin/env python3
"""Build a single self-contained HTML gallery of every leaf.jpg under
public/assets/verticals/<vertical>/categories/, grouped by:
  vertical -> L3 (top folder under categories) -> L4 (sub-folder).

Output: docs-reports/leaf_gallery.html  (opens directly in a browser)
Each tile shows the relative path under categories/ + thumbnail.
"""
import html
import os
import sys

REPO = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE"
ROOT = os.path.join(REPO, "public/assets/verticals")
OUT  = os.path.join(REPO, "docs-reports/leaf_gallery.html")
LEAF = "leaf.jpg"

VERT_TITLES = {
    "01-apparels": "01 — Apparels",
    "02-fmcg":     "02 — FMCG",
    "03-commodities": "03 — Commodities",
    "04-industrial":  "04 — Industrial",
    "05-minerals":    "05 — Minerals",
    "06-oil-gas":     "06 — Oil & Gas",
    "07-real-estate": "07 — Real Estate",
    "08-sourcing":    "08 — Sourcing",
    "09-finance":     "09 — Finance",
    "10-ai-tech":     "10 — AI & Tech",
}

# These two were regenerated this session via flux-schnell. Everything else
# is older placeholder content.
NEW_VERTS = {"01-apparels", "02-fmcg"}


def collect():
    rows = []
    for vert in sorted(os.listdir(ROOT)):
        cat_root = os.path.join(ROOT, vert, "categories")
        if not os.path.isdir(cat_root):
            continue
        for dirpath, _, files in os.walk(cat_root):
            if LEAF not in files:
                continue
            rel = os.path.relpath(dirpath, cat_root)  # e.g. apparel/womens-wear/dresses
            parts = rel.split(os.sep)
            l3 = parts[0] if parts else ""
            l4 = parts[1] if len(parts) > 1 else ""
            tail = "/".join(parts[2:]) if len(parts) > 2 else ""
            src_rel = os.path.relpath(os.path.join(dirpath, LEAF), os.path.dirname(OUT))
            rows.append({
                "vert": vert, "l3": l3, "l4": l4, "tail": tail,
                "rel": rel, "src": src_rel,
            })
    return rows


def main():
    rows = collect()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    # Split into NEW (flux-generated this session) and PREVIOUS (older placeholders).
    new_rows  = [r for r in rows if r["vert"] in NEW_VERTS]
    prev_rows = [r for r in rows if r["vert"] not in NEW_VERTS]

    def regroup(rs):
        g = {}
        for r in rs:
            g.setdefault(r["vert"], {}).setdefault(r["l3"], {}).setdefault(r["l4"], []).append(r)
        return g

    new_grouped  = regroup(new_rows)
    prev_grouped = regroup(prev_rows)
    total = len(rows)

    css = """
    :root{--bg:#0e0e10;--card:#16161a;--ink:#f3f3f3;--muted:#8a8a93;--accent:#c3a35e;--border:#22232a;
      --new:#3aa86b;--old:#9c9c9c;}
    *{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
    header{position:sticky;top:0;background:rgba(14,14,16,.95);backdrop-filter:blur(10px);
      padding:18px 28px;border-bottom:1px solid var(--border);z-index:10}
    h1{margin:0;font-size:22px;font-weight:600;letter-spacing:.3px}
    h1 small{color:var(--muted);font-weight:400;margin-left:10px;font-size:14px}
    main{padding:24px 28px 80px;max-width:1600px;margin:0 auto}
    .section{margin-bottom:48px;padding-top:8px}
    .section-head{display:flex;align-items:center;gap:14px;margin:24px 0 4px;
      padding:14px 18px;border-radius:10px;border:1px solid var(--border)}
    .section-head.new{background:linear-gradient(90deg,rgba(58,168,107,.18),rgba(58,168,107,.04));
      border-color:rgba(58,168,107,.4)}
    .section-head.old{background:linear-gradient(90deg,rgba(195,163,94,.10),rgba(195,163,94,.02));
      border-color:rgba(195,163,94,.3)}
    .section-head h2{margin:0;font-size:20px}
    .section-head .badge{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;
      padding:4px 10px;border-radius:999px}
    .section-head.new .badge{background:var(--new);color:#0e0e10}
    .section-head.old .badge{background:var(--old);color:#0e0e10}
    .section-head .count{color:var(--muted);font-size:13px;margin-left:auto}
    h3{margin:18px 0 8px;font-size:18px;color:var(--accent);border-bottom:1px solid var(--border);padding-bottom:5px}
    h4{margin:18px 0 6px;font-size:15px;color:#fff;letter-spacing:.2px}
    h5{margin:10px 0 6px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;
      display:flex;flex-direction:column;text-decoration:none;color:inherit;
      transition:transform .15s ease,border-color .15s ease}
    .card:hover{transform:translateY(-2px);border-color:var(--accent)}
    .card img{display:block;width:100%;height:180px;object-fit:cover;background:#000}
    .card .label{padding:8px 10px;font-size:12px;color:var(--ink);word-break:break-word;line-height:1.3}
    .card .label small{display:block;color:var(--muted);margin-top:2px;font-size:11px}
    nav.toc{font-size:13px;color:var(--muted);margin-top:8px}
    nav.toc a{color:var(--muted);text-decoration:none;margin-right:14px}
    nav.toc a:hover{color:var(--accent)}
    nav.toc .pill{display:inline-block;padding:2px 8px;border-radius:999px;margin-right:10px;font-size:11px}
    nav.toc .pill.new{background:rgba(58,168,107,.2);color:var(--new)}
    nav.toc .pill.old{background:rgba(195,163,94,.15);color:var(--accent)}
    """

    parts = []
    parts.append(f"<!doctype html><html><head><meta charset='utf-8'>")
    parts.append(f"<title>HARVICS Leaf Gallery ({total} images)</title>")
    parts.append(f"<style>{css}</style></head><body>")
    parts.append("<header><h1>HARVICS Leaf Gallery <small>"
                 f"{total} images · {len(new_rows)} new · {len(prev_rows)} previous</small></h1>")
    parts.append("<nav class='toc'>")
    parts.append("<a href='#section-new'><span class='pill new'>NEW</span> jump to new</a>")
    parts.append("<a href='#section-prev'><span class='pill old'>PREVIOUS</span> jump to previous</a>")
    parts.append("</nav></header><main>")

    def render_section(section_id, klass, badge, title, count, grouped):
        parts.append(f"<section class='section' id='{section_id}'>")
        parts.append(f"<div class='section-head {klass}'>"
                     f"<span class='badge'>{badge}</span>"
                     f"<h2>{title}</h2>"
                     f"<span class='count'>{count} images</span></div>")
        for vert in sorted(grouped):
            parts.append(f"<h3 id='{vert}'>{html.escape(VERT_TITLES.get(vert, vert))}</h3>")
            for l3 in sorted(grouped[vert]):
                l3_count = sum(len(v) for v in grouped[vert][l3].values())
                parts.append(f"<h4>{html.escape(l3)} <span style='color:#8a8a93;font-weight:400;font-size:13px'>"
                             f"({l3_count})</span></h4>")
                for l4 in sorted(grouped[vert][l3]):
                    items = grouped[vert][l3][l4]
                    parts.append(f"<h5>{html.escape(l4) if l4 else '(root)'}  ·  {len(items)}</h5>")
                    parts.append("<div class='grid'>")
                    for r in sorted(items, key=lambda x: x["rel"]):
                        src = html.escape(r["src"])
                        tail = html.escape(r["tail"] or r["l4"] or r["l3"])
                        fullrel = html.escape(r["rel"])
                        parts.append(
                            f"<a class='card' href='{src}' target='_blank'>"
                            f"<img loading='lazy' src='{src}' alt='{fullrel}'>"
                            f"<div class='label'>{tail}<small>{fullrel}</small></div></a>"
                        )
                    parts.append("</div>")
        parts.append("</section>")

    render_section("section-new",  "new", "NEW",
                   "Newly generated this session (Apparels + FMCG)",
                   len(new_rows),  new_grouped)
    render_section("section-prev", "old", "PREVIOUS",
                   "Previous / placeholder images (everything else)",
                   len(prev_rows), prev_grouped)

    parts.append("</main></body></html>")

    with open(OUT, "w") as f:
        f.write("".join(parts))
    print(f"Wrote {total} images ({len(new_rows)} new + {len(prev_rows)} previous) to {OUT}")


if __name__ == "__main__":
    main()
