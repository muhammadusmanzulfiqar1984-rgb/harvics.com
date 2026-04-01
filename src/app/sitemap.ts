import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.harvics.com'

const LOCALES = [
  'en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ko', 'it', 'pt',
  'ru', 'hi', 'bn', 'tr', 'nl', 'pl', 'sv', 'no', 'da', 'fi',
  'el', 'cs', 'sk', 'ro', 'hr', 'bg', 'sr', 'uk', 'hu', 'id',
  'ms', 'th', 'vi', 'sw', 'ur', 'fa', 'he', 'ps'
]

const PUBLIC_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/careers', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/investor-relations', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/history', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/leadership', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/compliance', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/csr', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/media', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/research', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/strategy', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/sourcing', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/locations', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/find-store', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/kids', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/help', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/newsletter', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/harvics-house', priority: 0.6, changeFrequency: 'monthly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const page of PUBLIC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  return entries
}
