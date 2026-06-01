#!/usr/bin/env python3
"""Compress all leaf.jpg and hero.jpg files in public/assets/verticals/ to web-friendly size.
   Resizes to max 800px wide and re-encodes JPEG at quality 75.
   Skips files already <= 100KB (already optimized).
"""
from pathlib import Path
from PIL import Image
import os

ROOT = Path("public/assets/verticals")
MAX_WIDTH = 800
QUALITY = 75
SKIP_BELOW = 100 * 1024  # 100 KB

total_before = 0
total_after = 0
processed = 0
skipped = 0

for jpg in ROOT.rglob("*.jpg"):
    size_before = jpg.stat().st_size
    total_before += size_before
    if size_before <= SKIP_BELOW:
        total_after += size_before
        skipped += 1
        continue
    try:
        im = Image.open(jpg)
        if im.mode != "RGB":
            im = im.convert("RGB")
        if im.width > MAX_WIDTH:
            ratio = MAX_WIDTH / im.width
            new_size = (MAX_WIDTH, int(im.height * ratio))
            im = im.resize(new_size, Image.Resampling.LANCZOS)
        im.save(jpg, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        size_after = jpg.stat().st_size
        total_after += size_after
        processed += 1
        if processed % 100 == 0:
            print(f"  ... {processed} done")
    except Exception as e:
        print(f"FAIL {jpg}: {e}")
        total_after += size_before

mb = lambda b: f"{b / 1024 / 1024:.1f} MB"
print(f"\nProcessed: {processed}   Skipped (small): {skipped}")
print(f"Before:    {mb(total_before)}")
print(f"After:     {mb(total_after)}")
print(f"Saved:     {mb(total_before - total_after)}  ({(1 - total_after/total_before)*100:.1f}% reduction)")
