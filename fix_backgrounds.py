import os

ROOT = os.path.dirname(os.path.abspath(__file__))

files = [
    'src/app/[locale]/[vertical]/VerticalPageClient.tsx',
    'src/app/[locale]/[vertical]/[category]/CategoryPageClient.tsx',
    'src/app/[locale]/[vertical]/[category]/[item]/ItemPageClient.tsx',
    'src/app/[locale]/about/AboutPageClient.tsx',
    'src/app/[locale]/about/brand-story/page.tsx',
    'src/app/[locale]/careers/page.tsx',
    'src/app/[locale]/checkout/page.tsx',
    'src/app/[locale]/compliance/page.tsx',
    'src/app/[locale]/contact/ContactPageClient.tsx',
    'src/app/[locale]/csr/page.tsx',
    'src/app/[locale]/faq/page.tsx',
    'src/app/[locale]/harvics-house/page.tsx',
    'src/app/[locale]/help/account/page.tsx',
    'src/app/[locale]/help/guides/page.tsx',
    'src/app/[locale]/help/orders/page.tsx',
    'src/app/[locale]/help/page.tsx',
    'src/app/[locale]/help/troubleshooting/page.tsx',
    'src/app/[locale]/history/page.tsx',
    'src/app/[locale]/investor-relations/page.tsx',
    'src/app/[locale]/investors/governance/page.tsx',
    'src/app/[locale]/investors/publications/page.tsx',
    'src/app/[locale]/investors/shares/page.tsx',
    'src/app/[locale]/kids/page.tsx',
    'src/app/[locale]/leadership/page.tsx',
    'src/app/[locale]/locations/page.tsx',
    'src/app/[locale]/login/page.tsx',
    'src/app/[locale]/media/contacts/page.tsx',
    'src/app/[locale]/media/images/page.tsx',
    'src/app/[locale]/media/news/page.tsx',
    'src/app/[locale]/media/page.tsx',
    'src/app/[locale]/money/club-rewards/page.tsx',
    'src/app/[locale]/money/credit-cards/page.tsx',
    'src/app/[locale]/money/exchange-rates/page.tsx',
    'src/app/[locale]/money/financial-support/page.tsx',
    'src/app/[locale]/money/home-insurance/page.tsx',
    'src/app/[locale]/money/personal-loans/page.tsx',
    'src/app/[locale]/money/rewards-card/page.tsx',
    'src/app/[locale]/money/savings-investing/page.tsx',
    'src/app/[locale]/money/travel-insurance/page.tsx',
    'src/app/[locale]/offers/bulk-orders/page.tsx',
    'src/app/[locale]/offers/promotions/page.tsx',
    'src/app/[locale]/offers/special-offers/page.tsx',
    'src/app/[locale]/portals/page.tsx',
    'src/app/[locale]/products/[category]/page.tsx',
    'src/app/[locale]/products/page.tsx',
    'src/app/[locale]/research/page.tsx',
    'src/app/[locale]/sales/clearance/page.tsx',
    'src/app/[locale]/sales/current-sales/page.tsx',
    'src/app/[locale]/sales/seasonal/page.tsx',
    'src/app/[locale]/sourcing/page.tsx',
    'src/app/[locale]/strategy/page.tsx',
    'src/app/not-found.tsx',
]

count = 0
for f in files:
    path = os.path.join(ROOT, f)
    if not os.path.exists(path):
        print(f'MISSING: {f}')
        continue
    content = open(path, 'r', encoding='utf-8').read()
    new_content = content.replace("background: '#F5F1E8'", "background: '#ffffff'")
    if new_content != content:
        open(path, 'w', encoding='utf-8').write(new_content)
        count += 1

print(f'Fixed {count} / {len(files)} files')
