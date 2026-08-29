import type { Metadata } from 'next'
import { Inter, Playfair_Display, Noto_Sans_Arabic, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { RegionProvider } from '@/contexts/RegionContext';
import { CountryProvider } from '@/contexts/CountryContext';
import { FoundationProviders } from '@/components/shared/FoundationProviders';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import PageTransition from '@/components/ui/PageTransition';
import { SUPPORTED_LOCALES, getValidLocale } from '@/config/locales';
import { isRTL } from '@/utils/rtl';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import DeferredSiteChrome from '@/components/layout/DeferredSiteChrome';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import { GeographicSyncWrapper } from '@/components/shared/GeographicSyncWrapper';
import { getFolderBasedCategories } from '@/data/folderBasedProducts';
import { generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo';
import SiteAnalytics from '@/components/layout/SiteAnalytics';
import '../globals.css'
import '@/styles/apple-effects.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  weight: ['400', '700'],
  display: 'swap',
  // Display font — don't compete with body Inter on first paint
  preload: false,
})
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = generateSEOMetadata({
  title: 'Harvics Global Ventures',
  description: '42 Markets. 10 Industries. 14 Stages — Harvics Global Ventures. Verified supply. Protected settlement.',
  url: 'https://www.harvics.com',
})

// Supported locales - matches the locale files we have
const locales = [...SUPPORTED_LOCALES];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  let locale: string = 'en';
  let messages: Record<string, any> = {};
  
  try {
    const resolvedParams = await params;
    locale = getValidLocale(resolvedParams?.locale || 'en');
    setRequestLocale(locale);
    messages = (await getMessages({ locale })) || {};
  } catch (error) {
    console.error('Error in LocaleLayout:', error);
    locale = 'en';
    messages = {};
    setRequestLocale('en');
  }

  // Determine text direction based on locale
  const textDirection = isRTL(locale) ? 'rtl' : 'ltr';

  // Get categories for header - with error handling
  let categories: any[] = []
  try {
    categories = getFolderBasedCategories() || []
  } catch (error) {
    console.error('Error loading categories in layout:', error)
    categories = []
  }

  return (
    <html lang={locale} dir={textDirection} suppressHydrationWarning>
      <head>
        {/* Organization Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        {/* LCP poster — hero paints before video loads */}
        <link
          rel="preload"
          as="image"
          href="/assets/shared/heroes/corridor-reel-poster.webp"
          type="image/webp"
        />
        <link rel="dns-prefetch" href="https://widget.intercom.io" />
        <link rel="dns-prefetch" href="https://js.intercomcdn.com" />
        <link rel="dns-prefetch" href="https://static.zdassets.com" />
      </head>
      <body className={`${inter.className} ${playfairDisplay.variable} ${notoSansArabic.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        {/* Accessibility: Skip to content */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            {/* Foundation Providers - LocaleProvider and GeoProvider */}
            <BackendStatusProvider>
            <FoundationProviders initialLocale={locale}>
              {/* Legacy Providers - Keep for backward compatibility */}
              <RegionProvider>
                <CountryProvider>
                  <GeographicSyncWrapper />
                  {/* Header - global across all routes */}
                  <ConditionalHeader categories={categories} />
                  {/* Isolate page crashes so header/footer stay up */}
                  <PageTransition>
                    <div id="main-content" suppressHydrationWarning>
                      {children}
                    </div>
                  </PageTransition>
                  {/* Footer - global across all routes */}
                  <ConditionalFooter />
                  <SiteAnalytics />
                </CountryProvider>
              </RegionProvider>
            </FoundationProviders>
            </BackendStatusProvider>
          </ErrorBoundary>
          {/* Must stay outside ALL ErrorBoundaries — Intercom/scroll must not blank the site */}
          <DeferredSiteChrome />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
