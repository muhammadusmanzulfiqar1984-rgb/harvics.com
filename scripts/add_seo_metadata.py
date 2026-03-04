#!/usr/bin/env python3
"""Add SEO metadata to pages that are missing it."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

metas = {
    "src/app/[locale]/csr/page.tsx": ("Corporate Social Responsibility | Harvics", "Harvics CSR initiatives across 40+ countries."),
    "src/app/[locale]/faq/page.tsx": ("FAQ | Harvics", "Frequently asked questions about Harvics products and services."),
    "src/app/[locale]/help/page.tsx": ("Help Center | Harvics", "Get help with orders, accounts, and Harvics services."),
    "src/app/[locale]/investor-relations/page.tsx": ("Investor Relations | Harvics", "Harvics investor information and shareholder resources."),
    "src/app/[locale]/products/page.tsx": ("Products | Harvics", "Explore Harvics product range across 10 industry verticals."),
    "src/app/[locale]/newsletter/page.tsx": ("Newsletter | Harvics", "Subscribe to Harvics newsletter for industry insights."),
    "src/app/[locale]/research/page.tsx": ("Research | Harvics", "Harvics research initiatives and innovation programs."),
    "src/app/[locale]/strategy/page.tsx": ("Strategy | Harvics", "Harvics strategic vision for global expansion."),
    "src/app/[locale]/about/page.tsx": ("About Us | Harvics", "About Harvics Global Ventures operating across 40+ countries."),
    "src/app/[locale]/contact/page.tsx": ("Contact Us | Harvics", "Get in touch with Harvics offices worldwide."),
    "src/app/[locale]/login/page.tsx": ("Login | Harvics", "Sign in to your Harvics account."),
}

for path, (title, desc) in metas.items():
    full = os.path.join(BASE, path)
    if not os.path.exists(full):
        print(f"MISSING: {path}")
        continue
    with open(full, 'r') as f:
        content = f.read()
    if 'export const metadata' in content or 'generateMetadata' in content:
        print(f"SKIP: {path}")
        continue
    meta_import = "import type { Metadata } from 'next'"
    meta_export = f"export const metadata: Metadata = {{\n  title: '{title}',\n  description: '{desc}',\n}}"
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import ') or stripped.startswith('// Header'):
            last_import_idx = i
    lines.insert(last_import_idx + 1, f"\n{meta_import}\n\n{meta_export}\n")
    with open(full, 'w') as f:
        f.write('\n'.join(lines))
    print(f"ADDED: {path}")

print("\nDone!")
