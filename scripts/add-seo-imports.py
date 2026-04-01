#!/usr/bin/env python3
"""Adds missing seo/Metadata imports to locale pages."""
import os

pages = ['contact', 'products', 'csr', 'faq', 'locations', 'leadership', 'help', 'compliance', 'history', 'newsletter', 'login', 'research']
base = "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/src/app/[locale]"

for page in pages:
    path = os.path.join(base, page, 'page.tsx')
    with open(path, encoding='utf-8') as f:
        content = f.read()

    if "@/lib/seo" in content:
        print(f'{page}: already has seo import, skipping')
        continue

    if "import type { Metadata } from 'next'" in content:
        content = content.replace(
            "import type { Metadata } from 'next'",
            "import type { Metadata } from 'next'\nimport { generateLocalizedMetadata } from '@/lib/seo'"
        )
    elif 'import type { Metadata } from "next"' in content:
        content = content.replace(
            'import type { Metadata } from "next"',
            "import type { Metadata } from 'next'\nimport { generateLocalizedMetadata } from '@/lib/seo'"
        )
    else:
        # Add both imports at the very top
        lines = content.split('\n')
        insert_idx = 0
        # Skip leading comment lines
        while insert_idx < len(lines) and lines[insert_idx].strip().startswith('//'):
            insert_idx += 1
        lines.insert(insert_idx, "import { generateLocalizedMetadata } from '@/lib/seo'")
        lines.insert(insert_idx, "import type { Metadata } from 'next'")
        content = '\n'.join(lines)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'{page}: updated')

print('Done!')
