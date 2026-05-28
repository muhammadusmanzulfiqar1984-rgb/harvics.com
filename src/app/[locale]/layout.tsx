import type { Metadata } from 'next'
import { Inter, Playfair_Display, Noto_Sans_Arabic, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { RegionProvider } from '@/contexts/RegionContext';
import { CountryProvider } from '@/contexts/CountryContext';
import { FoundationProviders } from '@/components/shared/FoundationProviders';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import PageTransition from '@/components/ui/PageTransition';
import { SUPPORTED_LOCALES, getValidLocale } from '@/config/locales';
import { isRTL } from '@/utils/rtl';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import { GeographicSyncWrapper } from '@/components/shared/GeographicSyncWrapper';
import { getFolderBasedCategories } from '@/data/folderBasedProducts';
import { generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo';
import '../globals.css'
import '@/styles/apple-effects.css'

// Lazy-load non-critical widgets so they don't block initial page render
const BackgroundMusic = dynamic(() => import('@/components/ui/BackgroundMusic'))
const AutoBugDetector = dynamic(() => import('@/components/shared/AutoBugDetector'))
const ChatbotWidget = dynamic(() => import('@/features/ai/ChatbotWidget'))
const GlobalScrollReveal = dynamic(() => import('@/components/shared/GlobalScrollReveal'))
const FrontendWatchdogClient = dynamic(() => import('@/components/shared/FrontendWatchdogClient'))
const AppleStyleScrollEffects = dynamic(() => import('@/components/effects/AppleStyleScrollEffects'))
const VapiWidget = dynamic(() => import('@/components/shared/VapiWidget'))

const inter = Inter({ subsets: ['latin'] })
const playfairDisplay = Playfair_Display({ subsets: ['latin', 'latin-ext'], variable: '--font-playfair-display', weight: ['400', '500', '600', '700', '800', '900'] });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ['arabic'], variable: '--font-arabic', weight: ['400', '500', '600', '700'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '700'], display: 'swap' });

export const metadata: Metadata = generateSEOMetadata({
  title: 'Harvics Global Ventures',
  description: 'Leading global trading company delivering premium products across 10 industries. Textiles, FMCG, commodities, industrial solutions, minerals, oil & gas, real estate, sourcing, technology, and AI automation. Operating in 42+ countries since 2019.',
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
    locale = resolvedParams?.locale || 'en';
    
    // Validate that the incoming `locale` parameter is valid
    locale = getValidLocale(locale);

    // Set request locale to enable static rendering
    setRequestLocale(locale);

    // Providing all messages to the client side
    // getMessages() automatically uses the locale from the request context and handles all fallbacks via i18n.ts
    try {
      const loadedMessages = await getMessages({ locale });
      messages = loadedMessages || {};
      
      // If messages are empty, try direct import as fallback
      if (!messages || Object.keys(messages).length === 0) {
        console.warn('getMessages() returned empty, trying direct import...');
        try {
          const localeModule = await import(`@/locales/${locale}.json`);
          messages = (localeModule.default as Record<string, any>) || {};
        } catch (staticError) {
          // Final fallback to English
          try {
            const enModule = await import(`@/locales/en.json`);
            messages = (enModule.default as Record<string, any>) || {};
            locale = 'en';
          } catch (enError) {
            console.error('Failed to load any translations:', enError);
            messages = {};
          }
        }
      }
    } catch (error) {
      // If getMessages fails, try direct import
      console.warn('getMessages() failed, trying direct import:', error);
      try {
        const localeModule = await import(`@/locales/${locale}.json`);
        messages = (localeModule.default as Record<string, any>) || {};
      } catch (staticError) {
        // Final fallback to English
        try {
          const enModule = await import(`@/locales/en.json`);
          messages = (enModule.default as Record<string, any>) || {};
          locale = 'en';
        } catch (enError) {
          console.error('Failed to load any translations:', enError);
          messages = {};
        }
      }
    }
  } catch (error) {
    console.error('Error in LocaleLayout:', error);
    // Use defaults if anything fails
    locale = 'en';
    messages = {};
    setRequestLocale('en');
  }

  // Ensure CRM namespace is always available for all locales.
  // If the current locale messages don't define `crm`, fetch English from static file or backend
  // so the whole CRM UI still works when you switch language.
  // Only do this if messages were successfully loaded
  if (messages && Object.keys(messages).length > 0) {
    try {
      if (!messages.crm) {
        // Try static English file first
        try {
          const enModule = await import(`@/locales/en.json`);
          const enMessages = (enModule.default as Record<string, any>) || {};
          if (enMessages.crm) {
            messages = {
              ...messages,
              crm: enMessages.crm,
            };
          }
        } catch (staticError) {
          // Silently fail - CRM messages are optional
          console.warn('Could not load CRM messages from static file:', staticError);
        }
      }
    } catch (crmError) {
      // Silently fail - CRM messages are optional
      console.warn('Failed to merge fallback CRM messages:', crmError);
    }
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
              <ErrorBoundary>
                  <RegionProvider>
                    <CountryProvider>
                      <GeographicSyncWrapper />
                      {/* Header - global across all routes */}
                      <ConditionalHeader categories={categories} />
                      {/* Page content with transition */}
                      <PageTransition>
                        <div id="main-content" suppressHydrationWarning>
                          {children}
                        </div>
                      </PageTransition>
                      {/* Footer - global across all routes */}
                      <ConditionalFooter />
                      <FrontendWatchdogClient />
                      <BackgroundMusic />
                      <AutoBugDetector />
                      <GlobalScrollReveal />
                      <ChatbotWidget />
                      <AppleStyleScrollEffects />
                      <VapiWidget />
                    </CountryProvider>
                  </RegionProvider>
              </ErrorBoundary>
            </FoundationProviders>
            </BackendStatusProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
