'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import { useLocaleContext } from '@/contexts/LocaleProvider'
import { isRTL } from '@/utils/rtl'

// Primary languages - Most commonly used (like Zara shows only key languages)
const primaryLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false }
]

// Extended languages - Available but not shown by default (can be accessed via "Show more")
const extendedLanguages = [
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', rtl: false },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', rtl: false },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', rtl: false },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', rtl: false },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', rtl: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', rtl: true }
]

// Fallback - combine primary + extended for API fallback
const fallbackLanguages = [...primaryLanguages, ...extendedLanguages]

// Wrapper component to safely use LocaleProvider
function LanguageSwitcherInner() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { selectedCountry } = useCountry()
  const localeContext = useLocaleContext()
  const [isOpen, setIsOpen] = useState(false)
  const [languages, setLanguages] = useState(fallbackLanguages)
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch languages from API
  useEffect(() => {
    if (!isMounted) return

    const fetchLanguages = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getSupportedLanguages()
        let fetchedLanguages: any[] = []
        
        if (response.data && (response.data as any).success && (response.data as any).data) {
          fetchedLanguages = (response.data as any).data
        } else if (Array.isArray(response.data)) {
          fetchedLanguages = response.data
        }
        
        // Validate that we have valid language objects with required fields
        if (Array.isArray(fetchedLanguages) && fetchedLanguages.length > 0) {
          const validLanguages = fetchedLanguages.filter(lang => 
            lang && 
            typeof lang === 'object' && 
            lang.code && 
            (lang.name || lang.nativeName)
          )
          
          if (validLanguages.length > 0) {
            setLanguages(validLanguages)
          } else {
            // If API returned invalid data, use fallback
            console.warn('API returned invalid language data, using fallback')
            setLanguages(fallbackLanguages)
          }
        } else {
          // If API returned empty or invalid response, use fallback
          console.warn('API returned empty or invalid languages, using fallback')
          setLanguages(fallbackLanguages)
        }
      } catch (error) {
        console.warn('Failed to fetch languages from API, using fallback:', error)
        // Use fallback languages if API fails
        setLanguages(fallbackLanguages)
      } finally {
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [isMounted])

  // Ensure we always have a valid currentLanguage, with multiple fallbacks
  const currentLanguage = languages.find(lang => lang.code === locale) 
    || languages[0] 
    || primaryLanguages.find(lang => lang.code === locale)
    || primaryLanguages[0]
    || { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false }
  
  // Check if current locale is RTL
  const isRTLMode = isRTL(locale)

  const switchLanguage = async (newLocale: string) => {
    setIsOpen(false)
    
    // Validate locale
    if (!fallbackLanguages.find(lang => lang.code === newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }
    
    // Don't switch if already on this locale
    if (newLocale === locale) {
      return
    }
    
    // Store in localStorage and sessionStorage for persistence FIRST
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', newLocale)
      sessionStorage.setItem('harvics_locale', newLocale)
    }
    
    // Skip updating LocaleProvider context directly to avoid race conditions
    // The full page reload via window.location.href will re-initialize the provider
    // with the correct locale from the URL.
    
    // Save language preference to backend (non-blocking, don't fail if backend is down)
    // This is optional - language switching should work even if backend is unavailable
    if (typeof window !== 'undefined') {
      apiClient.saveLanguagePreference(newLocale, selectedCountry).catch(error => {
        // Silently fail - this is not critical for language switching
        console.debug('Language preference save failed (non-critical):', error)
      })
    }

    // Get current pathname and extract path without locale
    let pathWithoutLocale = pathname || '/'
    
    const segments = pathWithoutLocale
      .split('/')
      .filter((segment) => segment.length > 0)
    
    // Check if first segment is the current locale
    if (segments.length > 0 && segments[0] === locale) {
      // Remove the locale segment
      segments.shift()
      pathWithoutLocale = segments.length > 0 ? '/' + segments.join('/') : '/'
    } else {
      // Check if first segment is any valid locale (in case locale doesn't match)
      if (segments.length > 0 && fallbackLanguages.find(lang => lang.code === segments[0])) {
        // First segment is a locale, remove it
        segments.shift()
        pathWithoutLocale = segments.length > 0 ? '/' + segments.join('/') : '/'
      } else {
        // No locale in path, keep the path as is (but ensure it starts with /)
        pathWithoutLocale = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : '/' + pathWithoutLocale
      }
    }
    
    // Preserve query parameters and hash
    const searchParams = typeof window !== 'undefined' ? window.location.search : ''
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    
    // Ensure we have a valid path
    if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
      pathWithoutLocale = '/'
    }
    
    // Build new path with new locale
    const newPath = pathWithoutLocale === '/' 
      ? `/${newLocale}${searchParams}${hash}` 
      : `/${newLocale}${pathWithoutLocale}${searchParams}${hash}`
    
    // Debug logging (can be removed in production)
    console.log('Switching language:', {
      from: locale,
      to: newLocale,
      currentPath: pathname,
      pathWithoutLocale,
      newPath
    })
    
    // Use window.location.href for a full page reload to ensure locale changes properly
    // This is more reliable than router.push for locale changes in next-intl
    if (typeof window !== 'undefined') {
      window.location.href = newPath
    } else {
      // Fallback for server-side (shouldn't happen, but just in case)
    router.push(newPath)
      router.refresh()
    }
  }

  if (!isMounted) {
    // Render a placeholder on the server and during the initial client render
    // to avoid hydration mismatch. The real component will be rendered on the client
    // after mounting.
    return (
      <div className="relative" aria-hidden="true">
        <div className="h-[42px] w-[125px] rounded-md bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center ${isRTLMode ? 'space-x-reverse space-x-2' : 'space-x-2'} px-3 py-2 rounded-md bg-gold border-2 border-maroon-deep hover:bg-maroon-deep hover:text-gold text-maroon-deep transition-all duration-200 font-bold shadow-md hover:shadow-lg`}
        aria-label={t('selectLanguage') || 'Select Language'}
        aria-expanded={isOpen}
      >
        <span className="text-lg leading-none pt-0.5">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline-block font-ui-wide text-xs uppercase tracking-wider">{currentLanguage?.name}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-maroon-deep group-hover:text-gold ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute ${isRTLMode ? 'left-0' : 'right-0'} mt-2 w-48 bg-white border-2 border-maroon-deep rounded-md shadow-lg z-50 overflow-hidden transition-all duration-200 ease-out max-h-[400px] flex flex-col ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        {/* Primary Languages - Always visible (like Zara) */}
        <div className="overflow-y-auto flex-1">
          {((showAll ? languages : primaryLanguages).length > 0 
            ? (showAll ? languages : primaryLanguages) 
            : fallbackLanguages
          ).map((lang) => (
            <button
              key={lang.code}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                switchLanguage(lang.code)
              }}
              className={`w-full flex items-center ${isRTLMode ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-2.5 ${isRTLMode ? 'text-right' : 'text-left'} hover:bg-maroon-deep/5 transition-colors duration-150 ${
                locale === lang.code ? 'bg-gold text-maroon-deep font-bold' : 'text-maroon-deep'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="flex-1 text-sm font-ui tracking-wide">{lang.name}</span>
              {locale === lang.code && (
                <svg className={`w-4 h-4 ${isRTLMode ? 'mr-auto' : 'ml-auto'} text-maroon-deep flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
        
        {/* Show More / Show Less Toggle - Only if there are more languages */}
        {!showAll && languages.length > primaryLanguages.length && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAll(true)
            }}
            className={`w-full px-4 py-2 text-xs text-maroon-deep hover:bg-maroon-deep/5 border-t border-maroon-deep/10 transition-colors ${isRTLMode ? 'text-right' : 'text-left'}`}
          >
            Show all languages ({languages.length - primaryLanguages.length} more)
          </button>
        )}
        {showAll && languages.length > primaryLanguages.length && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAll(false)
            }}
            className={`w-full px-4 py-2 text-xs text-maroon-deep hover:bg-maroon-deep/5 border-t border-maroon-deep/10 transition-colors ${isRTLMode ? 'text-right' : 'text-left'}`}
          >
            Show less
          </button>
        )}
      </div>
      )}
    </div>
  )
}

// Main component with error boundary for LocaleProvider
export default function LanguageSwitcher() {
  try {
    return <LanguageSwitcherInner />
  } catch (error) {
    // If LocaleProvider is not available, the ErrorBoundary will handle it
    // For now, just return the inner component and let it fail gracefully
    return <LanguageSwitcherInner />
  }
}
