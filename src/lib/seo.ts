import { Metadata } from 'next'

interface GenerateMetadataParams {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  locale?: string
}

export function generateSEOMetadata({
  title = 'Harvics Global Ventures',
  description = 'Leading global trading company delivering premium products across 10+ industries. Textiles, FMCG, commodities, industrial solutions, minerals, oil & gas, real estate, sourcing, technology, and AI automation.',
  keywords = [
    'global trading',
    'FMCG',
    'textiles',
    'commodities',
    'industrial solutions',
    'minerals',
    'oil and gas',
    'real estate',
    'sourcing solutions',
    'supply chain',
    'international trade',
    'Dubai trading company',
    'wholesale distribution',
    'B2B solutions',
    'AI automation'
  ],
  image = '/Images/logo.png',
  url = 'https://www.harvics.com',
  locale = 'en'
}: GenerateMetadataParams = {}): Metadata {
  const fullTitle = `${title} | Premium Global Trading & Distribution`
  const fullDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.join(', '),
    authors: [{ name: 'Harvics Global Ventures' }],
    creator: 'Harvics Global Ventures',
    publisher: 'Harvics Global Ventures',
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
      languages: {
        'en': '/en',
        'ar': '/ar',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'zh': '/zh',
        'ja': '/ja',
        'ko': '/ko',
        'pt': '/pt',
        'ru': '/ru',
        'hi': '/hi',
        'tr': '/tr',
        'it': '/it',
        'nl': '/nl',
        'pl': '/pl',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: url,
      title: fullTitle,
      description: fullDescription,
      siteName: 'Harvics Global Ventures',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
      creator: '@HarvicsGlobal',
      site: '@HarvicsGlobal',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'business',
    classification: 'Global Trading and Distribution',
    other: {
      'og:phone_number': '+44 7405 527427',
      'og:email': 'sales.uk@harvics.com',
      'og:latitude': '25.2048',
      'og:longitude': '55.2708',
      'og:street-address': 'Dubai, UAE',
      'og:locality': 'Dubai',
      'og:region': 'Dubai',
      'og:country-name': 'United Arab Emirates',
    },
  }
}

// Generate JSON-LD structured data for rich snippets
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Harvics Global Ventures',
    alternateName: 'Harvics',
    url: 'https://www.harvics.com',
    logo: 'https://www.harvics.com/Images/logo.png',
    description: 'Leading global trading company delivering premium products across 10+ industries worldwide.',
    foundingDate: '2019',
    email: 'sales.uk@harvics.com',
    telephone: '+44-7405-527427',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    sameAs: [
      'https://x.com/HarvicsGlobal',
      'https://www.facebook.com/harvics',
      'https://www.instagram.com/harvicsfoods/',
      'https://www.linkedin.com/company/harvics',
      'https://www.youtube.com/@HarvicsFoods',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44-7405-527427',
        contactType: 'sales',
        email: 'sales.uk@harvics.com',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Arabic', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'],
      },
    ],
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  brand?: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Harvics',
    },
    category: product.category,
    manufacturer: {
      '@type': 'Organization',
      name: 'Harvics Global Ventures',
    },
  }
}

// ─── LOCALIZED METADATA ──────────────────────────────────────────────────────
/**
 * Generates locale-aware Metadata for a given page.
 * Falls back to English if the locale doesn't have a seo section.
 *
 * Usage in page.tsx:
 *   export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 *     const { locale } = await params;
 *     return generateLocalizedMetadata(locale, 'about');
 *   }
 */
export async function generateLocalizedMetadata(
  locale: string,
  pageKey: string,
  overrides?: Partial<GenerateMetadataParams>
): Promise<Metadata> {
  let title = overrides?.title
  let description = overrides?.description

  try {
    const messages = await import(`@/locales/${locale}.json`).catch(() => import('@/locales/en.json'))
    const seo = messages.default?.seo as Record<string, { title?: string; description?: string }> | undefined
    if (seo?.[pageKey]) {
      if (!title) title = seo[pageKey].title
      if (!description) description = seo[pageKey].description
    }
  } catch {
    // Fallback handled by generateSEOMetadata defaults
  }

  return generateSEOMetadata({
    title: title || undefined,
    description: description || undefined,
    locale,
    url: `https://www.harvics.com/${locale}/${pageKey === 'home' ? '' : pageKey}`,
    ...overrides,
  })
}
