import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import BackgroundMusic from '@/components/ui/BackgroundMusic';
import AutoBugDetector from '@/components/shared/AutoBugDetector';
import ChatbotWidget from '@/components/ui/ChatbotWidget';
import FrontendWatchdogClient from '@/components/shared/FrontendWatchdogClient';
import { RegionProvider } from '@/contexts/RegionContext';
import { CountryProvider } from '@/contexts/CountryContext';
import { TerritoryProvider } from '@/contexts/TerritoryContext';
import { FoundationProviders } from '@/components/shared/FoundationProviders';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { SUPPORTED_LOCALES, getValidLocale } from '@/config/locales';
import { isRTL } from '@/utils/rtl';
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import Footer from '@/components/layout/Footer';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import { GeographicSyncWrapper } from '@/components/shared/GeographicSyncWrapper';
import { getFolderBasedCategories } from '@/data/folderBasedProducts';
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })
const playfairDisplay = Playfair_Display({ subsets: ['latin', 'latin-ext'], variable: '--font-playfair-display', weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'Harvics - Corporate Website',
  description: 'Harvics Corporate Website - Dubai, UAE. Since 2019. Food, Beverages, Services and More.',
}

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
      <body className={`${inter.className} ${playfairDisplay.variable}`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            {/* Foundation Providers - LocaleProvider and GeoProvider */}
            <BackendStatusProvider>
            <FoundationProviders initialLocale={locale}>
              {/* Legacy Providers - Keep for backward compatibility */}
              <ErrorBoundary>
                <TerritoryProvider>
                  <RegionProvider>
                    <CountryProvider>
                      <GeographicSyncWrapper />
                      {/* Header - hidden on investor-relations, csr, portals, admin pages, OS domain pages, and dashboard pages */}
                      <ConditionalHeader 
                        categories={categories} 
                        hideOnPaths={[
                          '/investor-relations',
                          '/csr',
                          '/portals',
                          '/portal',
                          '/distributor-portal',
                          '/investors',
                          '/login/investor',
                          '/admin/company-dashboard',
                          '/admin',
                          '/os/',
                          '/dashboard/company',
                          '/dashboard'
                        ]} 
                      />
                      {/* Page content */}
                      <div>
                        {children}
                      </div>
                      {/* Footer - shown on all pages by default */}
                      <Footer />
                      <FrontendWatchdogClient />
                      <BackgroundMusic />
                      <AutoBugDetector />
                      <ChatbotWidget />
                    </CountryProvider>
                  </RegionProvider>
                </TerritoryProvider>
              </ErrorBoundary>
            </FoundationProviders>
            </BackendStatusProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
