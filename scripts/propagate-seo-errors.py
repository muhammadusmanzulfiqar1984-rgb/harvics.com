#!/usr/bin/env python3
"""
Propagates the seo and errors keys from en.json to all skeleton locale files.
For each skeleton locale, copies English values as a fallback (next-intl
will use these until professional translations are provided).
"""
import json, os

BASE = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/src/locales"

# Native locales already have real translations — skip them
NATIVE = {'en', 'ar', 'es', 'fr', 'de'}

# Load the English source (authoritative)
with open(os.path.join(BASE, 'en.json'), encoding='utf-8') as f:
    en = json.load(f)

seo_en = en['seo']
errors_en = en['errors']

updated = []
skipped = []

for fname in sorted(os.listdir(BASE)):
    if not fname.endswith('.json'):
        continue
    lang = fname[:-5]
    if lang in NATIVE:
        skipped.append(lang)
        continue

    path = os.path.join(BASE, fname)
    with open(path, encoding='utf-8') as f:
        d = json.load(f)

    changed = False
    if 'seo' not in d:
        d['seo'] = seo_en
        changed = True
    if 'errors' not in d:
        d['errors'] = errors_en
        changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(d, f, indent=2, ensure_ascii=False)
        updated.append(lang)
    else:
        skipped.append(f'{lang} (already had keys)')

print(f"Updated {len(updated)} locales: {', '.join(updated)}")
print(f"Skipped {len(skipped)}: {', '.join(skipped)}")
